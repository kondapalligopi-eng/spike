import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { recordPageView } from '@/lib/visitTracker';

export function VisitTracker() {
  const location = useLocation();
  useEffect(() => {
    recordPageView();
  }, [location.pathname]);
  return null;
}
