import React from "react";
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLanguage } from "../LanguageContext";

interface Column {
  id: string;
  label: string;
}

interface AdminTableProps {
  columns: Column[];
  rows: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onViewDetail?: (row: any) => void; // Thêm props mới
}

const AdminTable: React.FC<AdminTableProps> = ({ columns, rows, onEdit, onDelete, onViewDetail }) => {
  const { t } = useLanguage();
  // Hàm cắt ngắn chuỗi
  const truncate = (str: string, max: number) => {
    if (typeof str !== "string") return str;
    return str.length > max ? str.slice(0, max) + "..." : str;
  };

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.id}>{col.label}</TableCell>
            ))}
            {(onEdit || onDelete || onViewDetail) && <TableCell>{t("action")}</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={idx}>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    maxWidth: 200,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: typeof row[col.id] === "string" && row[col.id].length > 30 ? "pointer" : "default"
                  }}
                  title={typeof row[col.id] === "string" ? row[col.id] : undefined}
                >
                  {typeof row[col.id] === "string"
                    ? truncate(row[col.id], 30)
                    : row[col.id]}
                </TableCell>
              ))}
              {(onEdit || onDelete || onViewDetail) && (
                <TableCell sx={{ width: 240 }}>
                  {onViewDetail && (
                    <IconButton color="info" onClick={() => onViewDetail(row)}>
                      <span role="img" aria-label="view">👁️</span>
                    </IconButton>
                  )}
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