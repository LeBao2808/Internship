import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormHelperText,
} from "@mui/material";

interface Option {
  value: string | number;
  label: string;
}

interface AdminSelectProps {
  label: string;
  name: string;
  value: string | number;
  options: Option[];
  error: boolean;
  onChange: (e: any) => void;
  required?: boolean;
  helperText?: string;
}

const AdminSelect: React.FC<AdminSelectProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  helperText,
  error,
  required,
}) => {
  return (
    <FormControl fullWidth margin="normal" required={required} error={error}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} name={name} value={value} onChange={onChange}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default AdminSelect;
