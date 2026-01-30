import { getAllEntries, addEntry } from './storage';

/**
 * Export all entries to a text file
 * Format: YYYY-MM-DD: entry text
 */
export async function exportToText() {
  try {
    const entries = await getAllEntries();

    // Sort by journal day (chronological)
    entries.sort((a, b) => a.journalDay.localeCompare(b.journalDay));

    // Create text content
    const content = entries
      .map(entry => `${entry.journalDay}: ${entry.text}`)
      .join('\n');

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `journal-export-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true, count: entries.length };
  } catch (error) {
    console.error('Export error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Import entries from a text file with merge strategy
 * Expected format: YYYY-MM-DD: entry text
 *
 * @param {string} fileContent - Content of the import file
 * @param {string} strategy - One of: 'overwrite-all', 'keep-existing', 'prefer-imported'
 */
export async function importFromText(fileContent, strategy = 'keep-existing') {
  const results = {
    total: 0,
    imported: 0,
    skipped: 0,
    overwritten: 0,
    errors: [],
  };

  try {
    const lines = fileContent.split('\n').filter(line => line.trim());
    const parsedEntries = [];

    // First pass: parse and validate all entries
    for (const line of lines) {
      results.total++;

      // Parse line: YYYY-MM-DD: text
      const match = line.match(/^(\d{4}-\d{2}-\d{2}):\s*(.+)$/);

      if (!match) {
        results.errors.push(`Invalid format: ${line.substring(0, 50)}...`);
        continue;
      }

      const [, journalDay, text] = match;

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(journalDay)) {
        results.errors.push(`Invalid date format: ${journalDay}`);
        continue;
      }

      // Validate text length
      if (text.length > 300) {
        results.errors.push(`Entry too long (${text.length} chars): ${journalDay}`);
        continue;
      }

      if (text.trim().length === 0) {
        results.errors.push(`Empty entry: ${journalDay}`);
        continue;
      }

      parsedEntries.push({ journalDay, text });
    }

    // Second pass: apply merge strategy
    for (const { journalDay, text } of parsedEntries) {
      try {
        const existingEntry = await getAllEntries().then(entries =>
          entries.find(e => e.journalDay === journalDay)
        );

        if (strategy === 'overwrite-all') {
          // Always import
          await addEntry(journalDay, text);
          if (existingEntry) {
            results.overwritten++;
          }
          results.imported++;
        } else if (strategy === 'keep-existing') {
          // Only import if no existing entry
          if (!existingEntry) {
            await addEntry(journalDay, text);
            results.imported++;
          } else {
            results.skipped++;
          }
        } else if (strategy === 'prefer-imported') {
          // Import and overwrite if exists
          await addEntry(journalDay, text);
          if (existingEntry) {
            results.overwritten++;
          }
          results.imported++;
        }
      } catch (error) {
        results.errors.push(`Failed to import ${journalDay}: ${error.message}`);
      }
    }

    return results;
  } catch (error) {
    console.error('Import error:', error);
    return {
      ...results,
      errors: [...results.errors, `Fatal error: ${error.message}`],
    };
  }
}

/**
 * Read file content from File object
 */
export function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}
