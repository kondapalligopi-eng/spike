import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { FaqItem } from '@/components/FaqSchema';

export type BlogSection = { heading: string; body: ReactNode };

export type BlogPost = {
  slug: string;
  title: string; // <title> / og:title
  h1: string; // on-page heading
  description: string; // meta description (~150–160 chars)
  category: string;
  emoji: string;
  date: string; // ISO published date
  readMins: number;
  intro: ReactNode;
  sections: BlogSection[];
  faqs: FaqItem[];
  cta: { label: string; to: string; blurb: string };
};

// A directory link used throughout the articles.
const Dir = ({ to, children }: { to: string; children: ReactNode }) => (
  <Link to={to}>{children}</Link>
);

const AREAS = 'Indiranagar, Koramangala, HSR Layout, Whitefield, Jayanagar, Bellandur and Marathahalli';

export const BLOG_POSTS: BlogPost[] = [
  // 1) VET HOSPITALS ---------------------------------------------------------
  {
    slug: 'top-veterinary-hospitals-bengaluru',
    title: 'Top Veterinary Hospitals in Bengaluru (2026): How to Find a Trusted Vet',
    h1: 'Top Veterinary Hospitals in Bengaluru: Finding a Vet You Can Trust',
    description:
      'How to choose a trusted vet or 24×7 emergency pet hospital in Bengaluru — what to look for, the best neighbourhoods, questions to ask, and a verified directory.',
    category: 'Vet Care',
    emoji: '🩺',
    date: '2026-07-10',
    readMins: 6,
    intro: (
      <p>
        Finding the right vet is the single most important decision a dog parent in Bengaluru makes.
        A good veterinary hospital means faster diagnoses, calmer visits and real peace of mind at 2am
        when something's wrong. This guide covers what actually separates a great clinic from an average
        one, which neighbourhoods have strong options, and how to shortlist a vet you can rely on — plus
        a <Dir to="/hospital">verified directory of vets across Bengaluru</Dir> to start from.
      </p>
    ),
    sections: [
      {
        heading: 'What makes a good veterinary hospital?',
        body: (
          <>
            <p>Look past the waiting-room decor. The things that genuinely matter are:</p>
            <ul>
              <li><strong>Qualified, registered vets</strong> — check for a BVSc/MVSc and years of small-animal practice.</li>
              <li><strong>In-house diagnostics</strong> — an X-ray, ultrasound and lab on-site means answers in one visit, not three.</li>
              <li><strong>Clean, calm handling</strong> — how the staff hold and speak to a frightened dog tells you a lot.</li>
              <li><strong>Transparent pricing</strong> — a clinic that explains costs upfront rarely surprises you later.</li>
              <li><strong>Continuity</strong> — seeing the same vet each visit means they actually know your dog's history.</li>
            </ul>
          </>
        ),
      },
      {
        heading: '24×7 and emergency care',
        body: (
          <p>
            Emergencies don't keep office hours. Before you ever need one, note the nearest hospital
            that's genuinely open 24×7 with an on-call vet — not just a listed number. Bloat, poisoning,
            road accidents and Parvo are time-critical; knowing where to drive at midnight is worth more
            than any review. Save the address and a route in advance. Our
            {' '}<Dir to="/hospital">vet directory</Dir> flags clinics with emergency and round-the-clock services.
          </p>
        ),
      },
      {
        heading: 'Vets by neighbourhood',
        body: (
          <p>
            Bengaluru's traffic makes proximity a real factor — a 20-minute clinic beats a "better" one
            90 minutes away when your dog is unwell. There are well-regarded small-animal hospitals across
            {' '}{AREAS}. Pick two: a nearby everyday vet for vaccinations and check-ups, and one 24×7
            hospital you can reach quickly in a crisis.
          </p>
        ),
      },
      {
        heading: 'Questions to ask on your first visit',
        body: (
          <ul>
            <li>Are you open for emergencies, and is a vet on-call after hours?</li>
            <li>What diagnostics can you run in-house today?</li>
            <li>What's your approach to pain management and anaesthesia safety?</li>
            <li>Can I get an itemised estimate before treatment?</li>
            <li>Do you keep digital records I can access or share?</li>
          </ul>
        ),
      },
    ],
    faqs: [
      { q: 'Which is the best veterinary hospital in Bengaluru?', a: 'There\'s no single "best" — the right vet depends on your location, your dog\'s needs and whether you need 24×7 care. Shortlist a nearby everyday vet plus one emergency hospital you can reach quickly. HiSpike lists verified vets across Bengaluru to compare.' },
      { q: 'How much does a vet visit cost in Bengaluru?', a: 'A routine consultation typically ranges from ₹300–₹800, with vaccinations, tests and procedures billed separately. Always ask for an itemised estimate before any treatment.' },
      { q: 'Where can I find a 24×7 emergency vet in Bengaluru?', a: 'Several hospitals across Indiranagar, Koramangala and Whitefield offer round-the-clock care. Identify and save your nearest one before an emergency — the HiSpike vet directory flags clinics with emergency services.' },
      { q: 'How often should my dog see a vet?', a: 'A healthy adult dog should have an annual check-up plus vaccinations; puppies and senior dogs need more frequent visits. See a vet promptly for any sudden change in appetite, energy or behaviour.' },
    ],
    cta: { label: 'Browse trusted vets in Bengaluru', to: '/hospital', blurb: 'Verified vet hospitals and 24×7 emergency clinics across the city.' },
  },

  // 2) DOG PARKS -------------------------------------------------------------
  {
    slug: 'best-dog-parks-bengaluru',
    title: 'Best Dog Parks in Bengaluru (2026): Off-Leash Spots & Green Walks',
    h1: 'Best Dog Parks in Bengaluru: Where Dogs Run Free',
    description:
      'A guide to dog-friendly parks and off-leash spots in Bengaluru — what to look for, etiquette, safety tips, and a directory of green spaces where your dog can play.',
    category: 'Outdoors',
    emoji: '🌳',
    date: '2026-07-10',
    readMins: 5,
    intro: (
      <p>
        Every dog needs room to run, sniff and socialise — and Bengaluru, for all its concrete, still has
        some lovely green pockets for it. Whether you want a wide off-leash field or a shaded morning walk,
        this guide covers what makes a park dog-friendly, the etiquette that keeps everyone safe, and a
        {' '}<Dir to="/park">directory of dog-friendly parks across Bengaluru</Dir>.
      </p>
    ),
    sections: [
      {
        heading: 'What makes a park good for dogs?',
        body: (
          <ul>
            <li><strong>Space to run</strong> — open ground where a dog can actually stretch out.</li>
            <li><strong>Shade and water</strong> — essential in Bengaluru's afternoons; carry water regardless.</li>
            <li><strong>A safe boundary</strong> — fenced or set back from busy roads.</li>
            <li><strong>Clear rules</strong> — some parks allow off-leash play at certain hours only.</li>
            <li><strong>A friendly regular crowd</strong> — calm, vaccinated dogs make for good socialising.</li>
          </ul>
        ),
      },
      {
        heading: 'Green spaces dog parents love',
        body: (
          <p>
            Large green lungs like Cubbon Park and Lalbagh are popular for early-morning walks (check current
            timings and leash rules, which change), while neighbourhood parks and lake-side paths in areas like
            {' '}{AREAS} offer quieter options closer to home. Off-leash play is best in genuinely enclosed spaces
            or during designated hours — never near traffic.
          </p>
        ),
      },
      {
        heading: 'Dog-park etiquette (and safety)',
        body: (
          <ul>
            <li>Only bring a fully vaccinated, healthy dog.</li>
            <li>Keep a leash handy even in off-leash areas — for recall and for others' comfort.</li>
            <li>Always clean up after your dog.</li>
            <li>Watch body language; step in before rough play escalates.</li>
            <li>Go at cooler hours (early morning / evening) and carry water.</li>
          </ul>
        ),
      },
    ],
    faqs: [
      { q: 'Are there off-leash dog parks in Bengaluru?', a: 'Yes — some parks and private dog-play areas allow off-leash time, often during specific hours. Large parks like Cubbon Park and Lalbagh are popular for walks; always confirm current leash rules and timings. HiSpike lists dog-friendly parks across the city.' },
      { q: 'Can I take my dog to Cubbon Park or Lalbagh?', a: 'Both are popular with dog parents for morning and evening walks, but rules and timings change — check the latest before you go, keep your dog leashed where required, and clean up after them.' },
      { q: 'What should I carry to a dog park?', a: 'Water and a bowl, poop bags, a leash (even for off-leash areas), and treats for recall. Go during cooler hours to avoid Bengaluru\'s midday heat.' },
      { q: 'Is it safe to let my dog play with strange dogs?', a: 'Only if both dogs are vaccinated, healthy and calm. Introduce on-leash first, watch body language, and separate at the first sign of tension.' },
    ],
    cta: { label: 'Find dog-friendly parks near you', to: '/park', blurb: 'Off-leash spots, lakeside walks and green spaces across Bengaluru.' },
  },

  // 3) SWIMMING --------------------------------------------------------------
  {
    slug: 'dog-swimming-pools-classes-bengaluru',
    title: 'Dog Swimming in Bengaluru (2026): Pools, Classes & Safety',
    h1: 'Dog Swimming in Bengaluru: Pools, Classes and Safety Tips',
    description:
      'Where to find dog swimming pools and canine swim classes in Bengaluru, the health benefits of hydrotherapy, and how to keep your dog safe in the water.',
    category: 'Swimming & Training',
    emoji: '🏊',
    date: '2026-07-10',
    readMins: 5,
    intro: (
      <p>
        Swimming is one of the best forms of exercise for a dog — low-impact, cooling, and brilliant for
        building fitness and confidence. Bengaluru now has dedicated dog pools and trained swim coaches,
        including hydrotherapy for recovery and senior dogs. Here's how it helps, what to look for, and a
        {' '}<Dir to="/swimming">directory of dog swimming pools and classes in Bengaluru</Dir>.
      </p>
    ),
    sections: [
      {
        heading: 'Why swimming is great for dogs',
        body: (
          <ul>
            <li><strong>Low-impact exercise</strong> — kind on joints, ideal for arthritis and post-surgery recovery.</li>
            <li><strong>Full-body fitness</strong> — builds muscle and stamina fast.</li>
            <li><strong>Cooling relief</strong> — a welcome break from Bengaluru's warm afternoons.</li>
            <li><strong>Confidence and calm</strong> — supervised swimming can help anxious dogs settle.</li>
          </ul>
        ),
      },
      {
        heading: 'Pools vs. hydrotherapy vs. lessons',
        body: (
          <p>
            Some facilities offer open <strong>recreational swims</strong> in heated pools; others provide
            <strong> hydrotherapy</strong> under supervision for recovery and weight management, or structured
            <strong> swim lessons</strong> for dogs that are new to water. If your dog is recovering from injury,
            choose a facility with trained hydrotherapy staff and, ideally, a vet referral.
          </p>
        ),
      },
      {
        heading: 'Water-safety basics',
        body: (
          <ul>
            <li>Never force a nervous dog in — let them enter at their own pace.</li>
            <li>Use a canine life vest for first-timers and small breeds.</li>
            <li>Rinse off pool water afterwards and dry the ears to prevent infection.</li>
            <li>Watch for tiredness — dogs tire faster in water than on land.</li>
            <li>Confirm the pool is cleaned and maintained for canine use.</li>
          </ul>
        ),
      },
    ],
    faqs: [
      { q: 'Are there dog swimming pools in Bengaluru?', a: 'Yes — several facilities offer heated dog pools, hydrotherapy and swim lessons with trained coaches. HiSpike lists dog swimming pools and classes across Bengaluru.' },
      { q: 'Is swimming good for dogs?', a: 'Very — it\'s low-impact exercise that builds fitness and is especially good for joint problems, weight management and post-surgery recovery. Always supervise and use a life vest for beginners.' },
      { q: 'Can any dog learn to swim?', a: 'Most dogs can, but some breeds (and nervous dogs) need patient, gradual introduction. Never force a dog into water; a good swim coach lets them build confidence at their own pace.' },
      { q: 'What is canine hydrotherapy?', a: 'Supervised swimming or underwater-treadmill therapy used for rehabilitation, arthritis and weight control. For recovery cases, choose a facility with trained staff and, ideally, a vet referral.' },
    ],
    cta: { label: 'Explore dog swimming in Bengaluru', to: '/swimming', blurb: 'Heated pools, hydrotherapy and certified swim coaches near you.' },
  },

  // 4) GROOMING --------------------------------------------------------------
  {
    slug: 'best-dog-grooming-salons-bengaluru',
    title: 'Best Dog Grooming in Bengaluru (2026): Salons, Costs & Tips',
    h1: 'Dog Grooming in Bengaluru: Choosing the Right Salon',
    description:
      'How to pick a good dog grooming salon in Bengaluru — services, typical costs, how often to groom, and a directory of trusted groomers near you.',
    category: 'Grooming',
    emoji: '✂️',
    date: '2026-07-10',
    readMins: 5,
    intro: (
      <p>
        Regular grooming isn't just about looks — it keeps skin healthy, catches lumps and ticks early, and
        makes your dog more comfortable in Bengaluru's climate. But a rushed or rough groomer can turn bath
        day into a nightmare. Here's how to choose well, what things cost, and a
        {' '}<Dir to="/grooming">directory of trusted grooming salons in Bengaluru</Dir>.
      </p>
    ),
    sections: [
      {
        heading: 'What good grooming includes',
        body: (
          <ul>
            <li><strong>Bath &amp; blow-dry</strong> with a coat-appropriate shampoo.</li>
            <li><strong>Brushing &amp; de-shedding</strong> to prevent matting.</li>
            <li><strong>Nail trimming</strong> and paw-pad care.</li>
            <li><strong>Ear cleaning</strong> and a hygiene trim.</li>
            <li><strong>Breed-specific styling</strong> for coated breeds.</li>
          </ul>
        ),
      },
      {
        heading: 'How to choose a groomer',
        body: (
          <p>
            Visit before you book. A good salon is clean, calm and unhurried; the groomer handles dogs gently and
            asks about your dog's temperament and any skin issues. Ask whether they offer <strong>home grooming</strong>
            {' '}(great for anxious dogs), how they manage a scared dog, and what products they use. Groomers across
            {' '}{AREAS} range from budget to premium — match the service to your dog's coat, not just the price.
          </p>
        ),
      },
      {
        heading: 'How often, and what it costs',
        body: (
          <p>
            Short-coated dogs may need grooming every 6–8 weeks; long or double-coated breeds often need it every
            4–6 weeks plus regular home brushing. In Bengaluru, a basic bath-and-tidy typically starts around
            ₹600–₹1,200, with full grooming and breed cuts costing more depending on size and coat. Home-visit
            grooming usually carries a small premium.
          </p>
        ),
      },
    ],
    faqs: [
      { q: 'How much does dog grooming cost in Bengaluru?', a: 'A basic bath-and-tidy typically starts around ₹600–₹1,200; full grooming with breed-specific cuts costs more depending on your dog\'s size and coat. Home-visit grooming usually adds a small premium.' },
      { q: 'How often should I groom my dog?', a: 'Short-coated dogs every 6–8 weeks; long or double-coated breeds every 4–6 weeks, plus regular brushing at home. Nails and ears should be checked more frequently.' },
      { q: 'Is home grooming available in Bengaluru?', a: 'Yes — many groomers offer home-visit services, which is ideal for anxious dogs or multi-pet homes. HiSpike lists salons and mobile groomers across the city.' },
      { q: 'How do I choose a good dog groomer?', a: 'Visit first: look for a clean, calm space and gentle handling. Ask how they manage scared dogs, what products they use, and whether they have experience with your dog\'s breed and coat.' },
    ],
    cta: { label: 'Find a grooming salon near you', to: '/grooming', blurb: 'Trusted groomers and mobile grooming across Bengaluru.' },
  },

  // 5) PET SUPPLIES ----------------------------------------------------------
  {
    slug: 'where-to-buy-pet-supplies-bengaluru',
    title: 'Where to Buy Pet Supplies in Bengaluru (2026): Food, Toys & More',
    h1: 'Buying Pet Supplies in Bengaluru: A Practical Guide',
    description:
      'A practical guide to buying pet food, toys and essentials in Bengaluru — how to choose the right dog food, must-have supplies, and where to shop nearby.',
    category: 'Pet Supplies',
    emoji: '🛍️',
    date: '2026-07-10',
    readMins: 5,
    intro: (
      <p>
        From the right food to the right chew toy, what you buy shapes your dog's health and happiness. Bengaluru
        has everything from neighbourhood pet stores to premium brands — the trick is knowing what's worth it.
        Here's how to choose good dog food, the essentials every home needs, and where to shop, including
        {' '}<Dir to="/pet-supplies">pet supplies on HiSpike</Dir> and
        {' '}<Dir to="/petshop/paws-and-whiskers">local pet shops with their own storefronts</Dir>.
      </p>
    ),
    sections: [
      {
        heading: 'How to choose the right dog food',
        body: (
          <ul>
            <li><strong>Read the first ingredients</strong> — a named meat should lead, not fillers.</li>
            <li><strong>Match life stage</strong> — puppy, adult and senior formulas differ for good reason.</li>
            <li><strong>Size and breed</strong> — kibble size and calorie density matter.</li>
            <li><strong>Transition slowly</strong> — switch foods over 7–10 days to avoid tummy upsets.</li>
            <li><strong>Ask your vet</strong> for allergies, weight or medical conditions.</li>
          </ul>
        ),
      },
      {
        heading: 'The pet-supply essentials',
        body: (
          <ul>
            <li>Quality food and clean bowls (stainless steel lasts).</li>
            <li>A well-fitted collar, harness and leash.</li>
            <li>Durable chew toys and enrichment puzzles.</li>
            <li>Grooming basics — brush, nail clipper, dog shampoo.</li>
            <li>A comfortable, washable bed.</li>
            <li>Poop bags, and a raincoat for the monsoon.</li>
          </ul>
        ),
      },
      {
        heading: 'Where to shop in Bengaluru',
        body: (
          <p>
            You'll find neighbourhood pet stores across {AREAS}, alongside online delivery for convenience. Buying
            local means you can see products, ask questions and often get same-day delivery. On HiSpike you can browse
            {' '}<Dir to="/pet-supplies">pet supplies</Dir> and discover
            {' '}<Dir to="/petshop/paws-and-whiskers">local pet shops</Dir> that list their products and let you order
            straight over WhatsApp.
          </p>
        ),
      },
    ],
    faqs: [
      { q: 'What is the best dog food in India?', a: 'The best food is the one that suits your dog\'s age, size, activity and any medical needs. Look for a named meat as the first ingredient, match the life stage, and consult your vet for allergies or weight issues rather than chasing a single "best" brand.' },
      { q: 'Where can I buy pet supplies in Bengaluru?', a: 'Neighbourhood pet stores across the city stock food, toys and essentials, alongside online delivery. HiSpike lists pet supplies and local pet shops that let you order over WhatsApp.' },
      { q: 'What supplies does a new puppy need?', a: 'Age-appropriate food, food and water bowls, a collar/harness and leash, chew toys, a washable bed, grooming basics, poop bags, and a crate or playpen for training.' },
      { q: 'How do I switch my dog\'s food safely?', a: 'Transition gradually over 7–10 days, mixing increasing amounts of the new food with the old to avoid digestive upset. Slow down if you notice loose stools.' },
    ],
    cta: { label: 'Shop pet supplies on HiSpike', to: '/pet-supplies', blurb: 'Food, toys and everyday essentials — plus local pet shops near you.' },
  },
];

export const BLOG_POST_SLUGS = BLOG_POSTS.map((p) => p.slug);
export const getBlogPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug);
