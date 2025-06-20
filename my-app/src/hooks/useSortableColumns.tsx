
import { useState } from "react";
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

interface Column<T> {
  id: keyof T;
  label: string;
}

export const useSortableColumns = <T extends Record<string, any>>(initialSortBy: keyof T) => {
  const [sortBy, setSortBy] = useState<keyof T>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const renderColumnHeader = (col: Column<T>) => (
    <span
      className="flex items-center gap-1 cursor-pointer select-none"
      onClick={() => {
        if (sortBy === col.id) {
          setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
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

  return {
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    renderColumnHeader,
  };
};