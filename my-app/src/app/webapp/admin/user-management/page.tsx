"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";

interface User {
  id?: number;
  name: string;
  email: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch("/api/user");
    const data = await res.json();
    setUsers(data);
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setForm({ name: "", email: "" });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setForm({ name: user.name, email: user.email });
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        />
      </AdminModal>
    </div>
  );
}
