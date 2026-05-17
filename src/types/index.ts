export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  rating: number;
  category: string;
  barcode: string;
  status: 'available' | 'borrowed';
  borrowedBy: string | null;
}

export interface HistoryEntry {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  bookCategory: string;
  bookBarcode: string;
  studentName: string;
  borrowDate: string;
  returnDate: string | null;
  duration: number; // calculated in seconds
}
