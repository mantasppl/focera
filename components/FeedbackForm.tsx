"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { CONTACT_EMAIL } from "@/lib/contact";

type Status =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success" }
  | { type: "error"; message: string };

function FeedbackFormFields() {
  const searchParams = useSearchParams();
  const toolParam = searchParams.get("tool");
  const toolSlug =
    toolParam && /^[a-z0-9-]{1,80}$/.test(toolParam) ? toolParam : null;

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ type: "loading" });

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          message,
          toolSlug: toolSlug || undefined,
        }),
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
      {toolSlug ? (
        <p className="ui-hint">
          Tagged for tool: <strong>{toolSlug}</strong>
        </p>
      ) : null}
      <Input
        id="feedback-email"
        label="Email (optional)"
        name="email"
        type="email"
        autoComplete="email"
        hint="Include an email if you want a reply."
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        disabled={status.type === "loading"}
      />
      <Input
        as="textarea"
        id="feedback-message"
        label="Message"
        name="message"
        required
        hint="Describe the bug, improvement, or feature idea."
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        disabled={status.type === "loading"}
      />

      {status.type === "success" ? (
        <p className="contact-form__success" role="status">
          Thanks — your feedback was sent. We read every message.
        </p>
      ) : null}

      {status.type === "error" ? (
        <p className="tool-error" role="alert">
          {status.message}
        </p>
      ) : null}

      <Button type="submit" disabled={status.type === "loading"}>
        {status.type === "loading" ? "Sending…" : "Send feedback"}
      </Button>
    </form>
  );
}

export default function FeedbackForm() {
  return (
    <Suspense fallback={<div className="contact-form" aria-hidden="true" />}>
      <FeedbackFormFields />
    </Suspense>
  );
}
