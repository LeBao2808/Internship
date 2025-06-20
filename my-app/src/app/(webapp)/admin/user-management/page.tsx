"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";
import Pagination from "../../components/Pagination";
import AdminSelect from "../../components/AdminSelect";
import { useMessageStore } from "../../components/messageStore";
import { z } from "zod";
import "./user-management.css";
import InputSearch from "../../components/InputSearch";
import { useSession } from "next-auth/react";
import { useSortableColumns } from "../../../../hooks/useSortableColumns";
import { User } from "@/utils/type";

const UserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
});

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    image: "",
  });
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const { setMessage } = useMessageStore();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const { sortBy, sortOrder, renderColumnHeader } =
    useSortableColumns<User>("name");
  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers(search, currentPage, pageSize);
  }, [currentPage, search, sortBy, sortOrder]);
  const fetchUsers = async (query = "", page = currentPage, size = 10) => {
    try {
      setLoading(true);
      let url = `/api/user`;
      const params = [];
      if (query) params.push(`search=${encodeURIComponent(query)}`);
      if (sortBy) params.push(`sort=${sortBy}:${sortOrder}`);
      if (page) params.push(`page=${page}`);
      if (size) params.push(`pageSize=${size}`);
      if (params.length > 0) url += "?" + params.join("&");
      const res = await fetch(url);
      const data = await res.json();
      setUsers(
        data.users.map((user: any) => ({
          ...user,
          id: user.id || user._id || null,
        }))
      );
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    const res = await fetch("/api/role");
    const data = await res.json();
    const rolesArray = Array.isArray(data.roles) ? data.roles : [];
    setRoles(
      rolesArray.map((role: any) => ({
        value: role._id || role.id,
        label: role.name,
      }))
    );
  };

  const handleAddClick = () => {
    setEditingUser(null);
    setForm({
      name: "",
      email: "",
      role: "",
      image: "",
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role._id || "",
      image: user.image || "",
    });
    setIsModalOpen(true);
  };
  const handleDeleteUser = async (user: User) => {
    await fetch("/api/user", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user._id }),
    });
    fetchUsers();
  };

  const handleFormChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "name") {
      const result = UserSchema.shape.name.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          name: result.error.errors[0]?.message || "Invalid title",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.name;
          return newErrors;
        });
      }
    }
    if (name === "email") {
      const result = UserSchema.shape.email.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          email: result.error.errors[0]?.message || "Invalid email",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.email;
          return newErrors;
        });
      }
    }
  };

  const handleCloseModal = () => {
    setErrors({});
    setForm({
      name: "",
      email: "",
      role: "",
      image: "",
    });
    setEditingUser(null);
    setIsModalOpen(false);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = UserSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0] || "",
        email: fieldErrors.email?.[0] || "",
        role: fieldErrors.role?.[0] || "",
      });
      return;
    }

    setErrors({});
    const payload = {
      ...form,
      image: typeof form.image === "string" ? form.image : "",
    };

    if (editingUser) {
      await fetch(`/api/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingUser._id, ...payload }),
      });
      setMessage("Edit User Successful!", "success");
    } else {
      try {
        const res = await fetch("/api/user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Unknown error");
          return;
        } else {
          setMessage("Add User Successful!", "success");
        }
      } catch (error) {
        console.error("Error adding user:", error);
      }
    }

    setIsModalOpen(false);
    fetchUsers();
  };

  if (session && session.user?.role != "admin") {
    return null;
  }

  return (
    <div className="user-management-container">
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
            fetchUsers(e.target.value);
          }}
        />
        <button className="btn-add" onClick={handleAddClick}>
          Add User
        </button>
      </div>
      <AdminTable
        columns={[
          {
            id: "name",
            label: renderColumnHeader({ id: "name", label: "Name" }),
          },
          {
            id: "email",
            label: renderColumnHeader({ id: "email", label: "Email" }),
          },
          {
            id: "nameRole",
            label: renderColumnHeader({ id: "role", label: "Role" }),
          },
          {
            id: "image",
            label: renderColumnHeader({ id: "image", label: "Image" }),
          },
        ]}
        rows={users.map((user) => ({
          ...user,
          role: user.role || "",
          image: typeof user.image === "string" ? user.image : "",
          nameRole: user.role.name || "",
        }))}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        loading={loading}
      />

      {error && <div className="text-red-500 mb-2">{error}</div>}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(total / pageSize) || 1}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={pageSize}
      />
      <AdminModal
        open={isModalOpen}
        title={editingUser ? "Edit User" : "Add User"}
        onClose={() => handleCloseModal()}
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
              error: !!errors.name,
              helperText: errors.name,
            },
            {
              name: "email",
              label: "Email",
              value: form.email,
              onChange: handleFormChange,
              error: !!errors.email,
              helperText: errors.email,
            },
          ]}
          onSubmit={handleSaveUser}
          submitLabel={editingUser ? "Update" : "Create"}
        >
          {editingUser && (
            <div style={{ marginTop: 12 }}>
              <label
                style={{ fontWeight: 600, marginBottom: 6, display: "block" }}
              >
                Image:
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <label
                  htmlFor="user-image-upload"
                       style={{
                    background: "#1976d2",
                    color: "#fff",
                    padding: "8px 20px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontWeight: 600,
                    boxShadow: "0 2px 8px #e3e3e3",
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#1251a3")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "#1976d2")
                  }
                >
                  Chọn ảnh
                  <input
                    id="user-image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const formData = new FormData();
                        formData.append("image", file);
                        if (editingUser && editingUser._id) {
                          formData.append("id", editingUser._id.toString());
                        }
                        const res = await fetch("/api/user/upload", {
                          method: "POST",
                          body: formData,
                        });
                        const data = await res.json();
                        if (res.ok && data.image) {
                          setForm({ ...form, image: data.image });
                        } else {
                          alert(
                            "Upload thất bại: " +
                              (data.error || "Unknown error")
                          );
                        }
                      }
                    }}
                  />
                </label>
                {form.image && (
                  <img
                    src={form.image}
                    alt="Preview"
                    className="image-preview"
                  />
                )}
              </div>
            </div>
          )}
          <div>
            {roles.length > 0 && (
              <React.Suspense fallback={null}>
                <AdminSelect
                  label="Role"
                  name="role"
                  error={!!errors.role}
                  value={form.role}
                  helperText={errors.role}
                  options={roles}
                  onChange={(e: any) => {
                    setForm({ ...form, role: e.target.value });
                    if (e.target.value) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.role;
                        return newErrors;
                      });
                    }
                  }}
                />
              </React.Suspense>
            )}
          </div>
        </AdminForm>
      </AdminModal>
    </div>
  );
}
