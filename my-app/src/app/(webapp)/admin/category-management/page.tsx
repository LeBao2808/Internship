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
import { useSortableColumns } from "../hooks/useSortableColumns";
import { Category } from "@/utils/type";

const CategogySchema = z.object({
  description: z.string().min(1, "Description is required"),
  name: z.string().min(1, "Name is required"),
});

export default function CategoryManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");
  const { setMessage } = useMessageStore();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
 const { sortBy, sortOrder, renderColumnHeader } = useSortableColumns<Category>("name");

  useEffect(() => {
    fetchCategories(search, currentPage, pageSize);
  }, [search, currentPage, pageSize, sortBy, sortOrder]);

  const fetchCategories = async (query = "", page = currentPage, size = 10) => {
    try {
      setLoading(true);
      let url = "/api/category";
      const params = [];
      if (query) params.push(`search=${encodeURIComponent(query)}`);
      if (sortBy) params.push(`sort=${sortBy}:${sortOrder}`);
      if (page) params.push(`page=${page}`);
      if (size) params.push(`pageSize=${size}`);
      if (params.length > 0) url += "?" + params.join("&");
      const res = await fetch(url);
      const data = await res.json();
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } finally {
      setLoading(false);
    }
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
      await fetch("/api/category", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingCategory._id, ...form }),
      });
      setMessage("Edit Catelogy Successful!", "success");
    } else {
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
            e.preventDefault();
            fetchCategories(e.target.value);
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
        onDelete={handleDeleteCategory}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(0 / pageSize) || 1}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
        }}
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
    </div>
  );
}
