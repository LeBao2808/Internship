"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useMessageStore } from "../../components/messageStore";

interface Role {
  _id?: string;
  name: string;
  description: string;
}

export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Role>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { setMessage } = useMessageStore();

  useEffect(() => {
    fetchRoles();
  }, [sortBy, sortOrder]); // Thêm sortBy, sortOrder vào dependency

  const fetchRoles = async (query = "") => {
    let url = "/api/role";
    const params = [];
    if (query) params.push(`search=${encodeURIComponent(query)}`);
    if (sortBy) params.push(`sort=${sortBy}:${sortOrder}`);
    if (params.length > 0) url += "?" + params.join("&");
    const res = await fetch(url);
    const data = await res.json();
    setRoles(Array.isArray(data.roles) ? data.roles : []);
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
    setMessage("Delete role Successful!", "error");
    fetchRoles();
  };

  const handleDeleteModalRole = (role: Role) => {
    setEditingRole(role);
    setIsModalDelete(true);
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
      setMessage("Edit role Successful!", "success");
    } else {
      // Create
      await fetch("/api/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setMessage("Add role Successful!", "success");
    }
    setIsModalOpen(false);
    fetchRoles();
  };

  // Hàm render tiêu đề cột với icon sort
  const renderColumnHeader = (col: { id: keyof Role; label: string }) => (
    <span
      className="flex items-center gap-1 cursor-pointer select-none"
      onClick={() => {
        if (sortBy === col.id) {
          setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
          setSortBy(col.id);
          setSortOrder("asc");
        }
      }}
    >
      {col.label}
      {sortBy === col.id ? (
        sortOrder === "asc" ? (
          <FaSortUp />
        ) : (
          <FaSortDown />
        )
      ) : (
        <FaSort className="opacity-50" />
      )}
    </span>
  );

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
      {/* <h1>Role Management</h1> */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchRoles(search);
          }}
          style={{ display: "flex", gap: 8 }}
        >
          <input
            type="text"
            placeholder="Search role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: 8,
              borderRadius: 4,
              border: "1px solid #ccc",
              minWidth: 220,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "8px 16px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>
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
          Add Role
        </button>
      </div>
      <AdminTable
        columns={[
          {
            id: "name",
            label: renderColumnHeader({ id: "name", label: "Role Name" }),
          },
          {
            id: "description",
            label: renderColumnHeader({
              id: "description",
              label: "Description",
            }),
          },
        ]}
        rows={Array.isArray(roles) ? roles : []} // Dùng roles trực tiếp, không dùng sortedRoles
        onEdit={handleEditRole}
        onDelete={handleDeleteModalRole}
      />
      <AdminModal
        open={isModalOpen}
        title={editingRole ? "Edit Role" : "Add Role"}
        onClose={() => setIsModalOpen(false)}
        onConfirm={undefined}
        confirmLabel={undefined}
        cancelLabel={undefined}
      >
        <AdminForm
          fields={[
            {
              name: "name",
              label: "Role Name",
              value: form.name,
              onChange: handleFormChange,
              required: true,
            },
            {
              name: "description",
              label: "Description",
              value: form.description,
              onChange: handleFormChange,
              required: true,
            },
          ]}
          onSubmit={handleSaveRole}
          submitLabel={editingRole ? "Update" : "Create"}
        />
      </AdminModal>

      {isModalDelete && (
        <AdminModal
          open={isModalDelete}
          title="Delete Role"
          onClose={() => setIsModalDelete(false)}
          onConfirm={() => {
            handleDeleteRole(editingRole!);
            setIsModalDelete(false);
          }}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          isDelete={true}
        >
          <h2>Are you sure you want to delete this role?</h2>
        </AdminModal>
      )}
    </div>
  );
}
