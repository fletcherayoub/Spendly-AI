import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Profile } from '@/store/auth-store';

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Profile> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name, avatar_url')
        .eq('id', userId as string)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });
}
