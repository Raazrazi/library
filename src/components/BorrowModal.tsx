import { useState } from 'react';
import { X } from 'lucide-react';
import type { Book } from '../types';
import './Modal.css';

interface BorrowModalProps {
  book: Book | null;
  onClose: () => void;
  onBorrow: (studentName: string) => void;
}

const BorrowModal: React.FC<BorrowModalProps> = ({ book, onClose, onBorrow }) => {
  const [studentName, setStudentName] = useState('');

  if (!book) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBorrow(studentName);
    setStudentName('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        <h2>Borrow Book</h2>
        <p className="modal-subtitle">You are borrowing: <strong>{book.title}</strong></p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student Name</label>
            <input required value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Enter full name" />
          </div>
          <button type="submit" className="btn btn-primary w-100">Confirm Borrow</button>
        </form>
      </div>
    </div>
  );
};

export default BorrowModal;
