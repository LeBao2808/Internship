"use client";
import React, { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";

interface Blog {
  _id?: string;
  title: string;
  content: string;
  user: string;
  image_url: string;
  createdAt?: string;   // <-- Add this line
  updatedAt?: string;   // <-- (Optional) Add this line for consistency
}

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState({ title: "", content: "", user: "", image_url: "" });
  const [users, setUsers] = useState<{ id: string; name: string; email: string; image_url?: string }[]>([]);
  const [search, setSearch] = useState("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailBlog, setDetailBlog] = useState<Blog | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [blogId, setBlogId] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadingBlog, setUploadingBlog] = useState<Blog | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewUpload, setPreviewUpload] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogs();
    fetchUsers(); // Thêm dòng này để lấy danh sách user
  }, []);

  const fetchBlogs = async (query = "") => {
    let url = "/api/blog";
    if (query) url += `?search=${encodeURIComponent(query)}`;
    const res = await fetch(url);
    const data = await res.json();
    setBlogs(Array.isArray(data.blogs) ? data.blogs : []);
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/user");
    const data = await res.json();
    setUsers(
      Array.isArray(data.users)
        ? data.users.map((user: any) => ({
            id: user._id || user.id,
            name: user.name,
            email: user.email,
            image_url: user.image_url,
          }))
        : []
    );
  };

  const handleAddClick = () => {
    setEditingBlog(null);
    setForm({ title: "", content: "", user: "" , image_url: "",});
    setIsModalOpen(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title || "",
      content: blog.content || "",
      user: blog.user || "",
      image_url: blog.image_url || ""
    });
    setIsModalOpen(true);
  };

  const handleDeleteBlog = async (blog: Blog) => {
    await fetch("/api/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: blog._id }),
    });
    fetchBlogs();
  };

  const handleUploadImage = (blog: Blog) => {
    setUploadingBlog(blog);
    setBlogId(blog._id || "");
    setImage(null);
    setResult(null);
    setIsUploadModalOpen(true);
  };

const handleUploadImageSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!image || !blogId) {
    setResult("Vui lòng chọn ảnh và nhập Blog ID");
    return;
  }

  const formData = new FormData();
  formData.append("image", image);
  formData.append("id", blogId);

  try {
    const res = await fetch("/api/blog/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      setResult("Upload thành công: " + data.image_url);
      setIsUploadModalOpen(false);      // Đóng modal
      setPreviewUpload(null);           // Reset preview
      fetchBlogs();                     // Cập nhật lại danh sách blog (và hình ảnh)
    } else {
      setResult("Lỗi: " + data.error);
    }
  } catch (err) {
    setResult("Lỗi kết nối server");
  }
};
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBlog) {
      await fetch("/api/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingBlog._id, ...form }),
      });
    } else {
      await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setIsModalOpen(false);
    fetchBlogs();
  };

  // Hàm xử lý khi bấm nút xem chi tiết
  const handleViewDetail = (blog: Blog) => {
    setDetailBlog(blog);
    setDetailModalOpen(true);
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
      <h1>Blog Management</h1>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <form
          onSubmit={e => {
            e.preventDefault();
            fetchBlogs(search);
          }}
          style={{ display: "flex", gap: 8 }}
        >
          <input
            type="text"
            placeholder="Search blog..."
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
          Add Blog
        </button>
      </div>
      <AdminTable
        columns={[
          { id: "image_url", label: "Image" },
          { id: "title", label: "Title" },
          { id: "user", label: "Author" },
          { id: "content", label: "Content" },
        ]}
        rows={blogs.map(blog => ({
          ...blog,
          user:
          users.find(u => u.id === blog.user)?.name ||
          users.find(u => u.id === blog.user)?.email ||
          blog.user,
            image_url: (
              <img
                src={blog.image_url}
                alt="blog"
                style={{ width: 60, height: 40, objectFit: "cover", cursor: "pointer" }}
                onClick={() => setPreviewImage(blog.image_url)}
              />
            )
        }))}
        onEdit={handleEditBlog}
        onDelete={handleDeleteBlog}
        onViewDetail={handleViewDetail}
        onUpload={handleUploadImage}

      />
      <AdminModal
        open={isModalOpen}
        title={editingBlog ? "Edit Blog" : "Add Blog"}
        onClose={() => setIsModalOpen(false)}
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
              required: true,
            },
            {
              name: "image_url",
              label: "Image URL",
              value: form.image_url,
              onChange: handleFormChange,
              required: true,
            },
          ]}
          onSubmit={handleSaveBlog}
          submitLabel={editingBlog ? "Update" : "Create"}
          // onBack={() => setIsModalOpen(false)}
        >

