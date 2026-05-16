import { Book as BookIcon } from 'lucide-react';
import type { Book } from '../types';
import './BookCard.css';

interface BookCardProps {
  book: Book;
  onBorrow: () => void;
  onReturn: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onBorrow, onReturn }) => {
  const isAvailable = book.status === 'available';

  return (
    <div className={`book-card glass ${!isAvailable ? 'borrowed-state' : ''}`}>
      <div className="book-cover-container">
        <img src={book.coverImage} alt={book.title} className="book-cover" />
        <div className={`status-badge ${isAvailable ? 'available' : 'borrowed'}`}>
          {isAvailable ? 'Available' : 'Borrowed'}
        </div>
        <div className="book-category">{book.category}</div>
      </div>
      <div className="book-info">
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <div className="barcode-display" style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
          Barcode: {book.barcode}
        </div>
        
        {!isAvailable && book.borrowedBy && (
          <div className="borrower-info">
            <BookIcon size={14} className="borrower-icon" />
            <span>By: {book.borrowedBy}</span>
          </div>
        )}

        <div className="action-buttons">
          {isAvailable ? (
            <button className="btn btn-primary btn-sm w-100" onClick={onBorrow}>
              Borrow Book
            </button>
          ) : (
            <button className="btn btn-secondary glass btn-sm w-100" onClick={onReturn}>
              Return Book
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
