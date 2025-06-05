"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useMessageStore } from "../../components/messageStore";
import { z } from "zod";
import InputSearch from "../../components/InputSearch";
import Pagination from "../../components/Pagination";
interface Role {
  _id?: string;
  name: string;
  description: string;
}
const RoleSchema = z.object({
  description: z.string().min(1, "Description is required"),
  name: z.string().min(1, "Name is required"),
});
export default function RoleManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Role>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { setMessage } = useMessageStore();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  // useEffect(() => {
  //   fetchRoles();
  // }, [sortBy, sortOrder]); // Thêm sortBy, sortOrder vào dependency

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
    // setLoading(true);
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

  // const handleDeleteModalRole = (role: Role) => {
  //   setEditingRole(role);
  //   setIsModalDelete(true);
  // };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "name") {
      const result = RoleSchema.shape.name.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          title: result.error.errors[0]?.message || "Invalid title",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.name;
          return newErrors;
        });
      }
    }

    if (name === "description") {
      const result = RoleSchema.shape.description.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          description: result.error.errors[0]?.message || "Invalid description",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.description;
          return newErrors;
        });
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsModalDelete(false);
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
        name: fieldErrors.name?.[0] || "",
        description: fieldErrors.description?.[0] || "",
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
        className="container-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        {/* <form
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
        </form> */}
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
          // setCurrentPage(1);
        }}
      />
      <AdminModal
        open={isModalOpen}
        title={editingRole ? "Edit Role" : "Add Role"}
        onClose={() => handleCloseModal()}
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
              error: !!errors.name,
              helperText: errors.name,
            },
            {
              name: "description",
              label: "Description",
              value: form.description,
              onChange: handleFormChange,
              error: !!errors.description,
              helperText: errors.description,
            },
          ]}
          onSubmit={handleSaveRole}
          submitLabel={editingRole ? "Update" : "Create"}
        />
      </AdminModal>

      {/* {isModalDelete && (
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
      )} */}
    </div>
  );
}
