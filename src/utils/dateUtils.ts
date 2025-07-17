// Date formatting utilities for consistent date display across the application

export const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid

    // Format as "16/07/2025 5:00pm" (Australian style, 24-hour not required, no space before am/pm)
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${day}/${month}/${year} ${hours}:${minutes}${ampm}`;
  } catch (error) {
    return dateString; // Return original if formatting fails
  }
};

export const formatDateOnly = (dateString: string | undefined): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    // Format as "15 July 2025"
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    return date.toLocaleDateString("en-US", options);
  } catch (error) {
    return dateString;
  }
};

export const formatTimeOnly = (dateString: string | undefined): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    // Format as "6:48 PM"
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    };

    return date.toLocaleTimeString("en-US", options);
  } catch (error) {
    return dateString;
  }
};

export const formatRelativeDate = (dateString: string | undefined): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return date < now ? "Yesterday" : "Tomorrow";
    if (diffDays < 7)
      return `${diffDays} days ${date < now ? "ago" : "from now"}`;

    return formatDateOnly(dateString);
  } catch (error) {
    return dateString;
  }
};
