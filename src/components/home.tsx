import React, { useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import RaceProfileForm, {
  RaceProfile as RaceProfileType,
} from "./RaceProfileForm";
import NutritionSliders, { NutritionPlan } from "./NutritionSliders";
import AidStationInput from "./AidStationInput";
import AidStationCarousel from "./AidStationCarousel";
import ReportGenerator from "./ReportGenerator";
import { UnitPreferences } from "@/lib/utils";

interface AidStation {
  id: string;
  name: string;
  distance: number;
  elevation?: number;
}

interface AidStationWithTiming extends AidStation {
  estimatedTime: number;
  nutritionNeeded: {
    carbs: number;
    sodium: number;
    water: number;
  };
}

type Step = "race-details" | "nutrition" | "aid-stations" | "review" | "report";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("race-details");
  const [raceProfile, setRaceProfile] = useState<RaceProfileType | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(
    null,
  );
  const [aidStations, setAidStations] = useState<AidStation[]>([]);
  const [finalAidStations, setFinalAidStations] = useState<
    AidStationWithTiming[]
  >([]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const parseEstimatedTimeToHours = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours + minutes / 60 + seconds / 3600;
  };

  const handleRaceProfileSubmit = (profile: RaceProfileType) => {
    setRaceProfile(profile);
    setCurrentStep("nutrition");
  };

  const handleNutritionNext = (nutrition: NutritionPlan) => {
    setNutritionPlan(nutrition);
    setCurrentStep("aid-stations");
  };

  const handleAidStationsNext = (stations: AidStation[]) => {
    setAidStations(stations);
    setCurrentStep("review");
  };

  const handleReviewNext = (stationsWithTiming: AidStationWithTiming[]) => {
    setFinalAidStations(stationsWithTiming);
    setCurrentStep("report");
  };

  const handleStartOver = () => {
    setCurrentStep("race-details");
    setRaceProfile(null);
    setNutritionPlan(null);
    setAidStations([]);
    setFinalAidStations([]);
  };

  const handleBack = () => {
    switch (currentStep) {
      case "nutrition":
        setCurrentStep("race-details");
        break;
      case "aid-stations":
        setCurrentStep("nutrition");
        break;
      case "review":
        setCurrentStep("aid-stations");
        break;
      case "report":
        setCurrentStep("review");
        break;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${darkMode ? "dark" : ""}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Ultra Runner Planner</h1>
            {/* Progress indicator */}
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className={
                  currentStep === "race-details"
                    ? "text-primary font-medium"
                    : ""
                }
              >
                1. Race Details
              </span>
              <span>→</span>
              <span
                className={
                  currentStep === "nutrition" ? "text-primary font-medium" : ""
                }
              >
                2. Nutrition
              </span>
              <span>→</span>
              <span
                className={
                  currentStep === "aid-stations"
                    ? "text-primary font-medium"
                    : ""
                }
              >
                3. Aid Stations
              </span>
              <span>→</span>
              <span
                className={
                  currentStep === "review" ? "text-primary font-medium" : ""
                }
              >
                4. Review
              </span>
              <span>→</span>
              <span
                className={
                  currentStep === "report" ? "text-primary font-medium" : ""
                }
              >
                5. Report
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
        </header>

        <main className="max-w-4xl mx-auto">
          {currentStep === "race-details" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Step 1: Race Details
                </h2>
                <p className="text-muted-foreground">
                  Enter your race information to get started with your
                  personalized plan
                </p>
              </div>
              <RaceProfileForm onSubmit={handleRaceProfileSubmit} />
            </div>
          )}

          {currentStep === "nutrition" && raceProfile && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Step 2: Nutrition Planning
                </h2>
                <p className="text-muted-foreground">
                  Set your target nutrition intake based on your race duration
                </p>
              </div>
              <NutritionSliders
                estimatedTime={parseEstimatedTimeToHours(
                  raceProfile.estimatedTime,
                )}
                onNext={handleNutritionNext}
                onBack={handleBack}
              />
            </div>
          )}

          {currentStep === "aid-stations" && raceProfile && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Step 3: Aid Stations
                </h2>
                <p className="text-muted-foreground">
                  Define your aid station locations and distances
                </p>
              </div>
              <AidStationInput
                unitPreferences={raceProfile.unitPreferences}
                onNext={handleAidStationsNext}
                onBack={handleBack}
              />
            </div>
          )}

          {currentStep === "review" && raceProfile && nutritionPlan && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Step 4: Review Aid Stations
                </h2>
                <p className="text-muted-foreground">
                  Fine-tune timing and nutrition for each aid station
                </p>
              </div>
              <AidStationCarousel
                aidStations={aidStations}
                nutritionPlan={nutritionPlan}
                totalDistance={parseFloat(raceProfile.distance)}
                totalTime={parseEstimatedTimeToHours(raceProfile.estimatedTime)}
                unitPreferences={raceProfile.unitPreferences}
                onNext={handleReviewNext}
                onBack={handleBack}
              />
            </div>
          )}

          {currentStep === "report" && raceProfile && nutritionPlan && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Step 5: Race Plan Report
                </h2>
                <p className="text-muted-foreground">
                  Your complete race strategy is ready
                </p>
              </div>
              <ReportGenerator
                raceProfile={raceProfile}
                nutritionPlan={nutritionPlan}
                aidStations={finalAidStations}
                onBack={handleBack}
                onStartOver={handleStartOver}
              />
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Ultra Runner Planner. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
