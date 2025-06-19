import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  UnitPreferences,
  defaultUnitPreferences,
  UnitSystem,
} from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AidStation {
  id: string;
  name: string;
  distance: string;
  elevation: string;
}

interface RaceProfileFormProps {
  onSubmit?: (raceProfile: RaceProfile) => void;
}

export interface RaceProfile {
  raceName: string;
  distance: string;
  elevationGain: string;
  estimatedTime: string;
  aidStations: AidStation[];
  unitPreferences: UnitPreferences;
}

const RaceProfileForm: React.FC<RaceProfileFormProps> = ({
  onSubmit = () => {},
}) => {
  const [raceName, setRaceName] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [elevationGain, setElevationGain] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [minutes, setMinutes] = useState<string>("");
  const [seconds, setSeconds] = useState<string>("");
  const [aidStations, setAidStations] = useState<AidStation[]>([
    { id: "1", name: "", distance: "", elevation: "" },
  ]);
  const [unitPreferences, setUnitPreferences] = useState<UnitPreferences>(
    defaultUnitPreferences,
  );

  const updateUnitPreference = (
    type: keyof UnitPreferences,
    value: UnitSystem,
  ) => {
    setUnitPreferences((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleAddAidStation = () => {
    setAidStations([
      ...aidStations,
      { id: Date.now().toString(), name: "", distance: "", elevation: "" },
    ]);
  };

  const handleRemoveAidStation = (id: string) => {
    if (aidStations.length > 1) {
      setAidStations(aidStations.filter((station) => station.id !== id));
    }
  };

  const updateAidStation = (
    id: string,
    field: keyof AidStation,
    value: string,
  ) => {
    setAidStations(
      aidStations.map((station) =>
        station.id === id ? { ...station, [field]: value } : station,
      ),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Format the time as HH:MM:SS
    const formattedHours = hours.padStart(2, "0");
    const formattedMinutes = minutes.padStart(2, "0");
    const formattedSeconds = seconds.padStart(2, "0");
    const estimatedTime = `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

    const raceProfile: RaceProfile = {
      raceName,
      distance,
      elevationGain,
      estimatedTime,
      aidStations,
      unitPreferences,
    };
    onSubmit(raceProfile);
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle>Race Profile</CardTitle>
        <CardDescription>
          Enter your race details to generate a personalized nutrition and gear
          plan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="raceName">Race Name</Label>
              <Input
                id="raceName"
                placeholder="e.g. Western States 100"
                value={raceName}
                onChange={(e) => setRaceName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="distance">Distance</Label>
              <div className="flex gap-2">
                <Input
                  id="distance"
                  placeholder="e.g. 100 mi"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  required
                  className="flex-1"
                />
                <RadioGroup
                  value={unitPreferences.distance}
                  onValueChange={(value) =>
                    updateUnitPreference("distance", value as UnitSystem)
                  }
                  className="flex gap-2"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="metric" id="distance-km" />
                    <Label htmlFor="distance-km" className="text-sm">
                      km
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="imperial" id="distance-mi" />
                    <Label htmlFor="distance-mi" className="text-sm">
                      mi
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="elevationGain">Elevation Gain</Label>
              <div className="flex gap-2">
                <Input
                  id="elevationGain"
                  placeholder={
                    unitPreferences.elevation === "metric"
                      ? "e.g. 5,500 m"
                      : "e.g. 18,000 ft"
                  }
                  value={elevationGain}
                  onChange={(e) => setElevationGain(e.target.value)}
                  required
                  className="flex-1"
                />
                <RadioGroup
                  value={unitPreferences.elevation}
                  onValueChange={(value) =>
                    updateUnitPreference("elevation", value as UnitSystem)
                  }
                  className="flex gap-2"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="metric" id="elevation-m" />
                    <Label htmlFor="elevation-m" className="text-sm">
                      m
                    </Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="imperial" id="elevation-ft" />
                    <Label htmlFor="elevation-ft" className="text-sm">
                      ft
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Estimated Completion Time</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="hours" className="text-xs">
                    Hours
                  </Label>
                  <Input
                    id="hours"
                    placeholder="HH"
                    value={hours}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and limit to 2 digits
                      if (/^\d{0,2}$/.test(value)) {
                        setHours(value);
                      }
                    }}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="minutes" className="text-xs">
                    Minutes
                  </Label>
                  <Input
                    id="minutes"
                    placeholder="MM"
                    value={minutes}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and limit to 2 digits and max value of 59
                      if (
                        /^\d{0,2}$/.test(value) &&
                        (parseInt(value) <= 59 || value === "")
                      ) {
                        setMinutes(value);
                      }
                    }}
                    required
                    className="mt-1"
                  />
                </div>
                <div className="flex-1">
                  <Label htmlFor="seconds" className="text-xs">
                    Seconds
                  </Label>
                  <Input
                    id="seconds"
                    placeholder="SS"
                    value={seconds}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers and limit to 2 digits and max value of 59
                      if (
                        /^\d{0,2}$/.test(value) &&
                        (parseInt(value) <= 59 || value === "")
                      ) {
                        setSeconds(value);
                      }
                    }}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Fluid Units</Label>
              <RadioGroup
                value={unitPreferences.fluid}
                onValueChange={(value) =>
                  updateUnitPreference("fluid", value as UnitSystem)
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="metric" id="fluid-ml" />
                  <Label htmlFor="fluid-ml">Milliliters (ml)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="imperial" id="fluid-oz" />
                  <Label htmlFor="fluid-oz">Fluid Ounces (oz)</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label>Weight Units</Label>
              <RadioGroup
                value={unitPreferences.weight}
                onValueChange={(value) =>
                  updateUnitPreference("weight", value as UnitSystem)
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="metric" id="weight-g" />
                  <Label htmlFor="weight-g">Grams (g)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="imperial" id="weight-oz" />
                  <Label htmlFor="weight-oz">Ounces (oz)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-medium">Aid Stations</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddAidStation}
                className="flex items-center gap-1"
              >
                <PlusCircle className="h-4 w-4" /> Add Station
              </Button>
            </div>

            <div className="space-y-4">
              {aidStations.map((station, index) => (
                <div
                  key={station.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end border p-4 rounded-md"
                >
                  <div className="md:col-span-4 space-y-2">
                    <Label htmlFor={`station-name-${station.id}`}>Name</Label>
                    <Input
                      id={`station-name-${station.id}`}
                      placeholder="Aid Station Name"
                      value={station.name}
                      onChange={(e) =>
                        updateAidStation(station.id, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <Label htmlFor={`station-distance-${station.id}`}>
                      Distance
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`station-distance-${station.id}`}
                        placeholder={
                          unitPreferences.distance === "metric"
                            ? "e.g. 25.4"
                            : "e.g. 15.8"
                        }
                        value={station.distance}
                        onChange={(e) =>
                          updateAidStation(
                            station.id,
                            "distance",
                            e.target.value,
                          )
                        }
                        className="flex-1"
                      />
                      <div className="flex items-center text-sm text-gray-500 w-8">
                        {unitPreferences.distance === "metric" ? "km" : "mi"}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <Label htmlFor={`station-elevation-${station.id}`}>
                      Elevation
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`station-elevation-${station.id}`}
                        placeholder={
                          unitPreferences.elevation === "metric"
                            ? "e.g. 1200"
                            : "e.g. 5280"
                        }
                        value={station.elevation}
                        onChange={(e) =>
                          updateAidStation(
                            station.id,
                            "elevation",
                            e.target.value,
                          )
                        }
                        className="flex-1"
                      />
                      <div className="flex items-center text-sm text-gray-500 w-8">
                        {unitPreferences.elevation === "metric" ? "m" : "ft"}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAidStation(station.id)}
                      disabled={aidStations.length === 1}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="px-6">
              Generate Plan
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RaceProfileForm;
