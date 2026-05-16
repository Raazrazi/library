import { useState, useRef } from 'react';
import { ScanBarcode } from 'lucide-react';
import './ScannerInput.css';

interface ScannerInputProps {
  onScan: (barcode: string) => void;
}

const ScannerInput: React.FC<ScannerInputProps> = ({ onScan }) => {
  const [barcode, setBarcode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onScan(barcode.trim());
      setBarcode('');
    }
  };

  return (
    <div className="scanner-container glass">
      <div className="scanner-icon-wrap">
        <ScanBarcode size={24} className="scanner-icon" />
      </div>
      <form onSubmit={handleSubmit} className="scanner-form">
        <input 
          ref={inputRef}
          type="text" 
          className="scanner-input" 
          placeholder="Click here and scan barcode..." 
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          autoFocus
        />
        <button type="submit" className="btn btn-primary scanner-btn">Scan</button>
      </form>
    </div>
  );
};

export default ScannerInput;
