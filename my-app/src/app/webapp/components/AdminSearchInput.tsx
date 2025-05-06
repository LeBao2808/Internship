import React from "react";
import { TextField, Button, Box } from "@mui/material";

interface AdminSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  placeholder?: string;
  buttonLabel?: string;
}

const AdminSearchInput: React.FC<AdminSearchInputProps> = ({ value, onChange, onSubmit, placeholder = "Tìm kiếm...", buttonLabel = "Tìm kiếm" }) => {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
      <TextField
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        size="small"
        variant="outlined"
        sx={{ flex: 1 }}
      />
      <Button type="submit" variant="contained" color="primary" sx={{ whiteSpace: "nowrap" }}>
        {buttonLabel}
      </Button>
    </Box>
  );
};

export default AdminSearchInput;