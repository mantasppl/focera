import { jsPDF } from "jspdf";
import { downloadBlob } from "@/lib/image";
import { toNumber } from "@/lib/utils";

export type PartyDetails = {
  name: string;
  email: string;
  address: string;
  phone: string;
  taxId: string;
};

export type InvoiceLineItem = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

export type InvoiceData = {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  company: PartyDetails;
  client: PartyDetails;
  lineItems: InvoiceLineItem[];
  vatEnabled: boolean;
  vatRate: string;
  notes: string;
};

export type InvoiceTotals = {
  subtotal: number;
  vatAmount: number;
  total: number;
};

export const INVOICE_STORAGE_KEY = "Focera-invoice-draft";

export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD ($)" },
  { value: "AUD", label: "AUD ($)" },
] as const;

const EMPTY_PARTY: PartyDetails = {
  name: "",
  email: "",
  address: "",
  phone: "",
  taxId: "",
};

export function createLineItem(): InvoiceLineItem {
  return {
    id: crypto.randomUUID(),
    description: "",
    quantity: "1",
    unitPrice: "0",
  };
}

export function createDefaultInvoice(): InvoiceData {
  const today = new Date();
  const due = new Date(today);
  due.setDate(due.getDate() + 30);

  return {
    invoiceNumber: `INV-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`,
    issueDate: formatDateInput(today),
    dueDate: formatDateInput(due),
    currency: "USD",
    company: { ...EMPTY_PARTY },
    client: { ...EMPTY_PARTY },
    lineItems: [createLineItem()],
    vatEnabled: true,
    vatRate: "20",
    notes: "Thank you for your business.",
  };
}

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return "—";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function lineItemAmount(item: InvoiceLineItem): number {
  return toNumber(item.quantity) * toNumber(item.unitPrice);
}

export function calculateInvoiceTotals(data: InvoiceData): InvoiceTotals {
  const subtotal = data.lineItems.reduce(
    (sum, item) => sum + lineItemAmount(item),
    0,
  );
  const vatAmount = data.vatEnabled
    ? subtotal * (toNumber(data.vatRate) / 100)
    : 0;

  return {
    subtotal,
    vatAmount,
    total: subtotal + vatAmount,
  };
}

export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function saveInvoiceDraft(data: InvoiceData): void {
  try {
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage may be unavailable or full.
  }
}

export function loadInvoiceDraft(): InvoiceData | null {
  try {
    const raw = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as InvoiceData;
  } catch {
    return null;
  }
}

export function clearInvoiceDraft(): void {
  try {
    localStorage.removeItem(INVOICE_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

function pdfCurrency(doc: jsPDF, amount: number, currency: string): string {
  return formatCurrency(amount, currency);
}

export function generateInvoicePdf(data: InvoiceData): Blob {
  const totals = calculateInvoiceTotals(data);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const ink = [11, 31, 28] as const;
  const accent = [15, 122, 102] as const;
  const muted = [90, 110, 105] as const;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...ink);
  doc.text("INVOICE", margin, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text(`#${data.invoiceNumber}`, pageWidth - margin, y - 2, { align: "right" });
  doc.text(`Issue date: ${formatDisplayDate(data.issueDate)}`, pageWidth - margin, y + 4, {
    align: "right",
  });
  doc.text(`Due date: ${formatDisplayDate(data.dueDate)}`, pageWidth - margin, y + 8, {
    align: "right",
  });

  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...accent);
  doc.text("FROM", margin, y);
  doc.text("BILL TO", pageWidth / 2 + 4, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...ink);
  doc.text(data.company.name || "Your company", margin, y);
  doc.text(data.client.name || "Client name", pageWidth / 2 + 4, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...muted);

  const companyLines = [
    data.company.email,
    data.company.phone,
    data.company.taxId ? `Tax ID: ${data.company.taxId}` : "",
    ...data.company.address.split("\n").filter(Boolean),
  ].filter(Boolean);

  const clientLines = [
    data.client.email,
    data.client.phone,
    data.client.taxId ? `Tax ID: ${data.client.taxId}` : "",
    ...data.client.address.split("\n").filter(Boolean),
  ].filter(Boolean);

  const maxLines = Math.max(companyLines.length, clientLines.length, 1);
  for (let i = 0; i < maxLines; i++) {
    if (companyLines[i]) doc.text(companyLines[i], margin, y);
    if (clientLines[i]) doc.text(clientLines[i], pageWidth / 2 + 4, y);
    y += 4.5;
  }

  y += 8;

  const colDesc = margin;
  const colQty = margin + contentWidth * 0.55;
  const colRate = margin + contentWidth * 0.7;
  const colAmount = margin + contentWidth;

  doc.setFillColor(244, 251, 248);
  doc.rect(margin, y - 4, contentWidth, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...accent);
  doc.text("Description", colDesc + 2, y);
  doc.text("Qty", colQty, y, { align: "right" });
  doc.text("Rate", colRate, y, { align: "right" });
  doc.text("Amount", colAmount, y, { align: "right" });
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...ink);

  for (const item of data.lineItems) {
    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    const amount = lineItemAmount(item);
    const descLines = doc.splitTextToSize(
      item.description || "Item",
      contentWidth * 0.5,
    ) as string[];

    doc.text(descLines, colDesc + 2, y);
    doc.text(String(toNumber(item.quantity)), colQty, y, { align: "right" });
    doc.text(
      pdfCurrency(doc, toNumber(item.unitPrice), data.currency),
      colRate,
      y,
      { align: "right" },
    );
    doc.text(pdfCurrency(doc, amount, data.currency), colAmount, y, {
      align: "right",
    });

    y += Math.max(descLines.length * 4.5, 6);
    doc.setDrawColor(230, 238, 235);
    doc.line(margin, y - 2, margin + contentWidth, y - 2);
  }

  y += 6;
  const totalsX = margin + contentWidth * 0.55;

  doc.setFontSize(9);
  doc.setTextColor(...muted);
  doc.text("Subtotal", totalsX, y);
  doc.setTextColor(...ink);
  doc.text(
    pdfCurrency(doc, totals.subtotal, data.currency),
    colAmount,
    y,
    { align: "right" },
  );
  y += 6;

  if (data.vatEnabled) {
    doc.setTextColor(...muted);
    doc.text(`VAT (${data.vatRate || "0"}%)`, totalsX, y);
    doc.setTextColor(...ink);
    doc.text(
      pdfCurrency(doc, totals.vatAmount, data.currency),
      colAmount,
      y,
      { align: "right" },
    );
    y += 6;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...accent);
  doc.text("Total", totalsX, y);
  doc.text(pdfCurrency(doc, totals.total, data.currency), colAmount, y, {
    align: "right",
  });
  y += 12;

  if (data.notes.trim()) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...accent);
    doc.text("NOTES", margin, y);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...muted);
    const noteLines = doc.splitTextToSize(data.notes, contentWidth) as string[];
    doc.text(noteLines, margin, y);
  }

  return doc.output("blob");
}

export function downloadInvoicePdf(data: InvoiceData): void {
  const blob = generateInvoicePdf(data);
  const safeNumber = data.invoiceNumber.replace(/[^\w-]+/g, "-") || "invoice";
  downloadBlob(blob, `${safeNumber}.pdf`);
}
