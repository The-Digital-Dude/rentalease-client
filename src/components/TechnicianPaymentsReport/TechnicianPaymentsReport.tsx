import { useState, useEffect } from "react";
import { RiMoneyDollarCircleLine, RiDownloadLine } from "react-icons/ri";
import toast from "react-hot-toast";
import reportService, { type TechnicianPayment } from "../../services/reportService";
import { unparse } from "papaparse";

const TechnicianPaymentsReport = () => {
  const [payments, setPayments] = useState<TechnicianPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await reportService.getTechnicianPaymentsReport();
        setPayments(response.data);
      } catch (error) {
        toast.error("Failed to fetch technician payments report");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleExport = () => {
    const csv = unparse(payments, {
      header: true,
      columns: ["technicianName", "amount", "status", "paymentDate"],
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "technician_payments_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="technician-payments-report">
      <div className="report-header">
        <div className="header-content">
          <h3>Technician Payments</h3>
          <p>Overview of payments made to technicians</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleExport}>
            <RiDownloadLine /> Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading technician payments data...</p>
        </div>
      ) : (
        <div className="payments-table">
          <table>
            <thead>
              <tr>
                <th>Technician</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.technicianName}</td>
                  <td>${payment.amount.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${payment.status.toLowerCase()}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TechnicianPaymentsReport;
