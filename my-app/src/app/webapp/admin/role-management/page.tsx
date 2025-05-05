"use client";


import React, { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";

interface Role {
  _id?: string;
  name: string;
  description: string;
}

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const res = await fetch("/api/role");
    const data = await res.json();
    setRoles(data);
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
    fetchRoles();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRole) {
      // Update
      await fetch("/api/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingRole._id, ...form }),
      });
    } else {
      // Create
      await fetch("/api/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setIsModalOpen(false);
    fetchRoles();
  };

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
      <h1>Quản lý vai trò</h1>
      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <button
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
          Thêm vai trò
        </button>
      </div>
      <AdminTable
        columns={[
          { id: "name", label: "Tên vai trò" },
          { id: "description", label: "Mô tả" },
        ]}
        rows={roles}
        onEdit={handleEditRole}
        onDelete={handleDeleteRole}
      />
      <AdminModal
        open={isModalOpen}
        title={editingRole ? "Chỉnh sửa vai trò" : "Thêm vai trò"}
        onClose={() => setIsModalOpen(false)}
        onConfirm={null}
        confirmLabel={null}
        cancelLabel={null}
      >
        <AdminForm
          fields={[
            {
              name: "name",
              label: "Tên vai trò",
              value: form.name,
              onChange: handleFormChange,
              required: true,
            },
            {
              name: "description",
              label: "Mô tả",
              value: form.description,
              onChange: handleFormChange,
              required: true,
            },
          ]}
          onSubmit={handleSaveRole}
          submitLabel={editingRole ? "Cập nhật" : "Thêm mới"}
        />
      </AdminModal>
    </div>
  );
}
