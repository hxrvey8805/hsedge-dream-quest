export interface ParsedTrade {
  trade_date: string;
  symbol: string;
  asset_class: string;
  buy_sell: string;
  entry_price: number | null;
  exit_price: number | null;
  stop_loss: number | null;
  size: number | null;
  fees: number | null;
  time_opened: string | null;
  time_closed: string | null;
  session: string | null;
  strategy_type: string | null;
  entry_timeframe: string | null;
  notes: string | null;
}

export interface TradeCSVParseResult {
  data: ParsedTrade[];
  errors: string[];
  warnings: string[];
}

const REQUIRED_COLUMNS = ['trade_date', 'symbol', 'buy_sell'];
const OPTIONAL_COLUMNS = [
  'asset_class', 'entry_price', 'exit_price', 'stop_loss', 'size', 
  'fees', 'time_opened', 'time_closed', 'session', 'strategy_type', 
  'entry_timeframe', 'notes'
];

const VALID_ASSET_CLASSES = ['Forex', 'Stocks', 'Futures', 'Crypto'];
const VALID_BUY_SELL = ['Buy', 'Sell'];
const VALID_SESSIONS = ['Asia', 'London', 'New York', 'Sydney', 'Pre-Market', 'Regular', 'After Hours'];

/**
 * Parses CSV data for bulk trade import
 */
export function parseTradesFromCSV(csvText: string): TradeCSVParseResult {
  const lines = csvText.trim().split('\n');
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (lines.length < 2) {
    return { data: [], errors: ["CSV must have at least a header row and one data row"], warnings: [] };
  }

  // Parse header row - handle various delimiters and quotes
  const headerLine = lines[0];
  const header = parseCSVLine(headerLine).map(h => h.toLowerCase().trim().replace(/\s+/g, '_'));
  
  // Find column indices
  const columnMap: Record<string, number> = {};
  header.forEach((col, idx) => {
    columnMap[col] = idx;
  });

  // Validate required columns
  const missingRequired = REQUIRED_COLUMNS.filter(col => columnMap[col] === undefined);
  if (missingRequired.length > 0) {
    return { 
      data: [], 
      errors: [`Missing required columns: ${missingRequired.join(', ')}`],
      warnings: []
    };
  }

  const data: ParsedTrade[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const rowNum = i + 1;

    try {
      // Parse required fields
      const tradeDateRaw = values[columnMap['trade_date']]?.trim();
      const symbol = values[columnMap['symbol']]?.trim();
      const buySellRaw = values[columnMap['buy_sell']]?.trim();

      if (!tradeDateRaw) {
        errors.push(`Row ${rowNum}: Missing trade_date`);
        continue;
      }
      if (!symbol) {
        errors.push(`Row ${rowNum}: Missing symbol`);
        continue;
      }
      if (!buySellRaw) {
        errors.push(`Row ${rowNum}: Missing buy_sell`);
        continue;
      }

      // Normalize and validate trade_date
      const tradeDate = normalizeDate(tradeDateRaw);
      if (!tradeDate) {
        errors.push(`Row ${rowNum}: Invalid date format "${tradeDateRaw}"`);
        continue;
      }

      // Normalize buy_sell
      const buySell = normalizeBuySell(buySellRaw);
      if (!buySell) {
        errors.push(`Row ${rowNum}: Invalid buy_sell "${buySellRaw}". Use Buy/Sell or Long/Short`);
        continue;
      }

      // Parse optional fields
      const assetClassRaw = columnMap['asset_class'] !== undefined 
        ? values[columnMap['asset_class']]?.trim() 
        : null;
      const assetClass = normalizeAssetClass(assetClassRaw) || 'Forex';
      
      if (assetClassRaw && !normalizeAssetClass(assetClassRaw)) {
        warnings.push(`Row ${rowNum}: Unknown asset_class "${assetClassRaw}", defaulting to Forex`);
      }

      const trade: ParsedTrade = {
        trade_date: tradeDate,
        symbol: symbol.toUpperCase(),
        asset_class: assetClass,
        buy_sell: buySell,
        entry_price: parseNumberField(values, columnMap, 'entry_price'),
        exit_price: parseNumberField(values, columnMap, 'exit_price'),
        stop_loss: parseNumberField(values, columnMap, 'stop_loss'),
        size: parseNumberField(values, columnMap, 'size'),
        fees: parseNumberField(values, columnMap, 'fees'),
        time_opened: parseTimeField(values, columnMap, 'time_opened'),
        time_closed: parseTimeField(values, columnMap, 'time_closed'),
        session: parseStringField(values, columnMap, 'session'),
        strategy_type: parseStringField(values, columnMap, 'strategy_type'),
        entry_timeframe: parseStringField(values, columnMap, 'entry_timeframe'),
        notes: parseStringField(values, columnMap, 'notes'),
      };

      data.push(trade);
    } catch (err) {
      errors.push(`Row ${rowNum}: Parse error`);
    }
  }

  if (data.length === 0 && errors.length === 0) {
    errors.push("No valid data rows found");
  }

  return { data, errors, warnings };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === ',' || char === '\t') && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function normalizeDate(dateStr: string): string | null {
  // Try various date formats
  const formats = [
    // ISO format
    /^(\d{4})-(\d{2})-(\d{2})$/,
    // US format
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // EU format
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
  ];

  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return dateStr;
    }
  }

  // US format: MM/DD/YYYY or M/D/YYYY
  const usMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    const [, month, day, year] = usMatch;
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) {
      return isoDate;
    }
  }

  // EU format: DD-MM-YYYY
  const euMatch = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (euMatch) {
    const [, day, month, year] = euMatch;
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) {
      return isoDate;
    }
  }

  return null;
}

