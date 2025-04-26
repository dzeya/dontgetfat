import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

// Define Profile type based on table structure
// Ensure this matches the columns in your 'profiles' table
interface Profile {
  id: string;
  updated_at?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  website?: string;
  // Fields from FormData
  goals?: string[];
  otherGoals?: string;
  allergies?: string[];
  specificAllergies?: string;
  dietaryChoice?: string;
  dislikes?: string;
  cookingTime?: string;
  batchCooking?: boolean;
  householdSize?: string;
  mealsPerDay?: string; // Add if needed based on your table
  cookingDaysPerWeek?: string; // Add if needed based on your table
  favoriteCuisines?: string[];
  favoriteMeals?: string;
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
          otherGoals,
          allergies,
          specificAllergies,
          dietaryChoice,
          dislikes,
          cookingTime,
          batchCooking,
          householdSize,
          mealsPerDay,
          cookingDaysPerWeek,
          favoriteCuisines,
          favoriteMeals
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
          mealsPerDay: data.mealsPerDay, // Map new fields
          cookingDaysPerWeek: data.cookingDaysPerWeek, // Map new fields
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
