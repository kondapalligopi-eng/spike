import { useEffect, useId, useMemo, useRef, useState } from 'react';

// A styled, accessible replacement for native <select> across HiSpike.
// - Rounded trigger with a leading icon + chevron
// - Optional search box (auto-on for long lists) so localities are quick to find
// - Highlighted current choice with a check, keyboard support, click-away close
//
// Kept dependency-free and client-only friendly (no portals) so it drops into
// the pre-rendered pages without hydration surprises.

export type SelectOption = { value: string; label: string; disabled?: boolean };

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  /** Search box in the panel. Defaults to on when there are more than 8 options. */
  searchable?: boolean;
  /** Icon shown in the trigger and beside each option. Defaults to a location pin. */
  icon?: React.ReactNode;
  /** Hide the per-option icon (keep the trigger icon). */
  hideOptionIcon?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  /** Extra classes for the trigger button (e.g. min-width). */
  buttonClassName?: string;
};

const PinIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 21s7-5.686 7-11a7 7 0 10-14 0c0 5.314 7 11 7 11z"
      fill="currentColor"
      opacity="0.15"
    />
    <path
      d="M12 21s7-5.686 7-11a7 7 0 10-14 0c0 5.314 7 11 7 11z"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <circle cx="12" cy="10" r="2.4" fill="currentColor" />
  </svg>
);

function normalize(opts: (string | SelectOption)[]): SelectOption[] {
  return opts.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
}

export function SelectMenu({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  searchable,
  icon,
  hideOptionIcon = false,
  ariaLabel,
  disabled = false,
  className = '',
  buttonClassName = '',
}: Props) {
  const items = useMemo(() => normalize(options), [options]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1); // keyboard-highlighted index
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const showSearch = searchable ?? items.length > 8;
  const selected = items.find((o) => o.value === value);
  const triggerIcon = icon ?? <PinIcon className="w-full h-full" />;

  const filtered = useMemo(() => {
    if (!showSearch || !query.trim()) return items;
    const q = query.trim().toLowerCase();
    return items.filter((o) => o.label.toLowerCase().includes(q));
  }, [items, query, showSearch]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // On open: focus the search (if any) and point the highlight at the current value.
  useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const idx = filtered.findIndex((o) => o.value === value);
    setActive(idx);
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const commit = (opt: SelectOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      let next = active;
      for (let i = 0; i < filtered.length; i++) {
        next = (next + dir + filtered.length) % filtered.length;
        if (!filtered[next]?.disabled) break;
      }
      setActive(next);
      const node = listRef.current?.children[next] as HTMLElement | undefined;
      node?.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const opt = filtered[active];
      if (opt) commit(opt);
    }
  };

  return (
    <div ref={rootRef} className={`relative ${className}`} onKeyDown={onKeyDown}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`flex w-full items-center gap-2.5 rounded-xl border-2 bg-white px-3 py-2.5 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          open ? 'border-primary-500' : 'border-warm-200 hover:border-warm-300'
        } ${buttonClassName}`}
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary-50 p-1.5 text-primary-600">
          {triggerIcon}
        </span>
        <span className={`flex-1 truncate text-sm ${selected ? 'font-semibold text-warm-900' : 'text-warm-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`h-4 w-4 shrink-0 text-warm-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full min-w-[15rem] rounded-2xl border border-warm-200 bg-white p-2 shadow-xl">
          {showSearch && (
            <div className="mb-1 flex items-center gap-2 rounded-xl border-2 border-warm-200 bg-warm-50 px-3 py-2 focus-within:border-primary-500">
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-warm-400" aria-hidden="true">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Search…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-warm-400"
              />
            </div>
          )}

          <ul ref={listRef} role="listbox" aria-label={ariaLabel} className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-3 py-3 text-center text-sm text-warm-400">No matches</li>
            ) : (
              filtered.map((opt, i) => {
                const isSelected = opt.value === value;
                const isActive = i === active;
                return (
                  <li
                    key={`${opt.value}-${i}`}
                    id={`${listId}-opt-${i}`}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => commit(opt)}
                    className={`relative flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm ${
                      opt.disabled ? 'cursor-not-allowed text-warm-300' : ''
                    } ${
                      isSelected
                        ? 'bg-primary-50 font-semibold text-primary-900'
                        : isActive
                          ? 'bg-warm-50 text-warm-800'
                          : 'text-warm-700'
                    }`}
                  >
                    {isSelected && <span className="absolute inset-y-1.5 left-0 w-1 rounded-full bg-primary-500" />}
                    {!hideOptionIcon && (
                      <span
                        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full p-1 ${
                          isSelected ? 'bg-primary-100 text-primary-600' : 'bg-warm-100 text-warm-400'
                        }`}
                      >
                        {triggerIcon}
                      </span>
                    )}
                    <span className="flex-1 truncate">{opt.label}</span>
                    {isSelected && (
                      <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-primary-600" aria-hidden="true">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
