import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { NutritionPlan } from "./NutritionSliders";
import { UnitPreferences, formatDistance } from "@/lib/utils";

interface AidStation {
  id: string;
  name: string;
  distance: number;
  elevation?: number;
}

interface AidStationWithTiming extends AidStation {
  estimatedTime: number; // hours from start
  nutritionNeeded: {
    carbs: number;
    sodium: number;
    water: number;
  };
}

interface AidStationCarouselProps {
  aidStations: AidStation[];
  nutritionPlan: NutritionPlan;
  totalDistance: number;
  totalTime: number;
  unitPreferences: UnitPreferences;
  onNext: (stationsWithTiming: AidStationWithTiming[]) => void;
  onBack: () => void;
}

const AidStationCarousel: React.FC<AidStationCarouselProps> = ({
  aidStations,
  nutritionPlan,
  totalDistance,
  totalTime,
  unitPreferences,
  onNext,
  onBack,
}) => {
  const [currentStationIndex, setCurrentStationIndex] = useState(0);

  // Calculate initial timing and nutrition for each station
  const [stationsWithTiming, setStationsWithTiming] = useState<
    AidStationWithTiming[]
  >(() => {
    return aidStations.map((station, index) => {
      // Calculate estimated time based on distance progression
      const estimatedTime = (station.distance / totalDistance) * totalTime;

      // Calculate nutrition needed until next station (or finish)
      const nextStation = aidStations[index + 1];
      const distanceToNext = nextStation
        ? nextStation.distance - station.distance
        : 0;
      const timeToNext = nextStation
        ? (distanceToNext / totalDistance) * totalTime
        : 0;

      return {
        ...station,
        estimatedTime,
        nutritionNeeded: {
          carbs: Math.round(nutritionPlan.carbsPerHour * timeToNext),
          sodium: Math.round(nutritionPlan.sodiumPerHour * timeToNext),
          water: Math.round(nutritionPlan.waterPerHour * timeToNext),
        },
      };
    });
  });

  const currentStation = stationsWithTiming[currentStationIndex];

  const updateStationTiming = (field: "estimatedTime", value: number) => {
    setStationsWithTiming((prev) =>
      prev.map((station, index) =>
        index === currentStationIndex
          ? { ...station, [field]: value }
          : station,
      ),
    );
  };

  const updateStationNutrition = (
    field: keyof AidStationWithTiming["nutritionNeeded"],
    value: number,
  ) => {
    setStationsWithTiming((prev) =>
      prev.map((station, index) =>
        index === currentStationIndex
          ? {
              ...station,
              nutritionNeeded: {
                ...station.nutritionNeeded,
                [field]: value,
              },
            }
          : station,
      ),
    );
  };

  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const nextStation = () => {
    if (currentStationIndex < stationsWithTiming.length - 1) {
      setCurrentStationIndex(currentStationIndex + 1);
    }
  };

  const prevStation = () => {
    if (currentStationIndex > 0) {
      setCurrentStationIndex(currentStationIndex - 1);
    }
  };

  const handleNext = () => {
    onNext(stationsWithTiming);
  };

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Aid Station Review</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevStation}
              disabled={currentStationIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentStationIndex + 1} of {stationsWithTiming.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextStation}
              disabled={currentStationIndex === stationsWithTiming.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
        <p className="text-muted-foreground">
          Review and adjust estimated completion times and nutrition needs for
          each aid station.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">{currentStation.name}</h3>
          <div className="flex items-center justify-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>
                {formatDistance(
                  currentStation.distance,
                  unitPreferences.distance,
                )}
              </span>
            </div>
            {currentStation.elevation && (
              <div className="flex items-center gap-1">
                <span>📏</span>
                <span>
                  {unitPreferences.elevation === "metric"
                    ? `${Math.round(currentStation.elevation)}m`
                    : `${Math.round(currentStation.elevation)}ft`}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Estimated Arrival Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="estimated-time">Hours from start</Label>
                <Input
                  id="estimated-time"
                  type="number"
                  step="0.1"
                  value={currentStation.estimatedTime.toFixed(1)}
                  onChange={(e) =>
                    updateStationTiming(
                      "estimatedTime",
                      parseFloat(e.target.value) || 0,
                    )
                  }
                />
                <p className="text-sm text-muted-foreground">
                  {formatTime(currentStation.estimatedTime)} elapsed
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Nutrition to Next Station
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="carbs-needed">Carbs (g)</Label>
                <Input
                  id="carbs-needed"
                  type="number"
                  value={currentStation.nutritionNeeded.carbs}
                  onChange={(e) =>
                    updateStationNutrition(
                      "carbs",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sodium-needed">Sodium (mg)</Label>
                <Input
                  id="sodium-needed"
                  type="number"
                  value={currentStation.nutritionNeeded.sodium}
                  onChange={(e) =>
                    updateStationNutrition(
                      "sodium",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="water-needed">Water (ml)</Label>
                <Input
                  id="water-needed"
                  type="number"
                  value={currentStation.nutritionNeeded.water}
                  onChange={(e) =>
                    updateStationNutrition(
                      "water",
                      parseInt(e.target.value) || 0,
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleNext}>Generate Report</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AidStationCarousel;
