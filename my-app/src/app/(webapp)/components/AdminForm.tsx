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
    error?: boolean;
    helperText?: string;
  }>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  children?: React.ReactNode;
  onBack?: () => void;
}

const AdminForm: React.FC<AdminFormProps> = ({
  title,
  fields,
  onSubmit,
  submitLabel = "Lưu",
  children,
  onBack,
}) => {
  return (
    <>
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          p: 3,
          border: "1px solid #eee",
          width: "100%",
          borderRadius: 2,
          maxWidth: 1000,
          mx: "auto",
        }}
      >
        {title && (
          <Typography variant="h6" mb={2}>
            {title}
          </Typography>
        )}
        {fields.map((field) => (
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
            error={field.error}
            helperText={field.helperText}
          />
        ))}
        {children}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
        >
          {submitLabel}
        </Button>
      </Box>
      {onBack && (
        <Box
          sx={{
            maxWidth: 500,
            mx: "auto",
            mt: 2,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button onClick={onBack} variant="outlined" color="secondary">
            Back
          </Button>
        </Box>
      )}
    </>
  );
};

export default AdminForm;
