'use client';

import React from 'react';
import { FieldDefinition } from '@/lib/contractFields';

interface DynamicFieldProps {
  field: FieldDefinition;
  value: string | number;
  onChange: (value: string) => void;
  error?: string;
}

const DynamicField: React.FC<DynamicFieldProps> = ({
  field,
  value,
  onChange,
  error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const renderField = () => {
    const baseClassName = "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
    const errorClassName = error ? "border-red-300" : "border-gray-300";

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            className={`${baseClassName} ${errorClassName}`}
            placeholder={field.placeholder}
            required={field.required}
            title={`${field.label} 입력 필드`}
            aria-label={field.label}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            className={`${baseClassName} ${errorClassName}`}
            placeholder={field.placeholder}
            min={field.min}
            max={field.max}
            step={field.step}
            required={field.required}
            title={`${field.label} 입력 필드`}
            aria-label={field.label}
          />
        );

      case 'select':
        return (
          <select
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            className={`${baseClassName} ${errorClassName}`}
            required={field.required}
            title={`${field.label} 선택 필드`}
            aria-label={field.label}
          >
            <option key="default-select" value="">선택하세요</option>
            {field.options?.map((option, idx) => (
              <option key={`${field.name}-${option.value || idx}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'date':
        return (
          <input
            type="date"
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            className={`${baseClassName} ${errorClassName}`}
            required={field.required}
            title={`${field.label} 날짜 선택 필드`}
            aria-label={field.label}
          />
        );

      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value || ''}
            onChange={handleChange}
            rows={3}
            className={`${baseClassName} ${errorClassName}`}
            placeholder={field.placeholder}
            required={field.required}
            title={`${field.label} 텍스트 영역`}
            aria-label={field.label}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label} {field.required && <span className="text-red-500">*</span>}
      </label>
      {renderField()}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DynamicField;



