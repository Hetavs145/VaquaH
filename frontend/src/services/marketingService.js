import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const SERVICES_DOC_PATH = 'marketingAssets/services';

export const marketingService = {
  async getServices() {
    try {
      const cacheKey = 'marketing_services_cache_v1';
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed?.items)) return parsed.items;
        } catch {}
      }

      const docRef = doc(db, SERVICES_DOC_PATH);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return [];

      const data = snap.data() || {};
      const items = Array.isArray(data.items) ? data.items : [];

      sessionStorage.setItem(cacheKey, JSON.stringify({ items }));
      return items;
    } catch (error) {
      console.error('Failed to load marketing services:', error);
      // Return default services if Firebase fails
      return [
        {
          id: 1,
          title: 'AC Installation',
          description: 'Professional AC installation services with warranty',
          iconKey: 'zap',
          link: '/services',
          image: '/placeholder.svg'
        },
        {
          id: 2,
          title: 'AC Maintenance',
          description: 'Regular maintenance to keep your AC running efficiently',
          iconKey: 'rotate',
          link: '/services',
          image: '/placeholder.svg'
        },
        {
          id: 3,
          title: 'AC Repair',
          description: 'Quick and reliable AC repair services',
          iconKey: 'wrench',
          link: '/services',
          image: '/placeholder.svg'
        }
      ];
    }
  }
};

export default marketingService;