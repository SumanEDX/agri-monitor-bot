import { supabase } from "@/integrations/supabase/client";

export interface HistoricalMandiData {
  date: string;
  commodity: string;
  market: string;
  state: string;
  district: string;
  min_price: number;
  max_price: number;
  modal_price: number;
  arrival_quantity?: number;
}

export async function queryHistoricalData(params: {
  commodity?: string;
  market?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<HistoricalMandiData[]> {
  try {
    let query = supabase
      .from("mandi_price_history")
      .select("*");

    if (params.commodity) {
      query = query.eq("commodity", params.commodity);
    }

    if (params.market) {
      query = query.eq("market", params.market);
    }

    if (params.startDate) {
      query = query.gte("date", params.startDate);
    }

    if (params.endDate) {
      query = query.lte("date", params.endDate);
    }

    query = query.order("date", { ascending: false });

    if (params.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error querying historical data:", error);
      return [];
    }

    return data as HistoricalMandiData[];
  } catch (error) {
    console.error("Error in queryHistoricalData:", error);
    return [];
  }
}

export async function fetchHistoricalDataFromAPI(params: {
  commodity: string;
  market?: string;
  action?: "fetch" | "store";
}): Promise<HistoricalMandiData[]> {
  try {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agmarknet-historical`;

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        action: params.action || "fetch",
        commodity: params.commodity,
        market: params.market,
      }),
    });

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data.records || [];
  } catch (error) {
    console.error("Error fetching from API:", error);
    return [];
  }
}

export async function getTrendData(params: {
  commodity: string;
  market: string;
  days?: number;
}): Promise<{ date: string; modal: number }[]> {
  const days = params.days || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().slice(0, 10);

  const records = await queryHistoricalData({
    commodity: params.commodity,
    market: params.market,
    startDate: startDateStr,
    limit: 1000,
  });

  const byDate = new Map<string, number[]>();
  for (const record of records) {
    if (!byDate.has(record.date)) {
      byDate.set(record.date, []);
    }
    byDate.get(record.date)!.push(record.modal_price);
  }

  return Array.from(byDate.entries())
    .map(([date, prices]) => ({
      date,
      modal: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getLatestPriceByMarket(
  commodity: string,
  market: string
): Promise<HistoricalMandiData | null> {
  const records = await queryHistoricalData({
    commodity,
    market,
    limit: 1,
  });

  return records.length > 0 ? records[0] : null;
}

export async function getMarketComparison(
  commodity: string,
  markets: string[]
): Promise<Record<string, HistoricalMandiData | null>> {
  const result: Record<string, HistoricalMandiData | null> = {};

  for (const market of markets) {
    result[market] = await getLatestPriceByMarket(commodity, market);
  }

  return result;
}
