import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Printer, Moon, Sun } from "lucide-react";
import NutritionCalculator from "./NutritionCalculator";
import GearChecklist from "./GearChecklist";
import NutritionTraining from "./NutritionTraining";

import { UnitPreferences, formatDistance, formatElevation } from "@/lib/utils";

interface RaceDetails {
  distance: number;
  elevationGain: number;
  estimatedTime: string;
  aidStations: Array<{ name: string; distance: number; elevation?: number }>;
  unitPreferences: UnitPreferences;
}

interface PlanningDashboardProps {
  raceDetails?: RaceDetails;
  preloadedAidStations?: any[];
  preloadedNutritionPlan?: any;
}

// Helper function to parse HH:MM:SS to hours as a number
const parseEstimatedTimeToHours = (timeString: string): number => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  return hours + minutes / 60 + seconds / 3600;
};

const PlanningDashboard: React.FC<PlanningDashboardProps> = ({
  raceDetails = {
    distance: 50,
    elevationGain: 18000,
    estimatedTime: "10:00:00",
    aidStations: [
      { name: "Aid Station 1", distance: 10 },
      { name: "Aid Station 2", distance: 20 },
      { name: "Aid Station 3", distance: 35 },
      { name: "Aid Station 4", distance: 45 },
    ],
    unitPreferences: {
      distance: "metric",
      elevation: "imperial",
      fluid: "metric",
      weight: "metric",
    },
  },
  preloadedAidStations,
  preloadedNutritionPlan,
}) => {
  const [activeTab, setActiveTab] = useState("nutrition");
  const [darkMode, setDarkMode] = useState(false);
  const [savedAidStations, setSavedAidStations] = useState<any[] | null>(
    preloadedAidStations || null,
  );
  const [savedNutritionPlan, setSavedNutritionPlan] = useState<any | null>(
    preloadedNutritionPlan || null,
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // In a real implementation, this would toggle a class on the body or use a theme context
  };

  const handleExport = (type: "pdf" | "print" | "share") => {
    // Placeholder for export functionality
    console.log(`Exporting as ${type}`);
  };

  return (
    <Card className={`w-full p-6 bg-background ${darkMode ? "dark" : ""}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Race Planning Dashboard</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("pdf")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("print")}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("share")}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Distance</p>
            <h3 className="text-2xl font-bold">
              {formatDistance(
                raceDetails.distance,
                raceDetails.unitPreferences.distance,
              )}
            </h3>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Elevation Gain</p>
            <h3 className="text-2xl font-bold">
              {formatElevation(
                raceDetails.elevationGain,
                raceDetails.unitPreferences.elevation,
              )}
            </h3>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Estimated Time</p>
            <h3 className="text-2xl font-bold">{raceDetails.estimatedTime}</h3>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">Aid Stations</p>
            <h3 className="text-2xl font-bold">
              {raceDetails.aidStations.length}
            </h3>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue="nutrition"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="nutrition">Nutrition Calculator</TabsTrigger>
          <TabsTrigger value="gear">Gear Checklist</TabsTrigger>
          <TabsTrigger value="training">Nutrition Training</TabsTrigger>
          <TabsTrigger value="watch">Watch Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="nutrition" className="mt-4">
          <NutritionCalculator
            raceDistance={raceDetails.distance}
            elevationGain={raceDetails.elevationGain}
            estimatedTime={parseEstimatedTimeToHours(raceDetails.estimatedTime)}
            aidStations={savedAidStations || raceDetails.aidStations}
            unitPreferences={raceDetails.unitPreferences}
            onNutritionPlanChange={setSavedNutritionPlan}
            preloadedNutritionPlan={savedNutritionPlan}
          />
        </TabsContent>

        <TabsContent value="gear" className="mt-4">
          <GearChecklist
            raceDistance={raceDetails.distance}
            elevationGain={raceDetails.elevationGain}
            estimatedTime={parseEstimatedTimeToHours(raceDetails.estimatedTime)}
            unitPreferences={raceDetails.unitPreferences}
            aidStations={savedAidStations || raceDetails.aidStations}
          />
        </TabsContent>

        <TabsContent value="training" className="mt-4">
          <NutritionTraining
            raceDate={new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000)}
            preferredNutrition={["Energy Gel", "Sports Drink", "Energy Bar"]}
          />
        </TabsContent>

        <TabsContent value="watch" className="mt-4">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-semibold mb-4">Watch Integration</h3>

            <div className="mb-6">
              <p className="text-muted-foreground mb-4">
                Generate nutrition reminders for your watch. Select your device
                type to create a compatible file.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold">G</span>
                  </div>
                  <span>Garmin</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold">A</span>
                  </div>
                  <span>Apple Watch</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-bold">O</span>
                  </div>
                  <span>Other</span>
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download GPX File
                </Button>
                <Button variant="outline" className="flex-1">
                  Sync Directly to Device
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PlanningDashboard;
