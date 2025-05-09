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
}

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState({ title: "", content: "", user: "" });
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [search, setSearch] = useState("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailBlog, setDetailBlog] = useState<Blog | null>(null);

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
          }))
        : []
    );
  };

  const handleAddClick = () => {
    setEditingBlog(null);
    setForm({ title: "", content: "", user: "" });
    setIsModalOpen(true);
  };

  const handleEditBlog = (blog: Blog) => {
    setEditingBlog(blog);
    setForm({ title: blog.title, content: blog.content, user: blog.user });
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
      <h1>Quản lý bài viết</h1>
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
            placeholder="Tìm kiếm bài viết..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: 8, borderRadius: 4, border: "1px solid #ccc", minWidth: 220 }}
          />
          <button
            type="submit"
            style={{ padding: "8px 16px", background: "#1976d2", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" }}
          >
            Tìm kiếm
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
          Thêm bài viết
        </button>
      </div>
      <AdminTable
        columns={[
          { id: "title", label: "Tiêu đề" },
          { id: "user", label: "Tác giả" },
          { id: "content", label: "Nội dung" },
        ]}
        rows={blogs.map(blog => ({
          ...blog,
          user:
            users.find(u => u.id === blog.user)?.name ||
            users.find(u => u.id === blog.user)?.email ||
            blog.user // fallback nếu không tìm thấy
        }))}
        onEdit={handleEditBlog}
        onDelete={handleDeleteBlog}
        onViewDetail={handleViewDetail} // Thêm dòng này
      />
      <AdminModal
        open={isModalOpen}
        title={editingBlog ? "Chỉnh sửa bài viết" : "Thêm bài viết"}
        onClose={() => setIsModalOpen(false)}
        onConfirm={null}
        confirmLabel={null}
        cancelLabel={null}
      >
        <AdminForm
          fields={[
            {
              name: "title",
              label: "Tiêu đề",
              value: form.title,
              onChange: handleFormChange,
              required: true,
            },
          ]}
          onSubmit={handleSaveBlog}
          submitLabel={editingBlog ? "Cập nhật" : "Thêm mới"}
        >

<div>
  {users.length > 0 && (
    <React.Suspense fallback={null}>
      {React.createElement(require("../../components/AdminSelect").default, {
        label: "Người dùng",
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
            <label>Nội dung:</label>
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
      {/* Modal xem chi tiết */}
      <AdminModal
        open={detailModalOpen}
        title="Chi tiết bài viết"
        onClose={() => setDetailModalOpen(false)}
        onConfirm={null}
        confirmLabel={null}
        cancelLabel={null}// Thêm dòng này để modal rộng hơn
      >
        {detailBlog && (
          <div
            style={{
              background: "#f9f9fb",
              borderRadius: 8,
              padding: 24,
              boxShadow: "0 2px 8px #eee",
              fontSize: 16,
              color: "#222"
            }}
          >
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontWeight: 700, fontSize: 20, color: "#1976d2" }}>Tiêu đề:</span>
              <span style={{ marginLeft: 8 }}>{detailBlog.title}</span>
            </div>
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontWeight: 700 }}>Tác giả:</span>
              <span style={{ marginLeft: 8 }}>{users.find(u => u.id === detailBlog.user)?.name || detailBlog.user}</span>
            </div>
            <div style={{ marginBottom: 10 }}>
              <span style={{ fontWeight: 700 }}>Nội dung:</span>
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
              <span style={{ fontWeight: 700 }}>Ngày tạo:</span>
              <span style={{ marginLeft: 8 }}>{detailBlog.createdAt ? new Date(detailBlog.createdAt).toLocaleString() : ""}</span>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}