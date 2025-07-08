"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../../../../components/AdminTable";
import AdminModal from "../../../../components/AdminModal";
import AdminForm from "../../../../components/AdminForm";
import Pagination from "../../../../components/Pagination";
import AdminSelect from "../../../../components/AdminSelect";
import { useMessageStore } from "../../../../components/messageStore";
import { z } from "zod";
import "./user-management.css";
import InputSearch from "../../../../components/InputSearch";
import { useSession } from "next-auth/react";
import { useSortableColumns } from "../../../../hooks/useSortableColumns";
import { User } from "@/utils/type";
import ImageUploader from "../../../../components/ImageUploader";
import { useTranslation } from "react-i18next";
import { useForm } from "@/hooks/useForm";

const UserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  image: z.string().optional().nullable(),
});

export default function UserManagementPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;
  const { form, setForm, errors, setErrors, handleFormChange } = useForm(
    UserSchema,
    { name: "", email: "", role: "", image: "" }
  );
  const { setMessage } = useMessageStore();
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
      if (size) params.push(`limit=${size}`);
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
          {t("Add User")}
        </button>
      </div>
      <AdminTable
        columns={[
          {
            id: "name",
            label: renderColumnHeader({ id: "name", label: t("User Name") }),
          },
          {
            id: "email",
            label: renderColumnHeader({ id: "email", label: t("Email") }),
          },
          {
            id: "nameRole",
            label: renderColumnHeader({ id: "role", label: t("Role") }),
          },
          {
            id: "image",
            label: renderColumnHeader({ id: "image", label: t("Image") }),
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
        title={editingUser ? t("Edit User") : t("Add User")}
        onClose={() => handleCloseModal()}
        onConfirm={undefined}
        confirmLabel={undefined}
        cancelLabel={undefined}
      >
        <AdminForm
          fields={[
            {
              name: "name",
              label: t("User Name"),
              value: form.name,
              onChange: handleFormChange,
              error: !!errors.name,
              helperText: errors.name,
            },
            {
              name: "email",
              label: t("Email"),
              value: form.email,
              onChange: handleFormChange,
              error: !!errors.email,
              helperText: errors.email,
            },
          ]}
          onSubmit={handleSaveUser}
          submitLabel={editingUser ? t("Update") : t("Create")}
        >
          {editingUser && (
            <ImageUploader
              id="user-image-upload"
              currentImage={form.image}
              onUploadSuccess={(imageUrl: string) => {
                setForm({ ...form, image: imageUrl });
              }}
            />
          )}
          <div>
            {roles.length > 0 && (
              <React.Suspense fallback={null}>
                <AdminSelect
                  label={t("Role")}
                  name="role"
                  error={!!errors.role}
                  value={form.role}
                  helperText={errors.role}
                  options={roles}
                  onChange={(e: any) => {
                    setForm({ ...form, role: e.target.value });
                    if (e.target.value) {
                      setErrors((prev:any) => {
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
