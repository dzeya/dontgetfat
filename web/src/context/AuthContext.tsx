import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { FormData } from '../types'; // Import FormData for profile type

// Define Profile type based on table structure (can reuse FormData for now)
// Ensure this matches the columns in your 'profiles' table
type Profile = FormData & {
  id: string; // uuid
  updated_at?: string; // timestamptz
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null; // Add profile state
  loading: boolean; // Represents initial auth check + profile fetch
  fetchProfile: () => Promise<void>; // Add function to manually refetch profile if needed
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
        .select(`*
          // Explicitly list columns matching FormData + others if needed
          // goals, other_goals, allergies, specific_allergies, dietary_choice, 
          // dislikes, cooking_time, batch_cooking, household_size, 
          // favorite_cuisines, favorite_meals,
          // username, full_name, website, avatar_url 
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
          otherGoals: data.otherGoals || '',
          allergies: data.allergies || [],
          specificAllergies: data.specificAllergies || '',
          dietaryChoice: data.dietaryChoice || 'None/No specific diet',
          dislikes: data.dislikes || '',
          cookingTime: data.cookingTime || '🍳 Standard (15-30 mins)',
          batchCooking: data.batchCooking || false,
          householdSize: data.householdSize || 'Just Me (1)',
          favoriteCuisines: data.favoriteCuisines || [],
          favoriteMeals: data.favoriteMeals || '',
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

  useEffect(() => {
    const setupAuth = async () => {
      setLoading(true);
      // 1. Get initial session
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error fetching initial session:', sessionError);
      } else {
        setSession(initialSession);
        const initialUser = initialSession?.user ?? null;
        setUser(initialUser);
        // 2. Fetch profile if user exists
        if (initialUser) {
           await fetchProfileBasedOnUser(initialUser.id);
        }
      }
       setLoading(false); // Initial auth check complete
    };

    setupAuth();

    // Listener for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
       console.log("Auth state changed:", _event, session);
      const currentUser = session?.user ?? null;
      setSession(session);
      setUser(currentUser);
      // Fetch profile when user logs in or session changes
      if (currentUser) {
         await fetchProfileBasedOnUser(currentUser.id);
      } else {
        setProfile(null); // Clear profile on logout
        setLoading(false); // No profile to load
      }
    });

    // Cleanup listener
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []); // Run only once on mount

  // Helper to fetch profile based on user ID, managing loading state
  const fetchProfileBasedOnUser = async (userId: string) => {
     setLoading(true);
    console.log('Fetching profile for user:', userId);
    try {
       const { data, error, status } = await supabase
        .from('profiles')
        .select(`*
          // goals, other_goals, allergies, specific_allergies, dietary_choice, 
          // dislikes, cooking_time, batch_cooking, household_size, 
          // favorite_cuisines, favorite_meals,
          // username, full_name, website, avatar_url 
        `)
        .eq('id', userId)
        .single();

      if (error && status !== 406) throw error;

      if (data) {
        console.log('Profile data found:', data);
         setProfile({
          id: data.id,
          updated_at: data.updated_at,
          username: data.username,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          website: data.website,
          goals: data.goals || [],
          otherGoals: data.otherGoals || '',
          allergies: data.allergies || [],
          specificAllergies: data.specificAllergies || '',
          dietaryChoice: data.dietaryChoice || 'None/No specific diet',
          dislikes: data.dislikes || '',
          cookingTime: data.cookingTime || '🍳 Standard (15-30 mins)',
          batchCooking: data.batchCooking || false,
          householdSize: data.householdSize || 'Just Me (1)',
          favoriteCuisines: data.favoriteCuisines || [],
          favoriteMeals: data.favoriteMeals || '',
        });
      } else {
        console.log('No profile data found for user.');
        setProfile(null);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error.message);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };


  const value = {
    session,
    user,
    profile, // Provide profile in context
    loading,
    fetchProfile: () => fetchProfileBasedOnUser(user!.id) // Provide fetch function (ensure user exists)
  };

  // Render children only when initial loading (session check) is complete
  // Specific components can handle the profile loading state internally if needed
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
