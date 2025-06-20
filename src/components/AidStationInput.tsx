import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Upload } from "lucide-react";
import { UnitPreferences, UnitSystem } from "@/lib/utils";

interface AidStation {
  id: string;
  name: string;
  distance: number;
  elevation?: number;
}

interface AidStationInputProps {
  unitPreferences: UnitPreferences;
  onNext: (aidStations: AidStation[]) => void;
  onBack: () => void;
}

const AidStationInput: React.FC<AidStationInputProps> = ({
  unitPreferences,
  onNext,
  onBack,
}) => {
  const [aidStations, setAidStations] = useState<AidStation[]>([
    { id: "1", name: "Start", distance: 0 },
  ]);

  const handleAddAidStation = () => {
    setAidStations([
      ...aidStations,
      { id: Date.now().toString(), name: "", distance: 0 },
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
    value: string | number,
  ) => {
    setAidStations(
      aidStations.map((station) =>
        station.id === id ? { ...station, [field]: value } : station,
      ),
    );
  };

  const handleGPXUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Placeholder for GPX parsing logic
      console.log("GPX file uploaded:", file.name);
      // In a real implementation, you would parse the GPX file here
      // and extract waypoints to populate aid stations
    }
  };

  const handleNext = () => {
    // Sort aid stations by distance
    const sortedStations = [...aidStations].sort(
      (a, b) => a.distance - b.distance,
    );
    onNext(sortedStations);
  };

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle>Aid Stations</CardTitle>
        <p className="text-muted-foreground">
          Enter your aid station locations manually or upload a GPX file with
          waypoints.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="gpx-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Upload GPX file with waypoints
                </p>
              </div>
              <Input
                id="gpx-upload"
                type="file"
                accept=".gpx"
                onChange={handleGPXUpload}
                className="hidden"
              />
            </Label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-medium">Manual Entry</Label>
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
                    Distance (
                    {unitPreferences.distance === "metric" ? "km" : "mi"})
                  </Label>
                  <Input
                    id={`station-distance-${station.id}`}
                    type="number"
                    step="0.1"
                    placeholder={
                      unitPreferences.distance === "metric"
                        ? "e.g. 25.4"
                        : "e.g. 15.8"
                    }
                    value={station.distance || ""}
                    onChange={(e) =>
                      updateAidStation(
                        station.id,
                        "distance",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label htmlFor={`station-elevation-${station.id}`}>
                    Elevation (
                    {unitPreferences.elevation === "metric" ? "m" : "ft"})
                  </Label>
                  <Input
                    id={`station-elevation-${station.id}`}
                    type="number"
                    placeholder={
                      unitPreferences.elevation === "metric"
                        ? "e.g. 1200"
                        : "e.g. 5280"
                    }
                    value={station.elevation || ""}
                    onChange={(e) =>
                      updateAidStation(
                        station.id,
                        "elevation",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                  />
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

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={handleNext}>Next: Review Stations</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AidStationInput;
