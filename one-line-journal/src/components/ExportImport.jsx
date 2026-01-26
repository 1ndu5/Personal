import { useState, useRef } from 'react';
import { exportToText, importFromText, readFileContent } from '../utils/exportImport';
import './ExportImport.css';

export function ExportImport({ onImportComplete }) {
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleExport = async () => {
    const result = await exportToText();
    if (result.success) {
      alert(`Successfully exported ${result.count} entries!`);
    } else {
      alert(`Export failed: ${result.error}`);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportResult(null);

    try {
      const content = await readFileContent(file);
      const result = await importFromText(content);
      setImportResult(result);

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      setImportResult({
        total: 0,
        imported: 0,
        errors: [error.message],
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const closeImportResult = () => {
    setImportResult(null);
  };

  return (
    <div className="export-import">
      <h3 className="export-import-title">Backup & Restore</h3>

      <div className="export-import-buttons">
        <button onClick={handleExport} className="export-button">
          Export Journal
        </button>
        <button
          onClick={handleImportClick}
          className="import-button"
          disabled={isImporting}
        >
          {isImporting ? 'Importing...' : 'Import Journal'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {importResult && (
        <div className="import-result">
          <div className="import-result-header">
            <h4>Import Results</h4>
            <button onClick={closeImportResult} className="close-button">
              ×
            </button>
          </div>

          <div className="import-stats">
            <p>Total lines: {importResult.total}</p>
            <p className="success">Imported: {importResult.imported}</p>
            {importResult.skipped > 0 && (
              <p className="warning">Skipped: {importResult.skipped}</p>
            )}
          </div>

          {importResult.errors.length > 0 && (
            <div className="import-errors">
              <h5>Errors:</h5>
              <ul>
                {importResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="export-import-note">
        Export creates a text file backup. Import adds entries from a text file (duplicates will be updated).
      </p>
    </div>
  );
}
