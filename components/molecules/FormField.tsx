'use client';

import React from 'react';
import { Input } from '@/components/atoms';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
}) => {
  return (
    <div className="form-field">
      <Input
        label={`${label}${required ? ' *' : ''}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        error={error}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default FormField;


