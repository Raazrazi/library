import { useState, useEffect } from 'react';
import type { Book } from '../types';

const INITIAL_BOOKS: Book[] = [
  { id: '1', title: 'Neon Horizons', author: 'J.A. Sterling', coverImage: '/assets/book_cover_scifi.png', rating: 4.8, category: 'Sci-Fi', barcode: '1000000001', status: 'available', borrowedBy: null },
  { id: '2', title: 'Whispers of the Aether', author: 'Elena Vance', coverImage: '/assets/book_cover_fantasy.png', rating: 4.9, category: 'Fantasy', barcode: '1000000002', status: 'borrowed', borrowedBy: 'Alice Johnson' },
  { id: '3', title: 'Midnight Shadows', author: 'Marcus Black', coverImage: '/assets/book_cover_thriller.png', rating: 4.6, category: 'Thriller', barcode: '1000000003', status: 'available', borrowedBy: null },
  { id: '4', title: 'Echoes of Summer', author: 'Lily Rose', coverImage: '/assets/book_cover_romance.png', rating: 4.7, category: 'Romance', barcode: '1000000004', status: 'available', borrowedBy: null }
];

export const useLibrary = () => {
  const [books, setBooks] = useState<Book[]>(() => {
    const saved = localStorage.getItem('libon_books');
    if (saved) {
      return JSON.parse(saved);
    }
    return INITIAL_BOOKS;
  });

  useEffect(() => {
    localStorage.setItem('libon_books', JSON.stringify(books));
  }, [books]);

  const addBook = (newBook: Omit<Book, 'id' | 'status' | 'borrowedBy' | 'rating'>) => {
    const book: Book = {
      ...newBook,
      id: Date.now().toString(),
      status: 'available',
      borrowedBy: null,
      rating: 0, // No rating initially
      coverImage: newBook.coverImage || '/assets/logo_libon_m.png'
    };
    setBooks(prev => [...prev, book]);
  };

  const borrowBook = (id: string, studentName: string) => {
    setBooks(prev => prev.map(book => 
      book.id === id ? { ...book, status: 'borrowed', borrowedBy: studentName } : book
    ));
  };

  const returnBook = (id: string) => {
    setBooks(prev => prev.map(book => 
      book.id === id ? { ...book, status: 'available', borrowedBy: null } : book
    ));
  };

  const findByBarcode = (barcode: string): Book | undefined => {
    return books.find(book => book.barcode === barcode);
  };

  return { books, addBook, borrowBook, returnBook, findByBarcode };
};
