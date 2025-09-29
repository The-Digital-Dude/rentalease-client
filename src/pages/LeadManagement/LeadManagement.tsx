import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RiRefreshLine,
  RiErrorWarningLine,
  RiMoreFill,
  RiSearchLine,
  RiDownloadLine,
} from "react-icons/ri";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { leadService } from "../../services";
import type {
  Lead,
  LeadPagination,
  LeadStatus,
} from "../../services/leadService";
import "./LeadManagement.scss";

const PAGE_SIZE = 20;

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  converted: "Converted",
  closed: "Closed",
};

const statusOptions: Array<{ value: LeadStatus; label: string }> = (
  Object.entries(statusLabels) as Array<[LeadStatus, string]>
).map(([value, label]) => ({ value, label }));

type SortField = "createdAt" | "firstName" | "lastName" | "profession" | "status";

type SortOptionValue =
  | "createdAt:desc"
  | "createdAt:asc"
  | "firstName:asc"
  | "firstName:desc"
  | "lastName:asc"
  | "lastName:desc"
  | "profession:asc"
  | "profession:desc"
  | "status:asc"
  | "status:desc";

const sortOptions: Array<{ value: SortOptionValue; label: string }> = [
  { value: "createdAt:desc", label: "Newest leads" },
  { value: "createdAt:asc", label: "Oldest leads" },
  { value: "firstName:asc", label: "First name A-Z" },
  { value: "firstName:desc", label: "First name Z-A" },
  { value: "lastName:asc", label: "Last name A-Z" },
  { value: "lastName:desc", label: "Last name Z-A" },
  { value: "profession:asc", label: "Profession A-Z" },
  { value: "profession:desc", label: "Profession Z-A" },
  { value: "status:asc", label: "Status A-Z" },
  { value: "status:desc", label: "Status Z-A" },
];

type ExportRange = "7d" | "30d" | "180d" | "custom";

const exportRangeOptions: Array<{ value: ExportRange; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "180d", label: "Last 6 months" },
  { value: "custom", label: "Custom range" },
];


