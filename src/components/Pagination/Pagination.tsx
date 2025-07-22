import React from "react";
import { RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
import "./Pagination.scss";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`pagination ${className}`}>
      <div className="pagination-info">
        <span>
          Showing {(currentPage - 1) * 10 + 1} to{" "}
          {Math.min(currentPage * 10, totalCount)} of {totalCount} properties
        </span>
      </div>

      <div className="pagination-controls">
        <button
          className="pagination-button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <RiArrowLeftLine />
        </button>

        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === "..." ? (
              <span className="pagination-ellipsis">...</span>
            ) : (
              <button
                className={`pagination-button ${
                  currentPage === page ? "active" : ""
                }`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        <button
          className="pagination-button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <RiChevronRightLine />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
