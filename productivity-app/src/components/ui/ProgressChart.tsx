import React from 'react';
import { cn } from '@/utils/helpers';

interface ProgressChartProps {
  data: Array<{
    date: string;
    value: number;
    label?: string;
  }>;
  className?: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showLabels?: boolean;
}

export function ProgressChart({
  data,
  className,
  height = 120,
  color = '#0ea5e9',
  showGrid = true,
  showLabels = false
}: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <div 
        className={cn('flex items-center justify-center text-gray-500', className)}
        style={{ height }}
      >
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  // Generate SVG path
  const width = 400;
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const pathData = data
    .map((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  // Create area fill path
  const areaPath = pathData + 
    ` L ${padding + chartWidth} ${padding + chartHeight}` +
    ` L ${padding} ${padding + chartHeight} Z`;

  return (
    <div className={cn('relative', className)}>
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        {/* Grid lines */}
        {showGrid && (
          <g opacity="0.1">
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1={padding}
                y1={padding + chartHeight * ratio}
                x2={padding + chartWidth}
                y2={padding + chartHeight * ratio}
                stroke="currentColor"
                strokeWidth="1"
              />
            ))}
          </g>
        )}

        {/* Area fill */}
        <path
          d={areaPath}
          fill={color}
          fillOpacity="0.1"
        />

        {/* Main line */}
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
          
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="3"
                fill={color}
                className="drop-shadow-sm"
              />
              {showLabels && (
                <text
                  x={x}
                  y={y - 8}
                  textAnchor="middle"
                  className="fill-current text-xs font-medium"
                >
                  {point.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Date labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

// Circular progress component
interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = '#0ea5e9',
  backgroundColor = '#e5e7eb',
  children,
  className
}: CircularProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex', className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {/* Content */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

// Stats card component
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    label: string;
    trend: 'up' | 'down' | 'neutral';
  };
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  className 
}: StatsCardProps) {
  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        
        {Icon && (
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Icon className="w-6 h-6 text-primary-600" />
          </div>
        )}
      </div>
      
      {change && (
        <div className="mt-4 flex items-center">
          <span className={cn(
            'text-sm font-medium',
            change.trend === 'up' && 'text-green-600',
            change.trend === 'down' && 'text-red-600',
            change.trend === 'neutral' && 'text-gray-600'
          )}>
            {change.trend === 'up' && '+'}
            {change.value}%
          </span>
          <span className="text-sm text-gray-500 ml-2">
            {change.label}
          </span>
        </div>
      )}
    </div>
  );
}
