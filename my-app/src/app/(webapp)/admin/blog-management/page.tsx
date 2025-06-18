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
import { useSession } from "next-auth/react";
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
  featured?:boolean
}
const BlogSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  content: z.string().min(1, "Content is required"),
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
  const { data: session, status } = useSession();
  useEffect(() => {
    // fetchUsers();
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

const handleFeatured = async (blog:Blog) => {
  const res = await fetch(`/api/blog/featured/${blog._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ featured: !blog.featured }),
  });

  if (res.ok) {
    // Cập nhật lại state blogs ở client
    setBlogs((prev) =>
      prev.map((b) => (b._id === blog._id ? { ...b, featured: !b.featured } : b))
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
  console.log(form);
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
    // Đảm bảo image_url là string
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
        <InputSearch
          onInput={(e) => {
            setSearch(e.target.value);
            fetchBlogs(e.target.value, currentPage, pageSize);
          }}
        />
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

          {/* <button
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
          </button> */}
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
          featured: blog.featured || false,
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
 
       onFeatured={session?.user?.role === "admin" ?  handleFeatured : undefined}
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
   
          ]}
          onSubmit={handleSaveBlog}
          submitLabel={editingBlog ? "Update" : "Create"}
          // onBack={() => setIsModalOpen(false)}
        >
          {/* <div>
            <React.Suspense fallback={null}>
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
          </div> */}

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

          {/* {editingBlog && ( */}
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
                        // if (editingBlog && editingBlog._id) {
                        //   formData.append("id", editingBlog._id);
                        // }
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
                            "Upload thất bại: " +
                              (data.error || "Unknown error")
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
    </div>
  );
}
