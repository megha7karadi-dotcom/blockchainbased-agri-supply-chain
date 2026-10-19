/**
 * Secure, RFC 4180-compliant CSV Export Utility
 * Handles proper escaping of commas, quotes, line breaks, and adds UTF-8 BOM for Excel / Google Sheets compatibility.
 */

export interface CsvColumn<T> {
  header: string;
  accessor: (item: T, index: number) => string | number | boolean | null | undefined;
}

/**
 * Escapes a single cell value according to RFC 4180 rules
 */
export function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }

  const str = String(value);

  // If the cell contains commas, quotes, or newlines, wrap in quotes and escape internal quotes
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  // Also quote numeric-like strings that might have leading zeroes or symbols to preserve formatting
  if (str.startsWith('0') && str.length > 1 && !str.includes('.')) {
    return `"${str}"`;
  }

  return `"${str}"`;
}

/**
 * Generates CSV string and triggers client-side download
 */
export function downloadCsv<T>({
  filename,
  data,
  columns,
}: {
  filename: string;
  data: T[];
  columns: CsvColumn<T>[];
}): void {
  if (!data || data.length === 0) {
    console.warn('downloadCsv: No data provided to export.');
  }

  // Build CSV header row
  const headerRow = columns.map(col => escapeCsvCell(col.header)).join(',');

  // Build data rows
  const dataRows = data.map((item, index) => {
    return columns.map(col => escapeCsvCell(col.accessor(item, index))).join(',');
  });

  // Combine with UTF-8 BOM (\uFEFF) to ensure Unicode characters (e.g., ₹ symbol, accents) render properly in Excel
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  // Safe filename with extension
  const cleanFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;

  // Standard anchor download pattern
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', cleanFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Free memory
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
