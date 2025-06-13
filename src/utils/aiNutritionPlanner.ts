import { NutritionWorkout } from "@/components/NutritionTraining";
import { WorkoutData } from "@/services/workoutService";

export interface NutritionPlanConfig {
  startDate: Date;
  raceDate: Date;
  preferredProducts: string[];
  targetRaceCalories: number; // calories per hour
  targetRaceFluid: number; // ml per hour
  targetRaceCarbs: number; // g per hour
  targetRaceSodium: number; // mg per hour
}

export interface NutritionPlan {
  workouts: NutritionWorkout[];
  progressionStrategy: string;
  recommendations: string[];
}

/**
 * AI Nutrition Planner that generates a progressive nutrition training plan
 * to prepare the athlete's gut for race day nutrition demands
 */
export class AiNutritionPlanner {
  /**
   * Generate a nutrition training plan based on the provided configuration
   */
  static generatePlan(
    config: NutritionPlanConfig,
    existingWorkouts?: WorkoutData[],
  ): NutritionPlan {
    // Calculate weeks until race
    const weeksUntilRace = this.calculateWeeksUntilRace(
      config.startDate,
      config.raceDate,
    );

    // Generate workouts if none provided
    const workouts =
      existingWorkouts ||
      this.generateWorkouts(config.startDate, config.raceDate);

    // Create nutrition workouts with progressive nutrition strategy
    const nutritionWorkouts = this.createProgressiveNutritionPlan(
      workouts,
      config,
      weeksUntilRace,
    );

    // Generate recommendations based on the plan
    const recommendations = this.generateRecommendations(
      config,
      weeksUntilRace,
    );

    return {
      workouts: nutritionWorkouts,
      progressionStrategy: this.generateProgressionStrategy(
        config,
        weeksUntilRace,
      ),
      recommendations,
    };
  }

  /**
   * Calculate weeks between two dates
   */
  private static calculateWeeksUntilRace(
    startDate: Date,
    raceDate: Date,
  ): number {
    const diffTime = Math.abs(raceDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.ceil(diffDays / 7);
  }

  /**
   * Generate mock workouts if no existing workouts are provided
   */
  private static generateWorkouts(
    startDate: Date,
    raceDate: Date,
  ): WorkoutData[] {
    const workouts: WorkoutData[] = [];
    const daysBetween = Math.ceil(
      (raceDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24),
    );

    // Generate a workout every 3-4 days
    for (let i = 0; i < daysBetween; i += Math.floor(Math.random() * 2) + 3) {
      const workoutDate = new Date(startDate);
      workoutDate.setDate(startDate.getDate() + i);

      // Generate random workout data
      workouts.push({
        id: `workout-${i}`,
        date: workoutDate,
        distance: Math.round((Math.random() * 15 + 5) * 10) / 10, // 5-20km
        duration: Math.round(Math.random() * 90 + 30), // 30-120 minutes
        intensity: ["low", "medium", "high"][Math.floor(Math.random() * 3)] as
          | "low"
          | "medium"
          | "high",
        type: "run",
      });
    }

    return workouts;
  }

  /**
   * Create a progressive nutrition plan that gradually increases nutrition intake
   * to prepare the athlete's gut for race day demands
   */
  private static createProgressiveNutritionPlan(
    workouts: WorkoutData[],
    config: NutritionPlanConfig,
    weeksUntilRace: number,
  ): NutritionWorkout[] {
    return workouts.map((workout, index) => {
      // Calculate progression factor (0.5 to 1.0) based on workout date
      const workoutDate = workout.date;
      const totalDays =
        (config.raceDate.getTime() - config.startDate.getTime()) /
        (1000 * 3600 * 24);
      const daysElapsed =
        (workoutDate.getTime() - config.startDate.getTime()) /
        (1000 * 3600 * 24);
      const progressionFactor = 0.5 + (daysElapsed / totalDays) * 0.5;

      // Calculate nutrition values based on progression
      const calories = Math.round(
        config.targetRaceCalories * progressionFactor,
      );
      const fluid = Math.round(config.targetRaceFluid * progressionFactor);
      const carbs = Math.round(config.targetRaceCarbs * progressionFactor);
      const sodium = Math.round(config.targetRaceSodium * progressionFactor);

      // Select products based on preferences and workout intensity
      const products = this.selectProducts(
        config.preferredProducts,
        workout,
        index,
      );

      return {
        id: workout.id,
        date: workout.date,
        distance: workout.distance,
        duration: workout.duration,
        nutritionPlan: {
          calories,
          fluid,
          carbs,
          sodium,
          products,
        },
        completed: false,
      };
    });
  }

  /**
   * Select appropriate nutrition products based on preferences and workout
   */
  private static selectProducts(
    preferredProducts: string[],
    workout: WorkoutData,
    index: number,
  ): string[] {
    // If no preferred products, use defaults
    if (!preferredProducts.length) {
      return ["Energy Gel", "Sports Drink"];
    }

    // For shorter workouts, use fewer products
    if (workout.duration && workout.duration < 60) {
      return preferredProducts.slice(0, 2);
    }

    // For longer workouts, use more variety
    return preferredProducts;
  }

  /**
   * Generate a description of the progression strategy
   */
  private static generateProgressionStrategy(
    config: NutritionPlanConfig,
    weeksUntilRace: number,
  ): string {
    if (weeksUntilRace <= 4) {
      return "Short-term adaptation strategy: Focus on quickly adapting to your race nutrition by practicing with race-day products during key workouts.";
    } else if (weeksUntilRace <= 8) {
      return "Medium-term progression: Gradually increase nutrition intake over 8 weeks, starting at 50% of race-day targets and building to 100% for your longest training sessions.";
    } else {
      return "Long-term gut training: Methodical progression from baseline nutrition to race-day targets over multiple months, with specific focus on gut training during longer workouts.";
    }
  }

  /**
   * Generate recommendations based on the plan configuration
   */
  private static generateRecommendations(
    config: NutritionPlanConfig,
    weeksUntilRace: number,
  ): string[] {
    const recommendations: string[] = [
      "Practice your race-day nutrition strategy during your longest training sessions",
      "Gradually increase carbohydrate intake to train your gut tolerance",
      "Stay consistent with hydration across all training sessions",
    ];

    // Add specific recommendations based on time until race
    if (weeksUntilRace <= 4) {
      recommendations.push(
        "Focus on using exact race-day products in your final key workouts",
        "Don't introduce any new nutrition products in the final two weeks",
      );
    } else if (config.targetRaceCarbs > 60) {
      recommendations.push(
        "Your target carb intake is high - ensure you're training your gut to handle this load",
        "Consider adding specific gut training sessions with higher carb intake",
      );
    }

    return recommendations;
  }

  /**
   * Generate AI feedback based on user's workout feedback
   */
  static generateFeedback(
    workout: NutritionWorkout,
    userFeedback: string,
    rating: number,
  ): string {
    // In a real implementation, this would use an AI service
    // For now, we'll use simple logic based on the rating

    if (rating <= 2) {
      return "Based on your feedback, consider reducing your carbohydrate intake by 10-15% for your next similar workout. Try spacing out your nutrition intake more evenly throughout the session.";
    } else if (rating >= 4) {
      return "Your nutrition strategy seems to be working well. Consider gradually increasing your carbohydrate intake by 5-10% in your next workout to continue building gut tolerance.";
    } else {
      return "Your nutrition plan is on the right track. Make sure you're staying consistent with timing of intake. Consider testing different product combinations to find what works best for you.";
    }
  }
}
