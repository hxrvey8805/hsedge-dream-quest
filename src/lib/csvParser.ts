export interface ParsedOHLC {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CSVParseResult {
  data: ParsedOHLC[];
  error?: string;
}

/**
 * Parses CSV data from TradingView or other platforms into OHLC format.
 * Supports common column headers: time/date/datetime, open, high, low, close
 */
export function parseOHLCFromCSV(csvText: string): CSVParseResult {
  const lines = csvText.trim().split('\n');
  
  if (lines.length < 2) {
    return { data: [], error: "CSV must have at least a header row and one data row" };
  }

  // Parse header row
  const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
  
  // Find column indices
  const timeIndex = header.findIndex(h => 
    ['time', 'date', 'datetime', 'timestamp'].includes(h)
  );
  const openIndex = header.findIndex(h => h === 'open');
  const highIndex = header.findIndex(h => h === 'high');
  const lowIndex = header.findIndex(h => h === 'low');
  const closeIndex = header.findIndex(h => h === 'close');

  // Validate required columns
  if (timeIndex === -1) {
    return { data: [], error: "Missing 'time' or 'date' column" };
  }
  if (openIndex === -1 || highIndex === -1 || lowIndex === -1 || closeIndex === -1) {
    return { data: [], error: "Missing OHLC columns (open, high, low, close)" };
  }

  const data: ParsedOHLC[] = [];
  const errors: string[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
    
    try {
      const timeValue = values[timeIndex];
      const open = parseFloat(values[openIndex]);
      const high = parseFloat(values[highIndex]);
      const low = parseFloat(values[lowIndex]);
      const close = parseFloat(values[closeIndex]);

      if (isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
        errors.push(`Row ${i + 1}: Invalid numeric values`);
        continue;
      }

      // Normalize time format
      let normalizedTime = timeValue;
      
      // Handle TradingView format "2024-01-15T09:30:00Z" or "2024-01-15 09:30:00"
      if (!timeValue.includes('T')) {
        normalizedTime = timeValue.replace(' ', 'T');
      }
      
      // Validate date
      const date = new Date(normalizedTime);
      if (isNaN(date.getTime())) {
        errors.push(`Row ${i + 1}: Invalid date format`);
        continue;
      }

      data.push({
        time: normalizedTime,
        open,
        high,
        low,
        close,
      });
    } catch (err) {
      errors.push(`Row ${i + 1}: Parse error`);
    }
  }

  if (data.length === 0) {
    return { 
      data: [], 
      error: errors.length > 0 
        ? `No valid data rows. Errors: ${errors.slice(0, 3).join('; ')}` 
        : "No valid data rows found" 
    };
  }

  // Sort by time ascending
  data.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return { data };
}

/**
 * Example CSV format for user reference
 */
export const CSV_EXAMPLE = `time,open,high,low,close
2024-01-15 09:30:00,4520.25,4525.50,4518.00,4523.75
2024-01-15 09:45:00,4523.75,4528.00,4522.50,4527.25
2024-01-15 10:00:00,4527.25,4530.00,4525.00,4529.50`;
