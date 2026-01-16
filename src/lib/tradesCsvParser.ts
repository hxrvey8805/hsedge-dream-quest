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

// Column name aliases for flexible matching
const COLUMN_ALIASES: Record<string, string[]> = {
  trade_date: ['trade_date', 'trade date', 'date', 'datetime', 'timestamp', 'time', 'execution date', 'exec date', 'transaction date', 'trans date', 'order date'],
  symbol: ['symbol', 'ticker', 'stock', 'instrument', 'security', 'asset', 'pair', 'market', 'name'],
  buy_sell: ['buy_sell', 'buy/sell', 'side', 'direction', 'type', 'action', 'order type', 'trade type', 'b/s', 'position'],
  entry_price: ['entry_price', 'entry', 'price', 'open price', 'fill price', 'exec price', 'execution price', 'avg price', 'average price', 'cost'],
  exit_price: ['exit_price', 'exit', 'close price', 'closing price'],
  stop_loss: ['stop_loss', 'stop', 'sl', 'stoploss'],
  size: ['size', 'qty', 'quantity', 'shares', 'lots', 'contracts', 'units', 'volume', 'amount', 'position size'],
  fees: ['fees', 'fee', 'commission', 'commission amount', 'commissions', 'cost', 'charges', 'trading fees'],
  time_opened: ['time_opened', 'time', 'open time', 'entry time', 'execution time', 'exec time', 'raw exec. time', 'fill time', 'trade time'],
  time_closed: ['time_closed', 'close time', 'exit time'],
  session: ['session', 'market session', 'trading session'],
  strategy_type: ['strategy_type', 'strategy', 'setup', 'pattern', 'trade setup'],
  entry_timeframe: ['entry_timeframe', 'timeframe', 'tf', 'chart'],
  notes: ['notes', 'note', 'comment', 'comments', 'description', 'memo', 'remarks'],
  asset_class: ['asset_class', 'asset class', 'security type', 'instrument type', 'market type', 'product type', 'type'],
  net_amount: ['net amount', 'net', 'total', 'principal amount', 'amount'],
};

/**
 * Parses CSV data for bulk trade import - supports multiple brokerage formats
 */
