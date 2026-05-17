import { useState } from 'react';
import BookCard from './BookCard';
import type { Book } from '../types';
import ScannerInput from './ScannerInput';
import './BookGrid.css';

const PAGE_SIZE = 8;

interface BookGridProps {
  books: Book[];
  onAddClick: () => void;
  onBorrowClick: (book: Book) => void;
  onReturnBook: (id: string) => void;
  onScan: (barcode: string) => void;
  onRemoveBook?: (id: string) => void;
}

const BookGrid: React.FC<BookGridProps> = ({ books, onAddClick, onBorrowClick, onReturnBook, onScan, onRemoveBook }) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleBooks = books.slice(0, visibleCount);
  const hasMore = visibleCount < books.length;
  const isExpanded = visibleCount > PAGE_SIZE;

  const handleViewMore = () => setVisibleCount(prev => prev + PAGE_SIZE);
  const handleShowLess = () => setVisibleCount(PAGE_SIZE);

  return (
    <section className="book-grid-section" id="discover">
      <div className="container">
        <ScannerInput onScan={onScan} />
        <div className="section-header">
          <h2 className="section-title">Library <span className="text-gradient">Inventory</span></h2>
          <button className="btn btn-primary" onClick={onAddClick}>+ Add New Book</button>
        </div>

        <div className="book-grid">
          {visibleBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onBorrow={() => onBorrowClick(book)}
              onReturn={() => onReturnBook(book.id)}
              onRemove={onRemoveBook}
            />
          ))}
          {books.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>No books registered yet.</p>
          )}
        </div>

        {books.length > PAGE_SIZE && (
          <div className="pagination-row">
            <span className="pagination-count">
              Showing <strong>{visibleBooks.length}</strong> of <strong>{books.length}</strong> books
            </span>
            <div className="pagination-actions">
              {hasMore && (
                <button className="btn btn-view-more" onClick={handleViewMore}>
                  View More <span className="pagination-arrow">↓</span>
                </button>
              )}
              {isExpanded && (
                <button className="btn btn-show-less" onClick={handleShowLess}>
                  Show Less <span className="pagination-arrow">↑</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default BookGrid;
