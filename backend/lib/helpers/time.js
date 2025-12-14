// lib/helpers/time.js

/**
 * Converts seconds to HH:MM:SS
 */
function secondsToHMS(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return "00:00:00";

  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  return [hrs, mins, secs]
    .map(v => String(v).padStart(2, "0"))
    .join(":");
}

/**
 * Converts seconds to human readable: Xh Xm Xs
 */
function secondsToHuman(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return "0s";

  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  const parts = [];
  if (hrs) parts.push(`${hrs}h`);
  if (mins) parts.push(`${mins}m`);
  if (secs || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

/**
 * Returns elapsed time since date
 */
function timeSince(date) {
  const d = date ? new Date(date) : null;
  if (!d || isNaN(d.getTime())) return "--";

  const diffSeconds = Math.floor((Date.now() - d.getTime()) / 1000);
  return secondsToHuman(diffSeconds);
}

module.exports = {
  secondsToHMS,
  secondsToHuman,
  timeSince
};
