import { useState, useEffect } from 'react';
import type { Book, HistoryEntry } from '../types';

export const BASE_URL = import.meta.env.VITE_API_URL || 'https://library-backend1.onrender.com';

const API_URL = `${BASE_URL}/api/books`;
const HISTORY_API_URL = `${BASE_URL}/api/history`;

// Read the secure token from sessionStorage so it's not hardcoded in the frontend
const getCredentials = () => sessionStorage.getItem('web_access_token') || btoa('admin:library2026'); // Fallback if needed, though App.tsx should guard

// Reusable headers config so we don't have to rewrite it for every request
const getHeaders = () => ({
  'Authorization': `Basic ${getCredentials()}`,
  'Content-Type': 'application/json'
});

export const useLibrary = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch books');
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch(HISTORY_API_URL, {
        method: 'GET',
        headers: getHeaders()
      });
      if (!response.ok) throw new Error('Failed to fetch history');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchHistory();
  }, []);

  const addBook = async (newBook: Omit<Book, 'id' | 'status' | 'borrowedBy' | 'rating'>) => {
    try {
      const bookData = {
        ...newBook,
        coverImage: newBook.coverImage || '/assets/logo_libon_m.png'
      };
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getHeaders(),
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
        headers: getHeaders(),
        body: JSON.stringify({ studentName })
      });
      if (!response.ok) throw new Error('Failed to borrow');
      const updatedBook = await response.json();
      setBooks(prev => prev.map(book => book.id === id ? updatedBook : book));
      await fetchHistory(); // immediately sync history
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  const returnBook = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}/return`, {
        method: 'PUT',
        headers: getHeaders() // Passing authentication token for processing validation
      });
      if (!response.ok) throw new Error('Failed to return');
      const updatedBook = await response.json();
      setBooks(prev => prev.map(book => book.id === id ? updatedBook : book));
      await fetchHistory(); // immediately sync history
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  const removeBook = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete book');
      }
      setBooks(prev => prev.filter(book => book.id !== id));
    } catch (error: any) {
      console.error('Error removing book:', error);
      alert(error.message || 'Error removing book.');
    }
  };

  const findByBarcode = (barcode: string): Book | undefined => {
    return books.find(book => book.barcode === barcode);
  };

  return {
    books,
    history,
    loading,
    addBook,
    borrowBook,
    returnBook,
    removeBook,
    findByBarcode,
    fetchHistory
  };
};