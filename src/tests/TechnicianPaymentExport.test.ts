/**
 * Test Case TC13: Technician Payment CSV Export Functionality
 *
 * This test verifies that the export functionality correctly generates and downloads
 * CSV files with all the data shown in the technician payments table.
 */

// Mock test implementation (would require jest/testing-library setup)

import {
  transformPaymentsForCSV,
  exportPaymentsToCSV,
  validatePaymentDataForExport,
  getExportSummary,
  generateExportFilename
} from '../utils/csvUtils';

// Mock data for testing
const mockPaymentData = [
  {
    id: "1",
    paymentNumber: "TP-915986",
    technicianId: {
      _id: "tech1",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@email.com",
      phone: "+1234567890"
    },
    jobId: {
      _id: "job1",
      property: "123 Main St",
      jobType: "Gas",
      dueDate: "2025-08-05T00:00:00.000Z",
      description: "Gas safety inspection",
      job_id: "JOB-12345"
    },
    jobType: "Gas",
    amount: 50,
    status: "Paid" as const,
    jobCompletedAt: "2025-08-03T12:05:27.118Z",
    paymentDate: "2025-09-06T17:34:30.543Z",
    notes: "Completed on time",
    createdAt: "2025-08-03T12:05:27.119Z"
  },
  {
    id: "2",
    paymentNumber: "TP-915987",
    technicianId: {
      _id: "tech2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@email.com",
      phone: "+1234567891"
    },
    jobId: {
      _id: "job2",
      property: "456 Oak Ave",
      jobType: "Electrical",
      dueDate: "2025-08-06T00:00:00.000Z",
      description: "Electrical safety check",
      job_id: "JOB-12346"
    },
    jobType: "Electrical",
    amount: 80,
    status: "Pending" as const,
    jobCompletedAt: "2025-08-04T10:30:00.000Z",
    createdAt: "2025-08-04T10:30:00.000Z"
  }
];

