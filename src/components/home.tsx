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
          <h1 className="text-3xl font-bold">Ultra Runner Planner</h1>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {darkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </Button>
        </header>

        <main>
          {currentStep === "race-details" && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Step 1: Race Details
              </h2>
              <RaceProfileForm onSubmit={handleRaceProfileSubmit} />
            </section>
          )}

          {currentStep === "nutrition" && raceProfile && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Step 2: Nutrition Planning
              </h2>
              <NutritionSliders
                estimatedTime={parseEstimatedTimeToHours(
                  raceProfile.estimatedTime,
                )}
                onNext={handleNutritionNext}
                onBack={handleBack}
              />
            </section>
          )}

          {currentStep === "aid-stations" && raceProfile && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Step 3: Aid Stations
              </h2>
              <AidStationInput
                unitPreferences={raceProfile.unitPreferences}
                onNext={handleAidStationsNext}
                onBack={handleBack}
              />
            </section>
          )}

          {currentStep === "review" && raceProfile && nutritionPlan && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Step 4: Review Aid Stations
              </h2>
              <AidStationCarousel
                aidStations={aidStations}
                nutritionPlan={nutritionPlan}
                totalDistance={parseFloat(raceProfile.distance)}
                totalTime={parseEstimatedTimeToHours(raceProfile.estimatedTime)}
                unitPreferences={raceProfile.unitPreferences}
                onNext={handleReviewNext}
                onBack={handleBack}
              />
            </section>
          )}

          {currentStep === "report" && raceProfile && nutritionPlan && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">
                Step 5: Race Plan Report
              </h2>
              <ReportGenerator
                raceProfile={raceProfile}
                nutritionPlan={nutritionPlan}
                aidStations={finalAidStations}
                onBack={handleBack}
                onStartOver={handleStartOver}
              />
            </section>
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
