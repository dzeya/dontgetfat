import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// Define Profile type based on table structure
// Ensure this matches the columns in your 'profiles' table
export interface Profile {
  id: string;
  updated_at?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  goals?: string[];
  other_goals?: string;
  allergies?: string[];
  specific_allergies?: string;
  dietary_choice?: string;
  dislikes?: string;
  cooking_time?: string;
  batch_cooking?: boolean;
  household_size?: string;
  meals_per_day?: string; // Add if needed based on your table
  cooking_days_per_week?: string; // Add if needed based on your table
  favorite_cuisines?: string[];
  favorite_meals?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null; // Use updated Profile type
  loading: boolean;
  fetchProfile: () => Promise<void>; // Add fetchProfile to context type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // Profile state
  const [loading, setLoading] = useState<boolean>(true);

  // Function to fetch profile data
  const fetchProfile = async () => {
    if (!user) return; // Need user to fetch profile
    console.log('Fetching profile for user:', user.id);
    setLoading(true); // Indicate loading while fetching profile
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`
          id,
          updated_at,
          username,
          full_name,
          avatar_url,
          website,
          goals,
          other_goals,
          allergies,
          specific_allergies,
          dietary_choice,
          dislikes,
          cooking_time,
          batch_cooking,
          household_size,
          meals_per_day,
          cooking_days_per_week,
          favorite_cuisines,
          favorite_meals
        `)
        .eq('id', user.id)
        .single();

      if (error && status !== 406) { // 406 = No rows found, which is okay initially
        throw error;
      }

      if (data) {
        console.log('Profile data found:', data);
        // Map fetched data to Profile type (adjust mapping if necessary)
        setProfile({
          id: data.id,
          updated_at: data.updated_at,
          username: data.username,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          website: data.website,
          goals: data.goals || [],
          other_goals: data.other_goals || '',
          allergies: data.allergies || [],
          specific_allergies: data.specific_allergies || '',
          dietary_choice: data.dietary_choice || 'None/No specific diet',
          dislikes: data.dislikes || '',
          cooking_time: data.cooking_time || '🍳 Standard (15-30 mins)',
          batch_cooking: data.batch_cooking || false,
          household_size: data.household_size || 'Just Me (1)',
          meals_per_day: data.meals_per_day, // Map new fields
          cooking_days_per_week: data.cooking_days_per_week, // Map new fields
          favorite_cuisines: data.favorite_cuisines || [],
          favorite_meals: data.favorite_meals || '',
        });
      } else {
        console.log('No profile data found for user, might be first login.');
        setProfile(null); // Ensure profile is null if no data found
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      setProfile(null); // Reset profile on error
    } finally {
      setLoading(false); // Stop loading after fetch attempt
    }
  };

  // Fetch session and profile on initial load and auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Auth state changed:', _event, session);
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          // If user logs in, fetch their profile
          fetchProfile(); 
        } else {
          // If user logs out, clear the profile
          setProfile(null);
        }

        // Initial loading complete after first auth check
        if (loading) {
          setLoading(false);
        }
      }
    );

    // Initial check to see if there's an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session fetch:', session);
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
         // Fetch profile immediately if session exists on load
         fetchProfile();
      } else {
        setLoading(false); // No user, loading is done
      }
    });

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed user and fetchProfile dependency, handled internally

  // Context value
  const value = {
    session,
    user,
    profile,
    loading,
    fetchProfile, // Provide fetchProfile through context
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
