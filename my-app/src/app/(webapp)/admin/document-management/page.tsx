"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMessageStore } from "@/components/messageStore";
import InputSearch from "@/components/InputSearch";
import Pagination from "@/components/Pagination";
import AdminTable from "@/components/AdminTable";

export default function DocumentManagementPage() {
  // Add CSS for animation
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const { data: session } = useSession();
  const { setMessage } = useMessageStore();

  useEffect(() => {
    fetchDocuments(search, currentPage, pageSize);
  }, [search, currentPage, pageSize]);

  const fetchDocuments = async (query = "", page = currentPage, size = pageSize) => {
    try {
      setLoading(true);
      let url = "/api/documents";
      const params = [];
      if (query) params.push(`search=${encodeURIComponent(query)}`);
      if (page) params.push(`page=${page}`);
      if (size) params.push(`pageSize=${size}`);
      if (params.length > 0) url += "?" + params.join("&");
      const res = await fetch(url);
      const data = await res.json();
      setDocuments(data.documents || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setMessage("Document uploaded and processed successfully!", "success");
        setFile(null);
        setShowModal(false);
        fetchDocuments(search, currentPage, pageSize);
      } else {
        setMessage("Failed to upload document", "error");
      }
    } catch (error) {
      setMessage("Error uploading document", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setMessage("Document deleted successfully!", "success");
      fetchDocuments(search, currentPage, pageSize);
    } catch (error) {
      setMessage("Failed to delete document", "error");
    }
  };


  return (
    <div style={{
      width: "100%",
      margin: 0,
      padding: 24,
      background: "#fff",
      borderRadius: 0,
      boxShadow: "0 2px 8px #eee",
    }}>
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
            fetchDocuments(e.target.value);
          }}
        />
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 16px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Upload Document
        </button>
        
        {showModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            backdropFilter: "blur(3px)",
          }}>
            <div style={{
              backgroundColor: "white",
              padding: 28,
              borderRadius: 12,
              width: "450px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              animation: "fadeIn 0.1s ease-out",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Upload Document</h3>
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setFile(null);
                  }}
                  style={{
                    background: "transparent",
                    border: "none",
                    fontSize: 22,
                    cursor: "pointer",
                    color: "#666",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    transition: "all 0.02s",
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f0f0f0"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleFileUpload} style={{ marginBottom: 0 }}>
                <div style={{ 
                  border: "2px dashed #ddd", 
                  borderRadius: 8, 
                  padding: 20, 
                  marginBottom: 20,
                  backgroundColor: "#fafafa",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}>
                  <div style={{ marginBottom: 12 }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: "0 auto" }}>
                      <path d="M12 16L12 8" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M9 11L12 8 15 11" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 16H16" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M3 19H21" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p style={{ margin: "0 0 10px 0", color: "#666" }}>Drag and drop your file here or</p>
                  <label htmlFor="file-upload" style={{
                    display: "inline-block",
                    padding: "6px 16px",
                    backgroundColor: "#f0f7ff",
                    color: "#1976d2",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: 500,
                    border: "1px solid #1976d2",
                  }}>
                    Browse Files
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".txt,.docx,.doc"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    style={{ display: "none" }}
                  />
                  {file && (
                    <div style={{ 
                      marginTop: 12, 
                      padding: "8px 12px", 
                      backgroundColor: "#e3f2fd", 
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <span style={{ fontSize: 14 }}>{file.name}</span>
                      <button 
                        type="button" 
                        onClick={() => setFile(null)}
                        style={{ 
                          background: "none", 
                          border: "none", 
                          color: "#666", 
                          cursor: "pointer",
                          fontSize: 18,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
                
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFile(null);
                    }}
                    style={{
                      padding: "10px 16px",
                      background: "#f5f5f5",
                      color: "#333",
                      border: "none",
                      borderRadius: 6,
                      cursor: "pointer",
                      fontWeight: 500,
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#e0e0e0"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!file || uploading}
                    style={{
                      padding: "10px 20px",
                      background: uploading ? "#ccc" : "#1976d2",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      cursor: uploading ? "not-allowed" : "pointer",
                      fontWeight: 500,
                      transition: "all 0.2s",
                      boxShadow: uploading ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                    onMouseOver={(e) => {
                      if (!uploading) e.currentTarget.style.backgroundColor = "#1565c0";
                    }}
                    onMouseOut={(e) => {
                      if (!uploading) e.currentTarget.style.backgroundColor = "#1976d2";
                    }}
                  >
                    {uploading ? "Processing..." : "Upload & Process"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <AdminTable
        columns={[
          { id: "name", label: "Name" },
          { id: "type", label: "Type" },
          { id: "size", label: "Size" },
          { id: "createdAt", label: "Uploaded" },
        ]}
        rows={documents.map((doc) => ({
          ...doc,
          size: `${Math.round(doc.size / 1024)} KB`,
          createdAt: new Date(doc.createdAt).toLocaleDateString(),
        }))}
        onDelete={(doc) => handleDelete(doc._id)}
        loading={loading}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={Math.ceil(total / pageSize) || 1}
        onPageChange={(page) => setCurrentPage(page)}
        pageSize={pageSize}
        onPageSizeChange={(size) => setPageSize(size)}
      />
    </div>
  );
}