import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookGrid from './components/BookGrid';
import Footer from './components/Footer';
import AddBookModal from './components/AddBookModal';
import BorrowModal from './components/BorrowModal';
import HistoryPanel from './components/HistoryPanel';
import SettingsModal from './components/SettingsModal';
import LoginPage from './components/LoginPage';
import { useLibrary } from './hooks/useLibrary';
import type { Book } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('web_access_granted') === 'true';
  });

  const { books, history, addBook, borrowBook, returnBook, removeBook, findByBarcode } = useLibrary();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAutoScanEnabled, setIsAutoScanEnabled] = useState(() => localStorage.getItem('auto_scan_enabled') !== 'false');
  const [borrowingBook, setBorrowingBook] = useState<Book | null>(null);
  const [activeView, setActiveView] = useState<'catalog' | 'history'>('catalog');

  // Listen for setting changes
  useEffect(() => {
    const handleToggle = () => setIsAutoScanEnabled(localStorage.getItem('auto_scan_enabled') !== 'false');
    window.addEventListener('auto_scan_toggled', handleToggle);
    return () => window.removeEventListener('auto_scan_toggled', handleToggle);
  }, []);

  const handleScan = useCallback((barcode: string) => {
    const autoViewResults = localStorage.getItem('auto_view_results') !== 'false';
    const autoCheckinCheckout = localStorage.getItem('auto_checkin_checkout') !== 'false';

    const book = findByBarcode(barcode);
    if (!book) {
      if (autoViewResults) alert(`Book with barcode ${barcode} not found!`);
      return;
    }

    if (autoCheckinCheckout) {
      if (book.status === 'available') {
        setBorrowingBook(book);
      } else {
        returnBook(book.id);
        if (autoViewResults) alert(`Successfully returned: ${book.title}`);
      }
    } else if (autoViewResults) {
      // Just view it (we can just open the borrow modal as a preview)
      setBorrowingBook(book);
    }
  }, [findByBarcode, returnBook]);

  // Global Barcode Scanner Listener
  useEffect(() => {
    if (!isAuthenticated || !isAutoScanEnabled) return;
    
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      // If time between keystrokes is more than 50ms, clear buffer (probably a human typing)
      if (currentTime - lastKeyTime > 50) {
        barcodeBuffer = '';
      }
      
      if (e.key === 'Enter' && barcodeBuffer.length >= 3) {
        e.preventDefault(); // Prevent default enter behavior (like submitting a form)
        handleScan(barcodeBuffer);
        barcodeBuffer = '';
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        barcodeBuffer += e.key;
      }
      lastKeyTime = currentTime;
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScan, isAuthenticated]);



  if (!isAuthenticated) {
    return (
      <LoginPage
        onAuthenticated={() => {
          setIsAuthenticated(true);
          window.location.reload();
        }}
      />
    );
  }

  const uniqueCategories = Array.from(new Set(books.map(b => b.category)));

  return (
    <>
      <Navbar activeView={activeView} onViewChange={setActiveView} />
      
      {activeView === 'catalog' ? (
        <main>
          <Hero />
          <BookGrid 
            books={books} 
            onAddClick={() => setIsAddModalOpen(true)}
            onBorrowClick={setBorrowingBook}
            onReturnBook={returnBook}
            onScan={handleScan}
            onRemoveBook={removeBook}
          />
        </main>
      ) : (
        <main style={{ paddingTop: '100px' }}>
          <HistoryPanel 
            history={history} 
            onReturnBook={returnBook}
            categories={uniqueCategories}
          />
        </main>
      )}
      
      <Footer />
      
      <AddBookModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addBook} 
      />
      
      <BorrowModal
        book={borrowingBook}
        onClose={() => setBorrowingBook(null)}
        onBorrow={(studentName) => {
          if (borrowingBook) borrowBook(borrowingBook.id, studentName);
        }}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 1000 }}>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          style={{ padding: '0.6rem 1.2rem', background: '#334155', color: 'white', border: '1px solid #475569', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
        >
          ⚙️ Settings
        </button>
        <button 
          onClick={() => {
            sessionStorage.removeItem('web_access_granted');
            sessionStorage.removeItem('web_access_token');
            setIsAuthenticated(false);
            window.location.reload();
          }}
          style={{ padding: '0.6rem 1.2rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
        >
          🔒 Lock Web
        </button>
      </div>
    </>
  );
}

export default App;