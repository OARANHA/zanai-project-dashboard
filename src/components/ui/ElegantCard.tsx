'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface ElegantCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  bgColor?: string;
  value?: string | number;
  badge?: string;
  badgeColor?: string;
  children?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function ElegantCard({
  title,
  description,
  icon: Icon,
  iconColor = "text-blue-600",
  bgColor = "bg-blue-100 dark:bg-blue-900/20",
  value,
  badge,
  badgeColor = "bg-blue-50 text-blue-700 border-blue-200",
  children,
  href,
  onClick,
  className = ""
}: ElegantCardProps) {
  const CardWrapper = href && !onClick ? 'a' : 'div';
  const wrapperProps = href && !onClick 
    ? { href, onClick, className: `cursor-pointer ${className}` }
    : { onClick, className };

  const content = (
    <Card className="group relative overflow-hidden bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:scale-105 hover:-translate-y-1">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 relative z-10">
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-1 text-gray-600 dark:text-gray-300">
              {description}
            </CardDescription>
          )}
        </div>
        {Icon && (
          <div className={`p-3 ${bgColor} rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0 relative z-10">
        {value && (
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {value}
          </div>
        )}
        
        {badge && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {children}
            </span>
            <Badge variant="outline" className={`${badgeColor} px-3 py-1 rounded-full text-xs font-medium shadow-sm`}>
              {badge}
            </Badge>
          </div>
        )}
        
        {!badge && children}
      </CardContent>
      
      {/* Subtle border animation */}
      <div className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-blue-200 dark:group-hover:border-blue-800 transition-all duration-300 pointer-events-none"></div>
    </Card>
  );

  if (CardWrapper === 'a') {
    return (
      <CardWrapper {...wrapperProps}>
        {content}
      </CardWrapper>
    );
  }

  return (
    <CardWrapper {...wrapperProps}>
      {content}
    </CardWrapper>
  );
}