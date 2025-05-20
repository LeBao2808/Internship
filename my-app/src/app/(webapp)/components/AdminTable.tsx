
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useLanguage } from "../LanguageContext";
import { EyeIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";

interface Column {
  id: string;
  label: React.ReactNode; 
}

interface AdminTableProps {
  columns: Column[];
  rows: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onViewDetail?: (row: any) => void; // Thêm props mới
  onUpload?: (row: any) => void; // Thêm props mới
}

const AdminTable: React.FC<AdminTableProps> = ({ columns, rows, onEdit, onDelete, onViewDetail, onUpload }) => {
  const { t } = useLanguage();
  const [previewImage, setPreviewImage] = useState<string | null>(null); // Thêm state này

  // Hàm cắt ngắn chuỗi
  const truncate = (str: string, max: number) => {
    if (typeof str !== "string") return str;
    return str.length > max ? str.slice(0, max) + "..." : str;
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell key={col.id}>{col.label}</TableCell>
              ))}
              {(onEdit || onDelete || onViewDetail || onUpload) && <TableCell>{t("action")}</TableCell>}
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
                  >
                    {(col.id === "image_url" || col.id === "image")&& typeof row[col.id] === "string" && row[col.id] ? (
                      <img
                        src={row[col.id]}
                        alt="blog"
                        style={{width: 60, height: 40, objectFit: "cover", cursor: "pointer", border: "1px solid #eee", background: "#f5f5f5"}}
                        onClick={() => setPreviewImage(row[col.id])}
                      />
                    ) : col.id === "content" && typeof row[col.id] === "string" ? (
                      <div
                        style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        dangerouslySetInnerHTML={{ __html: truncate(row[col.id],30) }}
                      />
                    ) : typeof row[col.id] === "string"
                      ? truncate(row[col.id], 30)
                      : row[col.id]}
                  </TableCell>
                ))}
                {(onEdit || onDelete || onViewDetail) && (
                  <TableCell sx={{ width: 240 }}>
                    {onViewDetail && (
                      <IconButton color="info" onClick={() => onViewDetail(row)}>
                        <EyeIcon style={{ width: 24, height: 24 }} />
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
                    {onUpload && (
                      <IconButton color="secondary" onClick={() => onUpload(row)}>
                        <span role="img" aria-label="upload">⬆️</span>
                      </IconButton>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Modal hiển thị ảnh lớn */}
      {previewImage && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Preview"
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              borderRadius: 8,
              background: "#fff",
              boxShadow: "0 4px 32px rgba(0,0,0,0.2)"
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default AdminTable;