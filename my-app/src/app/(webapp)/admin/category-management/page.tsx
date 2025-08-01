"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../../../../components/AdminTable";
import AdminModal from "../../../../components/AdminModal";
import AdminForm from "../../../../components/AdminForm";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useMessageStore } from "../../../../components/messageStore";
import { z } from "zod";
import InputSearch from "../../../../components/InputSearch";
import Pagination from "../../../../components/Pagination";
import { useSortableColumns } from "../../../../hooks/useSortableColumns";
import { Category } from "@/utils/type";
import { useTranslation } from "react-i18next"; // hoặc "next-i18next"
import ImageUploader from "@/components/ImageUploader";
import { useForm } from "@/hooks/useForm";

const CategogySchema = z.object({
  description: z.string().min(1, "Description is required"),
  name: z.string().min(1, "Name is required"),
  image: z.string().optional().nullable(),
});

export default function CategoryManagementPage() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { form, setForm, errors, setErrors, handleFormChange } = useForm(
    CategogySchema,
    {
      name: "",
      description: "",
      image: "",
    }
  );
  const [search, setSearch] = useState("");
  const { setMessage } = useMessageStore();
  const [loading, setLoading] = useState(false);
  const { sortBy, sortOrder, renderColumnHeader } =
    useSortableColumns<Category>("name");

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
    setForm({ name: "", description: "", image: "" });
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description,
      image: category.image || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    await fetch("/api/category", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category._id }),
    });
    setMessage(t("Delete Category Successful!"), "error");
    fetchCategories();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
    setForm({
      description: "",
      name: "",
      image: "",
    });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = CategogySchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        name: t(fieldErrors.name?.[0] || "Name is required"),
        description: t(
          fieldErrors.description?.[0] || "Description is required"
        ),
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
      setMessage(t("Edit Category Successful!"), "success");
    } else {
      await fetch("/api/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setMessage(t("Add Category Successful!"), "success");
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
          {t("Add Category")}
        </button>
      </div>
      <AdminTable
        columns={[
          {
            id: "name",
            label: renderColumnHeader({
              id: "name",
              label: t("Category Name"),
            }),
          },
          {
            id: "description",
            label: renderColumnHeader({
              id: "description",
              label: t("Description"),
            }),
          },
          {
            id: "image",
            label: renderColumnHeader({
              id: "image",
              label: t("Image"),
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
        totalPages={Math.ceil(total / pageSize) || 1}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
        }}
      />
      <AdminModal
        open={isModalOpen}
        title={editingCategory ? t("Edit Category") : t("Add Category")}
        onClose={() => handleCloseModal()}
        onConfirm={undefined}
        confirmLabel={undefined}
        cancelLabel={undefined}
      >
        <AdminForm
          fields={[
            {
              name: "name",
              label: t("Category Name"),
              value: form.name,
              onChange: handleFormChange,
              error: !!errors.name,
              helperText: errors.name,
            },
            {
              name: "description",
              label: t("Description"),
              value: form.description,
              onChange: handleFormChange,
              error: !!errors.description,
              helperText: errors.description,
            },
          ]}
          onSubmit={handleSaveCategory}
          submitLabel={editingCategory ? t("Update") : t("Create")}
        >
          {editingCategory && (
            <ImageUploader
              id="user-image-upload"
              currentImage={form.image}
              onUploadSuccess={(imageUrl: string) => {
                setForm({ ...form, image: imageUrl });
              }}
            />
          )}
        </AdminForm>
      </AdminModal>
    </div>
  );
}
