import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDistance } from "@/lib/utils";

interface UserProfileProps {
  user: any;
  onClose: () => void;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  age?: number;
  gender?: string;
  location?: string;
}

interface SavedRaceReport {
  id: string;
  race_name: string;
  race_profile: any;
  nutrition_plan: any;
  aid_stations: any;
  created_at: string;
}

interface SavedNutritionItem {
  id: string;
  name: string;
  carbs_per_hour: number;
  sodium_per_hour: number;
  water_per_hour: number;
  calories_per_hour: number;
  category: string;
  notes?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onClose }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [savedRaces, setSavedRaces] = useState<SavedRaceReport[]>([]);
  const [savedNutrition, setSavedNutrition] = useState<SavedNutritionItem[]>(
    [],
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showAddNutrition, setShowAddNutrition] = useState(false);
  const [newNutritionItem, setNewNutritionItem] = useState({
    name: "",
    carbs_per_hour: 0,
    sodium_per_hour: 0,
    water_per_hour: 0,
    calories_per_hour: 0,
    category: "gel",
    notes: "",
  });

  useEffect(() => {
    if (user) {
      const loadAllData = async () => {
        setIsInitialLoading(true);
        try {
          await Promise.all([
            loadUserProfile(),
            loadSavedRaces(),
            loadSavedNutrition(),
          ]);
          setHasError(false);
        } catch (error) {
          console.error("Error loading user data:", error);
          setHasError(true);
        } finally {
          setIsInitialLoading(false);
        }
      };
      loadAllData();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile({
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          age: data.age,
          gender: data.gender,
          location: data.location,
        });
      } else {
        // No profile found, create a default one for display
        setProfile({
          id: "",
          firstName: "",
          lastName: "",
          email: user.email || "",
          age: undefined,
          gender: undefined,
          location: undefined,
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Set a default profile even on error
      setProfile({
        id: "",
        firstName: "",
        lastName: "",
        email: user.email || "",
        age: undefined,
        gender: undefined,
        location: undefined,
      });
      throw error; // Re-throw to be caught by the main error handler
    }
  };

  const loadSavedRaces = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_race_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSavedRaces(data || []);
    } catch (error) {
      console.error("Error loading saved races:", error);
      setSavedRaces([]);
    }
  };

  const loadSavedNutrition = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_nutrition_items")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      setSavedNutrition(data || []);
    } catch (error) {
      console.error("Error loading saved nutrition:", error);
      setSavedNutrition([]);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      if (profile.id) {
        // Update existing profile
        const { error } = await supabase
          .from("user_profiles")
          .update({
            first_name: profile.firstName,
            last_name: profile.lastName,
            email: profile.email,
            age: profile.age || null,
            gender: profile.gender || null,
            location: profile.location || null,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("user_profiles")
          .insert({
            user_id: user.id,
            first_name: profile.firstName,
            last_name: profile.lastName,
            email: profile.email,
            age: profile.age || null,
            gender: profile.gender || null,
            location: profile.location || null,
          })
          .select()
          .single();

        if (error) throw error;

        // Update the profile state with the new ID
        if (data) {
          setProfile((prev) => (prev ? { ...prev, id: data.id } : null));
        }
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNutritionItem = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("saved_nutrition_items").insert({
        user_id: user.id,
        name: newNutritionItem.name,
        carbs_per_hour: newNutritionItem.carbs_per_hour,
        sodium_per_hour: newNutritionItem.sodium_per_hour,
        water_per_hour: newNutritionItem.water_per_hour,
        calories_per_hour: newNutritionItem.calories_per_hour,
        category: newNutritionItem.category,
        notes: newNutritionItem.notes || null,
      });

      if (error) throw error;

      setNewNutritionItem({
        name: "",
        carbs_per_hour: 0,
        sodium_per_hour: 0,
        water_per_hour: 0,
        calories_per_hour: 0,
        category: "gel",
        notes: "",
      });
      setShowAddNutrition(false);
      loadSavedNutrition();
    } catch (error) {
      console.error("Error adding nutrition item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteNutritionItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_nutrition_items")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      loadSavedNutrition();
    } catch (error) {
      console.error("Error deleting nutrition item:", error);
    }
  };

  const handleDeleteRace = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_race_reports")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      loadSavedRaces();
    } catch (error) {
      console.error("Error deleting race:", error);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string | number) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  if (isInitialLoading) {
    return (
      <div className="bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (hasError || !profile) {
    return (
      <div className="bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                {hasError
                  ? "Error loading profile data."
                  : "Unable to load profile."}{" "}
                Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="races">Saved Races</TabsTrigger>
            <TabsTrigger value="nutrition">Saved Nutrition</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Personal Information</CardTitle>
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {isLoading ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) =>
                        updateProfile("firstName", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) =>
                        updateProfile("lastName", e.target.value)
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(e) => updateProfile("email", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      value={profile.age || ""}
                      onChange={(e) =>
                        updateProfile(
                          "age",
                          e.target.value ? parseInt(e.target.value) : "",
                        )
                      }
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    {isEditing ? (
                      <Select
                        value={profile.gender || ""}
                        onValueChange={(value) =>
                          updateProfile("gender", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="prefer-not-to-say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input value={profile.gender || ""} disabled />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location || ""}
                    onChange={(e) => updateProfile("location", e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="races" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Races ({savedRaces.length})</CardTitle>
                <p className="text-muted-foreground">
                  Your saved race plans and reports
                </p>
              </CardHeader>
              <CardContent>
                {savedRaces.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No saved races yet. Complete a race plan and save it to
                      see it here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedRaces.map((race) => (
                      <div
                        key={race.id}
                        className="border rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-medium">{race.race_name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {formatDistance(
                              race.race_profile.distance,
                              race.race_profile.unitPreferences?.distance ||
                                "metric",
                            )}{" "}
                            • {race.race_profile.raceDate} •{" "}
                            {new Date(race.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Report
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
                                  Delete Race Report
                                </AlertDialogTitle>
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>
                      Saved Nutrition ({savedNutrition.length})
                    </CardTitle>
                    <p className="text-muted-foreground">
                      Your custom nutrition items for aid station planning
                    </p>
                  </div>
                  <Dialog
                    open={showAddNutrition}
                    onOpenChange={setShowAddNutrition}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Nutrition Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add Nutrition Item</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              placeholder="e.g., Energy Gel"
                              value={newNutritionItem.name}
                              onChange={(e) =>
                                setNewNutritionItem((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                              value={newNutritionItem.category}
                              onValueChange={(value) =>
                                setNewNutritionItem((prev) => ({
                                  ...prev,
                                  category: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="gel">Energy Gel</SelectItem>
                                <SelectItem value="bar">Energy Bar</SelectItem>
                                <SelectItem value="drink">
                                  Sports Drink
                                </SelectItem>
                                <SelectItem value="food">Real Food</SelectItem>
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
                            <Label htmlFor="carbs">Carbs per Hour (g)</Label>
                            <Input
                              id="carbs"
                              type="number"
                              value={newNutritionItem.carbs_per_hour}
                              onChange={(e) =>
                                setNewNutritionItem((prev) => ({
                                  ...prev,
                                  carbs_per_hour: parseInt(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="sodium">Sodium per Hour (mg)</Label>
                            <Input
                              id="sodium"
                              type="number"
                              value={newNutritionItem.sodium_per_hour}
                              onChange={(e) =>
                                setNewNutritionItem((prev) => ({
                                  ...prev,
                                  sodium_per_hour:
                                    parseInt(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="water">Water per Hour (ml)</Label>
                            <Input
                              id="water"
                              type="number"
                              value={newNutritionItem.water_per_hour}
                              onChange={(e) =>
                                setNewNutritionItem((prev) => ({
                                  ...prev,
                                  water_per_hour: parseInt(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="calories">
                              Calories per Hour (optional)
                            </Label>
                            <Input
                              id="calories"
                              type="number"
                              value={newNutritionItem.calories_per_hour}
                              onChange={(e) =>
                                setNewNutritionItem((prev) => ({
                                  ...prev,
                                  calories_per_hour:
                                    parseInt(e.target.value) || 0,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Notes (optional)</Label>
                          <Input
                            id="notes"
                            placeholder="Additional notes about this item"
                            value={newNutritionItem.notes}
                            onChange={(e) =>
                              setNewNutritionItem((prev) => ({
                                ...prev,
                                notes: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => setShowAddNutrition(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleAddNutritionItem}
                            disabled={isLoading || !newNutritionItem.name}
                          >
                            {isLoading ? "Adding..." : "Add Item"}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {savedNutrition.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No saved nutrition items yet. Add your first item to get
                      started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedNutrition.map((item) => (
                      <div
                        key={item.id}
                        className="border rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {item.carbs_per_hour}g carbs •{" "}
                            {item.sodium_per_hour}
                            mg sodium • {item.water_per_hour}ml water per hour
                          </p>
                          {item.notes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.notes}
                            </p>
                          )}
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Nutrition Item
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{item.name}"?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteNutritionItem(item.id)
                                }
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
