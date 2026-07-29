"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { CONTACT_EMAIL } from "@/lib/contact";

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success" }
  | { type: "error"; message: string };

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setStatus({
          type: "error",
          message:
            data?.error ||
            `Could not send your message. Email us at ${CONTACT_EMAIL}.`,
        });
        return;
      }

      setName("");
      setEmail("");
      setMessage("");
      setStatus({ type: "success" });
    } catch {
      setStatus({
        type: "error",
        message: `Network error. Please email us at ${CONTACT_EMAIL}.`,
      });
    }
  }

  return (
    <form className="contact-form" onSubmit={onSubmit} noValidate>
      <Input
        id="contact-name"
        label="Name"
        name="name"
        autoComplete="name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        disabled={status.type === "loading"}
      />
      <Input
        id="contact-email"
        label="Your email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={status.type === "loading"}
      />
      <Input
        as="textarea"
        id="contact-message"
        label="Message"
        name="message"
        required
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        disabled={status.type === "loading"}
      />

      {status.type === "success" ? (
        <p className="contact-form__success" role="status">
          Message sent. We&apos;ll get back to you at your email.
        </p>
      ) : null}

      {status.type === "error" ? (
        <p className="tool-error" role="alert">
          {status.message}
        </p>
      ) : null}

      <Button type="submit" disabled={status.type === "loading"}>
        {status.type === "loading" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
