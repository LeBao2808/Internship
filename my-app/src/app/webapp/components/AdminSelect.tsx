import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface Option {
  value: string | number;
  label: string;
}

interface AdminSelectProps {
  label: string;
  name: string;
  value: string | number;
  options: Option[];
  onChange: (e: React.ChangeEvent<{ value: unknown }>) => void;
  required?: boolean;
}

const AdminSelect: React.FC<AdminSelectProps> = ({ label, name, value, options, onChange, required }) => {
  return (
    <FormControl fullWidth margin="normal" required={required}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        name={name}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default AdminSelect;