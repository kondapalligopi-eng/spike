// Full-viewport overlay shown during sign-in / sign-out so the user gets
// unambiguous feedback that something is happening between the click and
// the next page render. Sits above the navbar (z-60) and uses a soft
// blurred backdrop so the page underneath stays recognisable.

type AuthTransitionOverlayProps = {
  message: string;
};

export function AuthTransitionOverlay({ message }: AuthTransitionOverlayProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[60] bg-white/85 backdrop-blur-sm flex items-center justify-center"
    >
      <div className="flex flex-col items-center gap-4 px-6 py-8 rounded-2xl bg-white shadow-xl border border-warm-200">
        <div
          className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"
          aria-hidden="true"
        />
        <p className="text-warm-800 text-sm font-semibold tracking-wide">{message}</p>
      </div>
    </div>
  );
}
