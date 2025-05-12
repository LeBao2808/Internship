import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

interface AdminModalProps {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  width?: React.CSSProperties;
}

const AdminModal: React.FC<AdminModalProps> = ({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  loading = false,
  width,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth style={width}>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>{cancelLabel}</Button>
        {onConfirm && (
          <Button onClick={onConfirm} variant="contained" color="primary" disabled={loading}>
            {loading ? "Đang xử lý..." : confirmLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AdminModal;