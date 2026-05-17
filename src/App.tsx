import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookGrid from './components/BookGrid';
import Footer from './components/Footer';
import AddBookModal from './components/AddBookModal';
import BorrowModal from './components/BorrowModal';
import HistoryPanel from './components/HistoryPanel';
import { useLibrary } from './hooks/useLibrary';
import type { Book } from './types';

function App() {
  const { books, history, addBook, borrowBook, returnBook, removeBook, findByBarcode } = useLibrary();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [borrowingBook, setBorrowingBook] = useState<Book | null>(null);
  const [activeView, setActiveView] = useState<'catalog' | 'history'>('catalog');

  const handleScan = (barcode: string) => {
    const book = findByBarcode(barcode);
    if (!book) {
      alert(`Book with barcode ${barcode} not found!`);
      return;
    }

    if (book.status === 'available') {
      setBorrowingBook(book);
    } else {
      returnBook(book.id);
      alert(`Successfully returned: ${book.title}`);
    }
  };

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
    </>
  );
}

export default App;