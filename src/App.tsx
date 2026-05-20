import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookGrid from './components/BookGrid';
import Footer from './components/Footer';
import AddBookModal from './components/AddBookModal';
import BorrowModal from './components/BorrowModal';
import HistoryPanel from './components/HistoryPanel';
import SettingsModal from './components/SettingsModal';
import { useLibrary, BASE_URL } from './hooks/useLibrary';
import type { Book } from './types';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('web_access_granted') === 'true';
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = btoa(`${username}:${password}`);
      const response = await fetch(`${BASE_URL}/api/books`, {
        method: 'GET',
        headers: { 
          'Authorization': `Basic ${token}`,
          'Content-Type': 'application/json' 
        }
      });
      
      if (response.ok) {
        sessionStorage.setItem('web_access_granted', 'true');
        sessionStorage.setItem('web_access_token', token);
        setIsAuthenticated(true);
        setUsername('');
        setPassword('');
        setLoginError('');
        window.location.reload(); // Reload to initialize hooks with new token
      } else {
        setLoginError('Invalid username or password. Access Denied.');
        setPassword('');
      }
    } catch (err) {
      setLoginError('Network error connecting to the server.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0f172a', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLoginSubmit} style={{ padding: '2.5rem', background: '#1e293b', borderRadius: '12px', width: '100%', maxWidth: '360px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
          <h2 style={{ color: '#f8fafc', marginBottom: '1.5rem', textAlign: 'center' }}>LibOn-M Entrance</h2>
          
          {loginError && (
            <p style={{ color: '#f87171', backgroundColor: '#7f1d1d', padding: '0.5rem', borderRadius: '4px', fontSize: '14px', textAlign: 'center', marginBottom: '1rem' }}>
              {loginError}
            </p>
          )}
          
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '14px' }}>Admin Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#334155', color: '#fff', boxSizing: 'border-box' }} required />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '14px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#334155', color: '#fff', boxSizing: 'border-box' }} required />
          </div>

          <button type="submit" style={{ width: '100%', padding: '0.75rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Unlock Web System
          </button>
        </form>
      </div>
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