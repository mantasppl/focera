import {
  formatCurrency,
  formatDisplayDate,
  lineItemAmount,
  type InvoiceData,
} from "@/lib/invoice";
import InvoiceTotals from "@/components/invoice/InvoiceTotals";

type InvoicePreviewProps = {
  data: InvoiceData;
};

export default function InvoicePreview({ data }: InvoicePreviewProps) {
  const hasContent =
    data.company.name ||
    data.client.name ||
    data.lineItems.some((item) => item.description.trim());

  return (
    <article className="invoice-preview" aria-label="Invoice preview">
      <header className="invoice-preview__header">
        <div>
          <p className="invoice-preview__badge">Invoice</p>
          <h2 className="invoice-preview__number">#{data.invoiceNumber}</h2>
        </div>
        <dl className="invoice-preview__dates">
          <div>
            <dt>Issue date</dt>
            <dd>{formatDisplayDate(data.issueDate)}</dd>
          </div>
          <div>
            <dt>Due date</dt>
            <dd>{formatDisplayDate(data.dueDate)}</dd>
          </div>
        </dl>
      </header>

      <div className="invoice-preview__parties">
        <section className="invoice-preview__party">
          <h3>From</h3>
          <p className="invoice-preview__party-name">
            {data.company.name || "Your company"}
          </p>
          {data.company.email ? <p>{data.company.email}</p> : null}
          {data.company.phone ? <p>{data.company.phone}</p> : null}
          {data.company.taxId ? <p>Tax ID: {data.company.taxId}</p> : null}
          {data.company.address ? (
            <p className="invoice-preview__address">{data.company.address}</p>
          ) : null}
        </section>

        <section className="invoice-preview__party">
          <h3>Bill to</h3>
          <p className="invoice-preview__party-name">
            {data.client.name || "Client name"}
          </p>
          {data.client.email ? <p>{data.client.email}</p> : null}
          {data.client.phone ? <p>{data.client.phone}</p> : null}
          {data.client.taxId ? <p>Tax ID: {data.client.taxId}</p> : null}
          {data.client.address ? (
            <p className="invoice-preview__address">{data.client.address}</p>
          ) : null}
        </section>
      </div>

      <div className="invoice-preview__table-wrap">
        <table className="invoice-preview__table">
          <thead>
            <tr>
              <th scope="col">Description</th>
              <th scope="col">Qty</th>
              <th scope="col">Rate</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((item) => (
              <tr key={item.id}>
                <td>{item.description || "—"}</td>
                <td>{item.quantity || "0"}</td>
                <td>
                  {formatCurrency(
                    Number.parseFloat(item.unitPrice) || 0,
                    data.currency,
                  )}
                </td>
                <td>{formatCurrency(lineItemAmount(item), data.currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="invoice-preview__footer">
        <InvoiceTotals data={data} />
      </div>

      {data.notes.trim() ? (
        <footer className="invoice-preview__notes">
          <h3>Notes</h3>
          <p>{data.notes}</p>
        </footer>
      ) : null}

      {!hasContent ? (
        <p className="invoice-preview__empty">
          Fill in your details to see a live preview
        </p>
      ) : null}
    </article>
  );
}
