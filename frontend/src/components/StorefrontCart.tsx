import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/store/toastStore';
import { placeOrder, type PetShopRead, type ShopOrder } from '@/api/petShops';

const rupee = (n: number) => `₹${n.toLocaleString('en-IN')}`;

// Stable reference so the zustand selector doesn't return a new [] each render
// (which would loop "Maximum update depth exceeded").
const EMPTY: never[] = [];

// A pay target for the whole order total (manual-confirm). UPI carries the
// amount + an order reference in the note; else the Razorpay link; else null
// (shop takes payment on contact / delivery).
function payLinkForTotal(
  shop: Pick<PetShopRead, 'upi_id' | 'payment_url' | 'name'>,
  total: number,
  ref: string,
): { href: string; external: boolean; label: string } | null {
  if (shop.upi_id) {
    const params = new URLSearchParams({ pa: shop.upi_id, pn: shop.name, cu: 'INR', am: String(total), tn: `HiSpike order ${ref}` });
    return { href: `upi://pay?${params.toString()}`, external: false, label: `Pay ${rupee(total)} via UPI` };
  }
  if (shop.payment_url) return { href: shop.payment_url, external: true, label: 'Pay online' };
  return null;
}

function CartIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

export function StorefrontCart({ shop }: { shop: PetShopRead }) {
  const { user } = useAuth();
  const items = useCartStore((s) => s.carts[shop.id] ?? EMPTY);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const open = useCartStore((s) => s.open);
  const setOpen = useCartStore((s) => s.setOpen);

  const [step, setStep] = useState<'cart' | 'checkout' | 'done'>('cart');
  const [placed, setPlaced] = useState<ShopOrder | null>(null);
  const [name, setName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = Math.round(items.reduce((s, i) => s + i.unit_price * i.qty, 0) * 100) / 100;

  // Nothing to show until the persisted cart is read, and no floating button
  // when the cart is empty (and closed).
  if (!hasHydrated) return null;

  const close = () => { setOpen(false); setStep('cart'); };

  const submit = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      toast.error('Please add your name, phone and delivery address.');
      return;
    }
    setBusy(true);
    try {
      const order = await placeOrder(shop.id, {
        buyer_name: name.trim(),
        buyer_phone: phone.trim(),
        buyer_address: address.trim(),
        note: note.trim(),
        items: items.map((i) => ({ product_id: i.product_id, name: i.name, unit_price: i.unit_price, qty: i.qty })),
      });
      setPlaced(order);
      clear(shop.id);
      setStep('done');
    } catch (e) {
      toast.error((e as Error).message || 'Could not place the order.');
    } finally {
      setBusy(false);
    }
  };

  const pay = placed ? payLinkForTotal(shop, placed.total, placed.id.slice(0, 8).toUpperCase()) : null;

  return (
    <>
      {/* Floating cart button */}
      {count > 0 && !open && (
        <button
          type="button"
          onClick={() => { setStep('cart'); setOpen(true); }}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white font-bold pl-4 pr-5 py-3 shadow-xl transition-colors"
        >
          <span className="relative">
            <CartIcon />
            <span className="absolute -top-2 -right-2 bg-accent-400 text-warm-900 text-[10px] font-extrabold w-5 h-5 rounded-full grid place-items-center">{count}</span>
          </span>
          <span className="tabular-nums">{rupee(total)}</span>
        </button>
      )}

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Cart">
          <div className="absolute inset-0 bg-black/40" onClick={close} aria-hidden="true" />
          <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-warm-200">
              <h2 className="font-extrabold text-warm-900">
                {step === 'cart' && 'Your cart'}
                {step === 'checkout' && 'Checkout'}
                {step === 'done' && 'Order placed 🎉'}
              </h2>
              <button type="button" onClick={close} aria-label="Close" className="w-8 h-8 grid place-items-center rounded-full hover:bg-warm-100 text-warm-500 text-xl">✕</button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {step === 'cart' && (
                items.length === 0 ? (
                  <p className="text-center text-sm text-warm-500 py-10">Your cart is empty.</p>
                ) : (
                  <ul className="space-y-3">
                    {items.map((i) => (
                      <li key={i.product_id} className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-xl bg-warm-100 overflow-hidden shrink-0 grid place-items-center text-xl">
                          {i.photo_url ? <img src={i.photo_url} alt="" className="w-full h-full object-cover" /> : '🛍️'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-warm-900 leading-snug truncate">{i.name}</p>
                          <p className="text-sm font-extrabold text-warm-900">{rupee(i.unit_price)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button type="button" onClick={() => setQty(shop.id, i.product_id, i.qty - 1)} className="w-7 h-7 rounded-lg border border-warm-200 font-bold text-warm-600 hover:bg-warm-100">−</button>
                          <span className="w-6 text-center text-sm font-bold tabular-nums">{i.qty}</span>
                          <button type="button" onClick={() => setQty(shop.id, i.product_id, i.qty + 1)} className="w-7 h-7 rounded-lg border border-warm-200 font-bold text-warm-600 hover:bg-warm-100">+</button>
                          <button type="button" onClick={() => remove(shop.id, i.product_id)} aria-label="Remove" className="ml-1 text-warm-400 hover:text-red-600">✕</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}

              {step === 'checkout' && (
                <div className="space-y-3">
                  <p className="text-xs text-warm-500">The shop delivers offline and will confirm your order. No account needed.</p>
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1">Your name</label>
                    <input className="w-full px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1">Phone</label>
                    <input className="w-full px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1">Delivery address</label>
                    <textarea rows={3} className="w-full px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Flat / street / area, Bengaluru" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-warm-700 mb-1">Note <span className="text-warm-400 font-normal">(optional)</span></label>
                    <input className="w-full px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any delivery instructions" />
                  </div>
                  <div className="rounded-xl bg-warm-50 border border-warm-200 p-3 text-sm">
                    {items.map((i) => (
                      <div key={i.product_id} className="flex justify-between text-warm-600">
                        <span className="truncate pr-2">{i.name} × {i.qty}</span>
                        <span className="tabular-nums">{rupee(i.unit_price * i.qty)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 'done' && placed && (
                <div className="text-center py-4">
                  <div className="text-5xl mb-3">✅</div>
                  <p className="font-bold text-warm-900">Thanks, {placed.buyer_name.split(' ')[0]}!</p>
                  <p className="text-sm text-warm-500 mt-1">Order <span className="font-mono font-bold text-warm-700">#{placed.id.slice(0, 8).toUpperCase()}</span> · {rupee(placed.total)}</p>
                  <p className="text-sm text-warm-600 mt-4">
                    {pay
                      ? 'Pay now to confirm — the shop will then deliver to your address.'
                      : `${shop.name} will contact you to confirm payment and delivery.`}
                  </p>
                  {/* UPI — show a scannable QR (works on desktop & any phone),
                      plus a tap-to-pay link for when they're already on their
                      phone. */}
                  {pay && pay.external === false && (
                    <div className="mt-4 flex flex-col items-center gap-2.5">
                      <div className="bg-white p-3 rounded-2xl border border-warm-200 shadow-sm">
                        <QRCodeSVG value={pay.href} size={176} level="M" />
                      </div>
                      <p className="text-sm font-bold text-warm-800">Scan to pay {rupee(placed.total)}</p>
                      <p className="text-xs text-warm-400 leading-relaxed">
                        Open any UPI app (GPay / PhonePe / Paytm) and scan.<br />
                        UPI ID: <span className="font-semibold text-warm-600">{shop.upi_id}</span>
                      </p>
                      <a
                        href={pay.href}
                        className="mt-1 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors w-full"
                      >
                        Or tap to pay on this phone
                      </a>
                    </div>
                  )}
                  {pay && pay.external === true && (
                    <a
                      href={pay.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors w-full"
                    >
                      {pay.label}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Footer / actions */}
            {step !== 'done' && items.length > 0 && (
              <div className="border-t border-warm-200 px-5 py-4">
                <div className="flex justify-between font-extrabold text-warm-900 mb-3">
                  <span>Total</span>
                  <span className="tabular-nums">{rupee(total)}</span>
                </div>
                {step === 'cart' ? (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => clear(shop.id)} className="text-sm font-semibold text-warm-500 hover:text-warm-700 px-3">Clear</button>
                    <button type="button" onClick={() => setStep('checkout')} className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm py-3 rounded-full transition-colors">Proceed to checkout</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setStep('cart')} className="text-sm font-semibold text-warm-500 hover:text-warm-700 px-3">Back</button>
                    <button type="button" disabled={busy} onClick={submit} className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-full transition-colors">
                      {busy ? 'Placing…' : 'Place order'}
                    </button>
                  </div>
                )}
              </div>
            )}
            {step === 'done' && (
              <div className="border-t border-warm-200 px-5 py-4">
                <button type="button" onClick={close} className="w-full bg-warm-100 hover:bg-warm-200 text-warm-700 font-bold text-sm py-3 rounded-full transition-colors">Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
