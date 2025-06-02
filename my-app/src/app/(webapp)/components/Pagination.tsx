import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  // pageSize,
  // pageSizeOptions = [10, 20, 50],
  // onPageSizeChange,
}) => {
  // if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);
    if (currentPage <= 3) {
      end = Math.min(5, totalPages);
    }
    if (currentPage >= totalPages - 2) {
      start = Math.max(1, totalPages - 4);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        justifyContent: "center",
        margin: "16px 0",
      }}
    >
      {/* <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        style={{
          padding: "6px 12px",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: currentPage === 1 ? "#eee" : "#fff",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
      >
        First page
      </button> */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: "6px 12px",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: currentPage === 1 ? "#eee" : "#fff",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
      >
        Before
      </button>
      {getPages().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid #1976d2",
            background: page === currentPage ? "#1976d2" : "#fff",
            color: page === currentPage ? "#fff" : "#1976d2",
            fontWeight: page === currentPage ? 600 : 400,
            cursor: page === currentPage ? "default" : "pointer",
          }}
          disabled={page === currentPage}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: "6px 12px",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: currentPage === totalPages ? "#eee" : "#fff",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        }}
      >
        After
      </button>
      {/* <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        style={{
          padding: "6px 12px",
          borderRadius: 4,
          border: "1px solid #ccc",
          background: currentPage === totalPages ? "#eee" : "#fff",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        }}
      >
        Last page
      </button> */}
      {/* {onPageSizeChange && (
        <select
          value={pageSize}
          onChange={e => onPageSizeChange(Number(e.target.value))}
          style={{ marginLeft: 16, padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
        >
          {pageSizeOptions.map(size => (
            <option key={size} value={size}>
              {size} / trang
            </option>
          ))}
        </select>
      )} */}
    </div>
  );
};

export default Pagination;
