"use client";

import { useId } from "react";
import Input from "@/components/Input";
import type { PartyDetails } from "@/lib/invoice";

type PartyFieldsProps = {
  label: string;
  value: PartyDetails;
  onChange: (value: PartyDetails) => void;
};

export default function PartyFields({
  label,
  value,
  onChange,
}: PartyFieldsProps) {
  const baseId = useId();

  function update(field: keyof PartyDetails, next: string) {
    onChange({ ...value, [field]: next });
  }

  return (
    <fieldset className="invoice-fieldset">
      <legend className="invoice-fieldset__legend">{label}</legend>
      <div className="invoice-fieldset__grid">
        <Input
          id={`${baseId}-name`}
          label="Name"
          value={value.name}
          onChange={(e) => update("name", e.target.value)}
          placeholder="Company or person"
        />
        <Input
          id={`${baseId}-email`}
          label="Email"
          type="email"
          value={value.email}
          onChange={(e) => update("email", e.target.value)}
          placeholder="billing@example.com"
          autoComplete="email"
        />
        <Input
          id={`${baseId}-phone`}
          label="Phone"
          type="tel"
          value={value.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="+1 555 0100"
          autoComplete="tel"
        />
        <Input
          id={`${baseId}-taxId`}
          label="Tax / VAT ID"
          value={value.taxId}
          onChange={(e) => update("taxId", e.target.value)}
          placeholder="Optional"
        />
        <Input
          id={`${baseId}-address`}
          as="textarea"
          label="Address"
          className="invoice-fieldset__full"
          value={value.address}
          onChange={(e) => update("address", e.target.value)}
          placeholder="Street, city, postal code, country"
        />
      </div>
    </fieldset>
  );
}