export function parseTradesFromCSV(csvText: string): TradeCSVParseResult {
  const lines = csvText.trim().split('\n');
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (lines.length < 2) {
    return { data: [], errors: ["CSV must have at least a header row and one data row"], warnings: [] };
  }

  // Parse header row
  const headerLine = lines[0];
  const header = parseCSVLine(headerLine).map(h => h.toLowerCase().trim().replace(/"/g, ''));
  
  // Build flexible column mapping
  const columnMap = buildColumnMap(header);

  // Check for minimum required data
  const hasDateColumn = columnMap.trade_date !== -1;
  const hasSymbolColumn = columnMap.symbol !== -1;
  const hasSideColumn = columnMap.buy_sell !== -1;

  if (!hasDateColumn) {
    return { data: [], errors: [`Missing date column. Found columns: ${header.join(', ')}`], warnings: [] };
  }
  if (!hasSymbolColumn) {
    return { data: [], errors: [`Missing symbol column. Found columns: ${header.join(', ')}`], warnings: [] };
  }

  const data: ParsedTrade[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line).map(v => v.replace(/"/g, '').trim());
    const rowNum = i + 1;

    try {
      // Parse date
      const tradeDateRaw = getColumnValue(values, columnMap.trade_date);
      if (!tradeDateRaw) {
        errors.push(`Row ${rowNum}: Missing trade date`);
        continue;
      }

      const tradeDate = normalizeDate(tradeDateRaw);
      if (!tradeDate) {
        errors.push(`Row ${rowNum}: Invalid date format "${tradeDateRaw}"`);
        continue;
      }

      // Parse symbol
      let symbol = getColumnValue(values, columnMap.symbol);
      if (!symbol) {
        errors.push(`Row ${rowNum}: Missing symbol`);
        continue;
      }
      symbol = symbol.toUpperCase().trim();

      // Parse buy/sell direction
      let buySell = 'Buy'; // Default
      if (hasSideColumn) {
        const sideRaw = getColumnValue(values, columnMap.buy_sell);
        buySell = normalizeBuySell(sideRaw) || 'Buy';
      }

      // Parse size (handle negative quantities)
      let size = parseNumberValue(getColumnValue(values, columnMap.size));
      if (size !== null && size < 0) {
        size = Math.abs(size);
        // Negative quantity often indicates a sell
        if (!hasSideColumn) {
          buySell = 'Sell';
        }
      }

      // Parse prices
      const entryPrice = parseNumberValue(getColumnValue(values, columnMap.entry_price));
      const exitPrice = parseNumberValue(getColumnValue(values, columnMap.exit_price));
      const stopLoss = parseNumberValue(getColumnValue(values, columnMap.stop_loss));

      // Parse fees
      let fees = parseNumberValue(getColumnValue(values, columnMap.fees));
      if (fees !== null) {
        fees = Math.abs(fees); // Fees are always positive
      }

      // Parse time
      let timeOpened = parseTimeValue(getColumnValue(values, columnMap.time_opened));
      const timeClosed = parseTimeValue(getColumnValue(values, columnMap.time_closed));

      // Parse asset class
      const assetClassRaw = getColumnValue(values, columnMap.asset_class);
      const assetClass = normalizeAssetClass(assetClassRaw) || 'Stocks';

      // Parse optional fields
      const session = getColumnValue(values, columnMap.session);
      const strategyType = getColumnValue(values, columnMap.strategy_type);
      const entryTimeframe = getColumnValue(values, columnMap.entry_timeframe);
      const notes = getColumnValue(values, columnMap.notes);

      const trade: ParsedTrade = {
        trade_date: tradeDate,
        symbol,
        asset_class: assetClass,
        buy_sell: buySell,
        entry_price: entryPrice,
        exit_price: exitPrice,
        stop_loss: stopLoss,
        size: size || 100, // Default to 100 if not provided
        fees,
        time_opened: timeOpened,
        time_closed: timeClosed,
        session: session || null,
        strategy_type: strategyType || null,
        entry_timeframe: entryTimeframe || null,
        notes: notes || null,
      };

      data.push(trade);
    } catch (err) {
      errors.push(`Row ${rowNum}: Parse error`);
    }
  }

  if (data.length === 0 && errors.length === 0) {
    errors.push("No valid data rows found");
  }

  // Add warning about format detection
  if (data.length > 0) {
    const detectedFormat = detectFormat(header);
    if (detectedFormat) {
      warnings.push(`Detected ${detectedFormat} format`);
    }
  }

  return { data, errors, warnings };
}

function buildColumnMap(header: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    map[field] = -1;
    for (const alias of aliases) {
      const idx = header.findIndex(h => h === alias || h.includes(alias));
      if (idx !== -1) {
        map[field] = idx;
        break;
      }
    }
  }
  
  return map;
}

function getColumnValue(values: string[], index: number): string | null {
  if (index === -1 || index >= values.length) return null;
  const val = values[index]?.trim();
  return val || null;
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
  if (!dateStr) return null;
  
  // Clean up the string
  dateStr = dateStr.trim().replace(/"/g, '');
  
  // Try to extract date part if it includes time
  const dateTimeParts = dateStr.split(/\s+/);
  let datePart = dateTimeParts[0];
  
  // ISO format: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const date = new Date(datePart);
    if (!isNaN(date.getTime())) {
      return datePart;
    }
  }

  // US format: MM/DD/YYYY or M/D/YYYY or MM/DD/YY
  const usMatch = datePart.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (usMatch) {
    let [, month, day, year] = usMatch;
    if (year.length === 2) {
      year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
    }
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) {
      return isoDate;
    }
  }

  // EU format: DD-MM-YYYY or DD.MM.YYYY
  const euMatch = datePart.match(/^(\d{1,2})[-.](\d{1,2})[-.](\d{4})$/);
  if (euMatch) {
    const [, day, month, year] = euMatch;
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const date = new Date(isoDate);
    if (!isNaN(date.getTime())) {
      return isoDate;
    }
  }

  // Try parsing with Date constructor as fallback
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return null;
}

function normalizeBuySell(value: string | null): string | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  
  // Handle "Long Buy", "Long Sell", "Short Sell", etc.
  if (lower.includes('buy') || lower.includes('long buy')) return 'Buy';
  if (lower.includes('sell') || lower.includes('long sell') || lower.includes('short')) return 'Sell';
  
  // Handle simple values
  if (lower === 'b' || lower === 'l' || lower === 'long') return 'Buy';
  if (lower === 's' || lower === 'short') return 'Sell';
  
  // Handle Side column with B/S
  if (lower === 'b  ' || lower.startsWith('b')) return 'Buy';
  if (lower === 's  ' || lower.startsWith('s')) return 'Sell';
  
  return null;
}

