import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const marketingService = {
  async getServices() {
    try {
      // Intentionally using a new cache key to bust old session storage
      // const cacheKey = 'marketing_services_cache_v2'; 
      // Disabled cache for now to ensure fresh DB sync

      const servicesRef = collection(db, 'services');
      const snap = await getDocs(servicesRef);

      if (snap.empty) {
        return [];
      }

      const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Filter out the dummy/seeded services if they exist in the DB
      const dummyIds = ['service_ac_install', 'service_ac_maintenance', 'service_ac_repair'];
      const validItems = items.filter(item => !dummyIds.includes(item.id));

      // Optional: Cleanup routine (uncomment if you want to aggressively delete them)
      /*
      items.forEach(async (item) => {
        if (dummyIds.includes(item.id)) {
           try {
             await deleteDoc(doc(db, 'services', item.id));
             console.log('Cleaned up dummy service:', item.id);
           } catch (e) { console.error('Cleanup failed', e); }
        }
      });
      */

      return validItems;
    } catch (error) {
      console.error('Failed to load services:', error);
      return [];
    }
  }
};

export default marketingService;