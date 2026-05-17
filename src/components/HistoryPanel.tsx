import { useState } from 'react';
import { Search, Clock, BookOpen, User, Calendar, CheckCircle, RefreshCw } from 'lucide-react';
import type { HistoryEntry } from '../types';
import './HistoryPanel.css';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onReturnBook: (bookId: string) => Promise<void>;
  categories: string[];
}

export default function HistoryPanel({ history, onReturnBook, categories }: HistoryPanelProps) {
  const [studentQuery, setStudentQuery] = useState('');
  const [bookQuery, setBookQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'returned'>('all');

  const formatDuration = (seconds: number, isReturned: boolean) => {
    if (!isReturned) return 'Outstanding Loan';
    if (seconds < 60) return `${seconds} seconds`;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes < 60) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours < 24) {
      return `${hours}h ${remainingMinutes}m`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  const filteredLogs = history.filter(log => {
    // 1. Student Name Search
    const matchesStudent = log.studentName.toLowerCase().includes(studentQuery.toLowerCase());
    
    // 2. Book Title or Barcode Search
    const matchesBook = log.bookTitle.toLowerCase().includes(bookQuery.toLowerCase()) || 
                        log.bookBarcode.includes(bookQuery);
    
    // 3. Book Category Filter
    const matchesCategory = selectedCategory === 'All' || log.bookCategory === selectedCategory;
    
    // 4. Status Filter
    const isReturned = log.returnDate !== null;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && !isReturned) ||
                          (statusFilter === 'returned' && isReturned);
                          
    return matchesStudent && matchesBook && matchesCategory && matchesStatus;
  });

  return (
    <div className="history-section container">
      
      {/* Pane Header Banner */}
      <header className="history-header glass">
        <div className="header-meta">
          <Clock size={40} className="header-clock-icon" />
          <div>
            <h1 className="header-title">Borrowing History & Logs</h1>
            <p className="header-descr text-gradient">
              Track student transaction timelines, calculate active checkout durations, and manage due returns.
            </p>
          </div>
        </div>
        <div className="header-stats-row">
          <div className="h-stat-badge">
            <span className="h-stat-num">{history.length}</span>
            <span className="h-stat-lbl">Total Logs</span>
          </div>
          <div className="h-stat-badge active-loans">
            <span className="h-stat-num">{history.filter(h => !h.returnDate).length}</span>
            <span className="h-stat-lbl">Active Dues</span>
          </div>
        </div>
      </header>

      {/* Filter and Search Panel */}
      <div className="history-filters-box glass">
        
        {/* Searching Row */}
        <div className="filters-search-row">
          <div className="search-field-wrapper">
            <label className="field-label"><User size={13} /> Search Borrowing Student</label>
            <div className="search-box-input">
              <Search className="search-decor-icon" size={16} />
              <input
                type="text"
                placeholder="Search by student name..."
                value={studentQuery}
                onChange={(e) => setStudentQuery(e.target.value)}
                className="koha-input"
              />
            </div>
          </div>

          <div className="search-field-wrapper">
            <label className="field-label"><BookOpen size={13} /> Search Book / Barcode</label>
            <div className="search-box-input">
              <Search className="search-decor-icon" size={16} />
              <input
                type="text"
                placeholder="Search by book title or barcode..."
                value={bookQuery}
                onChange={(e) => setBookQuery(e.target.value)}
                className="koha-input"
              />
            </div>
          </div>
        </div>

        {/* Category & Status Filter Row */}
        <div className="filters-control-row">
          <div className="control-group">
            <label className="field-label">Filter by Book Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="koha-select"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label className="field-label">Filter by Status</label>
            <div className="status-filter-tabs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`status-tab-btn ${statusFilter === 'all' ? 'active' : ''}`}
              >
                All Logs
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`status-tab-btn ${statusFilter === 'active' ? 'active' : ''}`}
              >
                Active Outstanding
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('returned')}
                className={`status-tab-btn ${statusFilter === 'returned' ? 'active' : ''}`}
              >
                Returned (Closed)
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Transaction Ledger Table */}
      <div className="history-ledger-card glass">
        <div className="table-responsive-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Barcode</th>
                <th>Student</th>
                <th>Borrowed Date & Time</th>
                <th>Returned Date & Time</th>
                <th>Duration of Loan</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const isReturned = log.returnDate !== null;
                return (
                  <tr key={log.id} className={!isReturned ? 'active-row' : ''}>
                    <td className="book-cell">
                      <img src={log.bookCover} alt={log.bookTitle} className="table-book-cover" />
                      <div className="book-title-meta">
                        <strong className="table-book-title">{log.bookTitle}</strong>
                        <span className="table-book-cat">{log.bookCategory}</span>
                      </div>
                    </td>
                    <td>
                      <span className="table-barcode">{log.bookBarcode}</span>
                    </td>
                    <td>
                      <div className="student-cell">
                        <User size={13} className="cell-student-icon" />
                        <strong>{log.studentName}</strong>
                      </div>
                    </td>
                    <td>
                      <div className="date-time-cell">
                        <Calendar size={13} className="cell-date-icon" />
                        <span>{new Date(log.borrowDate).toLocaleString()}</span>
                      </div>
                    </td>
                    <td>
                      {isReturned ? (
                        <div className="date-time-cell returned-date">
                          <CheckCircle size={13} className="cell-date-icon" />
                          <span>{new Date(log.returnDate!).toLocaleString()}</span>
                        </div>
                      ) : (
                        <span className="outstanding-label">Outstanding</span>
                      )}
                    </td>
                    <td>
                      <span className={`duration-label ${!isReturned ? 'active-loan' : 'closed-loan'}`}>
                        {formatDuration(log.duration, isReturned)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge-lbl ${isReturned ? 'returned' : 'active'}`}>
                        {isReturned ? 'Returned' : 'Active'}
                      </span>
                    </td>
                    <td>
                      {!isReturned ? (
                        <button
                          type="button"
                          onClick={() => {
                            onReturnBook(log.bookId);
                            alert(`Successfully returned: "${log.bookTitle}"`);
                          }}
                          className="btn btn-secondary glass btn-sm return-action-btn"
                        >
                          <RefreshCw size={12} /> Return Book
                        </button>
                      ) : (
                        <span className="closed-check-mark">✓ Closed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-ledger-row">
                    No borrowing transactions match your current search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