function normalizeAssetClass(value: string | null): string | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  
  if (lower.includes('forex') || lower.includes('fx') || lower.includes('currency')) return 'Forex';
  if (lower.includes('stock') || lower.includes('equity') || lower.includes('equities')) return 'Stocks';
  if (lower.includes('future') || lower.includes('futures')) return 'Futures';
  if (lower.includes('crypto') || lower.includes('cryptocurrency') || lower.includes('coin')) return 'Crypto';
  if (lower.includes('option')) return 'Stocks'; // Treat options as stocks for now
  
  return null;
}

function parseNumberValue(value: string | null): number | null {
  if (!value) return null;
  // Remove currency symbols, commas, and clean up
  const cleaned = value.replace(/[$€£¥,\s]/g, '').trim();
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseTimeValue(value: string | null): string | null {
  if (!value) return null;
  
  const cleaned = value.trim();
  
  // Already in HH:MM format
  if (/^\d{1,2}:\d{2}$/.test(cleaned)) {
    const parts = cleaned.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1]}`;
  }
  
  // HH:MM:SS format
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(cleaned)) {
    const parts = cleaned.split(':');
    return `${parts[0].padStart(2, '0')}:${parts[1]}`;
  }
  
  // Full datetime format - extract time
  const timeMatch = cleaned.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (timeMatch) {
    return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
  }
  
  return null;
}

function detectFormat(header: string[]): string | null {
  const headerStr = header.join(' ').toLowerCase();
  
  if (headerStr.includes('account number') && headerStr.includes('cusip')) {
    return 'Brokerage Statement';
  }
  if (headerStr.includes('tradingview')) {
    return 'TradingView';
  }
  if (headerStr.includes('metatrader') || headerStr.includes('mt4') || headerStr.includes('mt5')) {
    return 'MetaTrader';
  }
  if (headerStr.includes('thinkorswim') || headerStr.includes('tos')) {
    return 'ThinkOrSwim';
  }
  if (headerStr.includes('interactive brokers') || headerStr.includes('ibkr')) {
    return 'Interactive Brokers';
  }
  
  return null;
}

/**
 * Calculate P&L for a parsed trade
 */
export function calculateTradePnL(trade: ParsedTrade): { pips: number; profit: number; outcome: string } {
  const entry = trade.entry_price;
  const exit = trade.exit_price;
  const size = trade.size;
  const fees = trade.fees || 0;

  // If no exit price, we only have entry (single transaction)
  if (!entry || !exit || !size) {
    // For single transactions, calculate based on entry price and size
    if (entry && size) {
      // This is a single transaction, not a complete trade
      return { pips: 0, profit: 0, outcome: 'Open' };
    }
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