<div>
  {users.length > 0 && (
    <React.Suspense fallback={null}>
      {React.createElement(require("../../components/AdminSelect").default, {
        label: "User",
        name: "user",
        value: form.user,
        options: users.map((user: any) => ({
          value: user.id,
          label: user.name || user.email
        })),
        onChange: (e: any) => setForm({ ...form, user: e.target.value }),
        required: true,
      })}
    </React.Suspense>
  )}
</div>

          <div style={{ marginTop: 12 }}>
            <label>Content:</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleFormChange}
              required
              style={{ width: "100%", minHeight: 100, marginTop: 4, borderRadius: 4, border: "1px solid #ccc", padding: 8 }}
            />
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
            style={{
              background: "#f9f9fb",
              borderRadius: 8,
              padding: 24,
              boxShadow: "0 2px 8px #eee",
              fontSize: 16,
              color: "#222",
              minHeight: 400,
              minWidth: 400,
              maxWidth: 400,
              maxHeight: 700,
              overflowY: "auto",
              position: "relative"
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontWeight: 700, fontSize: 20, color: "#1976d2" }}>Title:</span>
              <span style={{ marginLeft: 8 }}>{detailBlog.title}</span>
            </div>
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontWeight: 700 }}>Author:</span>
              <span style={{ marginLeft: 8 }}>{users.find(u => u.id === detailBlog.user)?.name || detailBlog.user}</span>
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
                  color: "#333"
                }}
              >
                {detailBlog.content}
              </div>
            </div>
            <div>
              <span style={{ fontWeight: 700 }}>Created At:</span>
              <span style={{ marginLeft: 8 }}>{detailBlog.createdAt ? new Date(detailBlog.createdAt).toLocaleString() : ""}</span>
            </div>
          </div>
        )}
        {detailBlog && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
            <button
              style={{
                background: "#e0e0e0",
                color: "#222",
                border: "none",
                borderRadius: 4,
                padding: "8px 24px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 16
              }}
              onClick={() => setDetailModalOpen(false)}
            >Back</button>
            <button
              style={{
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "8px 24px",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 16
              }}
              onClick={() => {
                setDetailModalOpen(false);
                setEditingBlog(detailBlog);
                setForm({
                  title: detailBlog.title || "",
                  content: detailBlog.content || "",
                  user: detailBlog.user || "",
                  image_url: detailBlog.image_url || ""
                });
                setIsModalOpen(true);
              }}
            >Edit</button>
          </div>
        )}
      </AdminModal>

      <AdminModal
        open={isUploadModalOpen}
        title="Upload Ảnh Blog"
        onClose={() => {
          setIsUploadModalOpen(false);
          setPreviewUpload(null);
        }}
        onConfirm={undefined}
        confirmLabel={undefined}
        cancelLabel={undefined}
      >
        <form
          className="flex flex-col items-center gap-4 p-4"
          onSubmit={handleUploadImageSubmit}
        >
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                       file:rounded-full file:border-0
                       file:text-sm file:font-semibold
                       file:bg-blue-50 file:text-blue-700
                       hover:file:bg-blue-100"
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setImage(e.target.files[0]);
                setPreviewUpload(URL.createObjectURL(e.target.files[0]));
              }
            }}
          />
          {previewUpload && (
            <img
              src={previewUpload}
              alt="Preview"
              className="rounded-lg shadow-md max-h-60 object-contain border border-gray-200"
            />
          )}
          <button
            type="submit"
            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            Upload
          </button>
          {result && (
            <div className="mt-2 text-center text-sm text-green-600">{result}</div>
          )}
        </form>
      </AdminModal>

      <AdminModal
    open={!!previewImage}
    title="big size image"
    onClose={() => setPreviewImage(null)}
    onConfirm={undefined}
    confirmLabel={undefined}
    cancelLabel={undefined}
  >
    {previewImage && (
      <img
        src={previewImage}
        alt="Preview"
        style={{ maxWidth: "100%", maxHeight: "70vh", display: "block", margin: "0 auto" }}
      />
    )}
  </AdminModal>


    </div>
  );
}
