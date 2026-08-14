import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { getShopBySlug, placeOrder, type PetShopRead, type ShopOrder } from '@/api/petShops';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/store/toastStore';
import { PageHead } from '@/components/PageHead';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const EMPTY: CartItem[] = [];
const rupee = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const QR_SECONDS = 300;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const field =
  'w-full px-4 py-2.5 border border-warm-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400';

// Pay target for the whole order total (manual-confirm). UPI carries amount +
// order ref; else the Razorpay link; else null (shop takes payment on contact).
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

// Full-page cart + checkout for a shop, at /petshop/<slug>/cart. Responsive:
// a two-column layout on desktop (items + sticky summary) that stacks on mobile.
export function PetShopCart() {
  const { slug = '' } = useParams();
  const { user } = useAuth();
  const { data: shop, isLoading, isError } = useQuery({
    queryKey: ['pet-shop', slug],
    queryFn: () => getShopBySlug(slug),
    enabled: !!slug,
    retry: false,
  });

  const shopId = shop?.id ?? '';
  const items = useCartStore((s) => s.carts[shopId] ?? EMPTY);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);

  const [step, setStep] = useState<'cart' | 'checkout' | 'done'>('cart');
  const [placed, setPlaced] = useState<ShopOrder | null>(null);
  const [name, setName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState((user?.phone ?? '').replace(/\D/g, '').slice(-10));
  const [email, setEmail] = useState(user?.email ?? '');
  const [pincode, setPincode] = useState('');
  const [area, setArea] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [pinStatus, setPinStatus] = useState<'idle' | 'checking' | 'ok' | 'outside'>('idle');
  const [street, setStreet] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(QR_SECONDS);

  useEffect(() => {
    if (step !== 'done') return;
    const t = setInterval(() => setSecondsLeft((s) => (s <= 0 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);

  // Bengaluru-only delivery: a 560xxx pincode auto-fills the area (via India
  // Post's free pincode API). Non-560 pincodes are rejected. If the API is
  // unreachable we still accept the 560xxx pincode and let the area be typed.
  useEffect(() => {
    const pin = pincode.trim();
    setArea('');
    setAreas([]);
    if (pin.length < 6) { setPinStatus('idle'); return; }
    if (!/^560\d{3}$/.test(pin)) { setPinStatus('outside'); return; }
    setPinStatus('checking');
    let cancelled = false;
    fetch(`https://api.postalpincode.in/pincode/${pin}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const po = data?.[0]?.PostOffice;
        if (data?.[0]?.Status === 'Success' && Array.isArray(po) && po.length && po[0]?.State === 'Karnataka') {
          const list = Array.from(new Set(po.map((x: { Name: string }) => x.Name))) as string[];
          setAreas(list);
          setArea(list[0] ?? '');
          setPinStatus('ok');
        } else {
          setPinStatus('outside');
        }
      })
      .catch(() => { if (!cancelled) setPinStatus('ok'); });
    return () => { cancelled = true; };
  }, [pincode]);

  const total = Math.round(items.reduce((s, i) => s + i.unit_price * i.qty, 0) * 100) / 100;
  const count = items.reduce((s, i) => s + i.qty, 0);
  const pay = placed && shop ? payLinkForTotal(shop, placed.total, placed.id.slice(0, 8).toUpperCase()) : null;

  const submit = async () => {
    if (!name.trim()) { toast.error('Please enter your name.'); return; }
    if (!/^\d{10}$/.test(phone.trim())) { toast.error('Enter a valid 10-digit phone number.'); return; }
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) { toast.error('Enter a valid email, or leave it blank.'); return; }
    if (pinStatus === 'outside') { toast.error('Sorry, we currently deliver only within Bengaluru.'); return; }
    if (pinStatus !== 'ok' || !/^560\d{3}$/.test(pincode.trim())) { toast.error('Enter a valid Bengaluru pincode (560xxx).'); return; }
    if (!area.trim()) { toast.error('Please select or enter your area.'); return; }
    if (!street.trim()) { toast.error('Please enter your flat / house / street.'); return; }
    setBusy(true);
    try {
      const buyer_address = `${street.trim()}, ${area.trim()}, Bengaluru, Karnataka - ${pincode.trim()}`;
      const order = await placeOrder(shopId, {
        buyer_name: name.trim(),
        buyer_phone: `+91 ${phone.trim()}`,
        buyer_email: email.trim() || null,
        buyer_address,
        note: note.trim(),
        items: items.map((i) => ({ product_id: i.product_id, name: i.name, unit_price: i.unit_price, qty: i.qty })),
      });
      setPlaced(order);
      clear(shopId);
      setSecondsLeft(QR_SECONDS);
      setStep('done');
      window.scrollTo({ top: 0 });
    } catch (e) {
      toast.error((e as Error).message || 'Could not place the order.');
    } finally {
      setBusy(false);
    }
  };

  if (isLoading || !hasHydrated) {
    return <div className="min-h-[60vh] flex items-center justify-center bg-primary-50"><LoadingSpinner size="lg" /></div>;
  }
  if (isError || !shop) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 bg-primary-50">
        <div className="text-5xl mb-3">🏪</div>
        <h1 className="text-xl font-extrabold text-warm-900">Shop not found</h1>
        <Link to="/petshops" className="mt-5 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white">Browse pet shops</Link>
      </div>
    );
  }

  const shopHref = `/petshop/${shop.slug}`;

  return (
    <div className="min-h-screen bg-primary-50">
      <PageHead title={`Cart — ${shop.name}`} description={`Your cart at ${shop.name}.`} path={`/petshop/${shop.slug}/cart`} />

      {/* Top bar — back to the shop */}
      <header className="bg-white border-b border-warm-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link to={shopHref} className="inline-flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white border border-warm-200 grid place-items-center text-lg overflow-hidden shrink-0">
              {shop.logo_url ? <img src={shop.logo_url} alt="" className="w-full h-full object-cover" /> : '🏪'}
            </div>
            <span className="font-extrabold text-warm-900 truncate">{shop.name}</span>
          </Link>
          <Link to={shopHref} className="ml-auto text-sm font-bold text-primary-600 hover:text-primary-700 whitespace-nowrap">← Continue shopping</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Confirmation */}
        {step === 'done' && placed ? (
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-warm-200 shadow-sm p-6 sm:p-8 text-center">
            <div className="text-5xl mb-3">✅</div>
            <h1 className="text-xl font-extrabold text-warm-900">Order placed 🎉</h1>
            <p className="text-sm text-warm-500 mt-1">
              Order <span className="font-mono font-bold text-warm-700">#{placed.id.slice(0, 8).toUpperCase()}</span> · {rupee(placed.total)}
            </p>
            <p className="text-sm text-warm-600 mt-4">
              {pay ? 'Pay now to confirm — the shop will then deliver to your address.' : `${shop.name} will contact you to confirm payment and delivery.`}
            </p>

            {pay && pay.external === false && (
              <div className="mt-5 flex flex-col items-center gap-2.5">
                <div className="relative bg-white p-3 rounded-2xl border border-warm-200 shadow-sm">
                  <QRCodeSVG value={pay.href} size={190} level="M" className={secondsLeft === 0 ? 'opacity-10' : ''} />
                  {secondsLeft === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <span className="text-xs font-bold text-warm-500">QR expired</span>
                      <button type="button" onClick={() => setSecondsLeft(QR_SECONDS)} className="inline-flex items-center gap-1.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold px-4 py-2">↻ Refresh QR</button>
                    </div>
                  )}
                </div>
                <p className="text-sm font-bold text-warm-800">Scan to pay {rupee(placed.total)}</p>
                {secondsLeft > 0 ? (
                  <p className="text-xs text-warm-400 leading-relaxed">
                    Open any UPI app (GPay / PhonePe / Paytm) and scan — valid for <span className="font-bold text-warm-600 tabular-nums">{mmss(secondsLeft)}</span>.<br />
                    UPI ID: <span className="font-semibold text-warm-600">{shop.upi_id}</span>
                  </p>
                ) : (
                  <p className="text-xs text-warm-400">Tap <b>Refresh QR</b> to show a new code. UPI ID: {shop.upi_id}</p>
                )}
                <a href={pay.href} className="mt-1 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors w-full">Or tap to pay on this phone</a>
              </div>
            )}
            {pay && pay.external === true && (
              <a href={pay.href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-6 py-3 rounded-full transition-colors w-full">{pay.label}</a>
            )}

            <Link to={shopHref} className="mt-5 inline-block text-sm font-bold text-primary-600 hover:text-primary-700">← Back to {shop.name}</Link>
          </div>
        ) : items.length === 0 ? (
          /* Empty cart */
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-warm-200 p-10 text-center">
            <div className="text-5xl mb-3">🛒</div>
            <h1 className="text-xl font-extrabold text-warm-900">Your cart is empty</h1>
            <p className="text-sm text-warm-500 mt-1">Add some products to get started.</p>
            <Link to={shopHref} className="mt-5 inline-flex rounded-full bg-primary-600 px-6 py-3 text-sm font-bold text-white hover:bg-primary-700">Browse {shop.name}</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
            {/* Left — cart items or checkout form */}
            <section className="bg-white rounded-3xl border border-warm-200 shadow-sm p-5 sm:p-6">
              {step === 'cart' ? (
                <>
                  <h1 className="text-lg font-extrabold text-warm-900 mb-4">Your cart <span className="text-warm-400 font-bold text-sm">({count})</span></h1>
                  <ul className="divide-y divide-warm-100">
                    {items.map((i) => (
                      <li key={i.product_id} className="flex gap-3 items-center py-3 first:pt-0">
                        <div className="w-16 h-16 rounded-xl bg-warm-100 overflow-hidden shrink-0 grid place-items-center text-2xl">
                          {i.photo_url ? <img src={i.photo_url} alt="" className="w-full h-full object-cover" /> : '🛍️'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-warm-900 leading-snug">{i.name}</p>
                          <p className="text-sm font-extrabold text-warm-900 mt-0.5">{rupee(i.unit_price)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button type="button" onClick={() => setQty(shopId, i.product_id, i.qty - 1)} className="w-8 h-8 rounded-lg border border-warm-200 font-bold text-warm-600 hover:bg-warm-100">−</button>
                          <span className="w-6 text-center text-sm font-bold tabular-nums">{i.qty}</span>
                          <button type="button" onClick={() => setQty(shopId, i.product_id, i.qty + 1)} className="w-8 h-8 rounded-lg border border-warm-200 font-bold text-warm-600 hover:bg-warm-100">+</button>
                          <button type="button" onClick={() => remove(shopId, i.product_id)} aria-label="Remove" className="ml-1 text-warm-400 hover:text-red-600 w-7 h-7 grid place-items-center">✕</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => clear(shopId)} className="mt-4 text-sm font-semibold text-warm-400 hover:text-red-600">Clear cart</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setStep('cart')} className="text-sm font-semibold text-warm-500 hover:text-warm-700 mb-3">← Back to cart</button>
                  <h1 className="text-lg font-extrabold text-warm-900 mb-1">Delivery details</h1>
                  <p className="text-xs text-warm-500 mb-4">The shop delivers offline and will confirm your order. No account needed.</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-warm-700 mb-1">Your name</label>
                      <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-700 mb-1">Phone</label>
                      <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-700 mb-1">Delivery address</label>
                      <textarea rows={3} className={field} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Flat / street / area, Bengaluru" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-warm-700 mb-1">Note <span className="text-warm-400 font-normal">(optional)</span></label>
                      <input className={field} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Any delivery instructions" />
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Right — order summary (sticky on desktop) */}
            <aside className="bg-white rounded-3xl border border-warm-200 shadow-sm p-5 sm:p-6 lg:sticky lg:top-20">
              <h2 className="font-extrabold text-warm-900 mb-3">Order summary</h2>
              <div className="space-y-1.5 text-sm border-b border-warm-100 pb-3 mb-3">
                {items.map((i) => (
                  <div key={i.product_id} className="flex justify-between text-warm-600">
                    <span className="truncate pr-2">{i.name} × {i.qty}</span>
                    <span className="tabular-nums">{rupee(i.unit_price * i.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-extrabold text-warm-900 text-lg mb-4">
                <span>Total</span>
                <span className="tabular-nums">{rupee(total)}</span>
              </div>
              {step === 'cart' ? (
                <button type="button" onClick={() => { setStep('checkout'); window.scrollTo({ top: 0 }); }} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm py-3 rounded-full transition-colors">Proceed to checkout</button>
              ) : (
                <button type="button" disabled={busy} onClick={submit} className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white font-bold text-sm py-3 rounded-full transition-colors">{busy ? 'Placing…' : 'Place order'}</button>
              )}
              <p className="mt-2 text-center text-[11px] text-warm-400">Payment is direct to the shop. HiSpike isn&apos;t a party to the sale.</p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
