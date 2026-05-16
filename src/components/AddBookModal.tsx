import { useState } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (book: { title: string; author: string; category: string; coverImage: string; barcode: string }) => void;
}

const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [barcode, setBarcode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, author, category, coverImage, barcode });
    setTitle('');
    setAuthor('');
    setCategory('');
    setCoverImage('');
    setBarcode('');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        <h2>Register New Book</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. The Great Gatsby" />
          </div>
          <div className="form-group">
            <label>Author</label>
            <input required value={author} onChange={e => setAuthor(e.target.value)} placeholder="e.g. F. Scott Fitzgerald" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input required value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Classic Literature" />
          </div>
          <div className="form-group">
            <label>Barcode</label>
            <input required value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Scan barcode or type manually" />
          </div>
          <div className="form-group">
            <label>Cover Image URL (Optional)</label>
            <input value={coverImage} onChange={e => setCoverImage(e.target.value)} placeholder="https://..." />
          </div>
          <button type="submit" className="btn btn-primary w-100">Add Book</button>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
