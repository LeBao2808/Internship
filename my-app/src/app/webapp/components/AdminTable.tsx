import React from "react";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface Column {
  id: string;
  label: string;
}

interface AdminTableProps {
  columns: Column[];
  rows: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
}

const AdminTable: React.FC<AdminTableProps> = ({ columns, rows, onEdit, onDelete }) => {
  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id}>{col.label}</TableCell>
            ))}
            {(onEdit || onDelete) && <TableCell>Hành động</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell key={col.id}>{row[col.id]}</TableCell>
              ))}
              {(onEdit || onDelete) && (
          <TableCell sx={{ width: 200 }}>
          {onEdit && (
            <IconButton color="primary" onClick={() => onEdit(row)}>
              <EditIcon />
            </IconButton>
          )}
          {onDelete && (
            <IconButton color="error" onClick={() => onDelete(row)}>
              <DeleteIcon />
            </IconButton>
          )}
        </TableCell>
        
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AdminTable;