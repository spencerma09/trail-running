import { NutritionWorkout } from "@/components/NutritionTraining";

export interface FeedbackAnalysis {
  recommendations: string;
  adjustments: {
    calories?: number; // percentage change
    fluid?: number; // percentage change
    carbs?: number; // percentage change
    sodium?: number; // percentage change
    products?: string[]; // recommended products
  };
}

/**
 * Service to analyze user feedback on nutrition workouts and provide AI-powered recommendations
 */
export class AiFeedbackService {
  /**
   * Analyze user feedback and generate recommendations
   * @param workout The workout with user feedback
   * @param feedbackText User's text feedback
   * @param rating User's rating (1-5)
   * @returns Feedback analysis with recommendations
   */
  static analyzeFeedback(
    workout: NutritionWorkout,
    feedbackText: string,
    rating: number,
  ): FeedbackAnalysis {
    // In a real implementation, this would call an AI service
    // For now, we'll use simple logic based on the rating and keywords in feedback

    const analysis: FeedbackAnalysis = {
      recommendations: "",
      adjustments: {},
    };

    // Generate recommendations based on rating
    if (rating <= 2) {
      // Poor experience - reduce intake
      analysis.recommendations =
        this.generateLowRatingRecommendation(feedbackText);
      analysis.adjustments = {
        calories: -10,
        carbs: -15,
      };
    } else if (rating === 3) {
      // Neutral experience - minor adjustments
      analysis.recommendations =
        this.generateNeutralRatingRecommendation(feedbackText);
      // No adjustments by default
    } else {
      // Good experience - potentially increase for progression
      analysis.recommendations =
        this.generateHighRatingRecommendation(feedbackText);
      analysis.adjustments = {
        carbs: 5,
      };
    }

    // Check for specific issues in feedback text
    this.analyzeKeywords(feedbackText, analysis);

    return analysis;
  }

  /**
   * Generate recommendation for low rating (1-2)
   */
  private static generateLowRatingRecommendation(feedback: string): string {
    const recommendations = [
      "Based on your feedback, consider reducing your carbohydrate intake by 10-15% for your next similar workout.",
      "Try spacing out your nutrition intake more evenly throughout the session.",
      "Consider using more easily digestible carbohydrate sources for your next workout.",
    ];

    return recommendations.join(" ");
  }

  /**
   * Generate recommendation for neutral rating (3)
   */
  private static generateNeutralRatingRecommendation(feedback: string): string {
    const recommendations = [
      "Your nutrition plan is on the right track, but there's room for improvement.",
      "Make sure you're staying consistent with timing of intake.",
      "Consider testing different product combinations to find what works best for you.",
    ];

    return recommendations.join(" ");
  }

  /**
   * Generate recommendation for high rating (4-5)
   */
  private static generateHighRatingRecommendation(feedback: string): string {
    const recommendations = [
      "Your nutrition strategy seems to be working well.",
      "Consider gradually increasing your carbohydrate intake by 5-10% in your next workout to continue building gut tolerance.",
      "Keep using this successful approach for similar workouts.",
    ];

    return recommendations.join(" ");
  }

  /**
   * Analyze feedback text for specific keywords and adjust recommendations
   */
  private static analyzeKeywords(
    feedback: string,
    analysis: FeedbackAnalysis,
  ): void {
    const lowerFeedback = feedback.toLowerCase();

    // Check for GI distress
    if (
      lowerFeedback.includes("stomach") ||
      lowerFeedback.includes("gi") ||
      lowerFeedback.includes("nausea") ||
      lowerFeedback.includes("cramp") ||
      lowerFeedback.includes("bloat")
    ) {
      analysis.recommendations +=
        " Consider trying a different carbohydrate source or reducing concentration of your sports drink.";
      analysis.adjustments.carbs = -15;
    }

    // Check for dehydration
    if (
      lowerFeedback.includes("thirst") ||
      lowerFeedback.includes("dehydrat") ||
      lowerFeedback.includes("dry")
    ) {
      analysis.recommendations +=
        " Increase your fluid intake by 100-200ml per hour and consider adding electrolytes.";
      analysis.adjustments.fluid = 20;
      analysis.adjustments.sodium = 15;
    }

    // Check for bonking/low energy
    if (
      lowerFeedback.includes("bonk") ||
      lowerFeedback.includes("energy") ||
      lowerFeedback.includes("tired") ||
      lowerFeedback.includes("fatigue")
    ) {
      analysis.recommendations +=
        " Try increasing your carbohydrate intake earlier in your workout to maintain energy levels.";
      analysis.adjustments.carbs = 10;
      analysis.adjustments.calories = 10;
    }
  }

  /**
   * Apply feedback adjustments to create an updated nutrition plan
   */
  static applyAdjustments(
    workout: NutritionWorkout,
    adjustments: FeedbackAnalysis["adjustments"],
  ): NutritionWorkout {
    const updatedWorkout = { ...workout };
    const plan = { ...workout.nutritionPlan };

    // Apply percentage adjustments
    if (adjustments.calories) {
      plan.calories = Math.round(
        plan.calories * (1 + adjustments.calories / 100),
      );
    }

    if (adjustments.fluid) {
      plan.fluid = Math.round(plan.fluid * (1 + adjustments.fluid / 100));
    }

    if (adjustments.carbs) {
      plan.carbs = Math.round(plan.carbs * (1 + adjustments.carbs / 100));
    }

    if (adjustments.sodium) {
      plan.sodium = Math.round(plan.sodium * (1 + adjustments.sodium / 100));
    }

    // Update products if provided
    if (adjustments.products) {
      plan.products = [...adjustments.products];
    }

    updatedWorkout.nutritionPlan = plan;
    return updatedWorkout;
  }
}
