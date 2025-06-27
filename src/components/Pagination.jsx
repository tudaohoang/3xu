import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }
  return (
    <div className="flex space-x-2 justify-center mt-6">
      {pages.map((page) => (
        <button
          key={page}
          className={`px-3 py-1 rounded-lg ${
            page === currentPage ? "bg-blue-500 text-white" : "bg-gray-300"
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
