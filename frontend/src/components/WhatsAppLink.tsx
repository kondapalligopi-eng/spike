import { WHATSAPP_NUMBER, WHATSAPP_URL } from '@/lib/contact';

/**
 * The official WhatsApp mark — filled green bubble with a white handset.
 *
 * The two brand colours are hard-coded rather than inheriting currentColor:
 * WhatsApp's brand guidelines don't permit recolouring the logo, and an earlier
 * version of this drew it in the link's blue, which is both off-brand and far
 * less recognisable at 16px than the green everyone already knows.
 */
function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} shrink-0`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        fill="#25D366"
        d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 004.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0012.04 2z"
      />
      <path
        fill="#fff"
        d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.12-.27-.2-.57-.35z"
      />
    </svg>
  );
}

/**
 * The WhatsApp contact line, shown wherever the support email is offered.
 *
 * The number leads and the caveat supports it, rather than the other way round:
 * the number is what people act on, so it is the link text, and "no calls" is
 * the note about it. Two variants because the surrounding context differs —
 *
 *   block  — a standalone contact block (the footer). Number on one line, the
 *            full "WhatsApp only — no calls" caveat under it.
 *   inline — inside a flowing sentence, where the sentence already supplies
 *            "message us on WhatsApp at …", so all that is left to add is the
 *            number and a short "(no calls)".
 *
 * Both are inline-level elements: several call sites sit inside a <p>, and a
 * <div> in there would be invalid markup.
 */
export function WhatsAppLink({
  variant = 'inline',
  className = '',
}: {
  variant?: 'block' | 'inline';
  className?: string;
}) {
  if (variant === 'block') {
    return (
      <span className={`inline-flex flex-col items-start ${className}`}>
        <a
          href={WHATSAPP_URL}
          // Opens the WhatsApp app or web client, so it leaves the site.
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary-700 font-semibold hover:text-primary-800 hover:underline"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          {WHATSAPP_NUMBER}
        </a>
        {/* pl-6 lines the caveat up under the number rather than the icon
            (icon w-4 plus gap-2). */}
        <span className="pl-6 text-xs text-warm-500">WhatsApp only — no calls</span>
      </span>
    );
  }

  return (
    <>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {WHATSAPP_NUMBER}
      </a>{' '}
      {/* Outside the anchor, so the link announces as the number alone. */}
      <span className="whitespace-nowrap text-warm-500">(no calls)</span>
    </>
  );
}
