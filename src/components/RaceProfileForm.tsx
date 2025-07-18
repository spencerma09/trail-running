import React, { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import {
  UnitPreferences,
  defaultUnitPreferences,
  UnitSystem,
} from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RaceDataStorage, SavedRace, supabase } from "@/lib/supabase";
import { FolderOpen, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface RaceProfileFormProps {
  onSubmit?: (
    raceProfile: RaceProfile,
    aidStations?: any[],
    nutritionPlan?: any,
  ) => void;
  onSave?: (raceProfile: RaceProfile) => void;
}

export interface RaceProfile {
  raceName: string;
  raceDate: string;
  startTime: string;
  distance: string;
  elevationGain: string;
  estimatedTime: string;

  unitPreferences: UnitPreferences;
}

const RaceProfileForm: React.FC<RaceProfileFormProps> = ({
  onSubmit = () => {},
  onSave = () => {},
}) => {
  const [user, setUser] = useState<any>(null);
  const [savedRaces, setSavedRaces] = useState<SavedRace[]>([]);

  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [raceName, setRaceName] = useState<string>("");
  const [raceDate, setRaceDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [elevationGain, setElevationGain] = useState<string>("");
  const [estimatedHours, setEstimatedHours] = useState<string>("");
  const [estimatedMinutes, setEstimatedMinutes] = useState<string>("");
  const [estimatedSeconds, setEstimatedSeconds] = useState<string>("");

  const [unitPreferences, setUnitPreferences] = useState<UnitPreferences>(
    defaultUnitPreferences,
  );

  // Store loaded aid stations and nutrition plan
  const [loadedAidStations, setLoadedAidStations] = useState<any[] | null>(
    null,
  );
  const [loadedNutritionPlan, setLoadedNutritionPlan] = useState<any | null>(
    null,
  );

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadSavedRaces(user.id);
      }
    };
    getCurrentUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadSavedRaces(session.user.id);
      } else {
        setSavedRaces([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSavedRaces = async (userId: string) => {
    const races = await RaceDataStorage.getSavedRaces(userId);
    setSavedRaces(races);
  };

  const handleLoadRace = async (savedRace: SavedRace) => {
    setRaceName(savedRace.race_name);
    setRaceDate(savedRace.race_date);
    setStartTime(savedRace.start_time);
    setDistance(savedRace.distance.toString());
    setElevationGain(savedRace.elevation_gain.toString());

    // Set estimated time - parse HH:MM:SS format
    const timeParts = savedRace.estimated_time.split(":");
    setEstimatedHours(timeParts[0] || "");
    setEstimatedMinutes(timeParts[1] || "");
    setEstimatedSeconds(timeParts[2] || "");

    setUnitPreferences(savedRace.unit_preferences || defaultUnitPreferences);

    // Load aid stations and nutrition plan
    setLoadedAidStations(savedRace.aid_stations || null);
    setLoadedNutritionPlan(savedRace.nutrition_plan || null);

    setShowLoadDialog(false);
  };

  const handleDeleteRace = async (raceId: string) => {
    if (!user) return;

    const success = await RaceDataStorage.deleteSavedRace(user.id, raceId);
    if (success) {
      await loadSavedRaces(user.id);
    }
  };

  const updateUnitPreference = (
    type: keyof UnitPreferences,
    value: UnitSystem,
  ) => {
    setUnitPreferences((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Combine time components into HH:MM:SS format
    const estimatedTime = `${estimatedHours.padStart(2, "0")}:${estimatedMinutes.padStart(2, "0")}:${estimatedSeconds.padStart(2, "0")}`;

    const raceProfile: RaceProfile = {
      raceName,
      raceDate,
      startTime,
      distance,
      elevationGain,
      estimatedTime,

      unitPreferences,
    };

    // Pass loaded aid stations and nutrition plan if available
    onSubmit(raceProfile, loadedAidStations, loadedNutritionPlan);
  };

  return (
    <Card className="w-full bg-white border border-gray-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Race Profile</CardTitle>
            <CardDescription>
              Enter your race details to generate a personalized nutrition and
              gear plan.
            </CardDescription>
          </div>
          {user && (
            <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Load Race
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Load Saved Race</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {savedRaces.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No saved races found. Save your first race to see it here.
                    </p>
                  ) : (
                    savedRaces.map((race) => (
                      <div
                        key={race.id}
                        className="border rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-medium">{race.race_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {race.race_date} • {race.distance}{" "}
                            {race.unit_preferences?.distance === "metric"
                              ? "km"
                              : "mi"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadRace(race)}
                          >
                            Load
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Race</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {race.race_name}"? This action cannot be
                                  undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteRace(race.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
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
              <Label htmlFor="raceDate">Race Date</Label>
              <Input
                id="raceDate"
                type="date"
                value={raceDate}
                onChange={(e) => setRaceDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
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
              <Label>Estimated Completion Time</Label>
              <div className="flex gap-2 items-center">
                <div className="flex-1">
                  <Input
                    id="estimatedHours"
                    placeholder="Hours"
                    value={estimatedHours}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,2}$/.test(value)) {
                        setEstimatedHours(value);
                      }
                    }}
                    maxLength={2}
                    required
                  />
                </div>
                <span className="text-muted-foreground flex items-center justify-center">
                  :
                </span>
                <div className="flex-1">
                  <Input
                    id="estimatedMinutes"
                    placeholder="Minutes"
                    value={estimatedMinutes}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        /^\d{0,2}$/.test(value) &&
                        parseInt(value || "0") <= 59
                      ) {
                        setEstimatedMinutes(value);
                      }
                    }}
                    maxLength={2}
                    required
                  />
                </div>
                <span className="text-muted-foreground flex items-center justify-center">
                  :
                </span>
                <div className="flex-1">
                  <Input
                    id="estimatedSeconds"
                    placeholder="Seconds"
                    value={estimatedSeconds}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (
                        /^\d{0,2}$/.test(value) &&
                        parseInt(value || "0") <= 59
                      ) {
                        setEstimatedSeconds(value);
                      }
                    }}
                    maxLength={2}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="px-6">
              Next: Nutrition Planning
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RaceProfileForm;
