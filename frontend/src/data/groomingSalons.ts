export type SalonReview = {
  stars: number;
  name: string;
  age: string;
  body: string;
  response?: { from: string; age: string; body: string };
};

export type SalonService = {
  title: string;
  desc: string;
  image: string;
  emoji: string;
};

export type GroomingSalonData = {
  slug: string;
  name: string;
  area: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  openTodayUntil: string;
  hours: { day: string; hours: string }[];
  mapLabel: string[];
  tint: string;
  heroEmoji: string;
  services: SalonService[];
  ratingDistribution: { stars: number; count: number }[];
  reviews: SalonReview[];
};

const DEFAULT_HOURS = [
  { day: 'Mon', hours: '8am – 8pm' },
  { day: 'Tue', hours: '8am – 8pm' },
  { day: 'Wed', hours: '8am – 8pm' },
  { day: 'Thu', hours: '8am – 8pm' },
  { day: 'Fri', hours: '8am – 8pm' },
  { day: 'Sat', hours: '8am – 9pm' },
  { day: 'Sun', hours: '9am – 6pm' },
];

const DEFAULT_SERVICES: SalonService[] = [
  {
    title: 'Bath & Full Groom',
    desc: 'Shampoo, blow-dry, brush-out, sanitary trim, nail trim, ear cleaning — for every coat type.',
    image: '/grooming-1.jpg',
    emoji: '🛁',
  },
  {
    title: 'Walk-in Touch-ups',
    desc: 'Nail grinding, paw-pad shave, de-shedding, teeth brushing — no appointment needed.',
    image: '/grooming-2.jpg',
    emoji: '💅',
  },
  {
    title: 'Breed-Specific Styling',
    desc: 'Academy-trained stylists for Shih Tzus, Poodles, Spitz, Goldens, and Indies.',
    image: '/grooming-3.jpg',
    emoji: '✂️',
  },
];