const LeadManagement = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<LeadPagination | undefined>();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOptionValue>("createdAt:desc");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportRange, setExportRange] = useState<ExportRange>("7d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [exportLoading, setExportLoading] = useState(false);
  const maxDate = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  const totalLeads = pagination?.totalLeads || leads.length;

  useEffect(() => {
    const handler = window.setTimeout(() => {
      const trimmed = searchTerm.trim();
      setDebouncedSearch(trimmed);
      setPage((previous) => (previous === 1 ? previous : 1));
    }, 300);

    return () => {
      window.clearTimeout(handler);
    };
  }, [searchTerm]);

  const fetchLeads = useCallback(
    async (pageToLoad: number) => {
      setLoading(true);
      setError("");

      const [sortByRaw, sortDirectionRaw] = sortOption.split(":") as [
        string,
        string
      ];

      const sortBy = (sortByRaw || "createdAt") as SortField;
      const sortOrder = sortDirectionRaw === "asc" ? "asc" : "desc";

      const response = await leadService.getLeads({
        page: pageToLoad,
        limit: PAGE_SIZE,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
      });

      if (response.success) {
        setLeads(response.data);
        setPagination(response.pagination);
        setActiveMenu(null);
      } else {
        const message = response.message || "Failed to fetch leads";
        setError(message);
        setLeads([]);
        setPagination(undefined);
        toast.error(message);
      }

      setLoading(false);
    },
    [statusFilter, debouncedSearch, sortOption]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".lead-management__menu")) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchLeads(page).catch(() => {
      // Errors handled in fetchLeads
    });
  }, [fetchLeads, page]);

  const handlePageChange = (nextPage: number) => {
    if (pagination) {
      if (nextPage < 1 || nextPage > pagination.totalPages) {
        return;
      }
    }

    if (nextPage === page) {
      return;
    }

    setPage(nextPage);
  };

  const handleRefresh = () => {
    fetchLeads(page).catch(() => {
      // Errors handled in fetchLeads
    });
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
    setDebouncedSearch("");
    setSortOption("createdAt:desc");
    setPage(1);
  };

  const resetExportForm = () => {
    setExportRange("7d");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  const closeExportModal = () => {
    if (exportLoading) {
      return;
    }
    setShowExportModal(false);
    resetExportForm();
  };

  const openExportModal = () => {
    resetExportForm();
    setShowExportModal(true);
  };

  const handleExport = async () => {
    if (exportLoading) {
      return;
    }

    try {
      setExportLoading(true);

      const now = new Date();
      let startDate = new Date(now);
      let endDate = new Date(now);

      if (exportRange === "7d") {
        startDate.setDate(startDate.getDate() - 7);
      } else if (exportRange === "30d") {
        startDate.setDate(startDate.getDate() - 30);
      } else if (exportRange === "180d") {
        startDate.setDate(startDate.getDate() - 180);
      } else {
        if (!customStartDate || !customEndDate) {
          toast.error("Please select both start and end dates.");
          return;
        }

        startDate = new Date(`${customStartDate}T00:00:00`);
        endDate = new Date(`${customEndDate}T23:59:59`);

        if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
          toast.error("Invalid custom date range.");
          return;
        }
      }

      if (startDate > endDate) {
        toast.error("Start date must be before end date.");
        return;
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      const startDateISO = startDate.toISOString();
      const endDateISO = endDate.toISOString();

      const limit = 500;
      let currentPage = 1;
      const allLeads: Lead[] = [];

      while (true) {
        const response = await leadService.getLeads({
          page: currentPage,
          limit,
          startDate: startDateISO,
          endDate: endDateISO,
          status: statusFilter === "all" ? undefined : statusFilter,
          search: debouncedSearch || undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        });

        if (!response.success) {
          toast.error(response.message || "Failed to export leads");
          return;
        }

        if (response.data.length === 0) {
          break;
        }

        allLeads.push(...response.data);

        if (!response.pagination?.hasNextPage) {
          break;
        }

        currentPage += 1;
      }

      if (allLeads.length === 0) {
        toast("No leads found for the selected range.");
        resetExportForm();
        setShowExportModal(false);
        return;
      }

      allLeads.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const fields = [
        "Created At",
        "First Name",
        "Last Name",
        "Email",
        "Phone",
        "Status",
        "Profession",
        "Source",
        "Message",
        "Notes",
      ];

      const data = allLeads.map((lead) => [
        new Date(lead.createdAt).toLocaleString(),
        lead.firstName,
        lead.lastName,
        lead.email,
        lead.phone ?? "",
        statusLabels[lead.status] || lead.status,
        lead.profession ?? "",
        lead.source === "website_contact_form" ? "Contact Form" :
        lead.source === "website_bookNow_form" ? "Book Now Form" :
        lead.source === "other" ? "Other" :
        lead.source || "",
        lead.message,
        lead.notes ?? "",
      ]);

      const csv = Papa.unparse({ fields, data });
      const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = window.URL.createObjectURL(blob);

      const formatForFile = (value: Date) => value.toISOString().slice(0, 10);
      const fileName = `website-leads_${formatForFile(startDate)}_${formatForFile(
        endDate
      )}.csv`;

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Exported ${allLeads.length} leads`);
      resetExportForm();
      setShowExportModal(false);
    } catch (error) {
      console.error("Export leads error", error);
      toast.error("Unable to export leads right now.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    if (updatingStatusId) {
      return;
    }

    setUpdatingStatusId(leadId);

    const response = await leadService.updateLeadStatus(leadId, newStatus);

    if (response.success && response.data) {
      const updatedLead = response.data;
      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === leadId ? updatedLead : lead
        )
      );
      toast.success(
        response.message ||
          `Lead marked as ${statusLabels[newStatus] || newStatus}`
      );
    } else {
      toast.error(response.message || "Failed to update lead status");
    }

    setUpdatingStatusId(null);
    setActiveMenu(null);
  };

  const leadCountLabel = useMemo(() => {
    if (!pagination) {
      return `${leads.length} lead${leads.length === 1 ? "" : "s"}`;
    }

    return `${pagination.totalLeads} lead${pagination.totalLeads === 1 ? "" : "s"}`;
  }, [leads.length, pagination]);

  const formatDate = (date: string) => {
    if (!date) return "-";

    try {
      return new Intl.DateTimeFormat("en-AU", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(date));
    } catch (err) {
      console.error("Failed to format date", err);
      return date;
    }
  };

  return (
    <div className="lead-management">
      <header className="lead-management__header">
        <div>
          <h1>Lead Management</h1>
          <p>Review inbound website enquiries and action them promptly.</p>
        </div>
        <div className="lead-management__header-actions">
          <button
            type="button"
            className="lead-management__refresh"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RiRefreshLine />
            <span>{loading ? "Refreshing" : "Refresh"}</span>
          </button>
          <button
            type="button"
            className="lead-management__export"
            onClick={openExportModal}
            disabled={exportLoading}
          >
            <RiDownloadLine />
            <span>{exportLoading ? "Preparing" : "Export"}</span>
          </button>
        </div>
      </header>

      <section className="lead-management__filters">
        <div className="lead-management__search">
          <RiSearchLine />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name, email, phone, profession, or message"
            aria-label="Search leads"
          />
        </div>

        <div className="lead-management__filter-group">
          <label htmlFor="lead-status-filter">Status</label>
          <select
            id="lead-status-filter"
            value={statusFilter}
            onChange={(event) => {
              const next = event.target.value as LeadStatus | "all";
              setStatusFilter(next);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            {statusOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="lead-management__filter-group">
          <label htmlFor="lead-sort">Sort</label>
          <select
            id="lead-sort"
            value={sortOption}
            onChange={(event) => {
              setSortOption(event.target.value as SortOptionValue);
              setPage(1);
            }}
          >
            {sortOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {(statusFilter !== "all" || searchTerm.trim() || sortOption !== "createdAt:desc") && (
          <button
            type="button"
            className="lead-management__clear"
            onClick={clearFilters}
          >
            Clear
          </button>
        )}
      </section>

      <section className="lead-management__summary">
        <div className="summary-card">
          <h2>Captured Leads</h2>
          <p className="summary-card__value">{leadCountLabel}</p>
          {pagination && (
            <p className="summary-card__meta">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
          )}
        </div>
      </section>

      {error && !loading && (
        <div className="lead-management__alert" role="alert">
          <RiErrorWarningLine />
          <span>{error}</span>
        </div>
      )}

      <div className="lead-management__table-wrapper">
        <table className="lead-management__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Profession</th>
              <th>Source</th>
              <th>Message</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="lead-management__loading">
                  Loading leads...
                </td>
              </tr>
            ) : leads.length > 0 ? (
              leads.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <div className="lead-management__primary-text">
                      {lead.firstName} {lead.lastName}
                    </div>
                    {lead.notes && (
                      <div className="lead-management__secondary-text">
                        Notes: {lead.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <a href={`mailto:${lead.email}`} className="lead-management__link">
                      {lead.email}
                    </a>
                  </td>
                  <td>
                    {lead.phone ? (
                      <a href={`tel:${lead.phone}`} className="lead-management__link">
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="lead-management__muted">—</span>
                    )}
                  </td>
                  <td>
                    <span className={`lead-management__status lead-management__status--${lead.status}`}>
                      {statusLabels[lead.status] || lead.status}
                    </span>
                  </td>
                  <td>
                    {lead.profession ? (
                      <span>{lead.profession}</span>
                    ) : (
                      <span className="lead-management__muted">—</span>
                    )}
                  </td>
                  <td>
                    {lead.source === "website_contact_form" ? "Contact Form" :
                     lead.source === "website_bookNow_form" ? "Book Now Form" :
                     lead.source === "other" ? "Other" :
                     lead.source || "—"}
                  </td>
                  <td>
                    <span className="lead-management__message" title={lead.message}>
                      {lead.message}
                    </span>
                  </td>
                  <td className="lead-management__actions">
                    <div className="lead-management__menu" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        className="lead-management__menu-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setActiveMenu((current) =>
                            current === lead.id ? null : lead.id
                          );
                        }}
                        aria-label="Lead actions"
                      >
                        <RiMoreFill />
                      </button>
                      {activeMenu === lead.id && (
                        <div className="lead-management__menu-dropdown">
                          {statusOptions.map(({ value, label }) => (
                            <button
                              key={value}
                              type="button"
                              className="lead-management__menu-item"
                              onClick={() => handleStatusChange(lead.id, value)}
                              disabled={
                                updatingStatusId === lead.id || lead.status === value
                              }
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="lead-management__empty-state">
                  {error ? (
                    <span>{error}</span>
                  ) : (
                    <span>No leads to display yet.</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="lead-management__pagination">
          <button
            type="button"
            onClick={() => handlePageChange(page - 1)}
            disabled={loading || !pagination.hasPrevPage}
          >
            Previous
          </button>
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(page + 1)}
            disabled={loading || !pagination.hasNextPage}
          >
            Next
          </button>
        </div>
      )}

      {!pagination && !loading && totalLeads > PAGE_SIZE && (
        <div className="lead-management__pagination">
          <span>Showing first {totalLeads} leads.</span>
          <button type="button" onClick={handleRefresh} disabled={loading}>
            Refresh
          </button>
        </div>
      )}

      {showExportModal && (
        <div
          className="lead-management__modal-backdrop"
          role="presentation"
          onClick={closeExportModal}
        >
          <div
            className="lead-management__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lead-export-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="lead-management__modal-header">
              <h2 id="lead-export-title">Export leads</h2>
              <button
                type="button"
                className="lead-management__modal-close"
                onClick={closeExportModal}
                aria-label="Close export dialog"
                disabled={exportLoading}
              >
                ×
              </button>
            </div>
            <div className="lead-management__modal-body">
              <p>Select the time range to include in your CSV export.</p>
              <div className="lead-management__radio-group">
                {exportRangeOptions.map(({ value, label }) => (
                  <label
                    key={value}
                    className={`lead-management__radio-option ${
                      exportRange === value ? "is-selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="lead-export-range"
                      value={value}
                      checked={exportRange === value}
                      onChange={(event) =>
                        setExportRange(event.target.value as ExportRange)
                      }
                      disabled={exportLoading}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>

              {exportRange === "custom" && (
                <div className="lead-management__date-range">
                  <label className="lead-management__date-field">
                    <span>From</span>
                    <input
                      type="date"
                      value={customStartDate}
                      max={maxDate}
                      onChange={(event) => setCustomStartDate(event.target.value)}
                      disabled={exportLoading}
                    />
                  </label>
                  <label className="lead-management__date-field">
                    <span>To</span>
                    <input
                      type="date"
                      value={customEndDate}
                      min={customStartDate || undefined}
                      max={maxDate}
                      onChange={(event) => setCustomEndDate(event.target.value)}
                      disabled={exportLoading}
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="lead-management__modal-actions">
              <button
                type="button"
                className="lead-management__modal-secondary"
                onClick={closeExportModal}
                disabled={exportLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="lead-management__modal-primary"
                onClick={handleExport}
                disabled={exportLoading}
              >
                {exportLoading ? "Exporting…" : "Download CSV"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement;
