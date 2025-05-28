"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useMessageStore } from "../../components/messageStore";
import { z } from "zod";
interface Category {
  _id?: string;
  name: string;
  description: string;
}

const CategogySchema = z.object({
  description: z.string().min(1, "Description is required"),
  name: z.string().min(1, "Name is required"),
});

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDelete, setIsModalDelete] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<keyof Category>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { setMessage } = useMessageStore();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    fetchCategories();
  }, [sortBy, sortOrder]);

  const fetchCategories = async (query = "") => {
    let url = "/api/category";
    const params = [];
    if (query) url += `?search=${encodeURIComponent(query)}`;
    if (sortBy) params.push(`sort=${sortBy}:${sortOrder}`);
    ``;
    if (params.length > 0) url += "?" + params.join("&");
    const res = await fetch(url);
    const data = await res.json();
    setCategories(Array.isArray(data.categories) ? data.categories : []);
  };

  const handleAddClick = () => {
    setEditingCategory(null);
    setForm({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setForm({ name: category.name, description: category.description });
    setIsModalOpen(true);
  };

  const handleDeleteModalCategory = (category: Category) => {
    setEditingCategory(category);
    setIsModalDelete(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    await fetch("/api/category", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category._id }),
    });
    setMessage("Delete Catelogy Successful!", "error");
    fetchCategories();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "name") {
      const result = CategogySchema.shape.name.safeParse(value);
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
      const result = CategogySchema.shape.description.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          description: result.error.errors[0]?.message || "Invalid description",
        }));
      }
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.description;
        return newErrors;
      });
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

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = CategogySchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0] || "",
        description: fieldErrors.description?.[0] || "",
      });
      return;
    }
    setErrors({});

    if (editingCategory) {
      // Update
      await fetch("/api/category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCategory._id, ...form }),
      });
      setMessage("Edit Catelogy Successful!", "success");
    } else {
      // Create
      await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setMessage("Add Catelogy Successful!", "success");
    }
    setIsModalOpen(false);
    fetchCategories();
  };

  const renderColumnHeader = (col: { id: keyof Category; label: string }) => (
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
      {/* <h1>Category Management</h1> */}
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
            fetchCategories(search);
          }}
          style={{ display: "flex", gap: 8 }}
        >
          <input
            type="text"
            placeholder="Search category..."
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
          Add Category
        </button>
      </div>
      <AdminTable
        columns={[
          {
            id: "name",
            label: renderColumnHeader({ id: "name", label: "Name" }),
          },
          {
            id: "description",
            label: renderColumnHeader({
              id: "description",
              label: "Description",
            }),
          },
        ]}
        rows={Array.isArray(categories) ? categories : []}
        onEdit={handleEditCategory}
        onDelete={handleDeleteModalCategory}
      />
      <AdminModal
        open={isModalOpen}
        title={editingCategory ? "Edit Category" : "Add Category"}
        onClose={() => handleCloseModal()}
        onConfirm={undefined}
        confirmLabel={undefined}
        cancelLabel={undefined}
      >
        <AdminForm
          fields={[
            {
              name: "name",
              label: "Category Name",
              value: form.name,
              onChange: handleFormChange,
              error: !!errors.name,
              helperText: errors.name,
              // required: true,
            },
            {
              name: "description",
              label: "Description",
              value: form.description,
              onChange: handleFormChange,
              error: !!errors.description,
              helperText: errors.description,
              // required: true,
            },
          ]}
          onSubmit={handleSaveCategory}
          submitLabel={editingCategory ? "Update" : "Create"}
        />
      </AdminModal>

      {isModalDelete && (
        <AdminModal
          open={isModalDelete}
          title="Delete Category"
          onClose={() => setIsModalDelete(false)}
          onConfirm={() => {
            handleDeleteCategory(editingCategory!);
            setIsModalDelete(false);
          }}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          isDelete={true}
        >
          <h2>Are you sure you want to delete this Category?</h2>
        </AdminModal>
      )}
    </div>
  );
}
