"use client";

import React, { useEffect, useState } from "react";
import AdminTable from "../../components/AdminTable";
import AdminModal from "../../components/AdminModal";
import AdminForm from "../../components/AdminForm";
import { useMessageStore } from "../../components/messageStore";
import { z } from "zod";
import InputSearch from "../../components/InputSearch";
import Pagination from "../../components/Pagination";
import { useSession } from "next-auth/react";
import { useSortableColumns } from "../../../../hooks/useSortableColumns";
import { Comment } from "@/utils/type"

const CommentSchema = z.object({
  content: z.string().min(1, "Description is required"),
  name: z.string().min(1, "Name is required"),
});

export default function CommentManagementPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [form, setForm] = useState({ content: "", user: "", blog: "" });
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const { setMessage } = useMessageStore();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession();
  const { sortBy, sortOrder, renderColumnHeader } = useSortableColumns<Comment>("content");
  useEffect(() => {
    fetchComments(search, currentPage, pageSize);
  }, [search, currentPage, pageSize, sortBy, sortOrder]);

  const fetchComments = async (query = "", page = currentPage, size = 10) => {
    try {
      setLoading(true);
      let url = "/api/comment";
      const params = [];
      if (query) params.push(`search=${encodeURIComponent(query)}`);
      if (sortBy) params.push(`sort=${sortBy}:${sortOrder}`);
      if (page) params.push(`page=${page}`);
      if (size) params.push(`pageSize=${size}`);
      if (params.length > 0) url += "?" + params.join("&");
      const res = await fetch(url);
      const data = await res.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
           setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    setForm({
      content: comment.content,
      user: String(comment.user),
      blog: String(comment.blog),
    });
    setIsModalOpen(true);
  };

  const handleDeleteComment = async (comment: Comment) => {
    await fetch("/api/comment", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: comment._id }),
    });
    setMessage("Delete Comment Successful!", "error");
    fetchComments();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    if (name === "content") {
      const result = CommentSchema.shape.content.safeParse(value);
      if (!result.success) {
        setErrors((prev) => ({
          ...prev,
          content: result.error.errors[0]?.message || "Invalid content",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.content;
          return newErrors;
        });
      }
    }
    if (name === "user") {
      const isValid = /^[a-f\d]{24}$/i.test(value);
      if (!isValid) {
        setErrors((prev) => ({
          ...prev,
          user: "Invalid user ID",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.user;
          return newErrors;
        });
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setErrors({});
    setForm({
      content: "",
      user: "",
      blog: "",
    });
  };

  const handleSaveComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (editingComment) {
      await fetch("/api/comment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingComment._id, ...form }),
      });
      setMessage("Edit Comment Successful!", "success");
    } else {
      await fetch("/api/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setMessage("Add Comment Successful!", "success");
    }

    setIsModalOpen(false);
    fetchComments();
  };

  return (
    <div
      style={{
        width: "100%",
        padding: 24,
        background: "#fff",
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
            fetchComments(e.target.value);
          }}
        />
      </div>

      <AdminTable
        columns={[
          {
            id: "content",
            label: renderColumnHeader({ id: "content", label: "Content" }),
          },
          {
            id: "nameUser",
            label: renderColumnHeader({ id: "nameUser", label: "User Name" }),
          },
          {
            id: "titleBlog",
            label: renderColumnHeader({ id: "titleBlog", label: "Blog Title" }),
          },
        ]}
        rows={comments.map((comment) => ({
          ...comment,
          user:
            typeof comment.user === "object" &&
            comment.user !== null &&
            "name" in comment.user
              ? comment.user._id
              : comment.user,

          nameUser:
            typeof comment.user === "object" &&
            comment.user !== null &&
            "name" in comment.user
              ? comment.user.name
              : comment.user,

          titleBlog:
            typeof comment.blog === "object" &&
            comment.blog !== null &&
            "title" in comment.blog
              ? comment.blog.title
              : comment.blog,
          blog:
            typeof comment.blog === "object" &&
            comment.blog !== null &&
            "title" in comment.blog
              ? comment.blog._id
              : comment.blog,
        }))}
       onEdit={session?.user?.role === "admin" ?  undefined : handleEditComment }
        onDelete={handleDeleteComment}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(total / pageSize) || 1}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={pageSize}
        onPageSizeChange={(size) => setPageSize(size)}
      />

      <AdminModal
        open={isModalOpen}
        title={editingComment ? "Edit Comment" : "Add Comment"}
        onClose={handleCloseModal}
      >
        <AdminForm
          fields={[
            {
              name: "content",
              label: "Content",
              value: form.content,
              onChange: handleFormChange,
              error: !!errors.content,
              helperText: errors.content,
            },
            {
              name: "user",
              label: "User ID",
              value: form.user,
              onChange: handleFormChange,
              error: !!errors.user,
              helperText: errors.user,
              display: true ,
            },
            {
              name: "blog",
              label: "Blog ID",
              value: form.blog,
              onChange: handleFormChange,
              error: !!errors.blog,
              helperText: errors.blog,
              display:true,
            },
          ]}
          onSubmit={handleSaveComment}
          submitLabel={editingComment ? "Update" : "Create"}
        />
      </AdminModal>
    </div>
  );
}
