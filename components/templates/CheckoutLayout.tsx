'use client';

import React from 'react';
import Link from 'next/link';
import { Text } from '@/components/atoms';

interface CheckoutStep {
  id: string;
  label: string;
}

interface CheckoutLayoutProps {
  children: React.ReactNode;
  currentStep?: number;
  steps?: CheckoutStep[];
}

const defaultSteps: CheckoutStep[] = [
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

export const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({
  children,
  currentStep = 0,
  steps = defaultSteps,
}) => {
  return (
    <div className="checkout-layout">
      <div className="checkout-header">
        <Link href="/" className="logo">Urban Jungle Co.</Link>
      </div>

      {/* Progress Steps */}
      <div className="progress-bar">
        <div className="progress-container">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`step ${index <= currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-number">{index + 1}</div>
              <Text variant="small" className="step-label">{step.label}</Text>
            </div>
          ))}
        </div>
      </div>

      <div className="checkout-container">
        <div className="checkout-content">{children}</div>
      </div>

      <style jsx>{`
        .checkout-layout {
          min-height: 100vh;
          background: #f8f7f4;
        }
        .checkout-header {
          background: #fff;
          padding: 16px 24px;
          text-align: center;
          border-bottom: 1px solid #e8e6e1;
        }
        .logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1a1a1a;
          text-decoration: none;
        }
        .progress-bar {
          background: #fff;
          padding: 24px;
          border-bottom: 1px solid #e8e6e1;
        }
        .progress-container {
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
        }
        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e8e6e1;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }
        .step.active .step-number {
          background: #4a7c59;
          color: #fff;
        }
        .step.completed .step-number {
          background: #4a7c59;
          color: #fff;
        }
        :global(.step-label) {
          color: #666;
        }
        .step.active :global(.step-label) {
          color: #1a1a1a;
          font-weight: 500;
        }
        .checkout-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 48px 24px;
        }
        .checkout-content {
          background: #fff;
          padding: 32px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
      `}</style>
    </div>
  );
};

export default CheckoutLayout;


