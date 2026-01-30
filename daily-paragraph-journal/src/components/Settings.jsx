import { useState, useRef } from 'react';
import { exportToText, importFromText, readFileContent } from '../utils/exportImport';
import { useTheme, THEMES } from '../hooks/useTheme';
import './Settings.css';

export function Settings({ onImportComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showStrategyDialog, setShowStrategyDialog] = useState(false);
  const [pendingFileContent, setPendingFileContent] = useState(null);
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

    try {
      const content = await readFileContent(file);
      setPendingFileContent(content);
      setShowStrategyDialog(true);
    } catch (error) {
      setImportResult({
        total: 0,
        imported: 0,
        overwritten: 0,
        errors: [error.message],
      });
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleStrategySelect = async (strategy) => {
    setShowStrategyDialog(false);
    setIsImporting(true);
    setImportResult(null);

    try {
      const result = await importFromText(pendingFileContent, strategy);
      setImportResult(result);

      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      setImportResult({
        total: 0,
        imported: 0,
        overwritten: 0,
        errors: [error.message],
      });
    } finally {
      setIsImporting(false);
      setPendingFileContent(null);
    }
  };

  const handleCancelStrategy = () => {
    setShowStrategyDialog(false);
    setPendingFileContent(null);
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

      {showStrategyDialog && (
        <div className="settings-overlay" onClick={handleCancelStrategy}>
          <div className="strategy-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="strategy-header">
              <h3>Import Strategy</h3>
              <button onClick={handleCancelStrategy} className="close-button">
                ×
              </button>
            </div>

            <p className="strategy-description">
              How should we handle entries that already exist in your journal?
            </p>

            <div className="strategy-options">
              <button
                onClick={() => handleStrategySelect('keep-existing')}
                className="strategy-option"
              >
                <strong>Keep Existing</strong>
                <p>Skip imported entries if they already exist (safe, no data loss)</p>
              </button>

              <button
                onClick={() => handleStrategySelect('prefer-imported')}
                className="strategy-option"
              >
                <strong>Prefer Imported</strong>
                <p>Overwrite existing entries with imported data</p>
              </button>

              <button
                onClick={() => handleStrategySelect('overwrite-all')}
                className="strategy-option destructive"
              >
                <strong>Overwrite All</strong>
                <p>Replace all existing data with imported entries</p>
              </button>
            </div>
          </div>
        </div>
      )}

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
                      {importResult.overwritten > 0 && (
                        <p className="info">Overwritten: {importResult.overwritten}</p>
                      )}
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
