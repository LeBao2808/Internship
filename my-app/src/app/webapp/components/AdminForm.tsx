import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

interface AdminFormProps {
  title?: string;
  fields: Array<{
    name: string;
    label: string;
    type?: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
  }>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  children?: React.ReactNode;
}

const AdminForm: React.FC<AdminFormProps> = ({
  title,
  fields,
  onSubmit,
  submitLabel = "Lưu",
  children
}) => {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ p: 3, border: "1px solid #eee", borderRadius: 2, maxWidth: 500, mx: "auto" }}>
      {title && <Typography variant="h6" mb={2}>{title}</Typography>}
      {fields.map((field, idx) => (
        <TextField
          key={field.name}
          label={field.label}
          name={field.name}
          type={field.type || "text"}
          value={field.value}
          onChange={field.onChange}
          required={field.required}
          fullWidth
          margin="normal"
        />
      ))}
      {children}
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>{submitLabel}</Button>
    </Box>
  );
};

export default AdminForm;