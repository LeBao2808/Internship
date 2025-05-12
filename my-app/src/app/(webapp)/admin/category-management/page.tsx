"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";

interface Category {
  _id?: string;
  name: string;
  description: string;
}

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async (query = "") => {
    let url = "/api/category";
    if (query) url += `?search=${encodeURIComponent(query)}`;
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

  const handleDeleteCategory = async (category: Category) => {
    await fetch("/api/category", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category._id }),
    });
    fetchCategories();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      // Update
      await fetch("/api/category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCategory._id, ...form }),
      });
    } else {
      // Create
      await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setIsModalOpen(false);
    fetchCategories();
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
      <h1>Category Management</h1>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <form
          onSubmit={e => {
            e.preventDefault();
            fetchCategories(search);
          }}
          style={{ display: "flex", gap: 8 }}
        >
          <input
            type="text"
            placeholder="Search category..."
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
          Add Category
        </button>
      </div>
      <AdminTable
        columns={[
          { id: "name", label: "Category Name" },
          { id: "description", label: "Description" },
        ]}
        rows={Array.isArray(categories) ? categories : []}
        onEdit={handleEditCategory}
        onDelete={handleDeleteCategory}
      />
      <AdminModal
        open={isModalOpen}
        title={editingCategory ? "Edit Category" : "Add Category"}
        onClose={() => setIsModalOpen(false)}
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
          onSubmit={handleSaveCategory}
          submitLabel={editingCategory ? "Update" : "Create"}
        />
      </AdminModal>
    </div>
  );
}
