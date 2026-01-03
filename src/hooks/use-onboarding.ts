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

        // Check if user has never signed in
        const { data, error } = await supabase
          .from('user_details')
          .select('last_sign_in_at')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error checking onboarding status:', error);
          setLoading(false);
          return;
        }

        // If last_sign_in_at is null, user has never signed in
        setNeedsOnboarding(!data?.last_sign_in_at);
      } catch (err) {
        console.error('Onboarding check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  return { needsOnboarding, loading, userEmail };
};
