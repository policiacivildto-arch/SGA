import React from 'react';

/* eslint-disable react/prop-types */

const Pagination = ({ currentPage, totalCount, pageSize, onPageChange }) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  // Não renderiza nada se houver apenas uma página
  if (totalPages <= 1) {
    return null;
  }

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  // Lógica simples para gerar os botões de página
  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Máximo de botões de página visíveis

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        endPage = maxPagesToShow;
      }
      if (currentPage > totalPages - 3) {
        startPage = totalPages - maxPagesToShow + 1;
      }

      if (startPage > 1) pageNumbers.push(1, 'dots-left');
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      if (endPage < totalPages) pageNumbers.push('dots-right', totalPages);
    }

    return pageNumbers.map((num) =>
      num === 'dots-left' || num === 'dots-right' ? (
        <span key={num} className="pagination-dots">...</span>
      ) : (
        <button key={num} onClick={() => handlePageClick(num)} className={currentPage === num ? 'active' : ''}>
          {num}
        </button>
      )
    );
  };

  return (
    <div className="pagination">
      <button onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1}>‹ Anterior</button>
      {renderPageNumbers()}
      <button onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages}>Próximo ›</button>
      <span className="pagination-info">{totalCount} registro(s)</span>
    </div>
  );
};

export default Pagination;