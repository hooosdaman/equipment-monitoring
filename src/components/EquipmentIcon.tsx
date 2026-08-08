import React from 'react';
import {
  Zap,
  Wind,
  Snowflake,
  Activity,
  BatteryCharging,
  ArrowUpDown,
  Fan,
  HelpCircle
} from 'lucide-react';
import { EquipmentIconType } from '../types';

interface EquipmentIconProps {
  type: EquipmentIconType | string;
  className?: string;
}

export const EquipmentIcon: React.FC<EquipmentIconProps> = ({ type, className = 'w-6 h-6' }) => {
  switch (type?.toLowerCase()) {
    case 'generator':
      return <Zap className={className} />;
    case 'aircon':
      return <Wind className={className} />;
    case 'chillers':
      return <Snowflake className={className} />;
    case 'pumps':
      return <Activity className={className} />;
    case 'ups':
      return <BatteryCharging className={className} />;
    case 'elevator':
      return <ArrowUpDown className={className} />;
    case 'cooling_tower':
      return <Fan className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
