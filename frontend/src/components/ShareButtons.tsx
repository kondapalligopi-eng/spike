import { useState } from 'react';
import { toast } from '@/store/toastStore';

const SITE_URL = 'https://hispike.in';

type ShareButtonsProps = {
  /** Listing name — used in the share message body. */
  name: string;
  /** Path or full URL. Paths are resolved against the production site. */
  url: string;
  /** Optional one-liner appended after the name in the WhatsApp message. */
  context?: string;
  /** Layout tweak — 'compact' is a small icon row, 'full' shows labels. */
  variant?: 'compact' | 'full';
};

// WhatsApp + Copy-link share buttons. India-first ordering: WhatsApp is the
// dominant share channel; copy-link is the universal fallback for everywhere
// else (Slack, email, SMS, X, LinkedIn). Pulled into a reusable component
// because it appears on every category's detail surface.
export function ShareButtons({ name, url, context, variant = 'full' }: ShareButtonsProps) {
  const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
  const message = context
    ? `Check out ${name} on HiSpike — ${context}\n${fullUrl}`
    : `Check out ${name} on HiSpike\n${fullUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(message)}`;

  const [copied, setCopied] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success('Link copied to clipboard.');
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error('Could not copy link.');
    }
  };

  const compact = variant === 'compact';
  const baseBtn = compact
    ? 'inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors'
    : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-colors';

  return (
    <div className="inline-flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Share ${name} on WhatsApp`}
        className={`${baseBtn} bg-[#25D366] hover:bg-[#1ebe5d] text-white shadow-sm`}
        title="Share on WhatsApp"
      >
        <svg aria-hidden="true" className={compact ? 'w-4 h-4' : 'w-3.5 h-3.5'} fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/>
        </svg>
        {!compact && <span>WhatsApp</span>}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy link to ${name}`}
        className={`${baseBtn} border-2 border-warm-300 bg-white text-warm-700 hover:border-primary-500 hover:text-primary-700`}
        title="Copy link"
      >
        {copied ? (
          <svg aria-hidden="true" className={compact ? 'w-4 h-4' : 'w-3.5 h-3.5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg aria-hidden="true" className={compact ? 'w-4 h-4' : 'w-3.5 h-3.5'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 015.656 5.656l-3 3a4 4 0 01-5.656-5.656m-3-3a4 4 0 015.656-5.656l3 3a4 4 0 010 5.656" />
          </svg>
        )}
        {!compact && <span>{copied ? 'Copied' : 'Copy link'}</span>}
      </button>
    </div>
  );
}
