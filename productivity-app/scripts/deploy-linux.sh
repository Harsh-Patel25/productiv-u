#!/bin/bash

# ProductivU - Linux Deployment Script
# Usage: ./deploy-linux.sh [OPTION]
# Options: --docker, --pm2, --nginx, --ssl

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="productiv-u"
APP_DIR="/var/www/productivity-app"
DOMAIN=""
EMAIL=""
DEPLOYMENT_TYPE="pm2"

# Functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

check_requirements() {
    print_status "Checking system requirements..."
    
    # Check if running as root or with sudo
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root. Consider using a non-root user with sudo privileges."
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18 or higher."
    fi
    
    NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
    if [[ $NODE_VERSION -lt 18 ]]; then
        print_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed."
    fi
    
    print_success "System requirements check passed."
}

install_dependencies() {
    print_status "Installing global dependencies..."
    
    # Install PM2 if not present
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
        print_success "PM2 installed successfully."
    fi
    
    # Install serve if not present
    if ! command -v serve &> /dev/null; then
        npm install -g serve
        print_success "serve installed successfully."
    fi
    
    # Install Docker if requested
    if [[ "$1" == "--docker" ]] && ! command -v docker &> /dev/null; then
        print_status "Installing Docker..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo systemctl enable docker
        sudo systemctl start docker
        sudo usermod -aG docker $USER
        print_success "Docker installed successfully."
        print_warning "Please log out and log back in for Docker permissions to take effect."
    fi
}

setup_application() {
    print_status "Setting up application..."
    
    # Create application directory
    if [[ ! -d "$APP_DIR" ]]; then
        sudo mkdir -p "$APP_DIR"
        sudo chown -R $USER:$USER "$APP_DIR"
    fi
    
    # Clone or update repository
    if [[ -d "$APP_DIR/.git" ]]; then
        print_status "Updating existing repository..."
        cd "$APP_DIR"
        git pull origin main
    else
        print_status "Application source should be copied to $APP_DIR"
        print_warning "Please ensure your application code is in $APP_DIR"
    fi
    
    cd "$APP_DIR"
    
    # Install dependencies
    print_status "Installing application dependencies..."
    npm install
    
    # Create environment file
    if [[ ! -f ".env.production" ]]; then
        cp .env.example .env.production
        print_warning "Created .env.production file. Please review and update configuration."
    fi
    
    # Build application
    print_status "Building application..."
    npm run build
    
    print_success "Application setup completed."
}

deploy_pm2() {
    print_status "Deploying with PM2..."
    
    cd "$APP_DIR"
    
    # Create logs directory
    mkdir -p logs
    
    # Start PM2 application
    pm2 stop $APP_NAME 2>/dev/null || true
    pm2 delete $APP_NAME 2>/dev/null || true
    pm2 start pm2.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Setup PM2 startup script
    sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
    
    print_success "PM2 deployment completed."
    print_status "Application is running on http://localhost:8080"
    
    # Show PM2 status
    pm2 status
}

deploy_docker() {
    print_status "Deploying with Docker..."
    
    cd "$APP_DIR"
    
    # Stop existing containers
    docker stop $APP_NAME 2>/dev/null || true
    docker rm $APP_NAME 2>/dev/null || true
    
    # Build and run container
    if [[ -f "docker-compose.yml" ]]; then
        docker-compose --profile prod up -d
        print_success "Docker Compose deployment completed."
    else
        docker build -t $APP_NAME .
        docker run -d \
            --name $APP_NAME \
            -p 8080:8080 \
            --restart unless-stopped \
            $APP_NAME
        print_success "Docker deployment completed."
    fi
    
    print_status "Application is running on http://localhost:8080"
    
    # Show container status
    docker ps
}

setup_nginx() {
    print_status "Setting up Nginx reverse proxy..."
    
    # Install Nginx
    sudo apt update
    sudo apt install -y nginx
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate;
    gzip_types text/plain text/css text/xml text/javascript application/javascript;
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test and restart Nginx
    sudo nginx -t
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    print_success "Nginx setup completed."
}

setup_ssl() {
    print_status "Setting up SSL certificate..."
    
    if [[ -z "$DOMAIN" ]] || [[ -z "$EMAIL" ]]; then
        print_error "Domain and email must be set for SSL setup."
    fi
    
    # Install Certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Get SSL certificate
    sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL"
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    print_success "SSL certificate installed successfully."
}

setup_firewall() {
    print_status "Configuring firewall..."
    
    # Enable UFW if not already enabled
    sudo ufw --force enable
    
    # Allow SSH (important!)
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Allow application port for direct access
    sudo ufw allow 8080/tcp
    
    print_success "Firewall configured successfully."
    sudo ufw status
}

cleanup() {
    print_status "Cleaning up temporary files..."
    rm -f get-docker.sh
    print_success "Cleanup completed."
}

show_status() {
    print_success "Deployment completed successfully!"
    echo ""
    print_status "Application Status:"
    
    if command -v pm2 &> /dev/null && pm2 list | grep -q $APP_NAME; then
        pm2 status
    fi
    
    if command -v docker &> /dev/null; then
        echo ""
        print_status "Docker Status:"
        docker ps
    fi
    
    echo ""
    print_status "Access your application:"
    echo "  Local: http://localhost:8080"
    echo "  Network: http://$(hostname -I | awk '{print $1}'):8080"
    
    if [[ -n "$DOMAIN" ]]; then
        echo "  Domain: https://$DOMAIN"
    fi
    
    echo ""
    print_status "Useful commands:"
    echo "  View PM2 logs: pm2 logs $APP_NAME"
    echo "  Restart PM2 app: pm2 restart $APP_NAME"
    echo "  View Docker logs: docker logs $APP_NAME"
    echo "  Check Nginx status: sudo systemctl status nginx"
}

# Main deployment function
main() {
    print_status "Starting ProductivU deployment..."
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --docker)
                DEPLOYMENT_TYPE="docker"
                shift
                ;;
            --pm2)
                DEPLOYMENT_TYPE="pm2"
                shift
                ;;
            --nginx)
                SETUP_NGINX=true
                shift
                ;;
            --ssl)
                SETUP_SSL=true
                shift
                ;;
            --domain=*)
                DOMAIN="${1#*=}"
                shift
                ;;
            --email=*)
                EMAIL="${1#*=}"
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                ;;
        esac
    done
    
    # Run deployment steps
    check_requirements
    install_dependencies $DEPLOYMENT_TYPE
    setup_application
    
    # Deploy based on type
    case $DEPLOYMENT_TYPE in
        "docker")
            deploy_docker
            ;;
        "pm2")
            deploy_pm2
            ;;
        *)
            print_error "Unknown deployment type: $DEPLOYMENT_TYPE"
            ;;
    esac
    
    # Optional components
    if [[ "$SETUP_NGINX" == true ]]; then
        setup_nginx
    fi
    
    if [[ "$SETUP_SSL" == true ]]; then
        setup_ssl
    fi
    
    setup_firewall
    cleanup
    show_status
}

# Run main function with all arguments
main "$@"