export const GROOMING_SALONS: GroomingSalonData[] = [
  {
    slug: 'indiranagar',
    name: 'HiSpike Grooming — Indiranagar',
    area: 'Indiranagar',
    city: 'Bengaluru',
    state: 'KA',
    address: '100 Feet Rd, HAL 2nd Stage, Indiranagar, Bengaluru 560038',
    phone: '+91 80 4123 1816',
    openTodayUntil: '8pm',
    hours: DEFAULT_HOURS,
    mapLabel: ['100 FEET', 'ROAD', 'HAL 2ND', 'STAGE'],
    tint: 'from-amber-200 to-amber-400',
    heroEmoji: '✂️',
    services: DEFAULT_SERVICES,
    ratingDistribution: [
      { stars: 5, count: 212 },
      { stars: 4, count: 15 },
      { stars: 3, count: 6 },
      { stars: 2, count: 1 },
      { stars: 1, count: 8 },
    ],
    reviews: [
      {
        stars: 5,
        name: 'Nikhil',
        age: '6 days ago',
        body: 'Appointment was easy to book online. Groomer handled my anxious Beagle patiently. Facility spotless.',
      },
      {
        stars: 4,
        name: 'Lucia',
        age: '11 days ago',
        body: 'My slot was rescheduled without notice, but Jeevitha at the desk was apologetic and fit us in the same evening.',
      },
      {
        stars: 1,
        name: 'Katyana',
        age: '6 days ago',
        body: 'Nails were clipped too short — my dog limped for two days. Sharing so others can ask for extra care.',
        response: {
          from: 'HiSpike Services',
          age: '3 days ago',
          body: 'Thank you for the feedback — we are reviewing the session with our stylist and reaching out directly. We take quick-clip incidents seriously.',
        },
      },
    ],
  },
  {
    slug: 'koramangala',
    name: 'HiSpike Grooming — Koramangala',
    area: 'Koramangala',
    city: 'Bengaluru',
    state: 'KA',
    address: '80 Feet Rd, 4th Block, Koramangala, Bengaluru 560034',
    phone: '+91 80 4567 2200',
    openTodayUntil: '8pm',
    hours: DEFAULT_HOURS,
    mapLabel: ['80 FEET', 'ROAD', 'KORAMANGALA', '4TH BLOCK'],
    tint: 'from-rose-200 to-rose-400',
    heroEmoji: '🛁',
    services: DEFAULT_SERVICES,
    ratingDistribution: [
      { stars: 5, count: 184 },
      { stars: 4, count: 22 },
      { stars: 3, count: 4 },
      { stars: 2, count: 2 },
      { stars: 1, count: 3 },
    ],
    reviews: [
      {
        stars: 5,
        name: 'Aarav',
        age: '2 days ago',
        body: 'Brought our Golden Retriever for a monsoon de-shed. Came out silky and smelling amazing.',
      },
      {
        stars: 5,
        name: 'Meera',
        age: '1 week ago',
        body: 'Loved the breed-specific cut for our Shih Tzu. Stylist asked all the right questions before starting.',
      },
      {
        stars: 3,
        name: 'Rohan',
        age: '2 weeks ago',
        body: 'Good groom, but the wait was longer than booked. Parking near 80 Feet Rd is rough.',
      },
    ],
  },
  {
    slug: 'hsr-layout',
    name: 'HiSpike Grooming — HSR Layout',
    area: 'HSR Layout',
    city: 'Bengaluru',
    state: 'KA',
    address: '27th Main, Sector 2, HSR Layout, Bengaluru 560102',
    phone: '+91 80 4321 9988',
    openTodayUntil: '8pm',
    hours: DEFAULT_HOURS,
    mapLabel: ['27TH', 'MAIN', 'SECTOR 2', 'HSR'],
    tint: 'from-emerald-200 to-emerald-500',
    heroEmoji: '💅',
    services: DEFAULT_SERVICES,
    ratingDistribution: [
      { stars: 5, count: 156 },
      { stars: 4, count: 18 },
      { stars: 3, count: 5 },
      { stars: 2, count: 1 },
      { stars: 1, count: 2 },
    ],
    reviews: [
      {
        stars: 5,
        name: 'Priya',
        age: '3 days ago',
        body: 'Walk-in nail trim in under 15 minutes. Our Indie is usually nervous but they used a gentle grinder.',
      },
      {
        stars: 4,
        name: 'Karthik',
        age: '1 week ago',
        body: 'Clean salon, fair pricing. Would appreciate more weekend slots — they book out 10 days ahead.',
      },
      {
        stars: 5,
        name: 'Sanjana',
        age: '2 weeks ago',
        body: 'Took our senior Lab for a medicated bath. They were thoughtful about his arthritis and went slow.',
      },
    ],
  },
  {
    slug: 'whitefield',
    name: 'HiSpike Grooming — Whitefield',
    area: 'Whitefield',
    city: 'Bengaluru',
    state: 'KA',
    address: 'ITPL Main Rd, near Phoenix Marketcity, Whitefield, Bengaluru 560066',
    phone: '+91 80 4900 7711',
    openTodayUntil: '8pm',
    hours: DEFAULT_HOURS,
    mapLabel: ['ITPL', 'MAIN', 'ROAD', 'WHITEFIELD'],
    tint: 'from-sky-200 to-sky-500',
    heroEmoji: '✂️',
    services: DEFAULT_SERVICES,
    ratingDistribution: [
      { stars: 5, count: 141 },
      { stars: 4, count: 12 },
      { stars: 3, count: 4 },
      { stars: 2, count: 2 },
      { stars: 1, count: 4 },
    ],
    reviews: [
      {
        stars: 5,
        name: 'Divya',
        age: '4 days ago',
        body: 'Super convenient for tech-park pet parents. Drop off before work, pick up on the way home.',
      },
      {
        stars: 4,
        name: 'Vikram',
        age: '1 week ago',
        body: 'Great stylist, but the AC was set a bit cold for my Pug. Mentioned it and they adjusted immediately.',
      },
      {
        stars: 5,
        name: 'Ananya',
        age: '3 weeks ago',
        body: 'Loved the photo they shared mid-groom. Nice touch and our Spitz looked adorable.',
      },
    ],
  },
];

export function getSalon(slug: string): GroomingSalonData | undefined {
  return GROOMING_SALONS.find((s) => s.slug === slug);
}
