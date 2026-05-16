interface AgmarknetRecord {
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

interface DataGovResponse {
  records?: Array<{
    state: string;
    district: string;
    market: string;
    commodity: string;
    variety?: string;
    grade?: string;
    arrival_date: string;
    min_price: string | number;
    max_price: string | number;
    modal_price: string | number;
    arrival_quantity?: string | number;
  }>;
  total?: number;
  offset?: number;
  limit?: number;
}

const parsePrice = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  const num = Number(String(value).replace(/[,\s]/g, ""));
  return Number.isFinite(num) ? num : 0;
};

const parseDate = (dateStr: string): string | null => {
  if (!dateStr) return null;
  if (dateStr.includes("/")) {
    const [d, m, y] = dateStr.split("/");
    if (!d || !m || !y) return null;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  const dt = new Date(dateStr);
  return isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
};

const normalizeMarketName = (market: string): string => {
  return String(market ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

export async function fetchHistoricalMandiData(params: {
  commodity: string;
  state?: string;
  district?: string;
  market?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<AgmarknetRecord[]> {
  try {
    const apiKey = import.meta.env.VITE_DATA_GOV_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      console.warn("Data.gov.in API key not configured");
      return [];
    }

    const filters = ["commodity=" + encodeURIComponent(params.commodity)];

    if (params.state) {
      filters.push("state=" + encodeURIComponent(params.state));
    }
    if (params.district) {
      filters.push("district=" + encodeURIComponent(params.district));
    }
    if (params.market) {
      filters.push("market=" + encodeURIComponent(params.market));
    }

    const filterString = filters.join(" AND ");
    const limit = params.limit ?? 100;
    const offset = params.offset ?? 0;

    const url = new URL("https://api.data.gov.in/resource/9ef84268-d588-465a-a5c0-3b641c4f61e6");
    url.searchParams.set("api-key", apiKey);
    url.searchParams.set("format", "json");
    url.searchParams.set("filters[commodity]", params.commodity);
    if (params.state) url.searchParams.set("filters[state]", params.state);
    if (params.district) url.searchParams.set("filters[district]", params.district);
    if (params.market) url.searchParams.set("filters[market]", params.market);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = (await response.json()) as DataGovResponse;
    const records = data.records ?? [];

    const cleaned: AgmarknetRecord[] = [];
    for (const record of records) {
      const date = parseDate(record.arrival_date);
      if (!date) continue;

      const modalPrice = parsePrice(record.modal_price);
      if (!modalPrice) continue;

      const market = String(record.market ?? "").trim();
      if (!market) continue;

      cleaned.push({
        date,
        commodity: String(record.commodity ?? "").trim(),
        market,
        state: String(record.state ?? "").trim(),
        district: String(record.district ?? "").trim(),
        min_price: parsePrice(record.min_price),
        max_price: parsePrice(record.max_price),
        modal_price: modalPrice,
        arrival_quantity: record.arrival_quantity ? parsePrice(record.arrival_quantity) : undefined,
      });
    }

    return cleaned;
  } catch (error) {
    console.error("Error fetching historical mandi data:", error);
    return [];
  }
}

export async function fetchMultipleMarketData(params: {
  commodity: string;
  markets: string[];
  state?: string;
  startDate?: string;
  endDate?: string;
}): Promise<AgmarknetRecord[]> {
  const allRecords: AgmarknetRecord[] = [];

  for (const market of params.markets) {
    const records = await fetchHistoricalMandiData({
      commodity: params.commodity,
      state: params.state,
      market,
      limit: 500,
    });
    allRecords.push(...records);
  }

  return allRecords;
}

export async function fetchCommodityTrend(params: {
  commodity: string;
  market: string;
  days?: number;
}): Promise<AgmarknetRecord[]> {
  const days = params.days ?? 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().slice(0, 10);

  return fetchHistoricalMandiData({
    commodity: params.commodity,
    market: params.market,
    startDate: startDateStr,
    limit: 500,
  });
}

export function aggregateByDate(
  records: AgmarknetRecord[]
): Record<string, { avg: number; min: number; max: number; count: number }> {
  const aggregated: Record<string, { avg: number; min: number; max: number; count: number }> = {};

  for (const record of records) {
    if (!aggregated[record.date]) {
      aggregated[record.date] = { avg: 0, min: Infinity, max: -Infinity, count: 0 };
    }

    const entry = aggregated[record.date];
    entry.avg += record.modal_price;
    entry.min = Math.min(entry.min, record.modal_price);
    entry.max = Math.max(entry.max, record.modal_price);
    entry.count += 1;
  }

  for (const date in aggregated) {
    const entry = aggregated[date];
    if (entry.count > 0) {
      entry.avg = entry.avg / entry.count;
    }
  }

  return aggregated;
}

export function filterByDateRange(
  records: AgmarknetRecord[],
  startDate: string,
  endDate: string
): AgmarknetRecord[] {
  return records.filter((r) => r.date >= startDate && r.date <= endDate);
}
