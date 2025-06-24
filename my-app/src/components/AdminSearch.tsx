import React from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface AdminSearchProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: () => void;
  placeholder?: string;
}

const AdminSearch: React.FC<AdminSearchProps> = ({ value, onChange, onSearch, placeholder }) => {
  return (
    <TextField
      value={value}
      onChange={onChange}
      placeholder={placeholder || "Tìm kiếm..."}
      fullWidth
      margin="normal"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={onSearch} edge="end">
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        )
      }}
      variant="outlined"
    />
  );
};

export default AdminSearch;