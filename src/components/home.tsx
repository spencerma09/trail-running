import React, { useState, useEffect } from "react";
import { MoonIcon, SunIcon, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import RaceProfileForm, {
  RaceProfile as RaceProfileType,
} from "./RaceProfileForm";
import NutritionSliders, { NutritionPlan } from "./NutritionSliders";
import AidStationInput from "./AidStationInput";
import AidStationCarousel from "./AidStationCarousel";
import ReportGenerator from "./ReportGenerator";
import UserProfileSetup from "./UserProfileSetup";
import UserProfile from "./UserProfile";
import { UnitPreferences } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface AidStation {
  id: string;
  name: string;
  distance: number;
  elevation?: number;
}

interface AidStationWithTiming extends AidStation {
  estimatedTime: number;
  nutritionNeeded: {
    carbs: number;
    sodium: number;
    water: number;
  };
}

type Step = "race-details" | "nutrition" | "aid-stations" | "review" | "report";

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("race-details");
  const [raceProfile, setRaceProfile] = useState<RaceProfileType | null>(null);
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(
    null,
  );
  const [aidStations, setAidStations] = useState<AidStation[]>([]);
  const [finalAidStations, setFinalAidStations] = useState<
    AidStationWithTiming[]
  >([]);

  // Authentication state
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup" | "reset">(
    "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Authentication functions
  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        checkUserProfile(user.id);
      }
    };
    getCurrentUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        checkUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setNeedsProfileSetup(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        // No profile found, user needs to set up profile
        setNeedsProfileSetup(true);
        setUserProfile(null);
      } else if (error) {
        console.error("Error checking user profile:", error);
      } else {
        setUserProfile(data);
        setNeedsProfileSetup(false);
      }
    } catch (error) {
      console.error("Error checking user profile:", error);
    }
  };

  const handleProfileSetupComplete = () => {
    setNeedsProfileSetup(false);
    if (user) {
      checkUserProfile(user.id);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    try {
      if (authMode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          // Provide more specific error messages
          if (error.message.includes("Invalid login credentials")) {
            throw new Error(
              "Invalid email or password. Please check your credentials and try again.",
            );
          }
          if (error.message.includes("Email not confirmed")) {
            throw new Error(
              "Please check your email and click the confirmation link before signing in.",
            );
          }
          throw error;
        }
        setShowAuthDialog(false);
        setEmail("");
        setPassword("");
      } else if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) {
          if (error.message.includes("User already registered")) {
            throw new Error(
              "An account with this email already exists. Please sign in instead.",
            );
          }
          throw error;
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
          setAuthError(
            "Please check your email and click the confirmation link to complete your registration.",
          );
        } else {
          setAuthError("Account created successfully! You can now sign in.");
        }
        setShowAuthDialog(false);
        setEmail("");
        setPassword("");
      } else if (authMode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;

        setAuthError(
          "Password reset email sent! Please check your email for instructions.",
        );
        setShowAuthDialog(false);
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      setAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error("Google OAuth error:", error);
        throw error;
      }
      console.log("Google OAuth initiated:", data);
    } catch (error: any) {
      console.error("Google auth error:", error);
      setAuthError(`Google authentication failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookAuth = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        console.error("Facebook OAuth error:", error);
        throw error;
      }
      console.log("Facebook OAuth initiated:", data);
    } catch (error: any) {
      console.error("Facebook auth error:", error);
      setAuthError(`Facebook authentication failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const parseEstimatedTimeToHours = (timeString: string): number => {
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    return hours + minutes / 60 + seconds / 3600;
  };

  const handleRaceProfileSubmit = (profile: RaceProfileType) => {
    setRaceProfile(profile);
    setCurrentStep("nutrition");
  };

  const handleNutritionNext = (nutrition: NutritionPlan) => {
    setNutritionPlan(nutrition);
    setCurrentStep("aid-stations");
  };

  const handleAidStationsNext = (stations: AidStation[]) => {
    setAidStations(stations);
    setCurrentStep("review");
  };

  const handleReviewNext = (stationsWithTiming: AidStationWithTiming[]) => {
    setFinalAidStations(stationsWithTiming);
    setCurrentStep("report");
  };

  const handleStartOver = () => {
    setCurrentStep("race-details");
    setRaceProfile(null);
    setNutritionPlan(null);
    setAidStations([]);
    setFinalAidStations([]);
  };

  const handleBack = () => {
    switch (currentStep) {
      case "nutrition":
        setCurrentStep("race-details");
        break;
      case "aid-stations":
        setCurrentStep("nutrition");
        break;
      case "review":
        setCurrentStep("aid-stations");
        break;
      case "report":
        setCurrentStep("review");
        break;
    }
  };

  return (
    <div className={`min-h-screen bg-background ${darkMode ? "dark" : ""}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src="/ultrasherpa-icon.png"
                alt="UltraSherpa"
                className="h-10 w-10"
              />
              <h1 className="text-3xl font-bold">UltraSherpa</h1>
            </div>
            {/* Progress indicator */}
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className={
                  currentStep === "race-details"
                    ? "text-primary font-medium"
                    : ""
                }
              >
                1. Race Details
              </span>
              <span>→</span>
              <span
                className={
                  currentStep === "nutrition" ? "text-primary font-medium" : ""
                }
              >
                2. Nutrition
              </span>
              <span>→</span>
              <span
                className={
                  currentStep === "aid-stations"
                    ? "text-primary font-medium"
                    : ""
                }
              >
                3. Aid Stations
              </span>
              <span>→</span>
              <span
                className={
                  currentStep === "review" ? "text-primary font-medium" : ""
                }
              >
                4. Review
              </span>
              <span>→</span>
              <span
                className={
                  currentStep === "report" ? "text-primary font-medium" : ""
                }
              >
                5. Report
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserProfile(true)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    {userProfile
                      ? `${userProfile.first_name} ${userProfile.last_name}`
                      : user.email}
                  </span>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {authMode === "login"
                        ? "Sign In"
                        : authMode === "signup"
                          ? "Create Account"
                          : "Reset Password"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Social Auth Buttons - only show for login/signup */}
                    {authMode !== "reset" && (
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleGoogleAuth}
                          disabled={isLoading}
                        >
                          Continue with Google
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={handleFacebookAuth}
                          disabled={isLoading}
                        >
                          Continue with Facebook
                        </Button>
                      </div>
                    )}

                    {/* Separator - only show for login/signup */}
                    {authMode !== "reset" && (
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator className="w-full" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">
                            Or continue with email
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Email Auth Form */}
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      {/* Password field - not needed for reset */}
                      {authMode !== "reset" && (
                        <div className="space-y-2">
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                      )}

                      {authError && (
                        <div
                          className={`text-sm p-2 rounded ${
                            authError.includes("check your email")
                              ? "text-blue-600 bg-blue-50"
                              : "text-red-600 bg-red-50"
                          }`}
                        >
                          {authError}
                        </div>
                      )}

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading
                          ? "Loading..."
                          : authMode === "login"
                            ? "Sign In"
                            : authMode === "signup"
                              ? "Create Account"
                              : "Send Reset Email"}
                      </Button>
                    </form>

                    <div className="text-center text-sm space-y-2">
                      {authMode === "reset" ? (
                        <button
                          type="button"
                          className="text-primary hover:underline"
                          onClick={() => {
                            setAuthMode("login");
                            setAuthError(null);
                          }}
                        >
                          Back to Sign In
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="text-primary hover:underline"
                            onClick={() => {
                              setAuthMode(
                                authMode === "login" ? "signup" : "login",
                              );
                              setAuthError(null);
                            }}
                          >
                            {authMode === "login"
                              ? "Don't have an account? Sign up"
                              : "Already have an account? Sign in"}
                          </button>
                          {authMode === "login" && (
                            <div>
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-primary text-xs"
                                onClick={() => {
                                  setAuthMode("reset");
                                  setAuthError(null);
                                }}
                              >
                                Forgot your password?
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto">
          {currentStep === "race-details" && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Step 1: Race Details
                </h2>
                <p className="text-muted-foreground">
                  Enter your race information to get started with your
                  personalized plan
                </p>
              </div>
              <RaceProfileForm onSubmit={handleRaceProfileSubmit} />
            </div>
          )}

          {currentStep === "nutrition" && raceProfile && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Step 2: Nutrition Planning
                </h2>
                <p className="text-muted-foreground">
                  Set your target nutrition intake based on your race duration
                </p>
              </div>
              <NutritionSliders
                estimatedTime={parseEstimatedTimeToHours(
                  raceProfile.estimatedTime,
                )}
                onNext={handleNutritionNext}
                onBack={handleBack}
              />
            </div>
          )}

          {currentStep === "aid-stations" && raceProfile && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Step 3: Aid Stations
                </h2>
                <p className="text-muted-foreground">
                  Define your aid station locations and distances
                </p>
              </div>
              <AidStationInput
                unitPreferences={raceProfile.unitPreferences}
                onNext={handleAidStationsNext}
                onBack={handleBack}
              />
            </div>
          )}

          {currentStep === "review" && raceProfile && nutritionPlan && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Step 4: Review Aid Stations
                </h2>
                <p className="text-muted-foreground">
                  Fine-tune timing and nutrition for each aid station
                </p>
              </div>
              <AidStationCarousel
                aidStations={aidStations}
                nutritionPlan={nutritionPlan}
                totalDistance={parseFloat(raceProfile.distance)}
                totalTime={parseEstimatedTimeToHours(raceProfile.estimatedTime)}
                unitPreferences={raceProfile.unitPreferences}
                onNext={handleReviewNext}
                onBack={handleBack}
              />
            </div>
          )}

          {currentStep === "report" && raceProfile && nutritionPlan && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Step 5: Race Plan Report
                </h2>
                <p className="text-muted-foreground">
                  Your complete race strategy is ready
                </p>
              </div>
              <ReportGenerator
                raceProfile={raceProfile}
                nutritionPlan={nutritionPlan}
                aidStations={finalAidStations}
                onBack={handleBack}
                onStartOver={handleStartOver}
                user={user}
              />
            </div>
          )}
        </main>

        <footer className="mt-12 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} UltraSherpa. All rights reserved.</p>
        </footer>
      </div>

      {/* User Profile Setup Modal */}
      {needsProfileSetup && user && (
        <UserProfileSetup user={user} onComplete={handleProfileSetupComplete} />
      )}

      {/* User Profile Modal */}
      {showUserProfile && user && (
        <UserProfile user={user} onClose={() => setShowUserProfile(false)} />
      )}
    </div>
  );
}
