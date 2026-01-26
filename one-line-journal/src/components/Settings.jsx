import { useState, useRef } from 'react';
import { exportToText, importFromText, readFileContent } from '../utils/exportImport';
import { useTheme, THEMES } from '../hooks/useTheme';
import './Settings.css';

export function Settings({ onImportComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);
  const { currentTheme, changeTheme } = useTheme();

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

  const closeSettings = () => {
    setIsOpen(false);
    setImportResult(null);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="settings-button"
        aria-label="Settings"
      >
        ⚙
      </button>

      {isOpen && (
        <div className="settings-overlay" onClick={closeSettings}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <h2>Settings</h2>
              <button onClick={closeSettings} className="close-button">
                ×
              </button>
            </div>

            <div className="settings-content">
              <section className="settings-section">
                <h3>Backup & Restore</h3>
                <p className="settings-description">
                  Export creates a text file backup of all your entries. Import adds entries from a text file.
                </p>

                <div className="settings-buttons">
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
                      <button onClick={closeImportResult} className="result-close-button">
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
              </section>

              <section className="settings-section">
                <h3>Theme</h3>
                <p className="settings-description">
                  Choose your journal's visual style
                </p>

                <div className="theme-grid">
                  {THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => changeTheme(theme.id)}
                      className={`theme-button ${currentTheme === theme.id ? 'active' : ''}`}
                    >
                      <span className="theme-name">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="settings-section">
                <h3>About</h3>
                <p className="settings-description">
                  One Line a Day - A personal journal for capturing daily memories.
                </p>
                <p className="settings-note">
                  Your journal is stored locally on this device. Use export to create backups.
                </p>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
