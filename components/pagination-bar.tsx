interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationBar({ currentPage, totalPages, onPageChange }: PaginationBarProps) {
  // Helper to generate page numbers with ellipsis
  function getPageNumbers() {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        className="w-8 h-8 flex items-center justify-center rounded border text-lg font-bold disabled:opacity-50 bg-white"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous"
      >
        &lt;
      </button>
      {pageNumbers.map((num, idx) =>
        num === '...'
          ? <span key={idx} className="px-2 text-lg">...</span>
          : <button
              key={num}
              className={`w-8 h-8 flex items-center justify-center rounded border text-lg font-bold transition-colors ${currentPage === num ? 'bg-mktv-accent text-white' : 'bg-white text-black hover:bg-mktv-accent hover:text-white'}`}
              onClick={() => onPageChange(Number(num))}
              disabled={currentPage === num}
            >
              {num}
            </button>
      )}
      <button
        className="w-8 h-8 flex items-center justify-center rounded border text-lg font-bold disabled:opacity-50 bg-white"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next"
      >
        &gt;
      </button>
    </div>
  );
} 