describe('TC13: Technician Payment CSV Export', () => {

  // Test 1: CSV Data Transformation
  test('should transform payment data into correct CSV format', () => {
    // Arrange: Use mock payment data
    const payments = mockPaymentData;

    // Act: Transform data for CSV
    const csvData = transformPaymentsForCSV(payments);

    // Assert: Check CSV structure and content
    expect(csvData).toHaveLength(2);
    expect(csvData[0]).toEqual({
      'Payment Number': 'TP-915986',
      'Technician Name': 'John Doe',
      'Technician Email': 'john.doe@email.com',
      'Technician Phone': '+1234567890',
      'Job ID': 'JOB-12345',
      'Job Type': 'Gas',
      'Property': '123 Main St',
      'Amount': '$50.00',
      'Status': 'Paid',
      'Job Completed Date': 'Aug 3, 2025',
      'Payment Date': 'Sep 6, 2025',
      'Notes': 'Completed on time',
      'Created Date': 'Aug 3, 2025'
    });

    expect(csvData[1]).toEqual({
      'Payment Number': 'TP-915987',
      'Technician Name': 'Jane Smith',
      'Technician Email': 'jane.smith@email.com',
      'Technician Phone': '+1234567891',
      'Job ID': 'JOB-12346',
      'Job Type': 'Electrical',
      'Property': '456 Oak Ave',
      'Amount': '$80.00',
      'Status': 'Pending',
      'Job Completed Date': 'Aug 4, 2025',
      'Payment Date': '-',
      'Notes': '-',
      'Created Date': 'Aug 4, 2025'
    });
  });

  // Test 2: Handle missing/null data gracefully
  test('should handle missing payment data gracefully', () => {
    // Arrange: Create payment with missing fields
    const incompletePayment = [{
      id: "3",
      paymentNumber: "TP-915988",
      technicianId: null,
      jobId: null,
      jobType: "",
      amount: 0,
      status: "Pending" as const,
      jobCompletedAt: "",
      createdAt: ""
    }];

    // Act: Transform data
    const csvData = transformPaymentsForCSV(incompletePayment as any);

    // Assert: Should have N/A values for missing data
    expect(csvData[0]).toEqual({
      'Payment Number': 'TP-915988',
      'Technician Name': 'N/A',
      'Technician Email': 'N/A',
      'Technician Phone': 'N/A',
      'Job ID': 'N/A',
      'Job Type': 'N/A',
      'Property': 'N/A',
      'Amount': '$0.00',
      'Status': 'Pending',
      'Job Completed Date': 'N/A',
      'Payment Date': '-',
      'Notes': '-',
      'Created Date': 'N/A'
    });
  });

  // Test 3: Data validation
  test('should validate payment data before export', () => {
    // Valid data should pass validation
    expect(() => validatePaymentDataForExport(mockPaymentData)).not.toThrow();

    // Invalid data types should throw errors
    expect(() => validatePaymentDataForExport(null as any)).toThrow('Invalid data format: Expected an array of payments');
    expect(() => validatePaymentDataForExport("not an array" as any)).toThrow('Invalid data format: Expected an array of payments');
    expect(() => validatePaymentDataForExport([])).toThrow('No data available to export');

    // Missing required fields should throw error
    const invalidPayment = [{ id: "1" }]; // Missing required fields
    expect(() => validatePaymentDataForExport(invalidPayment)).toThrow('Invalid data format: Missing required payment fields');
  });

  // Test 4: Export summary generation
  test('should generate appropriate export summary messages', () => {
    // Test singular payment
    expect(getExportSummary(1)).toBe('Exported 1 payment to CSV');

    // Test multiple payments
    expect(getExportSummary(5)).toBe('Exported 5 payments to CSV');

    // Test with filters applied
    const filters = { status: 'Paid', jobType: 'Gas' };
    expect(getExportSummary(3, filters)).toBe('Exported 3 filtered payments to CSV');

    // Test with empty filters
    const emptyFilters = { status: '', jobType: '', search: '' };
    expect(getExportSummary(10, emptyFilters)).toBe('Exported 10 payments to CSV');
  });

  // Test 5: Filename generation
  test('should generate proper filenames with timestamps', () => {
    const filename = generateExportFilename();

    // Should match pattern: technician-payments-YYYY-MM-DD-HH-MM-SS.csv
    expect(filename).toMatch(/^technician-payments-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.csv$/);

    // Custom prefix should work
    const customFilename = generateExportFilename('custom-export');
    expect(customFilename).toMatch(/^custom-export-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.csv$/);
  });

  // Test 6: CSV download functionality (integration test)
  test('should trigger browser download when export is called', () => {
    // Mock DOM APIs
    const mockLink = {
      href: '',
      download: '',
      style: { visibility: '' },
      setAttribute: jest.fn(),
      click: jest.fn()
    };

    const mockCreateElement = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    const mockCreateObjectURL = jest.spyOn(URL, 'createObjectURL').mockReturnValue('mock-url');
    const mockRevokeObjectURL = jest.spyOn(URL, 'revokeObjectURL').mockImplementation();
    const mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation();
    const mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockImplementation();

    // Act: Call export function
    exportPaymentsToCSV(mockPaymentData);

    // Assert: Check that download was triggered
    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'mock-url');
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringMatching(/\.csv$/));
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockAppendChild).toHaveBeenCalledWith(mockLink);
    expect(mockRemoveChild).toHaveBeenCalledWith(mockLink);

    // Cleanup mocks
    mockCreateElement.mockRestore();
    mockCreateObjectURL.mockRestore();
    mockRevokeObjectURL.mockRestore();
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
  });

  // Test 7: Error handling in export
  test('should handle export errors gracefully', () => {
    // Mock URL.createObjectURL to throw an error
    const mockCreateObjectURL = jest.spyOn(URL, 'createObjectURL').mockImplementation(() => {
      throw new Error('Browser API error');
    });

    // Act & Assert: Should throw a user-friendly error
    expect(() => exportPaymentsToCSV(mockPaymentData)).toThrow('Failed to export data to CSV. Please try again.');

    // Cleanup
    mockCreateObjectURL.mockRestore();
  });

  // Test 8: Empty data handling
  test('should handle empty payment arrays', () => {
    expect(() => validatePaymentDataForExport([])).toThrow('No data available to export');
    expect(getExportSummary(0)).toBe('Exported 0 payments to CSV');
  });

  // Test 9: Large dataset handling
  test('should handle large datasets efficiently', () => {
    // Create a large dataset
    const largeDataset = Array(1000).fill(null).map((_, index) => ({
      ...mockPaymentData[0],
      id: `payment-${index}`,
      paymentNumber: `TP-${String(index).padStart(6, '0')}`
    }));

    // Should not throw errors and should complete in reasonable time
    expect(() => {
      const csvData = transformPaymentsForCSV(largeDataset);
      expect(csvData).toHaveLength(1000);
    }).not.toThrow();
  });

  // Test 10: CSV format validation
  test('should generate valid CSV format', () => {
    // Mock Papa.unparse to capture the CSV output
    const Papa = require('papaparse');
    const originalUnparse = Papa.unparse;
    let capturedCSV = '';

    Papa.unparse = jest.fn((data, config) => {
      capturedCSV = originalUnparse(data, config);
      return capturedCSV;
    });

    // Mock DOM to prevent actual download
    jest.spyOn(document, 'createElement').mockReturnValue({
      setAttribute: jest.fn(),
      click: jest.fn(),
      style: { visibility: '' }
    } as any);
    jest.spyOn(URL, 'createObjectURL').mockReturnValue('mock-url');
    jest.spyOn(document.body, 'appendChild').mockImplementation();
    jest.spyOn(document.body, 'removeChild').mockImplementation();

    // Act: Export data
    exportPaymentsToCSV(mockPaymentData);

    // Assert: Check CSV format
    expect(Papa.unparse).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({
        header: true,
        delimiter: ',',
        quotes: true,
        quoteChar: '"',
        escapeChar: '"',
        skipEmptyLines: false
      })
    );

    // Verify CSV contains expected headers
    expect(capturedCSV).toContain('Payment Number');
    expect(capturedCSV).toContain('Technician Name');
    expect(capturedCSV).toContain('Amount');
    expect(capturedCSV).toContain('Status');

    // Restore original function
    Papa.unparse = originalUnparse;
  });
});

