/**
 * TypeScript declarations for CSV export functionality
 */

declare global {
  interface Navigator {
    msSaveBlob?: (blob: Blob, filename: string) => boolean;
  }
}

export interface CSVExportConfig {
  header: boolean;
  delimiter: string;
  quotes: boolean;
  quoteChar: string;
  escapeChar: string;
  skipEmptyLines: boolean;
}

export interface ExportSummary {
  count: number;
  filename: string;
  filtered: boolean;
  timestamp: Date;
}

export {};