/**
 * Session Detection Utility
 * Auto-detects trading sessions based on trade time and user timezone
 * 
 * Session time ranges (in user's local time, based on NYC market hours):
 * - Premarket: Before 09:30
 * - NYC: 09:30 to 16:00
 * - London: 03:00 to 10:00
 * - Asia: 23:00 to 06:00
 * 
 * For overlaps, uses "primary session" rule (first session to open)
 */

export type TradingSession = "Premarket" | "Asia" | "London" | "New York";

interface SessionTimeRange {
  name: TradingSession;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  priority: number; // Lower = higher priority for overlap resolution
}

// Session definitions with priority (Asia opens first globally, then London, then NYC)
const SESSION_RANGES: SessionTimeRange[] = [
  { name: "Asia", startHour: 23, startMinute: 0, endHour: 6, endMinute: 0, priority: 1 },
  { name: "London", startHour: 3, startMinute: 0, endHour: 10, endMinute: 0, priority: 2 },
  { name: "Premarket", startHour: 4, startMinute: 0, endHour: 9, endMinute: 30, priority: 3 },
  { name: "New York", startHour: 9, startMinute: 30, endHour: 16, endMinute: 0, priority: 4 },
];

/**
 * Convert a time string to minutes since midnight
 */
function timeToMinutes(hour: number, minute: number): number {
  return hour * 60 + minute;
}

/**
 * Check if a time (in minutes) falls within a session range
 * Handles overnight sessions (like Asia 23:00-06:00)
 */
function isTimeInSession(timeMinutes: number, session: SessionTimeRange): boolean {
  const startMinutes = timeToMinutes(session.startHour, session.startMinute);
  const endMinutes = timeToMinutes(session.endHour, session.endMinute);
  
  // Overnight session (e.g., 23:00 to 06:00)
  if (startMinutes > endMinutes) {
    return timeMinutes >= startMinutes || timeMinutes < endMinutes;
  }
  
  // Normal session (e.g., 09:30 to 16:00)
  return timeMinutes >= startMinutes && timeMinutes < endMinutes;
}

/**
 * Detect the trading session based on trade time
 * 
 * @param tradeTime - Time string in format "HH:MM" or "HH:MM:SS"
 * @param userTimezone - User's timezone (e.g., "America/New_York")
 * @returns The detected session, or null if outside all sessions
 */
export function detectSession(
  tradeTime: string | null | undefined,
  userTimezone: string = "America/New_York",
  allowedSessions?: TradingSession[]
): TradingSession | null {
  if (!tradeTime) return null;

  // Parse the time string
  const timeParts = tradeTime.split(":");
  if (timeParts.length < 2) return null;

  const hour = parseInt(timeParts[0], 10);
  const minute = parseInt(timeParts[1], 10);

  if (isNaN(hour) || isNaN(minute)) return null;

  // Convert to NYC time if user is in a different timezone
  const adjustedTime = convertToNYCTime(hour, minute, userTimezone);
  const timeMinutes = timeToMinutes(adjustedTime.hour, adjustedTime.minute);

  // Filter session ranges by allowed sessions if provided
  const sessionsToCheck = allowedSessions 
    ? SESSION_RANGES.filter(s => allowedSessions.includes(s.name))
    : SESSION_RANGES;

  // Find all matching sessions
  const matchingSessions = sessionsToCheck.filter(session => 
    isTimeInSession(timeMinutes, session)
  );

  if (matchingSessions.length === 0) {
    // Outside all defined sessions - check if premarket is allowed and time is before NYSE open
    if ((!allowedSessions || allowedSessions.includes("Premarket")) && timeMinutes < timeToMinutes(9, 30)) {
      return "Premarket";
    }
    return null;
  }

  // Return the session with highest priority (lowest number = first to open)
  matchingSessions.sort((a, b) => a.priority - b.priority);
  return matchingSessions[0].name;
}

/**
 * Convert a time from user's timezone to NYC time
 * This is a simplified conversion - for production, consider using a library like date-fns-tz
 */
function convertToNYCTime(
  hour: number, 
  minute: number, 
  userTimezone: string
): { hour: number; minute: number } {
  // For now, we'll use the browser's Intl API to handle timezone conversion
  // Create a date object for today with the given time
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  
  try {
    // Create date in user's timezone
    const userDate = new Date(`${dateStr}T${timeStr}`);
    
    // Get the offset difference between user timezone and NYC
    const userOffset = getTimezoneOffset(userTimezone, userDate);
    const nycOffset = getTimezoneOffset("America/New_York", userDate);
    
    // Adjust the time
    const diffMinutes = nycOffset - userOffset;
    const totalMinutes = hour * 60 + minute + diffMinutes;
    
    // Normalize to 0-1440 range
    const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
    
    return {
      hour: Math.floor(normalizedMinutes / 60),
      minute: normalizedMinutes % 60
    };
  } catch {
    // Fallback: assume user is already in NYC time
    return { hour, minute };
  }
}

/**
 * Get timezone offset in minutes for a given timezone
 */
function getTimezoneOffset(timezone: string, date: Date): number {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    };
    
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(date);
    
    const hourPart = parts.find(p => p.type === 'hour');
    const minutePart = parts.find(p => p.type === 'minute');
    
    if (!hourPart || !minutePart) return 0;
    
    const localHour = parseInt(hourPart.value, 10);
    const localMinute = parseInt(minutePart.value, 10);
    
    // Calculate offset from UTC
    const utcHour = date.getUTCHours();
    const utcMinute = date.getUTCMinutes();
    
    let diffMinutes = (localHour * 60 + localMinute) - (utcHour * 60 + utcMinute);
    
    // Handle day boundary
    if (diffMinutes > 720) diffMinutes -= 1440;
    if (diffMinutes < -720) diffMinutes += 1440;
    
    return diffMinutes;
  } catch {
    return 0;
  }
}

/**
 * Get common timezone options for dropdown
 */
export const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Phoenix", label: "Arizona (No DST)" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European Time" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (HKT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
  { value: "UTC", label: "UTC" },
] as const;

/**
 * Detect user's browser timezone
 */
export function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "America/New_York";
  }
}
