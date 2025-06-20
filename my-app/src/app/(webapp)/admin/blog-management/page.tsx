"use client";
import React, { useEffect, useState, useMemo } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";
import Pagination from "../../components/Pagination";
import dynamic from "next/dynamic";
import AdminSelect from "../../components/AdminSelect";
import { useMessageStore } from "../../components/messageStore";
import { z } from "zod";
import InputSearch from "../../components/InputSearch";
import { useSession } from "next-auth/react";
import { useSortableColumns } from "../../../../hooks/useSortableColumns";
import { Blog } from "@/utils/type";
const Editor = dynamic(() => import("./MyEditor"), { ssr: false });

const BlogSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  content: z.string().min(1, "Content is required"),
  category: z.string().min(1, "Category is required"),
  image_url: z.string().optional(),
});
export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [detailBlog, setDetailBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    user: "",
    image_url: "",
    category: "",
  });

  const [search, setSearch] = useState("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { setMessage } = useMessageStore();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const { sortBy, sortOrder, renderColumnHeader } =
    useSortableColumns<Blog>("title");
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs(search, currentPage, pageSize);
  }, [currentPage, pageSize, search, sortBy, sortOrder]);

  const fetchCategories = async () => {
    const res = await fetch("/api/category");
    const data = await res.json();
    const arr = Array.isArray(data.categories) ? data.categories : [];
    setCategories(
      arr.map((cat: any) => ({
        value: cat._id || cat.id,
        label: cat.name,
      }))
    );
  };

  const fetchBlogs = async (query = "", page = currentPage, size = 10) => {
    try {
      setLoading(true);
      let url = "/api/blog";
      const params = [];
      if (query) params.push(`search=${encodeURIComponent(query)}`);
      if (sortBy) params.push(`sort=${sortBy}:${sortOrder}`);
      if (page) params.push(`page=${page}`);
      if (size) params.push(`limit=${size}`);
      if (params.length > 0) url += "?" + params.join("&");
      const res = await fetch(url);
      const data = await res.json();
      setBlogs(Array.isArray(data.blogs) ? data.blogs : []);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingBlog(null);
    setForm({
      title: "",
      content: "",
      user: "",
      image_url: "",
      category: "",
    });
    setIsModalOpen(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    console.log("blog", blog);

    setForm({
      title: blog.title || "",
      content: blog.content || "",
      user: blog.user._id || "",
      category: blog.category._id || "",
      image_url: blog.image_url || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteBlog = async (blog: Blog) => {
    try {
      await fetch("/api/blog", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: blog._id }),
      });
      setMessage("Delete Blog Successful!", "error");
      fetchBlogs();
    } catch (err) {
      setMessage("Delete Blog Failed!", "error");
    }
  };

  const handleFeatured = async (blog: Blog) => {
    const res = await fetch(`/api/blog/featured/${blog._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ featured: !blog.featured }),
    });

    if (res.ok) {
      setBlogs((prev) =>
        prev.map((b) =>
          b._id === blog._id ? { ...b, featured: !b.featured } : b
        )
      );
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "title") {
      const result = BlogSchema.shape.title.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          title: result.error.errors[0]?.message || "Invalid title",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.title;
          return newErrors;
        });
      }
    }
  };

  console.log("form.user", form.user)
    console.log("form", form.category)

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = BlogSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0] || "",
        content: fieldErrors.content?.[0] || "",
        // user: session?.user?.id|| "",
        category: fieldErrors.category?.[0] || "",
      });
      return;
    }
    setErrors({});
    const payload = {
      ...form,
      user: session?.user,
      image_url: typeof form.image_url === "string" ? form.image_url : "",
      category:
        typeof form.category === "object" && form.category !== null
          ? (form.category as { _id: string })._id
          : form.category,
    };
    if (editingBlog) {
      
      editingBlog.title = form.title;
      editingBlog.category._id = form.category;
      const res = await fetch("/api/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingBlog._id, ...editingBlog }),
      });
      if (res.ok) {
        setMessage("Edit Blog Successful!", "success");
      }
    } else {
      try {
        const res = await fetch("/api/blog", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setMessage("Add Blog Successful!", "success");
        } else {
          return;
        }
      } catch {
        setMessage("Add Blog Failed!", "error");
      }
    }
    setIsModalOpen(false);
    fetchBlogs();
  };

  const handleCloseModal = () => {
    setErrors({});
    setEditingBlog(null);
    setForm({
      title: "",
      content: "",
      user: "",
      image_url: "",
      category: "",
    });

    setIsModalOpen(false);
  };
  const handleViewDetail = (blog: Blog) => {
    setDetailBlog(blog);
    console.log("blog detail",blog);
    setDetailModalOpen(true);
  };
  console.log("blogs", editingBlog);
  const EditorFormat = useMemo(
    () => (
      <Editor
        error={errors.content}
        helperText={errors.content}
        value={editingBlog ? editingBlog.content : form.content}
        onChange={(data: string) => {
          console.log("data", data);
          console.log("editingBlog", editingBlog);
          if (editingBlog) {
            console.log("data", data);
            setEditingBlog({
              ...editingBlog,
              content: data,
            });
          } else {
            console.log("form", form);
            setForm({ ...form, content: data });
          }
          // console.log("data", data);
          console.log("editingBlog", data.length);
          if (data && data.length === 0) {
            setErrors((prev) => ({
              ...prev,
              content: "Content is required",
            }));
          } else {
            setErrors((prev) => {
              const newErrors = { ...prev };
              delete newErrors.content;
              return newErrors;
            });
          }
        }}
        setErrors={setErrors}
      />
    ),
    [editingBlog, form]
  );

  const ImgUpload = useMemo(() => {
    if (editingBlog) {
      return (
        editingBlog.image_url && (
          <img
            src={editingBlog.image_url}
            alt="Preview"
            style={{
              maxWidth: 120,
              maxHeight: 80,
              borderRadius: 8,
              border: "1px solid #eee",
              boxShadow: "0 2px 8px #e3e3e3",
              background: "#fafbfc",
              objectFit: "cover",
            }}
          />
        )
      );
    }
    return (
      form.image_url && (
        <img
          src={form.image_url}
          alt="Preview"
          style={{
            maxWidth: 120,
            maxHeight: 80,
            borderRadius: 8,
            border: "1px solid #eee",
            boxShadow: "0 2px 8px #e3e3e3",
            background: "#fafbfc",
            objectFit: "cover",
          }}
        />
      )
    );
  }, [form, editingBlog]);

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
            fetchBlogs(e.target.value, currentPage, pageSize);
          }}
        />
        <div className="btn-add ">
          <button
            onClick={handleAddClick}
          >
            Add Blog
          </button>
        </div>
      </div>
      <AdminTable
        columns={[
          {
            id: "image_url",
            label: renderColumnHeader({ id: "image_url", label: "Image" }),
          },
          {
            id: "title",
            label: renderColumnHeader({ id: "title", label: "Title" }),
          },
          {
            id: "nameuser",
            label: renderColumnHeader({ id: "nameuser", label: "Name Author" }),
          },
          {
            id: "content",
            label: renderColumnHeader({ id: "content", label: "Content" }),
          },

          {
            id: "namecategory",
            label: renderColumnHeader({
              id: "namecategory",
              label: "Name Category",
            }),
          },
        ]}
        rows={blogs.map((blog) => ({
          ...blog,
          featured: blog.featured || false,
          user: blog.user._id?.toString() || "",
          nameuser: blog.user.name || "",
          category: blog.category || "",
          namecategory: blog.category.name || "",
          image_url: blog.image_url || "",
        }))}
        onFeatured={
          session?.user?.role === "admin" ? handleFeatured : undefined
        }
        onEdit={handleEditBlog}
        onDelete={handleDeleteBlog}
        onViewDetail={handleViewDetail}
        loading={loading}
        // onUpload={handleUploadImage}
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
        title={editingBlog ? "Edit Blog" : "Add Blog"}
        onClose={handleCloseModal}
        onConfirm={undefined}
        confirmLabel={undefined}
        cancelLabel={undefined}
      >
        <AdminForm
          fields={[
            {
              name: "title",
              label: "Title",
              value: form.title,
              onChange: handleFormChange,
              error: !!errors.title,
              helperText: errors.title,
            },
          ]}
          onSubmit={handleSaveBlog}
          submitLabel={editingBlog ? "Update" : "Create"}
        >
          <div>
            {categories.length > 0 && (
              <React.Suspense fallback={null}>
                <AdminSelect
                  label="Category"
                  name="category"
                  error={!!errors.category}
                  helperText={errors.category}
                  value={form.category}
                  options={categories}
                  onChange={(e: any) => {
                    setForm({ ...form, category: e.target.value });
                    if (e.target.value) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.category;
                        return newErrors;
                      });
                    }
                  }}
                />
              </React.Suspense>
            )}
          </div>
          <div style={{ marginTop: 12 }}>
            <label
              style={{ fontWeight: 600, marginBottom: 6, display: "block" }}
            >
              Image:
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <label
                htmlFor="blog-image-upload"
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
                  id="blog-image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      const formData = new FormData();
                      formData.append("upload", file);
                      const res = await fetch("/api/upload", {
                        method: "POST",
                        body: formData,
                      });
                      const data = await res.json();
                      if (res.ok && data.image_url) {
                        if (editingBlog) {
                          setEditingBlog({
                            ...editingBlog,
                            image_url: data.image_url,
                          });
                        } else {
                          setForm({ ...form, image_url: data.image_url });
                        }
                      } else {
                        alert(
                          "Upload thất bại: " + (data.error || "Unknown error")
                        );
                      }
                    }
                  }}
                />
              </label>

              {ImgUpload}
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label>Content:</label>

            {EditorFormat}
          </div>
        </AdminForm>
      </AdminModal>
      {/* Detail Modal */}
      <AdminModal
        open={detailModalOpen}
        title="Blog Detail"
        onClose={() => setDetailModalOpen(false)}
        onConfirm={undefined}
        confirmLabel={undefined}
        cancelLabel={undefined}
      >
        {detailBlog && (
          <div
          className="blog-detail-modal"
          >
            {detailBlog.image_url && (
              <img
                src={detailBlog.image_url}
                alt="Blog"
                className="blog-detail-image"
              />
            )}
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontWeight: 700, fontSize: 20, color: "#1976d2" }}>
                Title:
              </span>
              <span style={{ marginLeft: 8 }}>{detailBlog.title}</span>
            </div>
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontWeight: 700 }}>Author:</span>
              <span style={{ marginLeft: 8 }}>
                {detailBlog.nameuser}
              </span>
            </div>
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontWeight: 700 }}>Category:</span>
              <span style={{ marginLeft: 8 }}>
                {detailBlog.namecategory || ""}
              </span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontWeight: 700 }}>Content:</span>
              <div
                style={{
                  whiteSpace: "pre-line",
                  border: "1px solid #e0e0e0",
                  padding: 12,
                  borderRadius: 6,
                  marginTop: 6,
                  background: "#fff",
                  color: "#333",
                }}
                dangerouslySetInnerHTML={{ __html: detailBlog.content }}
              ></div>
            </div>
            <div>
              <span style={{ fontWeight: 700 }}>Created At:</span>
              <span style={{ marginLeft: 8 }}>
                {detailBlog.createdAt
                  ? new Date(detailBlog.createdAt).toLocaleString()
                  : ""}
              </span>
            </div>
          </div>
        )}
        {detailBlog && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 32,
            }}
          >
            <button
              style={{
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "8px 24px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 16,
              }}
              onClick={() => {
                setDetailModalOpen(false);
                setEditingBlog(detailBlog);
                setForm({
                  title: detailBlog.title || "",
                  content: detailBlog.content || "",
                  user:
                     detailBlog.user._id || "",
                  image_url: detailBlog.image_url || "",
                  category:
                    detailBlog.category._id || "",
                });
                setIsModalOpen(true);
              }}
            >
              Edit
            </button>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
