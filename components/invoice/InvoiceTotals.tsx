import {
  calculateInvoiceTotals,
  formatCurrency,
  type InvoiceData,
} from "@/lib/invoice";

type InvoiceTotalsProps = {
  data: InvoiceData;
  compact?: boolean;
};

export default function InvoiceTotals({ data, compact = false }: InvoiceTotalsProps) {
  const totals = calculateInvoiceTotals(data);

  return (
    <dl className={`invoice-totals${compact ? " invoice-totals--compact" : ""}`}>
      <div className="invoice-totals__row">
        <dt>Subtotal</dt>
        <dd>{formatCurrency(totals.subtotal, data.currency)}</dd>
      </div>
      {data.vatEnabled ? (
        <div className="invoice-totals__row">
          <dt>VAT ({data.vatRate || "0"}%)</dt>
          <dd>{formatCurrency(totals.vatAmount, data.currency)}</dd>
        </div>
      ) : null}
      <div className="invoice-totals__row invoice-totals__row--total">
        <dt>Total</dt>
        <dd>{formatCurrency(totals.total, data.currency)}</dd>
      </div>
    </dl>
  );
}
