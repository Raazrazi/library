import BookCard from './BookCard';
import type { Book } from '../types';
import ScannerInput from './ScannerInput';
import './BookGrid.css';

interface BookGridProps {
  books: Book[];
  onAddClick: () => void;
  onBorrowClick: (book: Book) => void;
  onReturnBook: (id: string) => void;
  onScan: (barcode: string) => void;
}

const BookGrid: React.FC<BookGridProps> = ({ books, onAddClick, onBorrowClick, onReturnBook, onScan }) => {
  return (
    <section className="book-grid-section" id="discover">
      <div className="container">
        <ScannerInput onScan={onScan} />
        <div className="section-header">
          <h2 className="section-title">Library <span className="text-gradient">Inventory</span></h2>
          <button className="btn btn-primary" onClick={onAddClick}>+ Add New Book</button>
        </div>
        <div className="book-grid">
          {books.map(book => (
            <BookCard 
              key={book.id} 
              book={book} 
              onBorrow={() => onBorrowClick(book)}
              onReturn={() => onReturnBook(book.id)}
            />
          ))}
          {books.length === 0 && (
            <p style={{ color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>No books registered yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookGrid;
