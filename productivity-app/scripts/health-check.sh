#!/bin/bash

# ProductivU Health Check and Monitoring Script
# Usage: ./health-check.sh [--verbose] [--auto-restart] [--email=admin@example.com]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="productiv-u"
APP_PORT="8080"
HEALTH_URL="http://localhost:$APP_PORT"
LOG_FILE="/var/log/productiv-u-health.log"
VERBOSE=false
AUTO_RESTART=false
EMAIL=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose)
            VERBOSE=true
            shift
            ;;
        --auto-restart)
            AUTO_RESTART=true
            shift
            ;;
        --email=*)
            EMAIL="${1#*=}"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Logging function
log_message() {
    local level=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
    if [ "$VERBOSE" = true ]; then
        log_message "INFO" "$1"
    fi
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    log_message "SUCCESS" "$1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    log_message "WARNING" "$1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log_message "ERROR" "$1"
}

# Send email notification
send_notification() {
    local subject=$1
    local body=$2
    
    if [[ -n "$EMAIL" ]] && command -v mail &> /dev/null; then
        echo "$body" | mail -s "$subject" "$EMAIL"
        print_status "Notification sent to $EMAIL"
    fi
}

# Check system resources
check_system_resources() {
    print_status "Checking system resources..."
    
    # Check disk space
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        print_warning "Disk usage is high: ${DISK_USAGE}%"
        send_notification "ProductivU Alert: High Disk Usage" "Disk usage is at ${DISK_USAGE}%"
    else
        print_success "Disk usage: ${DISK_USAGE}%"
    fi
    
    # Check memory usage
    MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
    if [ "$MEMORY_USAGE" -gt 90 ]; then
        print_warning "Memory usage is high: ${MEMORY_USAGE}%"
        send_notification "ProductivU Alert: High Memory Usage" "Memory usage is at ${MEMORY_USAGE}%"
    else
        print_success "Memory usage: ${MEMORY_USAGE}%"
    fi
    
    # Check load average
    LOAD_AVG=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    print_status "Load average: $LOAD_AVG"
}

# Check application health
check_app_health() {
    print_status "Checking application health..."
    
    # Check if port is listening
    if netstat -tuln | grep ":$APP_PORT " > /dev/null; then
        print_success "Application port $APP_PORT is listening"
    else
        print_error "Application port $APP_PORT is not listening"
        return 1
    fi
    
    # HTTP health check
    if curl -f -s -o /dev/null --connect-timeout 5 "$HEALTH_URL"; then
        print_success "HTTP health check passed"
        return 0
    else
        print_error "HTTP health check failed"
        return 1
    fi
}

# Check PM2 processes
check_pm2() {
    if command -v pm2 &> /dev/null; then
        print_status "Checking PM2 processes..."
        
        PM2_STATUS=$(pm2 jlist | jq -r ".[] | select(.name == \"$APP_NAME\") | .pm2_env.status" 2>/dev/null || echo "not_found")
        
        case $PM2_STATUS in
            "online")
                print_success "PM2 process is online"
                if [ "$VERBOSE" = true ]; then
                    pm2 show "$APP_NAME"
                fi
                return 0
                ;;
            "stopped")
                print_error "PM2 process is stopped"
                return 1
                ;;
            "errored")
                print_error "PM2 process is in error state"
                return 1
                ;;
            "not_found")
                print_error "PM2 process not found"
                return 1
                ;;
            *)
                print_warning "PM2 process status: $PM2_STATUS"
                return 1
                ;;
        esac
    else
        print_status "PM2 not installed, skipping PM2 checks"
        return 0
    fi
}

