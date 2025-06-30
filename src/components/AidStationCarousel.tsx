import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Save,
  FolderOpen,
  Check,
  Calculator,
} from "lucide-react";
import { NutritionPlan } from "./NutritionSliders";
import { UnitPreferences, formatDistance } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RaceDataStorage, SavedFoodItem, supabase } from "@/lib/supabase";
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

interface AidStation {
  id: string;
  name: string;
  distance: number;
  elevation?: number;
}

interface NutritionItem {
  id: string;
  name: string;
  carbs: number;
  sodium: number;
  water: number;
  quantity: number;
}

interface AidStationWithTiming extends AidStation {
  estimatedTime: number; // hours from start
  nutritionNeeded: {
    carbs: number;
    sodium: number;
    water: number;
  };
  nutritionItems: NutritionItem[];
}

interface StartStation {
  id: string;
  name: string;
  distance: number;
  estimatedTime: number;
  nutritionItems: NutritionItem[];
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
  const [user, setUser] = useState<any>(null);
  const [savedFoodItems, setSavedFoodItems] = useState<SavedFoodItem[]>([]);
  const [showSaveFoodDialog, setShowSaveFoodDialog] = useState(false);
  const [showLoadFoodDialog, setShowLoadFoodDialog] = useState(false);
  const [newFoodItem, setNewFoodItem] = useState({
    name: "",
    carbs_per_serving: 0,
    sodium_per_serving: 0,
    water_per_serving: 0,
    serving_size: "1 unit",
    category: "other",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Create start station
  const [startStation] = useState<StartStation>({
    id: "start",
    name: "Start",
    distance: 0,
    estimatedTime: 0,
    nutritionItems: [],
  });

  // Calculate initial timing and nutrition for each station
  const [stationsWithTiming, setStationsWithTiming] = useState<
    AidStationWithTiming[]
  >(() => {
    return aidStations.map((station, index) => {
      // Calculate estimated time based on distance progression
      const estimatedTime = (station.distance / totalDistance) * totalTime;

      // Calculate nutrition needed from previous station to current station
      const previousStationTime =
        index === 0
          ? 0
          : (aidStations[index - 1].distance / totalDistance) * totalTime;
      const timeBetweenStations = estimatedTime - previousStationTime;

      return {
        ...station,
        estimatedTime,
        nutritionNeeded: {
          carbs: Math.round(nutritionPlan.carbsPerHour * timeBetweenStations),
          sodium: Math.round(nutritionPlan.sodiumPerHour * timeBetweenStations),
          water: Math.round(nutritionPlan.waterPerHour * timeBetweenStations),
        },
        nutritionItems: [],
      };
    });
  });

  const [startStationItems, setStartStationItems] = useState<NutritionItem[]>(
    [],
  );

  useEffect(() => {
    // Get current user and load saved food items
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        loadSavedFoodItems(user.id);
      }
    };
    getCurrentUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadSavedFoodItems(session.user.id);
      } else {
        setSavedFoodItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadSavedFoodItems = async (userId: string) => {
    const items = await RaceDataStorage.getSavedFoodItems(userId);
    setSavedFoodItems(items);
  };

  const handleSaveFoodItem = async () => {
    if (!user || !newFoodItem.name) return;

    setIsLoading(true);
    const savedId = await RaceDataStorage.saveFoodItem(user.id, newFoodItem);
    if (savedId) {
      await loadSavedFoodItems(user.id);
      setShowSaveFoodDialog(false);
      setNewFoodItem({
        name: "",
        carbs_per_serving: 0,
        sodium_per_serving: 0,
        water_per_serving: 0,
        serving_size: "1 unit",
        category: "other",
      });
    }
    setIsLoading(false);
  };

  const handleLoadFoodItem = (foodItem: SavedFoodItem) => {
    const newItem: NutritionItem = {
      id: Date.now().toString(),
      name: foodItem.name,
      carbs: foodItem.carbs_per_serving,
      sodium: foodItem.sodium_per_serving,
      water: foodItem.water_per_serving,
      quantity: 1,
    };

    if (isStartStation) {
      setStartStationItems((prev) => [...prev, newItem]);
    } else {
      setStationsWithTiming((prev) =>
        prev.map((station, index) =>
          index === currentStationIndex - 1
            ? {
                ...station,
                nutritionItems: [...station.nutritionItems, newItem],
              }
            : station,
        ),
      );
    }
    setShowLoadFoodDialog(false);
  };

  const handleDeleteFoodItem = async (foodItemId: string) => {
    if (!user) return;

    const success = await RaceDataStorage.deleteSavedFoodItem(
      user.id,
      foodItemId,
    );
    if (success) {
      await loadSavedFoodItems(user.id);
    }
  };

  const allStations = [startStation, ...stationsWithTiming];
  const currentStation = allStations[currentStationIndex];
  const isStartStation = currentStationIndex === 0;

  const updateStationTiming = (field: "estimatedTime", value: number) => {
    if (isStartStation) {
      // Handle start station timing update if needed
      return;
    }
    setStationsWithTiming((prev) =>
      prev.map((station, index) =>
        index === currentStationIndex - 1
          ? { ...station, [field]: value }
          : station,
      ),
    );
  };

  const updateStationNutrition = (
    field: keyof AidStationWithTiming["nutritionNeeded"],
    value: number,
  ) => {
    if (isStartStation) return;
    setStationsWithTiming((prev) =>
      prev.map((station, index) =>
        index === currentStationIndex - 1
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

  const addNutritionItem = () => {
    const newItem: NutritionItem = {
      id: Date.now().toString(),
      name: "",
      carbs: 0,
      sodium: 0,
      water: 0,
      quantity: 1,
    };

    if (isStartStation) {
      setStartStationItems((prev) => [...prev, newItem]);
    } else {
      setStationsWithTiming((prev) =>
        prev.map((station, index) =>
          index === currentStationIndex - 1
            ? {
                ...station,
                nutritionItems: [...station.nutritionItems, newItem],
              }
            : station,
        ),
      );
    }
  };

  const updateNutritionItem = (
    itemId: string,
    field: keyof NutritionItem,
    value: string | number,
  ) => {
    if (isStartStation) {
      setStartStationItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, [field]: value } : item,
        ),
      );
    } else {
      setStationsWithTiming((prev) =>
        prev.map((station, index) =>
          index === currentStationIndex - 1
            ? {
                ...station,
                nutritionItems: station.nutritionItems.map((item) =>
                  item.id === itemId ? { ...item, [field]: value } : item,
                ),
              }
            : station,
        ),
      );
    }
  };

  const removeNutritionItem = (itemId: string) => {
    if (isStartStation) {
      setStartStationItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      setStationsWithTiming((prev) =>
        prev.map((station, index) =>
          index === currentStationIndex - 1
            ? {
                ...station,
                nutritionItems: station.nutritionItems.filter(
                  (item) => item.id !== itemId,
                ),
              }
            : station,
        ),
      );
    }
  };

  const getCurrentNutritionItems = (): NutritionItem[] => {
    if (isStartStation) {
      return startStationItems;
    }
    return stationsWithTiming[currentStationIndex - 1]?.nutritionItems || [];
  };

  const formatTime = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const nextStation = () => {
    if (currentStationIndex < allStations.length - 1) {
      setCurrentStationIndex(currentStationIndex + 1);
    }
  };

  const prevStation = () => {
    if (currentStationIndex > 0) {
      setCurrentStationIndex(currentStationIndex - 1);
    }
  };

  // Calculate total nutrition from current station's items
  const calculateTotalNutrition = () => {
    const items = getCurrentNutritionItems();
    return items.reduce(
      (total, item) => ({
        carbs: total.carbs + item.carbs * item.quantity,
        sodium: total.sodium + item.sodium * item.quantity,
        water: total.water + item.water * item.quantity,
      }),
      { carbs: 0, sodium: 0, water: 0 },
    );
  };

  // Calculate remaining nutrition needed to reach next station
  const calculateRemainingNutrition = () => {
    const totalNutrition = calculateTotalNutrition();
    let targetNutrition = { carbs: 0, sodium: 0, water: 0 };

    if (currentStationIndex < allStations.length - 1) {
      if (isStartStation && stationsWithTiming.length > 0) {
        targetNutrition = stationsWithTiming[0].nutritionNeeded;
      } else if (
        !isStartStation &&
        currentStationIndex < stationsWithTiming.length
      ) {
        targetNutrition =
          stationsWithTiming[currentStationIndex].nutritionNeeded;
      }
    }

    return {
      carbs: Math.max(0, targetNutrition.carbs - totalNutrition.carbs),
      sodium: Math.max(0, targetNutrition.sodium - totalNutrition.sodium),
      water: Math.max(0, targetNutrition.water - totalNutrition.water),
    };
  };

  // Submit/confirm a nutrition item
  const submitNutritionItem = (itemId: string) => {
    // For now, this just validates that the item has a name
    // In the future, this could save to database or mark as confirmed
    const items = getCurrentNutritionItems();
    const item = items.find((i) => i.id === itemId);
    if (item && item.name.trim()) {
      // Item is valid and submitted
      console.log("Item submitted:", item);
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
              {currentStationIndex + 1} of {allStations.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextStation}
              disabled={currentStationIndex === allStations.length - 1}
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
            {!isStartStation &&
              (currentStation as AidStationWithTiming).elevation && (
                <div className="flex items-center gap-1">
                  <span>📏</span>
                  <span>
                    {unitPreferences.elevation === "metric"
                      ? `${Math.round((currentStation as AidStationWithTiming).elevation!)}m`
                      : `${Math.round((currentStation as AidStationWithTiming).elevation!)}ft`}
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
                {isStartStation
                  ? "Time of Race Start"
                  : "Estimated Arrival Time"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="estimated-time">
                  {isStartStation ? "Start time" : "Hours from start"}
                </Label>
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
                  disabled={isStartStation}
                />
                <p className="text-sm text-muted-foreground">
                  {isStartStation
                    ? "Race begins here"
                    : `${formatTime(currentStation.estimatedTime)} elapsed`}
                </p>
              </div>
            </CardContent>
          </Card>

          {currentStationIndex < allStations.length - 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Nutrition to Next Station
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Nutrition needed to reach{" "}
                  {allStations[currentStationIndex + 1].name}
                  {!isStartStation && (
                    <span className="block mt-1">
                      Estimated time to next station:{" "}
                      {formatTime(
                        allStations[currentStationIndex + 1].estimatedTime -
                          currentStation.estimatedTime,
                      )}
                    </span>
                  )}
                  {isStartStation && stationsWithTiming.length > 0 && (
                    <span className="block mt-1">
                      Estimated time to next station:{" "}
                      {formatTime(stationsWithTiming[0].estimatedTime)}
                    </span>
                  )}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {isStartStation && stationsWithTiming.length > 0
                        ? stationsWithTiming[0].nutritionNeeded.carbs
                        : !isStartStation &&
                            currentStationIndex < stationsWithTiming.length
                          ? stationsWithTiming[currentStationIndex]
                              .nutritionNeeded.carbs
                          : 0}
                      g
                    </div>
                    <div className="text-sm text-muted-foreground">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {isStartStation && stationsWithTiming.length > 0
                        ? stationsWithTiming[0].nutritionNeeded.sodium
                        : !isStartStation &&
                            currentStationIndex < stationsWithTiming.length
                          ? stationsWithTiming[currentStationIndex]
                              .nutritionNeeded.sodium
                          : 0}
                      mg
                    </div>
                    <div className="text-sm text-muted-foreground">Sodium</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">
                      {isStartStation && stationsWithTiming.length > 0
                        ? stationsWithTiming[0].nutritionNeeded.water
                        : !isStartStation &&
                            currentStationIndex < stationsWithTiming.length
                          ? stationsWithTiming[currentStationIndex]
                              .nutritionNeeded.water
                          : 0}
                      ml
                    </div>
                    <div className="text-sm text-muted-foreground">Water</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Nutrition Planning
              <div className="flex gap-2">
                {user && (
                  <>
                    <Dialog
                      open={showLoadFoodDialog}
                      onOpenChange={setShowLoadFoodDialog}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <FolderOpen className="h-4 w-4 mr-2" />
                          Load Food
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Load Saved Food Items</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {savedFoodItems.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">
                              No saved food items found. Save your first food
                              item to see it here.
                            </p>
                          ) : (
                            savedFoodItems.map((item) => (
                              <div
                                key={item.id}
                                className="border rounded-lg p-4 flex justify-between items-center"
                              >
                                <div>
                                  <h4 className="font-medium">{item.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {item.carbs_per_serving}g carbs •{" "}
                                    {item.sodium_per_serving}mg sodium •{" "}
                                    {item.water_per_serving}ml water
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {item.serving_size} • {item.category}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleLoadFoodItem(item)}
                                  >
                                    Add
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete Food Item
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "
                                          {item.name}"? This action cannot be
                                          undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDeleteFoodItem(item.id)
                                          }
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

                    <Dialog
                      open={showSaveFoodDialog}
                      onOpenChange={setShowSaveFoodDialog}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Save className="h-4 w-4 mr-2" />
                          Save Food
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Save Food Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="food-name">Name</Label>
                              <Input
                                id="food-name"
                                placeholder="e.g., Energy Gel"
                                value={newFoodItem.name}
                                onChange={(e) =>
                                  setNewFoodItem((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="food-category">Category</Label>
                              <Select
                                value={newFoodItem.category}
                                onValueChange={(value) =>
                                  setNewFoodItem((prev) => ({
                                    ...prev,
                                    category: value,
                                  }))
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="gel">
                                    Energy Gel
                                  </SelectItem>
                                  <SelectItem value="bar">
                                    Energy Bar
                                  </SelectItem>
                                  <SelectItem value="drink">
                                    Sports Drink
                                  </SelectItem>
                                  <SelectItem value="food">
                                    Real Food
                                  </SelectItem>
                                  <SelectItem value="supplement">
                                    Supplement
                                  </SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="food-serving">Serving Size</Label>
                              <Input
                                id="food-serving"
                                placeholder="e.g., 1 packet"
                                value={newFoodItem.serving_size}
                                onChange={(e) =>
                                  setNewFoodItem((prev) => ({
                                    ...prev,
                                    serving_size: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="food-carbs">
                                Carbs per Serving (g)
                              </Label>
                              <Input
                                id="food-carbs"
                                type="number"
                                value={newFoodItem.carbs_per_serving}
                                onChange={(e) =>
                                  setNewFoodItem((prev) => ({
                                    ...prev,
                                    carbs_per_serving:
                                      parseInt(e.target.value) || 0,
                                  }))
                                }
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="food-sodium">
                                Sodium per Serving (mg)
                              </Label>
                              <Input
                                id="food-sodium"
                                type="number"
                                value={newFoodItem.sodium_per_serving}
                                onChange={(e) =>
                                  setNewFoodItem((prev) => ({
                                    ...prev,
                                    sodium_per_serving:
                                      parseInt(e.target.value) || 0,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="food-water">
                                Water per Serving (ml)
                              </Label>
                              <Input
                                id="food-water"
                                type="number"
                                value={newFoodItem.water_per_serving}
                                onChange={(e) =>
                                  setNewFoodItem((prev) => ({
                                    ...prev,
                                    water_per_serving:
                                      parseInt(e.target.value) || 0,
                                  }))
                                }
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setShowSaveFoodDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSaveFoodItem}
                              disabled={isLoading || !newFoodItem.name}
                            >
                              {isLoading ? "Saving..." : "Save Food Item"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={addNutritionItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Plan your food and water items to meet your nutrition goals
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getCurrentNutritionItems().map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Input
                      placeholder="Item name (e.g., Energy Gel)"
                      value={item.name}
                      onChange={(e) =>
                        updateNutritionItem(item.id, "name", e.target.value)
                      }
                      className="flex-1 mr-2"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => submitNutritionItem(item.id)}
                        disabled={!item.name.trim()}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeNutritionItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateNutritionItem(
                            item.id,
                            "quantity",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Carbs (g)</Label>
                      <Input
                        type="number"
                        value={item.carbs === 0 ? "" : item.carbs}
                        onChange={(e) =>
                          updateNutritionItem(
                            item.id,
                            "carbs",
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value) || 0,
                          )
                        }
                        className="text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Sodium (mg)</Label>
                      <Input
                        type="number"
                        value={item.sodium === 0 ? "" : item.sodium}
                        onChange={(e) =>
                          updateNutritionItem(
                            item.id,
                            "sodium",
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value) || 0,
                          )
                        }
                        className="text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Water (ml)</Label>
                      <Input
                        type="number"
                        value={item.water === 0 ? "" : item.water}
                        onChange={(e) =>
                          updateNutritionItem(
                            item.id,
                            "water",
                            e.target.value === ""
                              ? 0
                              : parseInt(e.target.value) || 0,
                          )
                        }
                        className="text-sm"
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Total</Label>
                      <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                        {item.carbs * item.quantity}g |
                        {item.sodium * item.quantity}mg |
                        {item.water * item.quantity}ml
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {getCurrentNutritionItems().length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No nutrition items added yet. Click "Add Item" to start
                  planning.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Calculator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Nutrition Calculator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Track your total nutrition and remaining needs for the next
              station
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Nutrition */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Total Food Items</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Combined nutrition from all items at this station
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {calculateTotalNutrition().carbs}g
                      </div>
                      <div className="text-sm text-muted-foreground">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {calculateTotalNutrition().sodium}mg
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Sodium
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-600">
                        {calculateTotalNutrition().water}ml
                      </div>
                      <div className="text-sm text-muted-foreground">Water</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Remaining Nutrition */}
              {currentStationIndex < allStations.length - 1 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      Remaining to Target
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Additional nutrition needed to reach next station
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {calculateRemainingNutrition().carbs}g
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Carbs
                        </div>
                        {calculateRemainingNutrition().carbs === 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            ✓ Target met
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {calculateRemainingNutrition().sodium}mg
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sodium
                        </div>
                        {calculateRemainingNutrition().sodium === 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            ✓ Target met
                          </div>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-600">
                          {calculateRemainingNutrition().water}ml
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Water
                        </div>
                        {calculateRemainingNutrition().water === 0 && (
                          <div className="text-xs text-green-600 mt-1">
                            ✓ Target met
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

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
