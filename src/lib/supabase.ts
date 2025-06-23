import { createClient } from "@supabase/supabase-js";
import {
  NutritionTrainingPlan,
  NutritionWorkout,
} from "@/components/NutritionTraining";
import { Database } from "@/types/supabase";
import { RaceProfile } from "@/components/RaceProfileForm";
import { NutritionPlan } from "@/components/NutritionSliders";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Types for saved data
export interface SavedRace {
  id: string;
  race_name: string;
  race_date: string;
  start_time: string;
  distance: number;
  elevation_gain: number;
  estimated_time: string;
  unit_preferences: any;
  aid_stations?: any[];
  nutrition_plan?: NutritionPlan;
  created_at: string;
  updated_at: string;
}

export interface SavedFoodItem {
  id: string;
  name: string;
  carbs_per_serving: number;
  sodium_per_serving: number;
  water_per_serving: number;
  serving_size: string;
  category: string;
  created_at: string;
  updated_at: string;
}

/**
 * Service for storing and retrieving race profiles and food items
 */
export class RaceDataStorage {
  /**
   * Save a race profile to the database
   */
  static async saveRaceProfile(
    userId: string,
    raceProfile: RaceProfile,
    aidStations?: any[],
    nutritionPlan?: NutritionPlan,
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("saved_races")
        .insert({
          user_id: userId,
          race_name: raceProfile.raceName,
          race_date: raceProfile.raceDate,
          start_time: raceProfile.startTime,
          distance: parseFloat(raceProfile.distance),
          elevation_gain: parseFloat(raceProfile.elevationGain),
          estimated_time: raceProfile.estimatedTime,
          unit_preferences: raceProfile.unitPreferences,
          aid_stations: aidStations || [],
          nutrition_plan: nutritionPlan,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error saving race profile:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Error saving race profile:", error);
      return null;
    }
  }

  /**
   * Get all saved race profiles for a user
   */
  static async getSavedRaces(userId: string): Promise<SavedRace[]> {
    try {
      const { data, error } = await supabase
        .from("saved_races")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching saved races:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching saved races:", error);
      return [];
    }
  }

  /**
   * Get a specific saved race
   */
  static async getSavedRace(
    userId: string,
    raceId: string,
  ): Promise<SavedRace | null> {
    try {
      const { data, error } = await supabase
        .from("saved_races")
        .select("*")
        .eq("user_id", userId)
        .eq("id", raceId)
        .single();

      if (error) {
        console.error("Error fetching saved race:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching saved race:", error);
      return null;
    }
  }

  /**
   * Delete a saved race
   */
  static async deleteSavedRace(
    userId: string,
    raceId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("saved_races")
        .delete()
        .eq("user_id", userId)
        .eq("id", raceId);

      if (error) {
        console.error("Error deleting saved race:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting saved race:", error);
      return false;
    }
  }

  /**
   * Save a food item to the database
   */
  static async saveFoodItem(
    userId: string,
    foodItem: Omit<SavedFoodItem, "id" | "created_at" | "updated_at">,
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("saved_food_items")
        .insert({
          user_id: userId,
          name: foodItem.name,
          carbs_per_serving: foodItem.carbs_per_serving,
          sodium_per_serving: foodItem.sodium_per_serving,
          water_per_serving: foodItem.water_per_serving,
          serving_size: foodItem.serving_size,
          category: foodItem.category,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error saving food item:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Error saving food item:", error);
      return null;
    }
  }

  /**
   * Get all saved food items for a user
   */
  static async getSavedFoodItems(userId: string): Promise<SavedFoodItem[]> {
    try {
      const { data, error } = await supabase
        .from("saved_food_items")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) {
        console.error("Error fetching saved food items:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching saved food items:", error);
      return [];
    }
  }

  /**
   * Get saved food items by category
   */
  static async getSavedFoodItemsByCategory(
    userId: string,
    category: string,
  ): Promise<SavedFoodItem[]> {
    try {
      const { data, error } = await supabase
        .from("saved_food_items")
        .select("*")
        .eq("user_id", userId)
        .eq("category", category)
        .order("name");

      if (error) {
        console.error("Error fetching saved food items by category:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching saved food items by category:", error);
      return [];
    }
  }

  /**
   * Delete a saved food item
   */
  static async deleteSavedFoodItem(
    userId: string,
    foodItemId: string,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("saved_food_items")
        .delete()
        .eq("user_id", userId)
        .eq("id", foodItemId);

      if (error) {
        console.error("Error deleting saved food item:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error deleting saved food item:", error);
      return false;
    }
  }

  /**
   * Update a saved food item
   */
  static async updateSavedFoodItem(
    userId: string,
    foodItemId: string,
    updates: Partial<Omit<SavedFoodItem, "id" | "created_at" | "updated_at">>,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("saved_food_items")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("id", foodItemId);

      if (error) {
        console.error("Error updating saved food item:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error updating saved food item:", error);
      return false;
    }
  }
}

/**
 * Service for storing and retrieving nutrition training data
 */
export class NutritionTrainingStorage {
  /**
   * Save a nutrition training plan to the database
   */
  static async saveTrainingPlan(
    userId: string,
    plan: NutritionTrainingPlan,
  ): Promise<string | null> {
    try {
      // In a real implementation, this would save to Supabase
      // For now, we'll simulate saving by returning a mock ID
      console.log("Saving training plan for user:", userId, plan);
      return "mock-plan-id-" + Date.now();
    } catch (error) {
      console.error("Error saving training plan:", error);
      return null;
    }
  }

  /**
   * Get a nutrition training plan from the database
   */
  static async getTrainingPlan(
    userId: string,
    planId: string,
  ): Promise<NutritionTrainingPlan | null> {
    try {
      // In a real implementation, this would fetch from Supabase
      // For now, we'll return null to indicate no saved plan
      console.log("Fetching training plan:", planId, "for user:", userId);
      return null;
    } catch (error) {
      console.error("Error fetching training plan:", error);
      return null;
    }
  }

  /**
   * Get all nutrition training plans for a user
   */
  static async getUserTrainingPlans(
    userId: string,
  ): Promise<{ id: string; plan: NutritionTrainingPlan }[]> {
    try {
      // In a real implementation, this would fetch from Supabase
      // For now, we'll return an empty array
      console.log("Fetching all training plans for user:", userId);
      return [];
    } catch (error) {
      console.error("Error fetching user training plans:", error);
      return [];
    }
  }

  /**
   * Update a workout with feedback
   */
  static async updateWorkoutFeedback(
    userId: string,
    planId: string,
    workoutId: string,
    feedback: NutritionWorkout["feedback"],
  ): Promise<boolean> {
    try {
      // In a real implementation, this would update in Supabase
      console.log(
        "Updating workout feedback:",
        workoutId,
        "in plan:",
        planId,
        "for user:",
        userId,
      );
      console.log("Feedback:", feedback);
      return true;
    } catch (error) {
      console.error("Error updating workout feedback:", error);
      return false;
    }
  }

  /**
   * Mark a workout as completed
   */
  static async markWorkoutCompleted(
    userId: string,
    planId: string,
    workoutId: string,
  ): Promise<boolean> {
    try {
      // In a real implementation, this would update in Supabase
      console.log(
        "Marking workout as completed:",
        workoutId,
        "in plan:",
        planId,
        "for user:",
        userId,
      );
      return true;
    } catch (error) {
      console.error("Error marking workout as completed:", error);
      return false;
    }
  }
}
