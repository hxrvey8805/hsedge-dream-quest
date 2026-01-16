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

  // Update data when it changes
  useEffect(() => {
    if (!seriesRef.current || !isReady || data.length === 0) return;

    // Transform data to the correct format
    const formattedData = data.map((candle) => ({
      time: candle.time as string,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    seriesRef.current.setData(formattedData);

    // Add trade price lines and markers
    if (trade && chartRef.current) {
      // Add entry line
      const entryLine = chartRef.current.addSeries(LineSeries, {
        color: "#22c55e",
        lineWidth: 2,
        lineStyle: LineStyle.Solid,
        title: `Entry: ${trade.entryPrice.toFixed(5)}`,
        crosshairMarkerVisible: false,
        lastValueVisible: true,
        priceLineVisible: false,
      });

      // Add exit line if exists
      if (trade.exitPrice) {
        const exitLine = chartRef.current.addSeries(LineSeries, {
          color: trade.isWin ? "#22c55e" : "#ef4444",
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          title: `Exit: ${trade.exitPrice.toFixed(5)}`,
          crosshairMarkerVisible: false,
          lastValueVisible: true,
          priceLineVisible: false,
        });

        const exitData = data.map(candle => ({
          time: candle.time as string,
          value: trade.exitPrice!,
        }));
        exitLine.setData(exitData);
      }

      // Add stop loss line
      if (trade.stopLoss) {
        const slLine = chartRef.current.addSeries(LineSeries, {
          color: "#ef4444",
          lineWidth: 1,
          lineStyle: LineStyle.Dashed,
          title: `SL: ${trade.stopLoss.toFixed(5)}`,
          crosshairMarkerVisible: false,
          lastValueVisible: true,
          priceLineVisible: false,
        });

        const slData = data.map(candle => ({
          time: candle.time as string,
          value: trade.stopLoss!,
        }));
        slLine.setData(slData);
      }

      // Set entry line data across entire visible range
      const entryData = data.map(candle => ({
        time: candle.time as string,
        value: trade.entryPrice,
      }));
      entryLine.setData(entryData);

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
