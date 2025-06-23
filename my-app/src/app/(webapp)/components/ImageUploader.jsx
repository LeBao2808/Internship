import React from "react";

const ImageUploader = ({ id, currentImage, onUploadSuccess }) => {
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("upload", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok && data.image_url) {
      onUploadSuccess(data.image_url);
    } else {
      alert("Upload thất bại: " + (data.error || "Unknown error"));
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <label
        htmlFor={id}
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
          id={id}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
      </label>

      {currentImage && (
        <img
          src={currentImage}
          alt="Preview"
          className="image-preview"
          style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8 }}
        />
      )}
    </div>
  );
};

export default ImageUploader;