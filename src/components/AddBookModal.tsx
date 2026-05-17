import { useState, useRef } from 'react';
import { X, FilePlus, Upload, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import './Modal.css';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (book: { title: string; author: string; category: string; coverImage: string; barcode: string }) => void;
}

interface CsvRow {
  title: string;
  author: string;
  category: string;
  barcode: string;
  coverImage: string;
  errors: string[];
}

const PRESET_COVERS = [
  '/assets/book_cover_scifi.png',
  '/assets/book_cover_fantasy.png',
  '/assets/book_cover_thriller.png',
  '/assets/book_cover_romance.png',
  '/assets/logo_libon_m.png'
];

const REQUIRED_COLS = ['title', 'author', 'category', 'barcode'];

function parseCsv(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  return lines.slice(1).map(line => {
    // Handle quoted fields
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; continue; }
      if (ch === ',' && !inQuotes) { values.push(current.trim()); current = ''; continue; }
      current += ch;
    }
    values.push(current.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i] ?? ''; });

    const errors: string[] = [];
    REQUIRED_COLS.forEach(col => {
      if (!row[col]) errors.push(`Missing "${col}"`);
    });

    return {
      title: row['title'] || '',
      author: row['author'] || '',
      category: row['category'] || '',
      barcode: row['barcode'] || '',
      coverImage: row['coverimage'] || row['cover_image'] || row['cover'] || '',
      errors,
    };
  }).filter(row => Object.values(row).some(v => v !== '' && !Array.isArray(v)));
}

const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [tab, setTab] = useState<'manual' | 'csv'>('manual');

  // Manual form state
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [barcode, setBarcode] = useState('');

  // CSV state
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [csvFileName, setCsvFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setTab('manual');
    setCsvRows([]);
    setCsvFileName('');
    setImportDone(false);
    onClose();
  };

  // ── Manual submit ──
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ title, author, category, coverImage, barcode });
    setTitle(''); setAuthor(''); setCategory(''); setCoverImage(''); setBarcode('');
    handleClose();
  };

  // ── CSV parsing ──
  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv')) { alert('Please upload a .csv file.'); return; }
    setCsvFileName(file.name);
    setImportDone(false);
    const reader = new FileReader();
    reader.onload = e => {
      const rows = parseCsv(e.target?.result as string);
      setCsvRows(rows);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // ── CSV import ──
  const handleImport = async () => {
    const valid = csvRows.filter(r => r.errors.length === 0);
    if (!valid.length) return;
    setImporting(true);
    for (const row of valid) {
      await onAdd({ title: row.title, author: row.author, category: row.category, coverImage: row.coverImage, barcode: row.barcode });
    }
    setImporting(false);
    setImportDone(true);
  };

  const validCount = csvRows.filter(r => r.errors.length === 0).length;
  const errorCount = csvRows.filter(r => r.errors.length > 0).length;

  return (
    <div className="modal-overlay">
      <div className="modal-content glass csv-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button className="close-btn" onClick={handleClose}><X size={20} /></button>
        <h2>Register Book{tab === 'csv' ? 's via CSV' : ''}</h2>

        {/* ── Tab switcher ── */}
        <div className="modal-tabs">
          <button
            className={`modal-tab ${tab === 'manual' ? 'active' : ''}`}
            onClick={() => setTab('manual')}
            type="button"
          >
            <FilePlus size={15} /> Manual Entry
          </button>
          <button
            className={`modal-tab ${tab === 'csv' ? 'active' : ''}`}
            onClick={() => setTab('csv')}
            type="button"
          >
            <Upload size={15} /> Upload CSV
          </button>
        </div>

        {/* ── Manual tab ── */}
        {tab === 'manual' && (
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
        )}

        {/* ── CSV tab ── */}
        {tab === 'csv' && (
          <div className="csv-tab">
            {/* Template hint */}
            <div className="csv-hint">
              <FileText size={14} />
              Required columns: <code>title, author, category, barcode</code> — optional: <code>coverImage</code>
            </div>

            {/* Drop zone */}
            <div
              className={`csv-dropzone ${isDragging ? 'dragging' : ''} ${csvFileName ? 'has-file' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
              />
              {csvFileName ? (
                <>
                  <FileText size={28} className="dropzone-icon success" />
                  <span className="dropzone-filename">{csvFileName}</span>
                  <span className="dropzone-sub">Click to replace file</span>
                </>
              ) : (
                <>
                  <Upload size={28} className="dropzone-icon" />
                  <span className="dropzone-label">Drag & drop CSV here</span>
                  <span className="dropzone-sub">or click to browse</span>
                </>
              )}
            </div>

            {/* Stats bar */}
            {csvRows.length > 0 && (
              <div className="csv-stats">
                <span className="csv-stat valid"><CheckCircle2 size={13} /> {validCount} valid</span>
                {errorCount > 0 && <span className="csv-stat error"><AlertCircle size={13} /> {errorCount} with errors</span>}
                <span className="csv-stat total">{csvRows.length} total rows</span>
              </div>
            )}

            {/* Preview table */}
            {csvRows.length > 0 && (
              <div className="csv-preview-wrap">
                <table className="csv-preview-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Author</th>
                      <th>Category</th>
                      <th>Barcode</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvRows.map((row, i) => (
                      <tr key={i} className={row.errors.length > 0 ? 'row-error' : 'row-valid'}>
                        <td>{i + 1}</td>
                        <td>{row.title || <em>—</em>}</td>
                        <td>{row.author || <em>—</em>}</td>
                        <td>{row.category || <em>—</em>}</td>
                        <td>{row.barcode || <em>—</em>}</td>
                        <td>
                          {row.errors.length === 0
                            ? <span className="row-badge ok"><CheckCircle2 size={12} /> OK</span>
                            : <span className="row-badge err" title={row.errors.join(', ')}><AlertCircle size={12} /> {row.errors[0]}</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Import / success */}
            {importDone ? (
              <div className="csv-success">
                <CheckCircle2 size={20} /> Successfully imported {validCount} book{validCount !== 1 ? 's' : ''}!
              </div>
            ) : (
              <button
                className="btn btn-primary w-100"
                style={{ marginTop: '1rem' }}
                disabled={validCount === 0 || importing}
                onClick={handleImport}
              >
                {importing ? 'Importing…' : `Import ${validCount} Book${validCount !== 1 ? 's' : ''}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddBookModal;
