type LoginAuditEvent = {
  type: "admin_login_success" | "admin_login_failure";
  usernameAttempt: string;
  ip: string;
  timestamp: string;
  reason?: string;
};

/** Structured audit log — never includes passwords or hashes. */
export function logAdminLogin(event: Omit<LoginAuditEvent, "timestamp">): void {
  const payload: LoginAuditEvent = {
    ...event,
    timestamp: new Date().toISOString(),
    usernameAttempt: event.usernameAttempt.slice(0, 80),
    ip: event.ip.slice(0, 64),
  };
  // Use a single-line JSON log for log aggregators.
  console.info(`[admin-audit] ${JSON.stringify(payload)}`);
}
