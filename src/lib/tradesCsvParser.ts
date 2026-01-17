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

interface RawTransaction {
  trade_date: string;
  symbol: string;
  asset_class: string;
  buy_sell: string;
  price: number;
  size: number;
  fees: number;
  time: string | null;
  rowNum: number;
}

export interface TradeCSVParseResult {
  data: ParsedTrade[];
  errors: string[];
  warnings: string[];
}

// Column name aliases for flexible matching
const COLUMN_ALIASES: Record<string, string[]> = {
  trade_date: ['trade_date', 'trade date', 'date', 'datetime', 'timestamp', 'execution date', 'exec date', 'transaction date', 'trans date', 'order date'],
  symbol: ['symbol', 'ticker', 'stock', 'instrument', 'security', 'asset', 'pair', 'market', 'name'],
  buy_sell: ['buy_sell', 'buy/sell', 'buy sell', 'direction', 'action', 'order type', 'trade type', 'b/s', 'position', 'side'],

  // IMPORTANT: avoid overly-generic aliases like "entry" here because they can incorrectly match
  // brokerage exports that contain "Entry Time" (which is NOT a price).
  entry_price: [
    'entry_price',
    'entry price',
    'open price',
    'fill price',
    'exec price',
    'execution price',
    'avg price',
    'average price',
    'price',
  ],

  exit_price: ['exit_price', 'exit price', 'exit', 'close price', 'closing price'],
  stop_loss: ['stop_loss', 'stop loss', 'stop', 'sl', 'stoploss'],
  size: ['size', 'qty', 'quantity', 'shares', 'lots', 'contracts', 'units', 'volume', 'position size'],

  // For many brokerage statements, the most accurate "fees" are derived from (net_amount - principal_amount).
  fees: ['fees', 'fee', 'commission', 'commission amount', 'commissions', 'charges', 'trading fees'],

  time_opened: ['time_opened', 'execution time', 'exec time', 'raw exec. time', 'fill time', 'trade time', 'time'],
  time_closed: ['time_closed', 'close time', 'exit time'],
  session: ['session', 'market session', 'trading session'],
  strategy_type: ['strategy_type', 'strategy', 'setup', 'pattern', 'trade setup'],
  entry_timeframe: ['entry_timeframe', 'timeframe', 'tf', 'chart'],
  notes: ['notes', 'note', 'comment', 'comments', 'description', 'memo', 'remarks'],
  asset_class: ['asset_class', 'asset class', 'security type', 'instrument type', 'market type', 'product type', 'type'],

  principal_amount: ['principal amount', 'principal'],
  net_amount: ['net amount', 'net'],
};

