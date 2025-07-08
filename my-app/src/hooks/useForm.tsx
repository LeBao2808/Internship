import { useState } from "react";
import { ZodSchema, ZodObject } from "zod";

type Errors = { [key: string]: string };

export function useForm<T extends Record<string, any>>(schema: ZodSchema<T>, initialValues: T) {
  const [form, setForm] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Errors>({});

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (schema instanceof ZodObject && name in schema.shape) {
      const fieldSchema = schema.shape[name];
      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          [name]: result.error.errors[0]?.message || "Invalid value",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  return { form, setForm, errors, setErrors, handleFormChange };
}