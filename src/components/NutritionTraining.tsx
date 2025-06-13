import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AiNutritionPlanner } from "@/utils/aiNutritionPlanner";
import { workoutService } from "@/services/workoutService";
import { AiFeedbackService } from "@/services/aiFeedbackService";
import { NutritionTrainingStorage } from "@/lib/supabase";

interface NutritionTrainingProps {
  raceDate?: Date;
  preferredNutrition?: string[];
  onSave?: (trainingPlan: NutritionTrainingPlan) => void;
}

export interface NutritionTrainingPlan {
  raceDate: Date;
  startDate: Date;
  preferredNutrition: string[];
  workouts: NutritionWorkout[];
}

export interface NutritionWorkout {
  id: string;
  date: Date;
  distance?: number;
  duration?: number;
  nutritionPlan: {
    calories: number;
    fluid: number;
    carbs: number;
    sodium: number;
    products: string[];
  };
  completed: boolean;
  feedback?: {
    rating: number;
    comments: string;
    aiRecommendations?: string;
    implemented: boolean;
    adjustments?: {
      calories?: number; // percentage change
      fluid?: number; // percentage change
      carbs?: number; // percentage change
      sodium?: number; // percentage change
      products?: string[];
    };
  };
}

const NutritionTraining: React.FC<NutritionTrainingProps> = ({
  raceDate = new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000), // Default to 12 weeks from now
  preferredNutrition = [],
  onSave = () => {},
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [selectedRaceDate, setSelectedRaceDate] = useState<Date>(raceDate);
  const [activeTab, setActiveTab] = useState("setup");
  const [nutritionProducts, setNutritionProducts] = useState<string[]>(
    preferredNutrition.length > 0
      ? preferredNutrition
      : ["Energy Gel", "Sports Drink", "Energy Bar"],
  );
  const [customProduct, setCustomProduct] = useState("");
  const [integration, setIntegration] = useState<string | undefined>();
  const [generatedPlan, setGeneratedPlan] =
    useState<NutritionTrainingPlan | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(3);
  const [feedbackComments, setFeedbackComments] = useState<string>("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] =
    useState<boolean>(false);
  const [aiRecommendations, setAiRecommendations] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [progressionStrategy, setProgressionStrategy] = useState<string>("");

  // Sample workout data (would come from API in real implementation)
  const sampleWorkouts: NutritionWorkout[] = [
    {
      id: "1",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      distance: 10,
      duration: 60,
      nutritionPlan: {
        calories: 200,
        fluid: 500,
        carbs: 50,
        sodium: 300,
        products: ["Energy Gel", "Sports Drink"],
      },
      completed: false,
    },
    {
      id: "2",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      distance: 15,
      duration: 90,
      nutritionPlan: {
        calories: 300,
        fluid: 750,
        carbs: 75,
        sodium: 450,
        products: ["Energy Gel", "Sports Drink", "Energy Bar"],
      },
      completed: false,
    },
    {
      id: "3",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Past workout
      distance: 12,
      duration: 75,
      nutritionPlan: {
        calories: 250,
        fluid: 600,
        carbs: 60,
        sodium: 350,
        products: ["Energy Gel", "Sports Drink"],
      },
      completed: true,
      feedback: {
        rating: 4,
        comments:
          "Felt good overall, but had some minor stomach discomfort around 10km.",
        aiRecommendations:
          "Consider spacing out your nutrition intake more evenly. Try taking smaller amounts more frequently.",
        implemented: false,
        adjustments: {
          carbs: -5,
          fluid: 10,
        },
      },
    },
  ];

  const handleAddProduct = () => {
    if (customProduct && !nutritionProducts.includes(customProduct)) {
      setNutritionProducts([...nutritionProducts, customProduct]);
      setCustomProduct("");
    }
  };

  const handleGeneratePlan = async () => {
    setIsLoading(true);
    try {
      // If integration is set, fetch workouts from the provider
      let workouts = [];

      if (integration === "trainingpeaks" || integration === "garmin") {
        // Configure workout service with the selected provider
        const config = {
          provider: integration as "trainingpeaks" | "garmin" | "none",
          // In a real implementation, we would get the auth token from the OAuth flow
          authToken: "mock-token",
        };

        // Authenticate with the provider
        await workoutService.authenticate();

        // Fetch workouts from the provider
        const fetchedWorkouts = await workoutService.fetchWorkouts(
          startDate,
          selectedRaceDate,
        );
        workouts = workoutService.convertToNutritionWorkouts(fetchedWorkouts);
      } else {
        // Generate AI-based plan
        const nutritionPlanConfig = {
          startDate,
          raceDate: selectedRaceDate,
          preferredProducts: nutritionProducts,
          targetRaceCalories: 300, // Default values - in a real app these would come from the nutrition calculator
          targetRaceFluid: 750,
          targetRaceCarbs: 75,
          targetRaceSodium: 450,
        };

        const aiPlan = AiNutritionPlanner.generatePlan(nutritionPlanConfig);
        workouts = aiPlan.workouts;
        setRecommendations(aiPlan.recommendations);
        setProgressionStrategy(aiPlan.progressionStrategy);
      }

      // Create the plan
      const plan: NutritionTrainingPlan = {
        raceDate: selectedRaceDate,
        startDate,
        preferredNutrition: nutritionProducts,
        workouts: workouts.length > 0 ? workouts : sampleWorkouts, // Fallback to sample workouts if none generated
      };

      // Save the plan (in a real implementation, this would save to the database)
      // const planId = await NutritionTrainingStorage.saveTrainingPlan('current-user-id', plan);

      setGeneratedPlan(plan);
      setActiveTab("plan");
      onSave(plan);
    } catch (error) {
      console.error("Error generating plan:", error);
      setError("Failed to generate nutrition training plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsCompleted = async (workoutId: string) => {
    if (!generatedPlan) return;

    try {
      const updatedWorkouts = generatedPlan.workouts.map((workout) =>
        workout.id === workoutId ? { ...workout, completed: true } : workout,
      );

      setGeneratedPlan({
        ...generatedPlan,
        workouts: updatedWorkouts,
      });

      // In a real implementation, this would save to the database
      // await NutritionTrainingStorage.markWorkoutCompleted('current-user-id', 'plan-id', workoutId);
    } catch (error) {
      console.error("Error marking workout as completed:", error);
      setError("Failed to mark workout as completed. Please try again.");
    }
  };

  const handleOpenFeedback = (workoutId: string) => {
    setSelectedWorkout(workoutId);
    const workout = generatedPlan?.workouts.find((w) => w.id === workoutId);
    if (workout?.feedback) {
      setFeedbackRating(workout.feedback.rating);
      setFeedbackComments(workout.feedback.comments);
    } else {
      setFeedbackRating(3);
      setFeedbackComments("");
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedWorkout || !generatedPlan) return;

    setIsSubmittingFeedback(true);

    try {
      // Find the workout
      const workout = generatedPlan.workouts.find(
        (w) => w.id === selectedWorkout,
      );
      if (!workout) return;

      // Use the AI Feedback Service to analyze the feedback
      const analysis = AiFeedbackService.analyzeFeedback(
        workout,
        feedbackComments,
        feedbackRating,
      );

      // Set the recommendations for display
      setAiRecommendations(analysis.recommendations);

      // Update the workout with feedback
      const updatedWorkouts = generatedPlan.workouts.map((w) =>
        w.id === selectedWorkout
          ? {
              ...w,
              feedback: {
                rating: feedbackRating,
                comments: feedbackComments,
                aiRecommendations: analysis.recommendations,
                implemented: false,
                adjustments: analysis.adjustments,
              },
            }
          : w,
      );

      setGeneratedPlan({
        ...generatedPlan,
        workouts: updatedWorkouts,
      });

      // In a real implementation, this would save to the database
      // await NutritionTrainingStorage.updateWorkoutFeedback(
      //   'current-user-id',
      //   'plan-id',
      //   selectedWorkout,
      //   updatedWorkouts.find(w => w.id === selectedWorkout)?.feedback
      // );
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setError("Failed to analyze feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleImplementRecommendations = async (workoutId: string) => {
    if (!generatedPlan) return;

    try {
      // Find the workout with feedback
      const workout = generatedPlan.workouts.find((w) => w.id === workoutId);
      if (!workout?.feedback?.adjustments) return;

      // Apply the adjustments to future workouts
      const currentDate = new Date();
      const updatedWorkouts = generatedPlan.workouts.map((w) => {
        // Only update future workouts
        if (w.date > currentDate && !w.completed) {
          // Apply the adjustments to the nutrition plan
          const updatedWorkout = AiFeedbackService.applyAdjustments(
            w,
            workout.feedback!.adjustments!,
          );
          return updatedWorkout;
        }
        // Mark the current workout's feedback as implemented
        if (w.id === workoutId && w.feedback) {
          return {
            ...w,
            feedback: {
              ...w.feedback,
              implemented: true,
            },
          };
        }
        return w;
      });

      setGeneratedPlan({
        ...generatedPlan,
        workouts: updatedWorkouts,
      });

      // In a real implementation, this would save to the database and update future workouts
      // await NutritionTrainingStorage.updateWorkoutFeedback(
      //   'current-user-id',
      //   'plan-id',
      //   workoutId,
      //   updatedWorkouts.find(w => w.id === workoutId)?.feedback
      // );
    } catch (error) {
      console.error("Error implementing recommendations:", error);
      setError("Failed to implement recommendations. Please try again.");
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle>Nutrition Training</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="plan">Training Plan</TabsTrigger>
            <TabsTrigger value="feedback">Feedback & Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="raceDate">Race Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedRaceDate ? (
                        format(selectedRaceDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedRaceDate}
                      onSelect={(date) => date && setSelectedRaceDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">
                  Preferred Nutrition
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom product"
                    value={customProduct}
                    onChange={(e) => setCustomProduct(e.target.value)}
                    className="w-48"
                  />
                  <Button onClick={handleAddProduct} variant="outline">
                    Add
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {nutritionProducts.map((product, index) => (
                  <div
                    key={index}
                    className="bg-muted px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {product}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-medium">
                Training Data Integration
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant={
                    integration === "trainingpeaks" ? "default" : "outline"
                  }
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => setIntegration("trainingpeaks")}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold">TP</span>
                  </div>
                  <span>TrainingPeaks</span>
                </Button>

                <Button
                  variant={integration === "garmin" ? "default" : "outline"}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => setIntegration("garmin")}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold">G</span>
                  </div>
                  <span>Garmin Connect</span>
                </Button>

                <Button
                  variant={integration === "none" ? "default" : "outline"}
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={() => setIntegration("none")}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold">AI</span>
                  </div>
                  <span>AI Generated</span>
                </Button>
              </div>

              {integration && (
                <div className="mt-4">
                  {integration !== "none" ? (
                    <Button className="w-full">
                      Connect to{" "}
                      {integration === "trainingpeaks"
                        ? "TrainingPeaks"
                        : "Garmin Connect"}
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      AI will generate a training plan based on your race date
                      and preferences.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              {error && (
                <div className="text-red-500 text-sm mr-4">{error}</div>
              )}
              <Button onClick={handleGeneratePlan} disabled={isLoading}>
                {isLoading
                  ? "Generating..."
                  : "Generate Nutrition Training Plan"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="plan" className="space-y-6">
            {generatedPlan ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Training Period</h3>
                    <p>
                      {format(generatedPlan.startDate, "PPP")} to{" "}
                      {format(generatedPlan.raceDate, "PPP")}
                    </p>
                  </div>

                  {progressionStrategy && (
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Progression Strategy</h3>
                      <p className="text-sm">{progressionStrategy}</p>
                    </div>
                  )}

                  {recommendations && recommendations.length > 0 && (
                    <div className="bg-card border p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Recommendations</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Upcoming Workouts</h3>
                  {generatedPlan.workouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">
                          {format(workout.date, "EEEE, MMMM d")}
                        </h4>
                        <span
                          className={cn(
                            "px-2 py-1 rounded-full text-xs",
                            workout.completed
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800",
                          )}
                        >
                          {workout.completed ? "Completed" : "Upcoming"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Distance:
                          </span>{" "}
                          {workout.distance} km
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Duration:
                          </span>{" "}
                          {workout.duration} min
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Calories:
                          </span>{" "}
                          {workout.nutritionPlan.calories} cal/hr
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fluid:</span>{" "}
                          {workout.nutritionPlan.fluid} ml/hr
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">Products:</span>{" "}
                        {workout.nutritionPlan.products.join(", ")}
                      </div>

                      {!workout.completed && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsCompleted(workout.id)}
                        >
                          Mark as Completed
                        </Button>
                      )}

                      {workout.completed && workout.feedback && (
                        <div className="bg-muted p-3 rounded-md text-sm">
                          <div className="font-medium">Your Feedback:</div>
                          <p>{workout.feedback.comments}</p>
                          {workout.feedback.aiRecommendations && (
                            <div className="mt-2">
                              <div className="font-medium">
                                AI Recommendations:
                              </div>
                              <p>{workout.feedback.aiRecommendations}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No nutrition training plan generated yet. Please set up your
                  preferences and generate a plan.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("setup")}
                  className="mt-4"
                >
                  Go to Setup
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            {generatedPlan &&
            generatedPlan.workouts.some((w) => w.completed) ? (
              <div className="space-y-6">
                <h3 className="font-medium text-lg">Completed Workouts</h3>

                {generatedPlan.workouts
                  .filter((workout) => workout.completed)
                  .map((workout) => (
                    <div
                      key={workout.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">
                          {format(workout.date, "EEEE, MMMM d")}
                        </h4>
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            Distance:
                          </span>{" "}
                          {workout.distance} km
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Duration:
                          </span>{" "}
                          {workout.duration} min
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Calories:
                          </span>{" "}
                          {workout.nutritionPlan.calories} cal/hr
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fluid:</span>{" "}
                          {workout.nutritionPlan.fluid} ml/hr
                        </div>
                      </div>

                      {workout.feedback ? (
                        <div className="space-y-3">
                          <div className="bg-muted p-3 rounded-md">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">Your Feedback:</div>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-4 h-4 rounded-full mx-0.5 ${i < workout.feedback!.rating ? "bg-primary" : "bg-muted-foreground/20"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm mt-1">
                              {workout.feedback.comments}
                            </p>
                          </div>

                          {workout.feedback.aiRecommendations && (
                            <div className="bg-primary/10 p-3 rounded-md">
                              <div className="font-medium flex items-center">
                                <Info className="h-4 w-4 mr-2" />
                                AI Recommendations:
                              </div>
                              <p className="text-sm mt-1">
                                {workout.feedback.aiRecommendations}
                              </p>

                              {workout.feedback.adjustments && (
                                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                  {workout.feedback.adjustments.calories !==
                                    undefined && (
                                    <div
                                      className={`flex items-center ${workout.feedback.adjustments.calories >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                      Calories:{" "}
                                      {workout.feedback.adjustments.calories > 0
                                        ? "+"
                                        : ""}
                                      {workout.feedback.adjustments.calories}%
                                    </div>
                                  )}
                                  {workout.feedback.adjustments.fluid !==
                                    undefined && (
                                    <div
                                      className={`flex items-center ${workout.feedback.adjustments.fluid >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                      Fluid:{" "}
                                      {workout.feedback.adjustments.fluid > 0
                                        ? "+"
                                        : ""}
                                      {workout.feedback.adjustments.fluid}%
                                    </div>
                                  )}
                                  {workout.feedback.adjustments.carbs !==
                                    undefined && (
                                    <div
                                      className={`flex items-center ${workout.feedback.adjustments.carbs >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                      Carbs:{" "}
                                      {workout.feedback.adjustments.carbs > 0
                                        ? "+"
                                        : ""}
                                      {workout.feedback.adjustments.carbs}%
                                    </div>
                                  )}
                                  {workout.feedback.adjustments.sodium !==
                                    undefined && (
                                    <div
                                      className={`flex items-center ${workout.feedback.adjustments.sodium >= 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                      Sodium:{" "}
                                      {workout.feedback.adjustments.sodium > 0
                                        ? "+"
                                        : ""}
                                      {workout.feedback.adjustments.sodium}%
                                    </div>
                                  )}
                                </div>
                              )}

                              {!workout.feedback.implemented && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() =>
                                    handleImplementRecommendations(workout.id)
                                  }
                                >
                                  Apply to Future Workouts
                                </Button>
                              )}

                              {workout.feedback.implemented && (
                                <div className="mt-2 text-xs text-green-600 flex items-center">
                                  <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-1"></span>
                                  Applied to future workouts
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenFeedback(workout.id)}
                          >
                            Add Feedback
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}

                {selectedWorkout &&
                  !generatedPlan.workouts.find((w) => w.id === selectedWorkout)
                    ?.feedback && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <h3 className="font-medium">Add Workout Feedback</h3>

                      <div className="space-y-2">
                        <Label>How did your nutrition strategy work?</Label>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Poor
                          </span>
                          <div className="flex items-center gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-6 h-6 rounded-full cursor-pointer flex items-center justify-center ${i < feedbackRating ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                                onClick={() => setFeedbackRating(i + 1)}
                              >
                                {i + 1}
                              </div>
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Great
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feedback">Comments</Label>
                        <textarea
                          id="feedback"
                          className="w-full min-h-[100px] p-2 rounded-md border border-input bg-background"
                          placeholder="Describe how you felt during the workout, any GI issues, energy levels, etc."
                          value={feedbackComments}
                          onChange={(e) => setFeedbackComments(e.target.value)}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedWorkout(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitFeedback}
                          disabled={isSubmittingFeedback}
                        >
                          {isSubmittingFeedback
                            ? "Analyzing..."
                            : "Submit Feedback"}
                        </Button>
                      </div>

                      {aiRecommendations && (
                        <div className="bg-primary/10 p-3 rounded-md mt-4">
                          <div className="font-medium flex items-center">
                            <Info className="h-4 w-4 mr-2" />
                            AI Recommendations:
                          </div>
                          <p className="text-sm mt-1">{aiRecommendations}</p>
                        </div>
                      )}
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Complete workouts in your training plan to provide feedback
                  and receive AI recommendations.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("plan")}
                  className="mt-4"
                >
                  View Training Plan
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NutritionTraining;
