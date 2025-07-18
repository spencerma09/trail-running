import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle } from "lucide-react";
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
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  const [existingRaceId, setExistingRaceId] = useState<string | null>(null);
  const { toast } = useToast();

  const checkForDuplicateName = async (name: string) => {
    const { data, error } = await supabase
      .from("saved_races")
      .select("id")
      .eq("user_id", user.id)
      .eq("race_name", name.trim())
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return data;
  };

  const handleSave = async (forceReplace = false) => {
    if (!raceName.trim()) {
      setError("Please enter a race name");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check for duplicate name unless we're forcing a replace
      if (!forceReplace) {
        const existingRace = await checkForDuplicateName(raceName);
        if (existingRace) {
          setExistingRaceId(existingRace.id);
          setShowReplaceDialog(true);
          setIsLoading(false);
          return;
        }
      }

      const raceData = {
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
      };

      let error;
      if (forceReplace && existingRaceId) {
        // Update existing race
        const result = await supabase
          .from("saved_races")
          .update(raceData)
          .eq("id", existingRaceId)
          .eq("user_id", user.id);
        error = result.error;
      } else {
        // Insert new race
        const result = await supabase.from("saved_races").insert(raceData);
        error = result.error;
      }

      if (error) throw error;

      // Show success toast with checkmark
      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Race {forceReplace ? "updated" : "saved"}
          </div>
        ),
        description: `"${raceName.trim()}" has been ${forceReplace ? "updated in" : "saved to"} your profile.`,
      });

      onOpenChange(false);
      setRaceName("");
      setShowReplaceDialog(false);
      setExistingRaceId(null);
      if (onSaved) onSaved();
    } catch (error: any) {
      console.error("Error saving race:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplaceConfirm = () => {
    setShowReplaceDialog(false);
    handleSave(true);
  };

  const handleCreateNew = () => {
    setShowReplaceDialog(false);
    setExistingRaceId(null);
    setError("Please enter a different race name");
  };

  return (
    <>
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
                onChange={(e) => {
                  setRaceName(e.target.value);
                  if (error === "Please enter a different race name") {
                    setError(null);
                  }
                }}
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
                onClick={() => handleSave()}
                disabled={isLoading || !raceName.trim()}
              >
                {isLoading ? "Saving..." : "Save Race"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showReplaceDialog} onOpenChange={setShowReplaceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Race Name Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              A race with the name "{raceName}" already exists in your saved
              races. Would you like to replace the existing race or create a new
              one with a different name?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCreateNew}>
              Create New
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleReplaceConfirm}>
              Replace Existing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SaveRaceDialog;