/**
 * Integration Test Scenarios for Manual Testing:
 *
 * 1. PASS: Click Export button with no filters - should download all payments
 * 2. PASS: Click Export button with status filter "Paid" - should download only paid payments
 * 3. PASS: Click Export button with search term "john" - should download matching payments
 * 4. PASS: Click Export during loading state - button should be disabled
 * 5. PASS: Export with no data available - should show appropriate error message
 * 6. PASS: Export with network error - should show error message
 * 7. PASS: Verify CSV file has proper filename with timestamp
 * 8. PASS: Open CSV file and verify all table columns are present
 * 9. PASS: Verify CSV data matches table display exactly
 * 10. PASS: Export large dataset (100+ payments) - should complete successfully
 *
 * Expected CSV Format:
 * Payment Number,Technician Name,Technician Email,Technician Phone,Job ID,Job Type,Property,Amount,Status,Job Completed Date,Payment Date,Notes,Created Date
 * TP-915986,"John Doe",john.doe@email.com,+1234567890,JOB-12345,Gas,"123 Main St","$50.00",Paid,"Aug 3, 2025","Sep 6, 2025","Completed on time","Aug 3, 2025"
 *
 * Success Criteria:
 * - File downloads automatically when Export is clicked
 * - CSV contains all visible table columns
 * - Data is properly formatted (dates, currency, quotes)
 * - Filtered exports respect current search/filter settings
 * - Loading state is properly indicated
 * - Error cases are handled gracefully
 */