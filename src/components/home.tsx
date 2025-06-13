import React, { useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import RaceProfileForm, {
  RaceProfile as RaceProfileType,
} from "./RaceProfileForm";
import PlanningDashboard from "./PlanningDashboard";
import { UnitPreferences } from "@/lib/utils";

interface RaceProfile {
  raceName: string;
  distance: number;
  elevationGain: number;
  estimatedTime: string;
  aidStations: { name: string; distance: number; elevation?: number }[];
  unitPreferences: UnitPreferences;
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [raceProfile, setRaceProfile] = useState<RaceProfile | null>(null);
  const [activeTab, setActiveTab] = useState("nutrition");

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleRaceProfileSubmit = (profile: RaceProfileType) => {
    // Convert string values to numbers where needed
    const parsedProfile: RaceProfile = {
      raceName: profile.raceName,
      distance: parseFloat(profile.distance) || 0,
      elevationGain: parseFloat(profile.elevationGain) || 0,
      estimatedTime: profile.estimatedTime,
      unitPreferences: profile.unitPreferences,
      aidStations: profile.aidStations.map((station) => ({
        name: station.name || "Unnamed Station",
        distance: parseFloat(station.distance) || 0,
        elevation: parseFloat(station.elevation) || 0,
      })),
    };

    setRaceProfile(parsedProfile);
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
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Race Profile</h2>
            <RaceProfileForm onSubmit={handleRaceProfileSubmit} />
          </section>

          {raceProfile && (
            <section>
              <h2 className="text-2xl font-semibold mb-4">
                Planning Dashboard
              </h2>
              <div className="bg-card rounded-lg shadow-md p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-6">
                    <TabsTrigger value="nutrition">
                      Nutrition Calculator
                    </TabsTrigger>
                    <TabsTrigger value="gear">Gear Checklist</TabsTrigger>
                    <TabsTrigger value="watch">Watch Integration</TabsTrigger>
                  </TabsList>
                  <PlanningDashboard
                    raceDetails={{
                      distance: raceProfile.distance,
                      elevationGain: raceProfile.elevationGain,
                      estimatedTime: raceProfile.estimatedTime,
                      aidStations: raceProfile.aidStations,
                      unitPreferences: raceProfile.unitPreferences,
                    }}
                  />
                </Tabs>
              </div>
            </section>
          )}

          {!raceProfile && (
            <div className="bg-card rounded-lg shadow-md p-6 text-center">
              <p className="text-muted-foreground">
                Enter your race details above to generate a personalized plan.
              </p>
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
