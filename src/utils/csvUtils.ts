/**
 * CSV Export Utilities for Technician Payments
 * Handles data transformation and CSV file generation
 */

import Papa from 'papaparse';
import { formatDate, formatCurrency } from './paymentUtils';

interface TechnicianPaymentForExport {
  id: string;
  paymentNumber: string;
  technicianId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  jobId: {
    _id: string;
    property: {
      _id: string;
      name: string;
      address: string;
    };
    jobType: string;
    dueDate: string;
    description: string;
    job_id: string;
  };
  jobType: string;
  amount: number;
  status: "Pending" | "Paid" | "Cancelled";
  jobCompletedAt: string;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}

interface CSVRow {
  'Payment Number': string;
  'Technician Name': string;
  'Technician Email': string;
  'Technician Phone': string;
  'Job ID': string;
  'Job Type': string;
  'Property': string;
  'Amount': string;
  'Status': string;
  'Job Completed Date': string;
  'Payment Date': string;
  'Notes': string;
  'Created Date': string;
}

/**
 * Transforms payment data into CSV-friendly format
 */
export const transformPaymentsForCSV = (payments: TechnicianPaymentForExport[]): CSVRow[] => {
  return payments.map(payment => ({
    'Payment Number': payment.paymentNumber || 'N/A',
    'Technician Name': payment.technicianId
      ? `${payment.technicianId.firstName || ''} ${payment.technicianId.lastName || ''}`.trim() || 'N/A'
      : 'N/A',
    'Technician Email': payment.technicianId?.email || 'N/A',
    'Technician Phone': payment.technicianId?.phone || 'N/A',
    'Job ID': payment.jobId?.job_id || 'N/A',
    'Job Type': payment.jobType || 'N/A',
    'Property': payment.jobId?.property?.name || payment.jobId?.property?.address || 'N/A',
    'Amount': formatCurrency(payment.amount || 0),
    'Status': payment.status || 'N/A',
    'Job Completed Date': payment.jobCompletedAt ? formatDate(payment.jobCompletedAt) : 'N/A',
    'Payment Date': payment.paymentDate ? formatDate(payment.paymentDate) : '-',
    'Notes': payment.notes || '-',
    'Created Date': payment.createdAt ? formatDate(payment.createdAt) : 'N/A'
  }));
};

/**
 * Generates a filename with timestamp for the CSV export
 */
export const generateExportFilename = (prefix: string = 'technician-payments'): string => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  return `${prefix}-${dateStr}-${timeStr}.csv`;
};

/**
 * Converts payment data to CSV and triggers browser download
 */
export const exportPaymentsToCSV = (
  payments: TechnicianPaymentForExport[],
  filename?: string
): void => {
  try {
    // Transform data for CSV
    const csvData = transformPaymentsForCSV(payments);

    // Generate CSV string using PapaParse
    const csv = Papa.unparse(csvData, {
      header: true,
      delimiter: ',',
      quotes: true,
      quoteChar: '"',
      escapeChar: '"',
      skipEmptyLines: false
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      // Feature detection for download attribute
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename || generateExportFilename());
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } else {
      // Fallback for older browsers
      if (navigator.msSaveBlob) {
        // Internet Explorer
        navigator.msSaveBlob(blob, filename || generateExportFilename());
      } else {
        // Other browsers - open in new window
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }
    }
  } catch (error) {
    console.error('CSV Export Error:', error);
    throw new Error('Failed to export data to CSV. Please try again.');
  }
};

/**
 * Validates payment data before export
 */
export const validatePaymentDataForExport = (payments: any[]): boolean => {
  if (!Array.isArray(payments)) {
    throw new Error('Invalid data format: Expected an array of payments');
  }

  if (payments.length === 0) {
    throw new Error('No data available to export');
  }

  // Check if payments have required fields
  const requiredFields = ['paymentNumber', 'amount', 'status'];
  const hasRequiredFields = payments.every(payment =>
    requiredFields.every(field => payment.hasOwnProperty(field))
  );

  if (!hasRequiredFields) {
    throw new Error('Invalid data format: Missing required payment fields');
  }

  return true;
};

/**
 * Formats export summary for user feedback
 */
export const getExportSummary = (paymentCount: number, filters?: any): string => {
  const hasFilters = filters && Object.values(filters).some((value: any) => value !== '' && value !== undefined);

  if (hasFilters) {
    return `Exported ${paymentCount} filtered payment${paymentCount !== 1 ? 's' : ''} to CSV`;
  }

  return `Exported ${paymentCount} payment${paymentCount !== 1 ? 's' : ''} to CSV`;
};

export default {
  transformPaymentsForCSV,
  generateExportFilename,
  exportPaymentsToCSV,
  validatePaymentDataForExport,
  getExportSummary
};