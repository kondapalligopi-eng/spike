// Trust strip for the Pet Supplies shop: "Secure Payments" + "24×7 Support"
// reassurance pills on the left, accepted-method logos on the right.
//
// SOFT-LAUNCH WIRING (Razorpay Payment Link / Payment Page, no backend):
// pass `payLink` (a Razorpay hosted link, e.g. https://pages.razorpay.com/xxx
// or https://rzp.io/l/xxx). When set, a "Pay Securely" button opens it in a new
// tab — the customer pays via UPI / cards / RuPay / Net Banking on Razorpay's
// hosted page and the money settles to your bank account. When it's not set
// (env var blank), the strip stays purely informational and shows a small
// "online payments launching soon" note instead of a dead button.
//
// Logos are inline SVG/styled text — no image assets, no third-party requests,
// and they survive corporate proxies that block external logo CDNs.

function Visa() {
  return (
    <span className="px-2 py-1 rounded bg-white border border-warm-200 text-[13px] font-extrabold italic tracking-tight text-[#1434CB] leading-none">
      VISA
    </span>
  );
}

function Mastercard() {
  return (
    <span className="px-2 py-1 rounded bg-white border border-warm-200 flex items-center leading-none" aria-label="Mastercard">
      <svg viewBox="0 0 36 22" className="h-[18px] w-auto" role="img">
        <circle cx="14" cy="11" r="8" fill="#EB001B" />
        <circle cx="22" cy="11" r="8" fill="#F79E1B" />
        <path d="M18 5a8 8 0 0 0 0 12 8 8 0 0 0 0-12z" fill="#FF5F00" />
      </svg>
    </span>
  );
}

function Upi() {
  return (
    <span className="px-2 py-1 rounded bg-white border border-warm-200 flex items-center gap-1 leading-none" aria-label="UPI">
      <svg viewBox="0 0 8 16" className="h-[15px] w-auto" role="img">
        <path d="M1 0l3 8-3 8z" fill="#F47216" />
        <path d="M4 0l3 8-3 8z" fill="#0F9D58" />
      </svg>
      <span className="text-[12px] font-extrabold text-[#1A237E]">UPI</span>
    </span>
  );
}

function RuPay() {
  return (
    <span className="px-2 py-1 rounded bg-white border border-warm-200 text-[13px] font-extrabold leading-none">
      <span className="text-[#1A237E] italic">Ru</span>
      <span className="text-[#0F9D58] italic">Pay</span>
    </span>
  );
}

function NetBanking() {
  return (
    <span className="px-2 py-1 rounded bg-white border border-warm-200 flex items-center gap-1.5 text-[12px] font-bold text-[#1A237E] leading-none" aria-label="Net Banking">
      <svg viewBox="0 0 24 24" className="h-[15px] w-auto" fill="none" stroke="#1A237E" strokeWidth={2} role="img">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 10v11M19 10v11M9 10v11M15 10v11M12 3L3 8h18l-9-5z" />
      </svg>
      Net Banking
    </span>
  );
}

export function PaymentBadges({ payLink }: { payLink?: string }) {
  const link = payLink?.trim();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-warm-200 bg-warm-50/60 px-4 py-3">
      {/* Reassurance pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-warm-200 bg-white px-3 py-1.5 text-xs font-semibold text-warm-700">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure Payments
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-warm-200 bg-white px-3 py-1.5 text-xs font-semibold text-warm-700">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636A9 9 0 005.636 18.364M12 3v3m0 12v3m9-9h-3M6 12H3m2.05-4.95l2.122 2.122m9.656 9.656l2.122 2.122M7.05 16.95l-2.122 2.122M16.95 7.05l2.122-2.122" />
          </svg>
          24×7 Support
        </span>
      </div>

      {/* Accepted methods + optional Pay CTA */}
      <div className="flex flex-wrap items-center gap-2">
        <Visa />
        <Mastercard />
        <Upi />
        <RuPay />
        <NetBanking />
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-primary-700 transition-colors"
          >
            Pay Securely
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        ) : (
          <span className="ml-1 text-[11px] text-warm-500 italic">Online payments launching soon</span>
        )}
      </div>
    </div>
  );
}
