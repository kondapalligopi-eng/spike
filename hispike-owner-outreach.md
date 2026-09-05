# HiSpike — Listing owner outreach (WhatsApp)

The WhatsApp counterpart to the "your listing is on HiSpike" email. Same
promise, a fifth of the words: on WhatsApp anything past the "read more" fold
doesn't get read, and anything that reads like a template gets reported.

Fill `{{Business}}` and `{{Link}}` per owner. Never send it unpersonalised —
the business name is the whole reason it doesn't look like a blast.

---

## Main message

Three lines. Fits above the fold on every phone.

```
Hi — Gopi here, I run HiSpike (hispike.in), a Bengaluru pet-care directory. *{{Business}}* is listed, free, nothing to sign up for:
{{Link}}

Anything wrong, or you'd rather not be listed? Just reply and I'll sort it today.
```

`*asterisks*` render as bold in WhatsApp. No emoji — the message works because
it's plain.

## If they reply

Then you have a real conversation and can use the full version.

```
Thanks for getting back. I built the listing from publicly available info — vets, dog parks, swim schools and grooming across Bengaluru, all in one place.

Send me whatever needs correcting (hours, phone, services, photos) and I'll update it today. There's no charge and no account needed.

— Gopi, Founder, HiSpike · support@hispike.in
```

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
| Vets         | `https://hispike.in/hospital?q=<Name>`  |
| Dog parks    | `https://hispike.in/park?q=<Name>`      |
| Swim schools | `https://hispike.in/swimming?q=<Name>`  |
| Grooming     | `https://hispike.in/grooming/<slug>`    |

`<Name>` must be URL-encoded — spaces become `%20`, as in
`https://hispike.in/swimming?q=Therpup%20Dog%20Swimming%20Pool`. Fastest way to
get a correct link: open the listing on the site and use its share button.

---

## Sending this to everyone, from a personal number

- **Broadcast lists will not work here.** WhatsApp delivers a broadcast only to
  recipients who already have your number saved in their contacts. Cold
  recipients don't, so a broadcast reaches almost none of them and you'd never
  know. These have to go as individual chats.
- **The real ban trigger is identical text at speed to strangers.** Spread them
  over days — roughly 20–30 a day from a personal number — and vary the
  business name (the template already forces that). Getting the number banned
  costs you the WhatsApp contact on the site too.
- **Warm up the number first** if it's new: a cold SIM sending fifty first-time
  messages on day one is the classic flagged pattern.
- **Business hours only.** A cold message at 9pm reads as spam whatever it says.
- **The takedown offer stays in.** It's the line that makes the message welcome
  rather than presumptuous — and it has to be honoured the same day.
- **Log who you messaged.** Nothing looks worse than the same owner getting the
  same opener twice from you.
