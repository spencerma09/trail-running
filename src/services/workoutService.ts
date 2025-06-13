import { NutritionWorkout } from "@/components/NutritionTraining";

export interface WorkoutServiceConfig {
  provider: "trainingpeaks" | "garmin" | "none";
  authToken?: string;
}

export interface WorkoutData {
  id: string;
  date: Date;
  distance?: number; // in km
  duration?: number; // in minutes
  intensity?: "low" | "medium" | "high";
  type?: "run" | "bike" | "swim" | "other";
  elevationGain?: number; // in meters
}

/**
 * Service to fetch workout data from external providers like TrainingPeaks or Garmin Connect
 */
export class WorkoutService {
  private config: WorkoutServiceConfig;

  constructor(config: WorkoutServiceConfig) {
    this.config = config;
  }

  /**
   * Authenticate with the workout provider
   * @returns Promise<boolean> - Whether authentication was successful
   */
  async authenticate(): Promise<boolean> {
    // In a real implementation, this would use OAuth or another auth method
    // For now, we'll simulate a successful authentication if token exists
    if (this.config.provider === "none") return true;
    return !!this.config.authToken;
  }

  /**
   * Fetch workouts from the provider within a date range
   */
  async fetchWorkouts(startDate: Date, endDate: Date): Promise<WorkoutData[]> {
    // In a real implementation, this would call the provider's API
    if (this.config.provider === "none") {
      return this.generateMockWorkouts(startDate, endDate);
    }

    // For demo purposes, return mock data
    return this.generateMockWorkouts(startDate, endDate);
  }

  /**
   * Convert workout data to nutrition workouts
   */
  convertToNutritionWorkouts(workouts: WorkoutData[]): NutritionWorkout[] {
    return workouts.map((workout) => ({
      id: workout.id,
      date: workout.date,
      distance: workout.distance,
      duration: workout.duration,
      nutritionPlan: {
        // Default nutrition plan based on workout intensity and duration
        calories: this.calculateCalories(workout),
        fluid: this.calculateFluid(workout),
        carbs: this.calculateCarbs(workout),
        sodium: this.calculateSodium(workout),
        products: ["Energy Gel", "Sports Drink"],
      },
      completed: false,
    }));
  }

  /**
   * Generate mock workouts for testing or when no provider is selected
   */
  private generateMockWorkouts(startDate: Date, endDate: Date): WorkoutData[] {
    const workouts: WorkoutData[] = [];
    const daysBetween = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24),
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
        elevationGain: Math.round(Math.random() * 500),
      });
    }

    return workouts;
  }

  /**
   * Calculate recommended calories based on workout data
   */
  private calculateCalories(workout: WorkoutData): number {
    if (!workout.duration) return 200;

    // Base calculation on duration and intensity
    let caloriesPerHour = 200; // Default

    if (workout.intensity === "medium") caloriesPerHour = 250;
    if (workout.intensity === "high") caloriesPerHour = 300;

    // Adjust for longer workouts (metabolic efficiency)
    if (workout.duration > 90) caloriesPerHour -= 25;

    return Math.round(caloriesPerHour);
  }

  /**
   * Calculate recommended fluid intake based on workout data
   */
  private calculateFluid(workout: WorkoutData): number {
    if (!workout.duration) return 500;

    // Base calculation (ml per hour)
    let fluidPerHour = 500; // Default

    if (workout.intensity === "medium") fluidPerHour = 600;
    if (workout.intensity === "high") fluidPerHour = 700;

    return Math.round(fluidPerHour);
  }

  /**
   * Calculate recommended carbs based on workout data
   */
  private calculateCarbs(workout: WorkoutData): number {
    if (!workout.duration) return 40;

    // Base calculation (g per hour)
    let carbsPerHour = 40; // Default

    if (workout.intensity === "medium") carbsPerHour = 50;
    if (workout.intensity === "high") carbsPerHour = 60;

    // Adjust for longer workouts (train gut tolerance)
    if (workout.duration > 90) carbsPerHour += 10;

    return Math.round(carbsPerHour);
  }

  /**
   * Calculate recommended sodium based on workout data
   */
  private calculateSodium(workout: WorkoutData): number {
    if (!workout.duration) return 300;

    // Base calculation (mg per hour)
    let sodiumPerHour = 300; // Default

    if (workout.intensity === "medium") sodiumPerHour = 400;
    if (workout.intensity === "high") sodiumPerHour = 500;

    return Math.round(sodiumPerHour);
  }
}

// Export a singleton instance for convenience
export const workoutService = new WorkoutService({ provider: "none" });
