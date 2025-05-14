"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";
import Pagination from "../../components/Pagination";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
interface User {
  id?: number;
  name: string;
  email: string;
  role: string | { _id?: string; name: string }; // Allow role to be string or object
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<keyof User>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [sortBy, sortOrder]);

  const fetchUsers = async (query = "") => {
    let url = `/api/user`;
    const params = [];
    if (query) url += `&search=${encodeURIComponent(query)}`;
    if (sortBy) params.push(`sort=${sortBy}:${sortOrder}`);
    if (params.length > 0) url += "?" + params.join("&");
    const res = await fetch(url);
    const data = await res.json();
    setUsers(data.users.map((user: any) => ({ ...user, id: user.id || user._id })));
    setTotal(data.total);
  };

  const fetchRoles = async () => {
    const res = await fetch("/api/role");
    const data = await res.json();
    const rolesArray = Array.isArray(data.roles) ? data.roles : [];
    setRoles(rolesArray.map((role: any) => ({ value: role._id || role.id, label: role.name })));
  };


  const handleAddClick = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", role: roles.length > 0 ? roles[0].value : "" });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role:
        typeof user.role === "object" && user.role !== null
          ? user.role._id || user.role.name // Prefer id, fallback to name
          : user.role || ""
    });
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
      await fetch(`/api/user`, {
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

  useEffect(() => {
    fetchUsers(search);
    fetchRoles();
  }, [currentPage, pageSize]);


  const renderColumnHeader = (col: { id: keyof User; label: string }) => (
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
        sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />
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
      {/* <h1>User Management</h1> */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <form
          onSubmit={e => {
            e.preventDefault();
            setCurrentPage(1);
            fetchUsers(search,);
          }}
          style={{ display: "flex", gap: 8 }}
        >
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", minWidth: 220 }}
          />
          <button
            type="submit"
            style={{ padding: "8px 16px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
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
          Add User
        </button>
      </div>
      <AdminTable
        columns={[
          { id: "name", label: renderColumnHeader({id: "name", label: "Name" }) },
          { id: "email", label: renderColumnHeader({id: "email", label: "Email" })  },
          { id: "role", label: renderColumnHeader({id: "role", label: "Role" })  },
        ]}
        rows={users.map(user => ({
          ...user,
          role: typeof user.role === "object" && user.role !== null ? user.role.name : user.role
        }))}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(total / pageSize) || 1}
        onPageChange={page => setCurrentPage(page)}
        pageSize={pageSize}
        onPageSizeChange={size => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
      <AdminModal
        open={isModalOpen}
        title={editingUser ? "Edit User" : "Add User"}
        onClose={() => setIsModalOpen(false)}
        onConfirm={undefined}
        confirmLabel={undefined}
        cancelLabel={undefined}
      >
        <AdminForm
          fields={[
            {
              name: "name",
              label: "User Name",
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
          submitLabel={editingUser ? "Update" : "Create"}
        >
          <div>
            {roles.length > 0 && (
              <React.Suspense fallback={null}>
                {React.createElement(require("../../components/AdminSelect").default, {
                  label: "Role",
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
