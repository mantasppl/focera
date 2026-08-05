"use client";

import { useEffect, useId, useState } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { useToolAnalytics } from "@/lib/analytics/client";
import InvoicePreview from "@/components/invoice/InvoicePreview";
import LineItemRow from "@/components/invoice/LineItemRow";
import PartyFields from "@/components/invoice/PartyFields";
import SectionHeading from "@/components/invoice/SectionHeading";
import {
  CURRENCY_OPTIONS,
  clearInvoiceDraft,
  createDefaultInvoice,
  createLineItem,
  downloadInvoicePdf,
  loadInvoiceDraft,
  saveInvoiceDraft,
  type InvoiceData,
  type InvoiceLineItem,
} from "@/lib/invoice";

export default function InvoiceGenerator() {
  const { trackSuccess, trackFailure } = useToolAnalytics();
  const invoiceNumberId = useId();
  const issueDateId = useId();
  const dueDateId = useId();
  const currencyId = useId();
  const vatRateId = useId();
  const notesId = useId();
  const vatToggleId = useId();

  const [data, setData] = useState<InvoiceData>(createDefaultInvoice);
  const [error, setError] = useState("");
  const [savedHint, setSavedHint] = useState(false);

  useEffect(() => {
    const draft = loadInvoiceDraft();
    if (draft) setData(draft);
  }, []);

  useEffect(() => {
    saveInvoiceDraft(data);
    setSavedHint(true);
    const timer = setTimeout(() => setSavedHint(false), 1200);
    return () => clearTimeout(timer);
  }, [data]);

  function updateLineItem(id: string, item: InvoiceLineItem) {
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((row) => (row.id === id ? item : row)),
    }));
  }

  function addLineItem() {
    setData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, createLineItem()],
    }));
  }

  function removeLineItem(id: string) {
    setData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((row) => row.id !== id),
    }));
  }

  function handleDownload() {
    if (!data.company.name.trim() && !data.client.name.trim()) {
      setError("Add at least a company or client name before downloading.");
      return;
    }

    setError("");
    try {
      downloadInvoicePdf(data);
      trackSuccess();
    } catch {
      trackFailure();
      setError("Could not generate the PDF. Try again.");
    }
  }

  function handleReset() {
    clearInvoiceDraft();
    setData(createDefaultInvoice());
    setError("");
  }

  return (
    <div className="invoice-tool">
      <div className="invoice-tool__form tool-panel">
        <SectionHeading
          title="Invoice details"
          description="Set invoice number, dates, and currency."
        />

        <div className="invoice-meta-grid">
          <Input
            id={invoiceNumberId}
            label="Invoice number"
            value={data.invoiceNumber}
            onChange={(e) =>
              setData((prev) => ({ ...prev, invoiceNumber: e.target.value }))
            }
            placeholder="INV-2026-001"
          />
          <Input
            id={issueDateId}
            label="Issue date"
            type="date"
            value={data.issueDate}
            onChange={(e) =>
              setData((prev) => ({ ...prev, issueDate: e.target.value }))
            }
          />
          <Input
            id={dueDateId}
            label="Due date"
            type="date"
            value={data.dueDate}
            onChange={(e) =>
              setData((prev) => ({ ...prev, dueDate: e.target.value }))
            }
          />
          <div className="ui-field">
            <label className="ui-label" htmlFor={currencyId}>
              Currency
            </label>
            <select
              id={currencyId}
              className="ui-input ui-input--select"
              value={data.currency}
              onChange={(e) =>
                setData((prev) => ({ ...prev, currency: e.target.value }))
              }
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <PartyFields
          label="Company details"
          value={data.company}
          onChange={(company) => setData((prev) => ({ ...prev, company }))}
        />

        <PartyFields
          label="Client details"
          value={data.client}
          onChange={(client) => setData((prev) => ({ ...prev, client }))}
        />

        <SectionHeading
          title="Products & services"
          description="Add as many line items as you need."
        />

        <div className="invoice-line-items">
          {data.lineItems.map((item, index) => (
            <LineItemRow
              key={item.id}
              item={item}
              index={index}
              currency={data.currency}
              canRemove={data.lineItems.length > 1}
              onChange={(next) => updateLineItem(item.id, next)}
              onRemove={() => removeLineItem(item.id)}
            />
          ))}
        </div>

        <Button variant="ghost" onClick={addLineItem}>
          + Add line item
        </Button>

        <SectionHeading title="Tax & notes" />

        <div className="invoice-vat-row">
          <label className="invoice-vat-toggle" htmlFor={vatToggleId}>
            <input
              id={vatToggleId}
              type="checkbox"
              checked={data.vatEnabled}
              onChange={(e) =>
                setData((prev) => ({ ...prev, vatEnabled: e.target.checked }))
              }
            />
            <span>Apply VAT / sales tax</span>
          </label>
          {data.vatEnabled ? (
            <Input
              id={vatRateId}
              label="VAT rate (%)"
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="any"
              value={data.vatRate}
              onChange={(e) =>
                setData((prev) => ({ ...prev, vatRate: e.target.value }))
              }
            />
          ) : null}
        </div>

        <Input
          id={notesId}
          as="textarea"
          label="Notes"
          value={data.notes}
          onChange={(e) =>
            setData((prev) => ({ ...prev, notes: e.target.value }))
          }
          placeholder="Payment terms, bank details, or a thank-you message"
        />

        <div className="tool-actions">
          <Button onClick={handleDownload}>Download PDF</Button>
          <Button variant="ghost" onClick={handleReset}>
            Reset form
          </Button>
        </div>

        {error ? (
          <p className="tool-error" role="alert">
            {error}
          </p>
        ) : null}

        <p className="tool-hint" aria-live="polite">
          {savedHint
            ? "Draft saved in your browser."
            : "Totals update automatically. Drafts stay local until you export."}
        </p>
      </div>

      <div className="invoice-tool__preview tool-panel tool-panel--preview">
        <SectionHeading
          title="Live preview"
          description="Matches your PDF export."
        />
        <InvoicePreview data={data} />
      </div>
    </div>
  );
}
