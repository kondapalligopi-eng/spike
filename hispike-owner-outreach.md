# HiSpike — Listing owner outreach (WhatsApp)

The WhatsApp counterpart to the "your listing is on HiSpike" email. Fill
`{{Business}}` and `{{Link}}` per owner. Never send it unpersonalised — the
business name is the whole reason it doesn't read as a blast.

The admin dashboard (Outreach → Listing links) builds each link and opens
WhatsApp with this message already typed. If you edit the wording here, edit
`outreachMessage()` in `frontend/src/pages/Admin.tsx` to match.

---

## Main message

```
Hi — I'm Gopi from HiSpike (https://www.hispike.in), a Bengaluru pet-care directory: vets, dog parks, swim schools and grooming in one place.

I've added {{Business}} using publicly available info. Have a look:
{{Link}}

Free listing, no registration. Corrections and removal requests are both handled the same day — just reply.

— Gopi, Founder, HiSpike
```

Why it's this long rather than a three-liner: the link preview WhatsApp
renders under the message does half the explaining, and the paragraph breaks
make it scannable even at this length. No emoji — it works because it's plain.

## Follow-up (once, ~5 days later)

Never chase twice. One nudge, then leave it.

```
Hi, just checking you saw this — {{Business}} on HiSpike:
{{Link}}

No action needed. Reply only if something needs correcting or you'd like it taken down.
```

---

## Link per category

The three directory pages have no per-listing page, so the link carries the
listing name as `?q=` and the page filters down to it. Grooming has a real
detail page and uses its slug.

| Category     | Link                                    |
|--------------|-----------------------------------------|
| Vets         | `https://www.hispike.in/hospital?q=<Name>`  |
| Dog parks    | `https://www.hispike.in/park?q=<Name>`      |
| Swim schools | `https://www.hispike.in/swimming?q=<Name>`  |
| Grooming     | `https://www.hispike.in/grooming/<slug>`    |

`<Name>` must be URL-encoded — spaces become `%20`, as in
`https://www.hispike.in/swimming?q=Therpup%20Dog%20Swimming%20Pool`. Don't build
these by hand: the admin's Listing links section has the correct one for every
listing, with a copy button.

---

## Sending this to everyone, from a personal number

- **Broadcast lists will not work here.** WhatsApp delivers a broadcast only to
  recipients who already have your number saved in their contacts. Cold
  recipients don't, so a broadcast reaches almost none of them and you'd never
  know. These have to go as individual chats.
- **The real ban trigger is identical text at speed to strangers.** Spread them
  over days — roughly 20–30 a day from a personal number. Losing the number
  also costs you the WhatsApp contact on the site.
- **Warm up the number first** if it's new: a cold SIM sending fifty first-time
  messages on day one is the classic flagged pattern.
- **Business hours only.** A cold message at 9pm reads as spam whatever it says.
- **Skip the landlines.** The admin shows a WhatsApp button on any ten-digit
  number, because an Indian mobile and a Bengaluru 080 landline are the same
  shape — the judgement call is yours.
- **The removal offer stays in.** It's the line that makes an unsolicited "I
  listed your business" welcome rather than presumptuous — and it has to be
  honoured the same day.
- **Log who you messaged.** Nothing looks worse than the same owner getting the
  same opener twice from you.
