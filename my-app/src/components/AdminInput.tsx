import React from "react";
import { TextField } from "@mui/material";

interface AdminInputProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  fullWidth?: boolean;
  margin?: "none" | "dense" | "normal";
}

const AdminInput: React.FC<AdminInputProps> = ({ label, name, type = "text", value, onChange, required, fullWidth = true, margin = "normal" }) => {
  return (
    <TextField
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      fullWidth={fullWidth}
      margin={margin}
    />
  );
};

export default AdminInput;