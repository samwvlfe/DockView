// lib/helpers/date.js

/**
 * Safely converts a date string into a Date object.
 * Returns null if invalid.
 */
function parseDate(date) {
  if (!date) return null;

  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a date into MM/DD/YYYY
 */
function formatDate(date) {
  const d = parseDate(date);
  if (!d) return "--";

  return d.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  });
}

/**
 * Formats date + time: MM/DD/YYYY HH:MM
 */
function formatDateTime(date) {
  const d = parseDate(date);
  if (!d) return "--";

  return d.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

module.exports = {
  parseDate,
  formatDate,
  formatDateTime
};
