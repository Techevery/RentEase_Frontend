import { useState } from 'react';
import { ZodSchema, ZodError } from 'zod';

interface FormData {
  role: string;
  email: string;
  password?: string;

  
}

export function useFormValidation<T extends FormData>(
  schema: ZodSchema<T>,
  initialState: T
) {
  const [values, setValues] = useState<T>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validate = (): boolean => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (err) {
      const fieldErrors: Partial<Record<keyof T, string>> = {};
      if (err instanceof ZodError) {
        err.errors.forEach((e) => {
          const field = e.path[0] as keyof T;
          fieldErrors[field] = e.message;
        });
      }
      setErrors(fieldErrors);
      return false;
    }
  };

  const handleChange = (field: keyof T) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return {
    values,
    errors,
    handleChange,
    validate,
    setValues,
    setErrors,
  };
}