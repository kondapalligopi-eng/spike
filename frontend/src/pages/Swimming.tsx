import { ReactNode } from 'react';

type Section = {
  eyebrow?: string;
  heading: string;
  body: string;
  cta: string;
  image: string;
  imageAlt: string;
  imageSide: 'left' | 'right';
  background: 'warm' | 'white';
};

const SECTIONS: Section[] = [
  {
    heading: 'Swim Training Programs',
    body:
      "As dogs grow and develop, swimming is one of the best low-impact ways to build strength, stamina, and confidence in the water. See how our structured swim sessions fit into every life stage.",
    cta: 'Learn More About Swim Training',
    image: '/swim-1.jpg',
    imageAlt: 'Dog learning to swim with instructor',
    imageSide: 'right',
    background: 'warm',
  },
  {
    heading: 'Water Safety and Hydrotherapy',
    body:
      "Our swim lessons aren't just great for exercise — they build essential water-safety skills and offer therapeutic benefits for senior dogs, post-surgery recovery, and joint support in a calm, controlled environment.",
    cta: 'Learn More About Hydrotherapy',
    image: '/swim-2.jpg',
    imageAlt: 'Dog swimming underwater in a pool',
    imageSide: 'left',
    background: 'white',
  },
  {
    heading: 'Open Swim & Play Sessions',
    body:
      "Bring your dog for open-swim hours in our heated pools. Socialize with other water-loving pups, splash in the shallow areas, or chase floating toys — a perfect weekend adventure.",
    cta: 'Book an Open Swim Session',
    image: '/swim-3.jpg',
    imageAlt: 'Dogs playing in the pool',
    imageSide: 'right',
    background: 'warm',
  },
];

function Panel({ section }: { section: Section }) {
  const { heading, body, cta, image, imageAlt, imageSide, background } = section;
  const bg = background === 'warm' ? 'bg-warm-100' : 'bg-white';
  const textFirst = imageSide === 'right';

  const textBlock: ReactNode = (
    <div className="flex flex-col justify-center p-8 lg:p-12">
      <h2 className="text-3xl lg:text-4xl font-extrabold text-primary-700 mb-3">
        {heading}
      </h2>
      <div className="w-12 h-1 bg-accent-400 mb-6" />
      <p className="text-warm-700 leading-relaxed mb-8 max-w-lg">{body}</p>
      <div>
        <button
          type="button"
          className="group inline-flex items-center gap-3 pl-2 pr-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-full transition-colors shadow-sm"
        >
          <span className="w-3 h-3 rounded-full bg-accent-400 group-hover:bg-accent-300 transition-colors" />
          {cta}
        </button>
      </div>
    </div>
  );

  const imageBlock: ReactNode = (
    <div className="relative aspect-[4/3] lg:aspect-auto bg-warm-200 overflow-hidden">
      <img
        src={image}
        alt={imageAlt}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          el.style.display = 'none';
        }}
      />
      {/* Fallback placeholder if the image is missing */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-300 pointer-events-none">
        <span className="text-7xl mb-2">🏊‍♂️🐕</span>
        <span className="text-xs font-medium tracking-widest uppercase">
          Drop image at public{image}
        </span>
      </div>
    </div>
  );

  return (
    <section className={bg}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-10 py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        {textFirst ? (
          <>
            {textBlock}
            {imageBlock}
          </>
        ) : (
          <>
            <div className="order-2 lg:order-1">{imageBlock}</div>
            <div className="order-1 lg:order-2">{textBlock}</div>
          </>
        )}
      </div>
    </section>
  );
}

export function Swimming() {
  return (
    <div className="bg-white">
      {/* Page intro */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-600 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold tracking-[0.3em] text-primary-200 mb-3">
            CUDDLY FRIEND · SERVICES
          </p>
          <h1 className="text-4xl lg:text-5xl font-extrabold uppercase tracking-tight mb-4">
            Swimming
          </h1>
          <p className="text-primary-100 text-lg max-w-2xl">
            Low-impact exercise, water safety, and pure joy — swim programs
            designed for every dog.
          </p>
        </div>
      </section>

      {SECTIONS.map((s) => (
        <Panel key={s.heading} section={s} />
      ))}
    </div>
  );
}