/**
 * Parses CSV data for bulk trade import - supports multiple brokerage formats
 * Automatically pairs buy/sell transactions into complete trades
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
  const hasExitPriceColumn = columnMap.exit_price !== -1;

  if (!hasDateColumn) {
    return { data: [], errors: [`Missing date column. Found columns: ${header.join(', ')}`], warnings: [] };
  }
  if (!hasSymbolColumn) {
    return { data: [], errors: [`Missing symbol column. Found columns: ${header.join(', ')}`], warnings: [] };
  }

  // Collect all transactions first
  const transactions: RawTransaction[] = [];

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
      let buySell = 'Buy';
      if (hasSideColumn) {
        const sideRaw = getColumnValue(values, columnMap.buy_sell);
        buySell = normalizeBuySell(sideRaw) || 'Buy';
      }

      // Parse size (handle negative quantities)
      let size = parseNumberValue(getColumnValue(values, columnMap.size));
      if (size !== null && size < 0) {
        size = Math.abs(size);
        // Negative quantity often indicates a sell
        if (!hasSideColumn || buySell === 'Buy') {
          buySell = 'Sell';
        }
      }

      // Parse price
      const price = parseNumberValue(getColumnValue(values, columnMap.entry_price));
      if (!price) {
        errors.push(`Row ${rowNum}: Missing price`);
        continue;
      }

      // Parse fees
      let fees = parseNumberValue(getColumnValue(values, columnMap.fees));
      if (fees !== null) {
        fees = Math.abs(fees);
      }

      // Parse time
      const time = parseTimeValue(getColumnValue(values, columnMap.time_opened));

      // Parse asset class
      const assetClassRaw = getColumnValue(values, columnMap.asset_class);
      const assetClass = normalizeAssetClass(assetClassRaw) || 'Stocks';

      transactions.push({
        trade_date: tradeDate,
        symbol,
        asset_class: assetClass,
        buy_sell: buySell,
        price,
        size: size || 100,
        fees: fees || 0,
        time,
        rowNum,
      });
    } catch (err) {
      errors.push(`Row ${rowNum}: Parse error`);
    }
  }

  // Check if this looks like a brokerage statement (separate buy/sell rows) or journaled trades
  const isBrokerageFormat = !hasExitPriceColumn && transactions.length > 0;
  
  let data: ParsedTrade[] = [];

  if (isBrokerageFormat) {
    // Pair buy/sell transactions into complete trades
    data = pairTransactions(transactions, warnings);
  } else {
    // Already formatted as complete trades - convert directly
    data = transactions.map(t => ({
      trade_date: t.trade_date,
      symbol: t.symbol,
      asset_class: t.asset_class,
      buy_sell: t.buy_sell,
      entry_price: t.price,
      exit_price: null,
      stop_loss: null,
      size: t.size,
      fees: t.fees,
      time_opened: t.time,
      time_closed: null,
      session: null,
      strategy_type: null,
      entry_timeframe: null,
      notes: null,
    }));
  }

  if (data.length === 0 && errors.length === 0) {
    errors.push("No valid trades could be created from the data");
  }

  // Add format detection warning
  if (data.length > 0) {
    const detectedFormat = detectFormat(header);
    if (detectedFormat) {
      warnings.unshift(`Detected ${detectedFormat} format - paired ${transactions.length} transactions into ${data.length} trades`);
    }
  }

  return { data, errors, warnings };
}

/**
 * Pairs buy and sell transactions into complete trades using chronological FIFO matching
 * Processes all transactions in strict time order to correctly pair entries with exits
 */
