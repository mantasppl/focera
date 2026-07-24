"use client";

import { useId } from "react";
import Input from "@/components/Input";
import {
  formatCurrency,
  lineItemAmount,
  type InvoiceLineItem,
} from "@/lib/invoice";

type LineItemRowProps = {
  item: InvoiceLineItem;
  currency: string;
  onChange: (item: InvoiceLineItem) => void;
  onRemove: () => void;
  canRemove: boolean;
  index: number;
};

export default function LineItemRow({
  item,
  currency,
  onChange,
  onRemove,
  canRemove,
  index,
}: LineItemRowProps) {
  const baseId = useId();
  const amount = lineItemAmount(item);

  return (
    <div className="invoice-line-item">
      <div className="invoice-line-item__header">
        <span className="invoice-line-item__index">Item {index + 1}</span>
        {canRemove ? (
          <button
            type="button"
            className="invoice-line-item__remove"
            onClick={onRemove}
            aria-label={`Remove item ${index + 1}`}
          >
            Remove
          </button>
        ) : null}
      </div>
      <div className="invoice-line-item__grid">
        <Input
          id={`${baseId}-desc`}
          label="Description"
          className="invoice-line-item__desc"
          value={item.description}
          onChange={(e) =>
            onChange({ ...item, description: e.target.value })
          }
          placeholder="Product or service"
        />
        <Input
          id={`${baseId}-qty`}
          label="Qty"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={item.quantity}
          onChange={(e) => onChange({ ...item, quantity: e.target.value })}
        />
        <Input
          id={`${baseId}-price`}
          label="Unit price"
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={item.unitPrice}
          onChange={(e) => onChange({ ...item, unitPrice: e.target.value })}
        />
        <div className="invoice-line-item__amount" aria-live="polite">
          <span className="invoice-line-item__amount-label">Amount</span>
          <span className="invoice-line-item__amount-value">
            {formatCurrency(amount, currency)}
          </span>
        </div>
      </div>
    </div>
  );
}
