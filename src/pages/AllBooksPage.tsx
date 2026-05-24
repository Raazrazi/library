import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Filter, BookOpen } from 'lucide-react';
import BookCard from '../components/BookCard';
import BorrowModal from '../components/BorrowModal';
import { useLibrary } from '../hooks/useLibrary';
import type { Book } from '../types';
import './AllBooksPage.css';

const AllBooksPage: React.FC = () => {
  const navigate = useNavigate();
  const { books, borrowBook, returnBook, removeBook } = useLibrary();

  const [borrowingBook, setBorrowingBook] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'available' | 'borrowed'>('all');

  const categories = ['All', ...Array.from(new Set(books.map(b => b.category)))];

  const filteredBooks = books.filter(book => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.barcode.includes(searchQuery);
    const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'available' && book.status === 'available') ||
      (selectedStatus === 'borrowed' && book.status === 'borrowed');
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const availableCount = books.filter(b => b.status === 'available').length;
  const borrowedCount = books.filter(b => b.status === 'borrowed').length;

  return (
    <div className="all-books-page">
      {/* Top Bar */}
      <header className="all-books-header">
        <div className="all-books-header-inner">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </button>
          <div className="all-books-title-group">
            <BookOpen size={22} className="title-icon" />
            <h1 className="all-books-title">
              Full <span className="text-gradient">Inventory</span>
            </h1>
          </div>
          <div className="all-books-stats">
            <span className="stat-chip available">{availableCount} Available</span>
            <span className="stat-chip borrowed">{borrowedCount} Borrowed</span>
          </div>
        </div>
      </header>

      <main className="all-books-main container">
        {/* Filters Bar */}
        <div className="filters-bar glass">
          {/* Search */}
          <div className="search-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by title, author or barcode…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <Filter size={15} className="filter-icon" />
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="status-tabs">
            {(['all', 'available', 'borrowed'] as const).map(s => (
              <button
                key={s}
                className={`status-tab ${selectedStatus === s ? 'active' : ''}`}
                onClick={() => setSelectedStatus(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="results-count">
          Showing <strong>{filteredBooks.length}</strong> of <strong>{books.length}</strong> books
        </p>

        {/* Grid */}
        <div className="all-books-grid">
          {filteredBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              onBorrow={() => setBorrowingBook(book)}
              onReturn={() => returnBook(book.id)}
              onRemove={removeBook}
            />
          ))}
          {filteredBooks.length === 0 && (
            <div className="empty-state">
              <BookOpen size={48} className="empty-icon" />
              <p>No books match your filters.</p>
            </div>
          )}
        </div>
      </main>

      <BorrowModal
        book={borrowingBook}
        onClose={() => setBorrowingBook(null)}
        onBorrow={(studentName) => {
          if (borrowingBook) borrowBook(borrowingBook.id, studentName);
          setBorrowingBook(null);
        }}
      />
    </div>
  );
};

export default AllBooksPage;
