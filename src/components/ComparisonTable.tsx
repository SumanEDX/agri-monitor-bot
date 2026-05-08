import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ALLOWED_APMCS } from "@/utils/marketNormalizer";
import type { CleanRecord } from "@/utils/dataCleaner";

const fmtINR = (n: number) =>
  isNaN(n) ? "—" : `₹${Math.round(n).toLocaleString("en-IN")}`;

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

interface Props {
  records: CleanRecord[];
  latestDate: string;
}

export default function ComparisonTable({ records, latestDate }: Props) {
  const byMarket = new Map<string, CleanRecord>();
  for (const r of records) byMarket.set(r.market, r);

  const rows = ALLOWED_APMCS.map((apmc) => ({
    apmc,
    record: byMarket.get(apmc) ?? null,
  }));

  rows.sort((a, b) => {
    if (!a.record && !b.record) return 0;
    if (!a.record) return 1;
    if (!b.record) return -1;
    return b.record.modalPrice - a.record.modalPrice;
  });

  const withData = rows.filter((r) => r.record);
  const highest = withData[0]?.record ?? null;
  const lowest = withData[withData.length - 1]?.record ?? null;

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30">
        <h3 className="font-semibold text-foreground">APMC Comparison</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Latest available data — {latestDate ? new Date(latestDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
        </p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>APMC Name</TableHead>
            <TableHead className="text-right">Min Price (₹)</TableHead>
            <TableHead className="text-right">Modal Price (₹)</TableHead>
            <TableHead className="text-right">Max Price (₹)</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ apmc, record }) => {
            const isHigh = highest && record && record.market === highest.market;
            const isLow = lowest && record && record.market === lowest.market && lowest !== highest;
            const cls = isHigh
              ? "bg-success/15 hover:bg-success/20"
              : isLow
                ? "bg-destructive/10 hover:bg-destructive/15"
                : "";
            return (
              <TableRow key={apmc} className={cls}>
                <TableCell className="font-medium">{apmc}</TableCell>
                {record ? (
                  <>
                    <TableCell className="text-right tabular-nums">{fmtINR(record.minPrice)}</TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">{fmtINR(record.modalPrice)}</TableCell>
                    <TableCell className="text-right tabular-nums">{fmtINR(record.maxPrice)}</TableCell>
                    <TableCell>{fmtDate(record.date)}</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="text-right text-muted-foreground italic">No data</TableCell>
                    <TableCell className="text-right text-muted-foreground italic">No data</TableCell>
                    <TableCell className="text-right text-muted-foreground italic">No data</TableCell>
                    <TableCell className="text-muted-foreground italic">—</TableCell>
                  </>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}