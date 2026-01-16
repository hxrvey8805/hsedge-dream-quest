import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineStyle, CandlestickSeries, LineSeries } from "lightweight-charts";

interface TradeMarker {
  entryTime: string;
  entryPrice: number;
  exitTime?: string;
  exitPrice?: number;
  stopLoss?: number;
  isWin?: boolean;
  isBuy?: boolean;
}

interface CandlestickChartProps {
  data: CandlestickData[];
  trade?: TradeMarker;
  height?: number;
}

export const CandlestickChart = ({ data, trade, height = 400 }: CandlestickChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#a1a1aa",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.1)" },
        horzLines: { color: "rgba(255, 255, 255, 0.1)" },
      },
      width: chartContainerRef.current.clientWidth,
      height,
      crosshair: {
        vertLine: {
          labelBackgroundColor: "#3b82f6",
        },
        horzLine: {
          labelBackgroundColor: "#3b82f6",
        },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.2)",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.2)",
      },
    });

    chartRef.current = chart;

    // Add candlestick series using the new API
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);
    setIsReady(true);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [height]);

  // Helper to convert date string to Unix timestamp (seconds)
  const toUnixTimestamp = (timeStr: string | number): number => {
    if (typeof timeStr === 'number') return timeStr;
    // Handle various date formats: "2026-01-12 09:30:00", "2026-01-12T09:30:00", etc.
    const date = new Date(timeStr.replace(' ', 'T'));
    return Math.floor(date.getTime() / 1000);
  };

  // Update data when it changes
  useEffect(() => {
    if (!seriesRef.current || !isReady || data.length === 0) return;

    // Transform data to the correct format with Unix timestamps
    const formattedData = data.map((candle) => ({
      time: toUnixTimestamp(candle.time as string) as any,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(formattedData);

    // Calculate price range of the candlestick data
    const priceMin = Math.min(...data.map(c => c.low));
    const priceMax = Math.max(...data.map(c => c.high));
    const priceRange = priceMax - priceMin;

    // Helper to check if a price is within reasonable range of chart data
    const isPriceInRange = (price: number): boolean => {
      // Allow prices within 50% of the data range from min/max
      const buffer = priceRange * 0.5;
      return price >= priceMin - buffer && price <= priceMax + buffer;
    };

    // Add trade price lines and markers only if prices are compatible
    if (trade && chartRef.current) {
      const entryInRange = isPriceInRange(trade.entryPrice);
      const exitInRange = trade.exitPrice ? isPriceInRange(trade.exitPrice) : true;
      const slInRange = trade.stopLoss ? isPriceInRange(trade.stopLoss) : true;

      // Only add lines if at least the entry price is in range
      if (entryInRange) {
        // Add entry line
        const entryLine = chartRef.current.addSeries(LineSeries, {
          color: "#22c55e",
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          title: `Entry: ${trade.entryPrice.toFixed(2)}`,
          crosshairMarkerVisible: false,
          lastValueVisible: true,
          priceLineVisible: false,
        });

        const entryData = data.map(candle => ({
          time: toUnixTimestamp(candle.time as string) as any,
          value: trade.entryPrice,
        }));
        entryLine.setData(entryData);

        // Add exit line if exists and in range
        if (trade.exitPrice && exitInRange) {
          const exitLine = chartRef.current.addSeries(LineSeries, {
            color: trade.isWin ? "#22c55e" : "#ef4444",
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            title: `Exit: ${trade.exitPrice.toFixed(2)}`,
            crosshairMarkerVisible: false,
            lastValueVisible: true,
            priceLineVisible: false,
          });

          const exitData = data.map(candle => ({
            time: toUnixTimestamp(candle.time as string) as any,
            value: trade.exitPrice!,
          }));
          exitLine.setData(exitData);
        }

        // Add stop loss line if in range
        if (trade.stopLoss && slInRange) {
          const slLine = chartRef.current.addSeries(LineSeries, {
            color: "#ef4444",
            lineWidth: 1,
            lineStyle: LineStyle.Dashed,
            title: `SL: ${trade.stopLoss.toFixed(2)}`,
            crosshairMarkerVisible: false,
            lastValueVisible: true,
            priceLineVisible: false,
          });

          const slData = data.map(candle => ({
            time: toUnixTimestamp(candle.time as string) as any,
            value: trade.stopLoss!,
          }));
          slLine.setData(slData);
        }
      }

      // Fit content
      chartRef.current.timeScale().fitContent();
    } else if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [data, trade, isReady]);

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full rounded-lg overflow-hidden"
      style={{ height }}
    />
  );
};
