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
      return [];
    }
  }
};

export default marketingService;