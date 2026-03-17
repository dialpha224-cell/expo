import { useState, useCallback } from "react";
import axios from "axios";
import { API } from "../App";

/**
 * usePagination - Hook for handling paginated API calls
 * @param {string} endpoint - API endpoint
 * @param {object} initialParams - Initial query parameters
 * @param {number} pageSize - Items per page (default: 20)
 */
export const usePagination = (endpoint, initialParams = {}, pageSize = 20) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize,
    totalItems: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchPage = useCallback(async (page = 1, append = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API}${endpoint}`, {
        params: {
          ...initialParams,
          page,
          page_size: pageSize
        },
        withCredentials: true
      });

      const data = response.data;
      
      // Handle paginated response
      if (data.pagination) {
        setItems(prev => append ? [...prev, ...data.items] : data.items);
        setPagination({
          page: data.pagination.page,
          pageSize: data.pagination.page_size,
          totalItems: data.pagination.total_items,
          totalPages: data.pagination.total_pages,
          hasNext: data.pagination.has_next,
          hasPrev: data.pagination.has_prev
        });
      } else {
        // Handle non-paginated response (backward compatibility)
        const items = Array.isArray(data) ? data : [];
        setItems(prev => append ? [...prev, ...items] : items);
        setPagination(prev => ({
          ...prev,
          page,
          totalItems: items.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: page > 1
        }));
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors du chargement");
      console.error("Pagination error:", err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, initialParams, pageSize]);

  const loadMore = useCallback(() => {
    if (pagination.hasNext && !loading) {
      fetchPage(pagination.page + 1, true);
    }
  }, [fetchPage, pagination.hasNext, pagination.page, loading]);

  const refresh = useCallback(() => {
    setItems([]);
    fetchPage(1, false);
  }, [fetchPage]);

  const goToPage = useCallback((page) => {
    fetchPage(page, false);
  }, [fetchPage]);

  return {
    items,
    loading,
    error,
    pagination,
    fetchPage,
    loadMore,
    refresh,
    goToPage,
    hasMore: pagination.hasNext
  };
};

/**
 * Pagination - UI Component for page navigation
 */
export const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = "" 
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-lg bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
      >
        ←
      </button>

      {/* First page */}
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-1 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            1
          </button>
          {start > 2 && <span className="text-slate-500">...</span>}
        </>
      )}

      {/* Page numbers */}
      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded-lg transition-colors ${
            page === currentPage
              ? "bg-indigo-600 text-white"
              : "bg-slate-700 text-slate-300 hover:bg-slate-600"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Last page */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-slate-500">...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-1 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-lg bg-slate-700 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-colors"
      >
        →
      </button>
    </div>
  );
};

export default usePagination;
