import { ComingSoon } from '@/components/ComingSoon';

export function Newsroom() {
  return (
    <ComingSoon
      emoji="📰"
      eyebrow="Press · HiSpike"
      title="Newsroom is launching soon"
      body="Press features, partnership announcements, and product news are on the way. We'll start publishing as soon as we have stories worth telling."
      notifySubject="the Newsroom launches"
      path="/newsroom"
    />
  );
}
