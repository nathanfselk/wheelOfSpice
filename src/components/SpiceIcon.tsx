import React from 'react';
import * as LucideIcons from 'lucide-react';

interface SpiceIconProps {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
}

export const SpiceIcon: React.FC<SpiceIconProps> = ({ iconName, className = "w-4 h-4", style }) => {
  // Get the icon component from Lucide
  const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Circle;
  
  return <IconComponent className={className} style={style} />;
};