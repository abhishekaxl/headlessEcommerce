'use client';

import React from 'react';
import { Icon, Text } from '@/components/atoms';

type IconName = 'truck' | 'shield' | 'refresh' | 'headphones';

interface FeatureCardProps {
  icon: IconName;
  title: string;
  description: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <div className="feature-card">
      <div className="icon-wrapper">
        <Icon name={icon} size={28} />
      </div>
      <div className="content">
        <Text variant="h4" className="title">{title}</Text>
        <Text variant="small" color="muted">{description}</Text>
      </div>

      <style jsx>{`
        .feature-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .icon-wrapper {
          flex-shrink: 0;
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f7f4;
          border-radius: 50%;
          color: #4a7c59;
        }
        .content {
          flex: 1;
        }
        :global(.title) {
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
};

export default FeatureCard;


