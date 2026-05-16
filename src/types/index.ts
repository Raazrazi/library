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
