"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";

interface User {
  id?: number;
  name: string;
  email: string;
  role?: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/user");
    const data = await res.json();
    setUsers(data);
  };

  const fetchRoles = async () => {
    const res = await fetch("/api/role");
    const data = await res.json();
    setRoles(data.map((role: any) => ({ value: role._id || role.id, label: role.name })));
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", role: roles.length > 0 ? roles[0].value : "" });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email, role: user.role || "" });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    await fetch("/api/user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id }),
    });
    fetchUsers();
  };

  const handleFormChange = (e: React.ChangeEvent<any>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser.id, ...form }),
      });
    } else {
      await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setIsModalOpen(false);
    fetchUsers();
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
      <h1>Quản lý người dùng</h1>
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
          Thêm người dùng
        </button>
      </div>
      <AdminTable
        columns={[
          { id: "name", label: "Tên người dùng" },
          { id: "email", label: "Email" },
        ]}
        rows={users}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
      <AdminModal
        open={isModalOpen}
        title={editingUser ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
        onClose={() => setIsModalOpen(false)}
        onConfirm={null}
        confirmLabel={null}
        cancelLabel={null}
      >
        <AdminForm
          fields={[
            {
              name: "name",
              label: "Tên người dùng",
              value: form.name,
              onChange: handleFormChange,
              required: true,
            },
            {
              name: "email",
              label: "Email",
              value: form.email,
              onChange: handleFormChange,
              required: true,
            },
          ]}
          onSubmit={handleSaveUser}
          submitLabel={editingUser ? "Cập nhật" : "Thêm mới"}
        >
          <div>
            {roles.length > 0 && (
              <React.Suspense fallback={null}>
                {React.createElement(require("../../components/AdminSelect").default, {
                  label: "Vai trò",
                  name: "role",
                  value: form.role,
                  options: roles,
                  onChange: (e: any) => setForm({ ...form, role: e.target.value }),
                  required: true,
                })}
              </React.Suspense>
            )}
          </div>
        </AdminForm>
      </AdminModal>
    </div>
  );
}
