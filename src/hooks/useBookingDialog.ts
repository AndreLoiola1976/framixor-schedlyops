import { createContext, useContext } from "react";

export interface BookingDialogState {
  open: boolean;
  setOpen: (next: boolean) => void;
}

export const BookingDialogContext = createContext<BookingDialogState | null>(null);

export function useBookingDialog(): BookingDialogState {
  const ctx = useContext(BookingDialogContext);
  if (!ctx) {
    return { open: false, setOpen: () => {} };
  }
  return ctx;
}