function pairTransactions(transactions: RawTransaction[], warnings: string[]): ParsedTrade[] {
  const trades: ParsedTrade[] = [];
  
  // Group by symbol and date
  const grouped = new Map<string, RawTransaction[]>();
  
  for (const tx of transactions) {
    const key = `${tx.symbol}_${tx.trade_date}`;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(tx);
  }

  // Process each group
  for (const [key, txs] of grouped) {
    // Sort ALL transactions by time chronologically
    txs.sort((a, b) => {
      if (a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      return a.rowNum - b.rowNum;
    });

    // Process transactions in order, maintaining open positions
    const openBuyPositions: RawTransaction[] = [];
    const openSellPositions: RawTransaction[] = [];

    for (const tx of txs) {
      if (tx.buy_sell === 'Buy') {
        // Check if this closes a short position
        if (openSellPositions.length > 0) {
          const entry = openSellPositions.shift()!;
          // Short trade: Sold first (entry), then bought to cover (exit)
          const trade: ParsedTrade = {
            trade_date: entry.trade_date,
            symbol: entry.symbol,
            asset_class: entry.asset_class,
            buy_sell: 'Sell',
            entry_price: entry.price,
            exit_price: tx.price,
            stop_loss: null,
            size: Math.min(entry.size, tx.size),
            fees: (entry.fees || 0) + (tx.fees || 0),
            time_opened: entry.time,
            time_closed: tx.time,
            session: null,
            strategy_type: null,
            entry_timeframe: null,
            notes: null,
          };
          trades.push(trade);
        } else {
          // Open a new long position
          openBuyPositions.push(tx);
        }
      } else {
        // Sell transaction
        // Check if this closes a long position
        if (openBuyPositions.length > 0) {
          const entry = openBuyPositions.shift()!;
          // Long trade: Bought first (entry), then sold (exit)
          const trade: ParsedTrade = {
            trade_date: entry.trade_date,
            symbol: entry.symbol,
            asset_class: entry.asset_class,
            buy_sell: 'Buy',
            entry_price: entry.price,
            exit_price: tx.price,
            stop_loss: null,
            size: Math.min(entry.size, tx.size),
            fees: (entry.fees || 0) + (tx.fees || 0),
            time_opened: entry.time,
            time_closed: tx.time,
            session: null,
            strategy_type: null,
            entry_timeframe: null,
            notes: null,
          };
          trades.push(trade);
        } else {
          // Open a new short position
          openSellPositions.push(tx);
        }
      }
    }

    // Report unpaired transactions
    if (openBuyPositions.length > 0) {
      warnings.push(`${key.split('_')[0]}: ${openBuyPositions.length} unpaired buy transaction(s) - likely still open positions`);
    }
    if (openSellPositions.length > 0) {
      warnings.push(`${key.split('_')[0]}: ${openSellPositions.length} unpaired sell transaction(s) - likely short positions`);
    }
  }

  // Sort trades by date and time
  trades.sort((a, b) => {
    const dateCompare = a.trade_date.localeCompare(b.trade_date);
    if (dateCompare !== 0) return dateCompare;
    if (a.time_opened && b.time_opened) {
      return a.time_opened.localeCompare(b.time_opened);
    }
    return 0;
  });

  return trades;
}

function buildColumnMap(header: string[]): Record<string, number> {
  const map: Record<string, number> = {};
  
  // Columns that should NEVER be matched for price fields
  const timeRelatedPatterns = ['entry time', 'exec time', 'execution time', 'raw exec', 'fill time', 'trade time', 'time opened', 'time closed'];
  
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    map[field] = -1;
    
    // First pass: look for EXACT matches only
    for (const alias of aliases) {
      const idx = header.findIndex(h => h === alias);
      if (idx !== -1) {
        // For price fields, make sure we're not matching a time column
        if (field === 'entry_price' || field === 'exit_price') {
          const headerVal = header[idx];
          const isTimeColumn = timeRelatedPatterns.some(pattern => headerVal.includes(pattern));
          if (!isTimeColumn) {
            map[field] = idx;
            break;
          }
        } else {
          map[field] = idx;
          break;
        }
      }
    }
    
    // Second pass: if no exact match found, try partial matches (but be careful with price fields)
    if (map[field] === -1) {
      for (const alias of aliases) {
        const idx = header.findIndex(h => {
          // Skip generic 'time' alias for entry_price matching
          if ((field === 'entry_price' || field === 'exit_price') && alias === 'time') {
            return false;
          }
          
          // Check if header contains the alias
          if (!h.includes(alias)) return false;
          
          // For price fields, exclude time-related columns
          if (field === 'entry_price' || field === 'exit_price') {
            const isTimeColumn = timeRelatedPatterns.some(pattern => h.includes(pattern));
            if (isTimeColumn) return false;
          }
          
          return true;
        });
        
        if (idx !== -1) {
          map[field] = idx;
          break;
        }
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
  
  // Handle Side column with B/S (with trailing spaces)
  const trimmed = lower.replace(/\s+/g, '');
  if (trimmed === 'b') return 'Buy';
  if (trimmed === 's') return 'Sell';
  
  return null;
}

function normalizeAssetClass(value: string | null): string | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  
  if (lower.includes('forex') || lower.includes('fx') || lower.includes('currency')) return 'Forex';
  if (lower.includes('stock') || lower.includes('equity') || lower.includes('equities')) return 'Stocks';
  if (lower.includes('future') || lower.includes('futures')) return 'Futures';
  if (lower.includes('crypto') || lower.includes('cryptocurrency') || lower.includes('coin')) return 'Crypto';
  if (lower.includes('option')) return 'Stocks';
  
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
  
  return 'Brokerage Statement';
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

  // For long trades (Buy): profit = (exit - entry) * size
  // For short trades (Sell): profit = (entry - exit) * size
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

  const outcome = profit > 0.01 ? 'Win' : profit < -0.01 ? 'Loss' : 'Break Even';

  return {
    pips: parseFloat(pips.toFixed(4)),
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
