/**
 * Backend error codes (migration 0023). Mapped to friendly UI copy.
 * Unknown codes pass through verbatim — never reinterpreted.
 */
const FRIENDLY: Record<string, string> = {
  // Tenant / auth
  no_tenant_context: "Your account isn't linked to a tenant. Ask an admin to grant access.",
  insufficient_privilege: "You need owner or manager access to perform this action.",
  not_found: "That record no longer exists or isn't in your tenant.",

  // Validation
  invalid_name: "Name can't be empty.",
  invalid_duration: "Duration must be greater than zero.",
  invalid_price: "Price must be zero or greater.",
  invalid_weekday: "Weekday must be 0 (Sun) through 6 (Sat).",
  invalid_hours: "Closing time must be after opening time.",
  invalid_slot_minutes: "Slot length must be greater than zero.",
  invalid_professional: "Selected professional isn't in your tenant.",
  invalid_service: "Selected service isn't in your tenant.",
  invalid_input: "One or more fields are invalid.",
  invalid_time_range: "Closing time must be after opening time.",

  // Booking creation / lifecycle
  slot_taken: "That time was just taken. Please pick another slot.",
  outside_hours: "That time is outside this professional's working hours.",
  slot_in_past: "You can't book a time in the past.",
  booking_not_active: "This booking is no longer active.",
  appointment_not_elapsed: "You can only do this once the appointment time has passed.",
  invalid_for_block: "This action isn't available for blocked time.",

  // Tenant settings
  invalid_timezone: "That timezone isn't recognized.",
  invalid_default_locale: "That locale isn't recognized.",
  invalid_cutoff_minutes: "Reschedule cutoff must be zero or greater.",
  invalid_late_cancel_fee_percent: "Late cancel fee must be between 0 and 100.",
  invalid_no_show_fee_percent: "No-show fee must be between 0 and 100.",

  // Public manage-by-token flow
  invalid_token: "This link is invalid or has expired.",
  self_cancel_disabled: "Self-service cancellation is disabled for this booking.",
  self_reschedule_disabled: "Self-service rescheduling is disabled for this booking.",
  reschedule_cutoff_passed: "The reschedule window for this booking has passed.",
  booking_in_past: "This booking has already occurred.",

  // Team / invites
  already_active: "This user is already active.",
  cannot_invite_self: "You can't invite yourself.",
  invalid_access_profile: "That role isn't valid.",
  cannot_disable_last_owner: "You can't disable the last owner of the workspace.",
  config_missing: "Team invites aren't configured for this workspace yet.",
};

export function toUserMessage(err: unknown): string {
  if (!err) return "Unknown error";
  const msg = err instanceof Error ? err.message : String(err);
  const code = msg.toLowerCase().trim();
  for (const key of Object.keys(FRIENDLY)) {
    if (code.includes(key)) return FRIENDLY[key];
  }
  return msg;
}
