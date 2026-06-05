/**
 * Documented error strings from LOVABLE_SUPABASE_HANDOFF.md §13 and §4.4.
 * Translated to friendly toast/banner messages. Unknown errors pass through.
 */
const FRIENDLY: Record<string, string> = {
  no_tenant_context: "Your account isn't linked to a tenant. Ask an admin to grant access.",
  insufficient_privilege: "You need owner or manager access to perform this action.",
  not_found: "That record no longer exists or isn't in your tenant.",
  invalid_name: "Name can't be empty.",
  invalid_duration: "Duration must be greater than zero.",
  invalid_price: "Price must be zero or greater.",
  invalid_weekday: "Weekday must be 0 (Sun) through 6 (Sat).",
  invalid_hours: "Closing time must be after opening time.",
  invalid_slot_minutes: "Slot length must be greater than zero.",
  invalid_professional: "Selected professional isn't in your tenant.",
  invalid_input: "One or more fields are invalid.",
  invalid_time_range: "Closing time must be after opening time.",
};

export function toUserMessage(err: unknown): string {
  if (!err) return "Unknown error";
  const msg = err instanceof Error ? err.message : String(err);
  // Supabase RPC errors come through with the raise message verbatim.
  const code = msg.toLowerCase().trim();
  for (const key of Object.keys(FRIENDLY)) {
    if (code.includes(key)) return FRIENDLY[key];
  }
  return msg;
}
