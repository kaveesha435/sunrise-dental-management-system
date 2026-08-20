import './Pagination.css';

/**
 * Pagination — page navigation controls.
 *
 * @param {number}   currentPage  - 1-indexed
 * @param {number}   totalPages
 * @param {Function} onPageChange - called with new page number
 * @param {number}   totalItems
 * @param {number}   pageSize
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  className = '',
}) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, totalItems);

  const pages = buildPageRange(currentPage, totalPages);

  return (
    <nav className={`pagination ${className}`} aria-label="Pagination">
      {/* Info */}
      {totalItems != null && (
        <span className="pagination__info">
          Showing {start}–{end} of {totalItems}
        </span>
      )}

      {/* Controls */}
      <div className="pagination__controls">
        {/* Previous */}
        <button
          type="button"
          className="pagination__btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Page numbers */}
        {pages.map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="pagination__ellipsis">…</span>
          ) : (
            <button
              key={page}
              type="button"
              className={`pagination__btn${page === currentPage ? ' pagination__btn--active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          type="button"
          className="pagination__btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

/** Builds a compact page range with ellipsis. */
function buildPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];
  if (current > 3) pages.push('...');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}
