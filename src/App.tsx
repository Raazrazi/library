import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BookGrid from './components/BookGrid';
import Footer from './components/Footer';
import AddBookModal from './components/AddBookModal';
import BorrowModal from './components/BorrowModal';
import { useLibrary } from './hooks/useLibrary';
import type { Book } from './types';

function App() {
  const { books, addBook, borrowBook, returnBook, findByBarcode } = useLibrary();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [borrowingBook, setBorrowingBook] = useState<Book | null>(null);

  const handleScan = (barcode: string) => {
    const book = findByBarcode(barcode);
    if (!book) {
      alert(`Book with barcode ${barcode} not found!`);
      return;
    }

    if (book.status === 'available') {
      // Trigger borrow process
      setBorrowingBook(book);
    } else {
      // It's borrowed, return it
      returnBook(book.id);
      alert(`Successfully returned: ${book.title}`);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <BookGrid 
          books={books} 
          onAddClick={() => setIsAddModalOpen(true)}
          onBorrowClick={setBorrowingBook}
          onReturnBook={returnBook}
          onScan={handleScan}
        />
      </main>
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