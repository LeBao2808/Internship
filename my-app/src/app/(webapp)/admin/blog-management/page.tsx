"use client";
import React, { useEffect, useState, useMemo } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import Pagination from "../../components/Pagination";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import AdminSelect from "../../components/AdminSelect";
import { useMessageStore } from "../../components/messageStore";
import { z } from "zod";
import InputSearch from "../../components/InputSearch";
const Editor = dynamic(() => import("./MyEditor"), { ssr: false });

interface Blog {
  _id?: string;
  title: string;
  content: string;
  user: string | { _id: string; name: string };
  image_url: string;
  category: string | { _id: string; name: string };
  createdAt?: string;
  namecategory?: string;
  nameuser?: string;
  updatedAt?: string;
}
const BlogSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  content: z.string().min(1, "Content is required"),
  user: z.string().min(1, "User is required"),
  category: z.string().min(1, "Category is required"),
  image_url: z.string().optional(),
});
export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isUpload, setIsUpload] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    user: "",
    image_url: "",
    category: "",
  });
  const [users, setUsers] = useState<
    { id: string; name: string; email: string }[]
  >([]);
  const [search, setSearch] = useState("");
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailBlog, setDetailBlog] = useState<Blog | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    { value: string; label: string }[]
  >([]);
  const [sortBy, setSortBy] = useState<keyof Blog>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const router = useRouter();
  const { setMessage } = useMessageStore();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchCategories();
  }, []);

  // useEffect(() => {
  //   fetchBlogs();
  //   // Thêm dòng này để lấy danh sách category
  // }, [sortBy, sortOrder]);

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
      if (size) params.push(`pageSize=${size}`);
      if (params.length > 0) url += "?" + params.join("&");
      const res = await fetch(url);
      const data = await res.json();
      setBlogs(Array.isArray(data.blogs) ? data.blogs : []);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch("/api/user");
    const data = await res.json();
    const arr = Array.isArray(data.users) ? data.users : [];
    setUsers(
      arr.map((user: any) => ({
        id: user._id || user.id,
        name: user.name || user.email,
        email: user.email,
      }))
    );
  };

  // const hanleClose = () => {
  //   setIsModalOpen(false);
  //   setEditingBlog(null);
  //   setForm({
  //     title: "",
  //     content: "",
  //     user: "",
  //     image_url: "",
  //     category: "",
  //   });
  // };

  const handleAddClick = () => {
    // setIsUpload(false);
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
    // setIsUpload(true);
    setEditingBlog(blog);
    console.log("blog", blog);

    setForm({
      title: blog.title || "",
      content: blog.content || "",
      user:
        typeof blog.user === "object"
          ? blog.user._id
          : typeof blog.user === "object" && blog.user !== null
          ? blog.user || blog.user
          : blog.user || "",
      image_url: blog.image_url || "",
      category:
        typeof blog.category === "object" && blog.category !== null
          ? blog.category._id
          : typeof blog.category === "object" && blog.category !== null
          ? blog.category || blog.category
          : blog.category || "",
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

  // const handleDeleteModalBlog = (blog: Blog) => {
  //   setEditingBlog(blog);
  //   // setIsModalDelete(true);
  // };

  // const handleUploadImageSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!image || !blogId) {
  //     setResult("Vui lòng chọn ảnh và nhập Blog ID");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("image", image);
  //   formData.append("id", blogId);

  //   try {
  //     const res = await fetch("/api/blog/upload", {
  //       method: "POST",
  //       body: formData,
  //     });
  //     const data = await res.json();
  //     if (res.ok) {
  //       setResult("Upload thành công: " + data.image_url);
  //       setIsUploadModalOpen(false);      // Đóng modal
  //       setPreviewUpload(null);           // Reset preview
  //       fetchBlogs();                     // Cập nhật lại danh sách blog (và hình ảnh)
  //     } else {
  //       setResult("Lỗi: " + data.error);
  //     }
  //   } catch (err) {
  //     setResult("Lỗi kết nối server");
  //   }
  // };

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
  console.log(form);
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = BlogSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0] || "",
        content: fieldErrors.content?.[0] || "",
        user: fieldErrors.user?.[0] || "",
        category: fieldErrors.category?.[0] || "",
      });
      return;
    }
    setErrors({});
    // Đảm bảo image_url là string
    const payload = {
      ...form,
      image_url: typeof form.image_url === "string" ? form.image_url : "",
      category:
        typeof form.category === "object" && form.category !== null
          ? (form.category as { _id: string })._id
          : form.category,
    };
    if (editingBlog) {
      editingBlog.title = form.title;
      editingBlog.user = form.user;
      editingBlog.category = form.category;
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
          // setIsError(true);
          // const data = await res.json();
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
    setDetailModalOpen(true);
  };
  const renderColumnHeader = (col: { id: keyof Blog; label: string }) => (
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
      {/* <h1>Blog Management</h1> */}
      <div
        className="container-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        {/* <input
            type="text"
            placeholder="Search blog..."
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
          </button> */}
        <InputSearch
          onInput={(e) => {
            setSearch(e.target.value);
            fetchBlogs(e.target.value, currentPage, pageSize);
          }}
        />

        {/* {isError && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow-lg flex items-center gap-2 animate-fade-in z-[1000] min-w-[320px] max-w-[90vw]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728"
              />
            </svg>
            <span className="font-semibold">{error}</span>
          </div>
        )} */}
        <div className="btn-add flex gap-x-4">
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

          <button
            onClick={() => {
              router.push("/UI/blog");
            }}
            style={{
              padding: "8px 16px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Visit your blog
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
          // {
          //   id: "user",
          //   label: renderColumnHeader({ id: "user", label: "Author" }),
          // },
          {
            id: "nameuser",
            label: renderColumnHeader({ id: "nameuser", label: "Name Author" }),
          },
          {
            id: "content",
            label: renderColumnHeader({ id: "content", label: "Content" }),
          },
          // {
          //   id: "category",
          //   label: renderColumnHeader({ id: "category", label: "Category" }),
          // },
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
          user:
            typeof blog.user === "object" &&
            blog.user !== null &&
            "name" in blog.user
              ? blog.user._id
              : blog.user,

          nameuser:
            typeof blog.user === "object" &&
            blog.user !== null &&
            "name" in blog.user
              ? blog.user.name
              : blog.user,

          category:
            typeof blog.category === "object" &&
            blog.category !== null &&
            "name" in blog.category
              ? blog.category._id
              : blog.category,

          namecategory:
            typeof blog.category === "object" &&
            blog.category !== null &&
            "name" in blog.category
              ? blog.category.name
              : blog.category,

          image_url: typeof blog.image_url === "string" ? blog.image_url : "",
        }))}
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
          // setCurrentPage(1);
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
            // {
            //   name: "image_url",
            //   label: "Image URL",
            //   value: form.image_url,
            //   onChange: handleFormChange,
            //   required: true,
            // },
          ]}
          onSubmit={handleSaveBlog}
          submitLabel={editingBlog ? "Update" : "Create"}
          // onBack={() => setIsModalOpen(false)}
        >
          <div>
            <React.Suspense fallback={null}>
              {/* {React.createElement(
                require("../../components/AdminSelect").default,
                {
                  label: "User",
                  name: "user",
                  value: form.user,
                  options: users.map((user: any) => ({
                    value: user.id,
                    label: user.name || user.email,
                  })),
                  onChange: (e: any) =>
                    setForm({ ...form, user: e.target.value }),
                  required: true,
                }
              )} */}
              <AdminSelect
                label="User"
                name="user"
                error={!!errors.user}
                value={form.user}
                helperText={errors.user}
                options={users.map((user: any) => ({
                  value: user.id,
                  label: user.name || user.email,
                }))}
                onChange={(e: any) => {
                  setForm({ ...form, user: e.target.value });
                  if (e.target.value) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.user;
                      return newErrors;
                    });
                  }
                }}
              />
            </React.Suspense>
          </div>

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

          {editingBlog && (
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
                        formData.append("image", file);
                        if (editingBlog && editingBlog._id) {
                          formData.append("id", editingBlog._id);
                        }
                        const res = await fetch("/api/blog/upload", {
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
                            "Upload thất bại: " +
                              (data.error || "Unknown error")
                          );
                        }
                      }
                    }}
                  />
                </label>
                {/* {form.image_url && (
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
                )} */}
                {ImgUpload}
              </div>
            </div>
          )}
          {/* <div style={{ marginTop: 12 }}>
            <label>Content:</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleFormChange}
              required
              style={{ width: "100%", minHeight: 100, marginTop: 4, borderRadius: 4, border: "1px solid #ccc", padding: 8 }}
            />
          </div> */}

          <div style={{ marginTop: 12 }}>
            <label>Content:</label>
            {/* <CKEditor
              editor={ClassicEditor as any}
              data={form.content}
              onChange={(_event, editor) => {
                const data = editor.getData();
                setForm({ ...form, content: data });
              }}
            /> */}
            {/* <Editor
              // value={form.content}
              onChange={(data: any) => {
                // const data = editor.getData();
                console.log("Editor is ready to use!", data);
                setForm({ ...form, content: data });
              }}
            /> */}
            {EditorFormat}
            {/* {errors &&
              (console.log("errors.content", errors.content),
              (<p className="text-red-500 mt-2">sssss</p>))} */}
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
              maxWidth: 1000,
              maxHeight: 700,
              overflowY: "auto",
              position: "relative",
            }}
          >
            {detailBlog.image_url && (
              <img
                src={detailBlog.image_url}
                alt="Blog"
                style={{
                  width: "100%",
                  maxHeight: 200,
                  objectFit: "contain",
                  borderRadius: 8,
                  marginBottom: 18,
                  border: "1px solid #eee",
                }}
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
                {typeof detailBlog.user === "object" &&
                detailBlog.user !== null &&
                "name" in detailBlog.user
                  ? detailBlog.user.name
                  : users.find((u) => u.id === detailBlog.user)?.name ||
                    detailBlog.user}
              </span>
            </div>
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontWeight: 700 }}>Category:</span>
              <span style={{ marginLeft: 8 }}>
                {typeof detailBlog.category === "object" &&
                detailBlog.category !== null
                  ? detailBlog.category.name
                  : categories.find((c) => c.value === detailBlog.category)
                      ?.label || detailBlog.category}
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
              >
                {/* {detailBlog.content} */}
              </div>
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
            {/* <button
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
            >Back</button> */}
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
                    typeof detailBlog.user === "object" &&
                    detailBlog.user !== null &&
                    "_id" in detailBlog.user
                      ? detailBlog.user._id
                      : detailBlog.user || "",
                  image_url: detailBlog.image_url || "",
                  category:
                    typeof detailBlog.category === "object" &&
                    detailBlog.category !== null
                      ? detailBlog.category._id
                      : detailBlog.category || "",
                });
                setIsModalOpen(true);
              }}
            >
              Edit
            </button>
          </div>
        )}
      </AdminModal>

      {/* <AdminModal
        open={isUploadModalOpen}
        title="Uploah Blog"
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
      </AdminModal> */}

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
            style={{
              maxWidth: "100%",
              maxHeight: "70vh",
              display: "block",
              margin: "0 auto",
            }}
          />
        )}
      </AdminModal>

      {/* {isModalDelete && (
        <AdminModal
          open={isModalDelete}
          title="Delete Blog"
          onClose={() => setIsModalDelete(false)}
          onConfirm={() => {
            handleDeleteBlog(editingBlog!);
            setIsModalDelete(false);
          }}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          isDelete={true}
        >
          <h2>Are you sure you want to delete this Blog?</h2>
        </AdminModal>
      )} */}
    </div>
  );
}