# Check Docker containers
check_docker() {
    if command -v docker &> /dev/null; then
        print_status "Checking Docker containers..."
        
        CONTAINER_STATUS=$(docker inspect --format='{{.State.Status}}' "$APP_NAME" 2>/dev/null || echo "not_found")
        
        case $CONTAINER_STATUS in
            "running")
                print_success "Docker container is running"
                if [ "$VERBOSE" = true ]; then
                    docker stats --no-stream "$APP_NAME"
                fi
                return 0
                ;;
            "exited")
                print_error "Docker container has exited"
                return 1
                ;;
            "not_found")
                print_status "Docker container not found, checking compose..."
                # Check docker-compose
                if docker-compose ps | grep "Up" > /dev/null 2>&1; then
                    print_success "Docker compose services are running"
                    return 0
                else
                    print_error "No running Docker containers found"
                    return 1
                fi
                ;;
            *)
                print_warning "Docker container status: $CONTAINER_STATUS"
                return 1
                ;;
        esac
    else
        print_status "Docker not installed, skipping Docker checks"
        return 0
    fi
}

# Restart application
restart_application() {
    print_warning "Attempting to restart application..."
    
    # Try PM2 first
    if command -v pm2 &> /dev/null && pm2 list | grep -q "$APP_NAME"; then
        print_status "Restarting with PM2..."
        pm2 restart "$APP_NAME"
        sleep 5
        return 0
    fi
    
    # Try Docker
    if command -v docker &> /dev/null; then
        if docker ps -a | grep -q "$APP_NAME"; then
            print_status "Restarting Docker container..."
            docker restart "$APP_NAME"
            sleep 10
            return 0
        elif [ -f "docker-compose.yml" ]; then
            print_status "Restarting Docker compose..."
            docker-compose restart
            sleep 10
            return 0
        fi
    fi
    
    print_error "Could not restart application - no suitable process manager found"
    return 1
}

# Generate health report
generate_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local status=$1
    
    cat << EOF

========================================
ProductivU Health Check Report
========================================
Timestamp: $timestamp
Status: $status
========================================

System Information:
- Hostname: $(hostname)
- Uptime: $(uptime)
- Disk Usage: $(df -h /)
- Memory Usage: $(free -h)

Application Status:
- Port $APP_PORT: $(if netstat -tuln | grep ":$APP_PORT " > /dev/null; then echo "LISTENING"; else echo "NOT LISTENING"; fi)
- HTTP Check: $(if curl -f -s -o /dev/null --connect-timeout 5 "$HEALTH_URL"; then echo "OK"; else echo "FAILED"; fi)

Process Management:
EOF

    if command -v pm2 &> /dev/null; then
        echo "- PM2 Status:"
        pm2 list
    fi
    
    if command -v docker &> /dev/null; then
        echo "- Docker Status:"
        docker ps
    fi
}

# Main health check function
main() {
    print_status "Starting ProductivU health check..."
    
    local health_issues=0
    
    # Check system resources
    check_system_resources
    
    # Check application health
    if ! check_app_health; then
        ((health_issues++))
    fi
    
    # Check process managers
    if ! check_pm2; then
        ((health_issues++))
    fi
    
    if ! check_docker; then
        ((health_issues++))
    fi
    
    # Determine overall status
    if [ $health_issues -eq 0 ]; then
        print_success "All health checks passed!"
        generate_report "HEALTHY" >> "$LOG_FILE"
    else
        print_error "Found $health_issues health issues"
        
        if [ "$AUTO_RESTART" = true ]; then
            if restart_application; then
                print_success "Application restarted successfully"
                send_notification "ProductivU: Application Restarted" "Application was automatically restarted due to health check failures"
                
                # Recheck after restart
                sleep 10
                if check_app_health; then
                    print_success "Application is now healthy after restart"
                    generate_report "RECOVERED" >> "$LOG_FILE"
                else
                    print_error "Application still unhealthy after restart"
                    generate_report "FAILED" >> "$LOG_FILE"
                    send_notification "ProductivU Alert: Restart Failed" "Application restart failed, manual intervention required"
                fi
            else
                print_error "Failed to restart application"
                generate_report "RESTART_FAILED" >> "$LOG_FILE"
                send_notification "ProductivU Alert: Restart Failed" "Failed to restart application, manual intervention required"
            fi
        else
            generate_report "UNHEALTHY" >> "$LOG_FILE"
            send_notification "ProductivU Alert: Health Check Failed" "Application health check failed, manual intervention required"
        fi
    fi
    
    if [ "$VERBOSE" = true ]; then
        print_status "Health check completed. Log file: $LOG_FILE"
    fi
}

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Run main function
main