function normalizeBuySell(value: string): string | null {
  const lower = value.toLowerCase();
  if (lower === 'buy' || lower === 'long' || lower === 'b') return 'Buy';
  if (lower === 'sell' || lower === 'short' || lower === 's') return 'Sell';
  return null;
}

function normalizeAssetClass(value: string | null): string | null {
  if (!value) return null;
  const lower = value.toLowerCase();
  if (lower === 'forex' || lower === 'fx' || lower === 'currency') return 'Forex';
  if (lower === 'stocks' || lower === 'stock' || lower === 'equity' || lower === 'equities') return 'Stocks';
  if (lower === 'futures' || lower === 'future') return 'Futures';
  if (lower === 'crypto' || lower === 'cryptocurrency') return 'Crypto';
  return null;
}

function parseNumberField(values: string[], columnMap: Record<string, number>, field: string): number | null {
  if (columnMap[field] === undefined) return null;
  const value = values[columnMap[field]]?.trim();
  if (!value) return null;
  const num = parseFloat(value.replace(/[,$]/g, ''));
  return isNaN(num) ? null : num;
}

function parseTimeField(values: string[], columnMap: Record<string, number>, field: string): string | null {
  if (columnMap[field] === undefined) return null;
  const value = values[columnMap[field]]?.trim();
  if (!value) return null;
  
  // Validate time format (HH:MM or HH:MM:SS)
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(value)) {
    const parts = value.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1]}`;
  }
  return null;
}

function parseStringField(values: string[], columnMap: Record<string, number>, field: string): string | null {
  if (columnMap[field] === undefined) return null;
  const value = values[columnMap[field]]?.trim();
  return value || null;
}

/**
 * Calculate P&L for a parsed trade
 */
export function calculateTradePnL(trade: ParsedTrade): { pips: number; profit: number; outcome: string } {
  const entry = trade.entry_price;
  const exit = trade.exit_price;
  const size = trade.size;
  const fees = trade.fees || 0;

  if (!entry || !exit || !size) {
    return { pips: 0, profit: 0, outcome: 'Break Even' };
  }

  const priceDiff = trade.buy_sell === 'Sell' ? (entry - exit) : (exit - entry);
  let pips = 0;
  let profit = 0;

  switch (trade.asset_class) {
    case 'Forex':
      pips = priceDiff * 10000;
      profit = pips * size * 10 - fees;
      break;
    case 'Stocks':
      profit = priceDiff * size - fees;
      pips = priceDiff;
      break;
    case 'Futures':
      profit = priceDiff * size - fees;
      pips = priceDiff;
      break;
    case 'Crypto':
      profit = priceDiff * size - fees;
      pips = priceDiff;
      break;
  }

  const outcome = profit > 0 ? 'Win' : profit < 0 ? 'Loss' : 'Break Even';

  return {
    pips: parseFloat(pips.toFixed(2)),
    profit: parseFloat(profit.toFixed(2)),
    outcome
  };
}

/**
 * Example CSV format for user reference
 */
export const TRADES_CSV_EXAMPLE = `trade_date,symbol,buy_sell,asset_class,entry_price,exit_price,stop_loss,size,fees,session,strategy_type,notes
2024-01-15,EURUSD,Buy,Forex,1.0850,1.0920,1.0800,0.5,2.50,London,Breakout,Strong momentum trade
2024-01-16,AAPL,Sell,Stocks,185.50,182.25,188.00,100,1.00,Regular,Mean Reversion,Overbought setup
2024-01-17,BTCUSD,Buy,Crypto,42500,43200,41800,0.1,5.00,Asia,Trend Follow,`;
