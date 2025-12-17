'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="input-wrapper">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input-field ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="error-text">{error}</span>}
      {helperText && !error && <span className="helper-text">{helperText}</span>}

      <style jsx>{`
        .input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .input-label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }
        .input-field {
          padding: 12px 16px;
          border: 1px solid #e8e6e1;
          font-size: 15px;
          color: #333;
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field:focus {
          outline: none;
          border-color: #4a7c59;
          box-shadow: 0 0 0 3px rgba(74, 124, 89, 0.1);
        }
        .input-field.input-error {
          border-color: #dc3545;
        }
        .error-text {
          font-size: 13px;
          color: #dc3545;
        }
        .helper-text {
          font-size: 13px;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Input;

