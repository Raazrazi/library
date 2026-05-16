import { useState, useEffect } from 'react';
import type { Book } from '../types';

const API_URL = 'http://localhost:5000/api/books';

export const useLibrary = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const addBook = async (newBook: Omit<Book, 'id' | 'status' | 'borrowedBy' | 'rating'>) => {
    try {
      const bookData = {
        ...newBook,
        coverImage: newBook.coverImage || '/assets/logo_libon_m.png'
      };
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData)
      });
      if (!response.ok) throw new Error('Failed to add book');
      const addedBook = await response.json();
      setBooks(prev => [...prev, addedBook]);
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const borrowBook = async (id: string, studentName: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}/borrow`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentName })
      });
      if (!response.ok) throw new Error('Failed to borrow');
      const updatedBook = await response.json();
      setBooks(prev => prev.map(book => book.id === id ? updatedBook : book));
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  const returnBook = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}/return`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to return');
      const updatedBook = await response.json();
      setBooks(prev => prev.map(book => book.id === id ? updatedBook : book));
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  const findByBarcode = (barcode: string): Book | undefined => {
    return books.find(book => book.barcode === barcode);
  };

  return { books, loading, addBook, borrowBook, returnBook, findByBarcode };
};
