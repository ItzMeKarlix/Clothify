import { useEffect, useState } from 'react';
import { supabase } from '../api/api';

export const useOnboarding = () => {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const session = await supabase.auth.getSession();
        if (!session.data.session?.user?.id) {
          setLoading(false);
          return;
        }

        const userId = session.data.session.user.id;
        setUserEmail(session.data.session.user.email || null);

        // Check if user has completed onboarding
        // CRITICAL: Use RPC function instead of direct table query to avoid RLS recursion
        const { data, error } = await supabase.rpc('get_onboarding_status');

        if (error) {
          console.error('Error checking onboarding status:', error);
          setLoading(false);
          return;
        }

        // If onboarding_completed is false/null, user needs to complete onboarding
        const shouldNeedOnboarding = !data;
        setNeedsOnboarding(shouldNeedOnboarding);
        
        // Store in localStorage to check for changes
        if (shouldNeedOnboarding) {
          localStorage.setItem('pendingOnboarding', 'true');
        } else {
          localStorage.removeItem('pendingOnboarding');
        }
      } catch (err) {
        console.error('Onboarding check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();

    // Listen for storage changes (when onboarding is completed from another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pendingOnboarding' && !e.newValue) {
        setNeedsOnboarding(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const completeOnboarding = async () => {
    try {
      const session = await supabase.auth.getSession();
      if (!session.data.session?.user?.id) return;

      // CRITICAL: Use RPC function instead of direct table update to avoid RLS recursion
      const { error } = await supabase.rpc('complete_onboarding');

      if (error) {
        console.error('Error completing onboarding:', error);
        return;
      }

      setNeedsOnboarding(false);
      localStorage.removeItem('pendingOnboarding');
    } catch (err) {
      console.error('Error completing onboarding:', err);
    }
  };

  return { needsOnboarding, loading, userEmail, completeOnboarding };
};
