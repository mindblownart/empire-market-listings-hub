
import React from 'react';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/ui/currency-input';

interface CurrencyFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent, nextFieldId: string) => void;
  nextFieldId?: string;
  currencyCode: string;
  locale: string;
  validationError?: string;
  originalValue?: string;
  originalCurrency?: string;
}

const CurrencyField: React.FC<CurrencyFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onKeyDown,
  nextFieldId = '',
  currencyCode,
  locale,
  validationError,
  originalValue,
  originalCurrency,
}) => {
  const handleKeyDown = nextFieldId 
    ? (e: React.KeyboardEvent) => onKeyDown?.(e, nextFieldId)
    : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <CurrencyInput
        id={id}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        currencyCode={currencyCode}
        locale={locale}
        placeholder={`Enter ${label.toLowerCase()}`}
        aria-invalid={!!validationError}
        className={validationError ? "border-red-500 focus-visible:ring-red-500" : ""}
        autoComplete="off"
        originalValue={originalValue}
        originalCurrency={originalCurrency}
      />
      {validationError && (
        <p className="text-sm font-medium text-red-500">{validationError}</p>
      )}
    </div>
  );
};

export default CurrencyField;
