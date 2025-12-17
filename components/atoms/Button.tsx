'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <>
      <button
        className={`btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${disabled || loading ? 'btn-disabled' : ''} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="btn-spinner">
            <svg className="spinner-icon" viewBox="0 0 24 24">
              <circle className="spinner-circle" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        )}
        {children}
      </button>

      <style jsx>{`
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-family: var(--font-body);
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          border: none;
          border-radius: 0;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-sm { padding: 10px 20px; font-size: 13px; }
        .btn-md { padding: 14px 32px; font-size: 14px; }
        .btn-lg { padding: 18px 40px; font-size: 15px; }

        .btn-primary {
          background-color: var(--primary);
          color: white;
        }
        .btn-primary:hover {
          background-color: var(--primary-dark);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background-color: var(--black);
          color: white;
        }
        .btn-secondary:hover {
          background-color: var(--charcoal);
        }

        .btn-outline {
          background-color: transparent;
          color: var(--black);
          border: 1px solid var(--black);
        }
        .btn-outline:hover {
          background-color: var(--black);
          color: white;
        }

        .btn-ghost {
          background: transparent;
          color: var(--primary);
          padding: 8px;
        }
        .btn-ghost:hover {
          background: rgba(74, 124, 89, 0.1);
        }

        .btn-link {
          background: transparent;
          color: var(--primary);
          padding: 0;
          text-transform: none;
        }
        .btn-link:hover {
          text-decoration: underline;
        }

        .btn-full { width: 100%; }

        .btn-disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .btn-spinner {
          display: inline-flex;
          margin-right: 8px;
        }

        .spinner-icon {
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }

        .spinner-circle {
          opacity: 0.25;
        }

        .spinner-path {
          opacity: 0.75;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default Button;
