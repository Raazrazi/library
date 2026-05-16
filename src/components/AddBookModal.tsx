import { useState } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (book: { title: string; author: string; category: string; coverImage: string; barcode: string }) => void;
}

const PRESET_COVERS = [
  '/assets/book_cover_scifi.png',
  '/assets/book_cover_fantasy.png',
  '/assets/book_cover_thriller.png',
  '/assets/book_cover_romance.png',
  '/assets/logo_libon_m.png'
];

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
      <div className="modal-content glass" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
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
            <label>Select Cover Image (Optional)</label>
            <div className="preset-covers">
              {PRESET_COVERS.map(cover => (
                <img 
                  key={cover}
                  src={cover} 
                  alt="Preset Cover" 
                  className={`preset-cover ${coverImage === cover ? 'selected' : ''}`}
                  onClick={() => setCoverImage(cover)}
                />
              ))}
            </div>
            <input 
              style={{ marginTop: '0.5rem' }}
              value={coverImage} 
              onChange={e => setCoverImage(e.target.value)} 
              placeholder="Or paste an image URL here..." 
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Add Book</button>
        </form>
      </div>
    </div>
  );
};

export default AddBookModal;
