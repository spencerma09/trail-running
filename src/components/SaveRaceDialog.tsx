import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { RaceProfile } from "./RaceProfileForm";
import { NutritionPlan } from "./NutritionSliders";

interface SaveRaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  raceProfile: RaceProfile;
  nutritionPlan: NutritionPlan;
  aidStations: any[];
  user: any;
  onSaved?: () => void;
}

const SaveRaceDialog: React.FC<SaveRaceDialogProps> = ({
  open,
  onOpenChange,
  raceProfile,
  nutritionPlan,
  aidStations,
  user,
  onSaved,
}) => {
  const [raceName, setRaceName] = useState(raceProfile.raceName || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!raceName.trim()) {
      setError("Please enter a race name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Save to the saved_races table to match what RaceProfileForm expects
      const { error } = await supabase.from("saved_races").insert({
        user_id: user.id,
        race_name: raceName.trim(),
        race_date: raceProfile.raceDate,
        start_time: raceProfile.startTime,
        distance: parseFloat(raceProfile.distance),
        elevation_gain: parseFloat(raceProfile.elevationGain),
        estimated_time: raceProfile.estimatedTime,
        unit_preferences: raceProfile.unitPreferences,
        aid_stations: aidStations,
        nutrition_plan: nutritionPlan,
      });

      if (error) throw error;

      onOpenChange(false);
      setRaceName("");
      if (onSaved) onSaved();
    } catch (error: any) {
      console.error("Error saving race:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Race Report</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Save this race plan to your profile for future reference.
          </p>

          <div className="space-y-2">
            <Label htmlFor="raceName">Race Name</Label>
            <Input
              id="raceName"
              placeholder="Enter a name for this race"
              value={raceName}
              onChange={(e) => setRaceName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleSave();
                }
              }}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Race Details</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                Distance: {raceProfile.distance}{" "}
                {raceProfile.unitPreferences.distance === "metric"
                  ? "km"
                  : "mi"}
              </p>
              <p>Date: {raceProfile.raceDate}</p>
              <p>Estimated Time: {raceProfile.estimatedTime}</p>
              <p>Aid Stations: {aidStations.length}</p>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !raceName.trim()}
            >
              {isLoading ? "Saving..." : "Save Race"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SaveRaceDialog;
