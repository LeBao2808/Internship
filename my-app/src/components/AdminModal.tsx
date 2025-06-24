import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

interface AdminModalProps {
  open: boolean;
  title?: string;
  isDelete?: boolean;
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
  cancelLabel = "x",
  loading = false,
  isDelete = false,
  width,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      style={width}
      className="modal-width"
    >
      {title && (
        <DialogTitle className="flex justify-between">
          {" "}
          <p>{title}</p>
          <Button onClick={onClose} disabled={loading}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </DialogTitle>
      )}
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        {/* <Button onClick={onClose} disabled={loading}>{cancelLabel}</Button> */}
        {onConfirm && (
          <Button
            onClick={onConfirm}
            variant="contained"
            color={isDelete ? "error" : "primary"}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : confirmLabel}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AdminModal;
