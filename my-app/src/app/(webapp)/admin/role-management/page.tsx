"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../../../../components/AdminTable";
import AdminModal from "../../../../components/AdminModal";
import AdminForm from "../../../../components/AdminForm";
import { useMessageStore } from "../../../../components/messageStore";
import { z } from "zod";
import InputSearch from "../../../../components/InputSearch";
import Pagination from "../../../../components/Pagination";
import { useSession } from "next-auth/react";
import { useSortableColumns } from "../../../../hooks/useSortableColumns";
import { Role } from "@/utils/type";
import { useTranslation } from "react-i18next"; // Thêm dòng này
import { useForm } from "@/hooks/useForm";

const RoleSchema = z.object({
  description: z.string().min(1, "Description is required"),
  name: z.string().min(1, "Name is required"),
});

export default function RoleManagementPage() {
  const { t } = useTranslation(); // Thêm dòng này
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const { form, setForm, errors, setErrors, handleFormChange } = useForm<
    Role
  >(RoleSchema, { name: "", description: "" });
  const [search, setSearch] = useState("");
  const { setMessage } = useMessageStore();
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const { sortBy, sortOrder, renderColumnHeader } = useSortableColumns<Role>("name");

  useEffect(() => {
    fetchRoles(search, currentPage, pageSize);
  }, [search, currentPage, pageSize, sortBy, sortOrder]);

  const fetchRoles = async (query = "", page = currentPage, size = 10) => {
    try {
      setLoading(true);
      let url = "/api/role";
      const params = [];
      if (query) params.push(`search=${encodeURIComponent(query)}`);
      if (sortBy) params.push(`sort=${sortBy}:${sortOrder}`);
      if (page) params.push(`page=${page}`);
      if (size) params.push(`pageSize=${size}`);
      if (params.length > 0) url += "?" + params.join("&");
      const res = await fetch(url);
      const data = await res.json();
      setRoles(Array.isArray(data.roles) ? data.roles : []);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingRole(null);
    setForm({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description });
    setIsModalOpen(true);
  };

  const handleDeleteRole = async (role: Role) => {
    await fetch("/api/role", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: role._id }),
    });
    setMessage(t("Delete Role Successful!"), "error");
    fetchRoles();
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
    setForm({
      description: "",
      name: "",
    });
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = RoleSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: t(fieldErrors.name?.[0] || "Name is required"),
        description: t(fieldErrors.description?.[0] || "Description is required"),
      });
      return;
    }
    setErrors({});
    if (editingRole) {
      // Update
      await fetch("/api/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingRole._id, ...form }),
      });
      setMessage(t("Edit Role Successful!"), "success");
    } else {
      // Create
      await fetch("/api/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setMessage(t("Add Role Successful!"), "success");
    }
    setIsModalOpen(false);
    fetchRoles();
  };

  if (session && session.user?.role != "admin") {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        margin: 0,
        padding: 24,
        background: "#fff",
        borderRadius: 0,
        boxShadow: "0 2px 8px #eee",
      }}
    >
      <div
        className="container-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <InputSearch
          onInput={(e) => {
            setSearch(e.target.value);
            e.preventDefault();
            fetchRoles(e.target.value);
          }}
        />
        <button
          className="btn-add"
          onClick={handleAddClick}
          style={{
            padding: "8px 16px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          {t("Add Role")}
        </button>
      </div>
      <AdminTable
        columns={[
          {
            id: "name",
            label: renderColumnHeader({ id: "name", label: t("Role Name") }),
          },
          {
            id: "description",
            label: renderColumnHeader({
              id: "description",
              label: t("Description"),
            }),
          },
        ]}
        rows={Array.isArray(roles) ? roles : []}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(total / pageSize) || 1}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
        }}
      />
      <AdminModal
        open={isModalOpen}
        title={editingRole ? t("Edit Role") : t("Add Role")}
        onClose={() => handleCloseModal()}
        onConfirm={undefined}
        confirmLabel={undefined}
        cancelLabel={undefined}
      >
        <AdminForm
          fields={[
            {
              name: "name",
              label: t("Role Name"),
              value: form.name,
              onChange: handleFormChange,
              error: !!errors.name,
              helperText: errors.name,
            },
            {
              name: "description",
              label: t("Description"),
              value: form.description,
              onChange: handleFormChange,
              error: !!errors.description,
              helperText: errors.description,
            },
          ]}
          onSubmit={handleSaveRole}
          submitLabel={editingRole ? t("Update") : t("Create")}
        />
      </AdminModal>
    </div>
  );
}
