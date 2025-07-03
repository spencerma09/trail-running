import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";

interface UserProfileSetupProps {
  user: any;
  onComplete: () => void;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  gender: string;
  location: string;
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({
  user,
  onComplete,
}) => {
  const [profile, setProfile] = useState<UserProfile>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    age: "",
    gender: "",
    location: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from("user_profiles").insert({
        user_id: user.id,
        first_name: profile.firstName,
        last_name: profile.lastName,
        email: profile.email,
        age: profile.age ? parseInt(profile.age) : null,
        gender: profile.gender || null,
        location: profile.location || null,
      });

      if (error) {
        throw error;
      }

      onComplete();
    } catch (error: any) {
      console.error("Error creating user profile:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-background">
        <CardHeader>
          <CardTitle className="text-center">
            Welcome to UltraSherpa! Let's set up your profile.
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Help us personalize your experience by providing some basic
            information.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  placeholder="Enter your first name"
                  value={profile.firstName}
                  onChange={(e) => updateProfile("firstName", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  placeholder="Enter your last name"
                  value={profile.lastName}
                  onChange={(e) => updateProfile("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={profile.email}
                onChange={(e) => updateProfile("email", e.target.value)}
                required
                disabled={!!user?.email}
              />
              {user?.email && (
                <p className="text-sm text-muted-foreground">
                  Email automatically filled from your account
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age">Age (optional)</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={profile.age}
                  onChange={(e) => updateProfile("age", e.target.value)}
                  min="1"
                  max="120"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender (optional)</Label>
                <Select
                  value={profile.gender}
                  onValueChange={(value) => updateProfile("gender", value)}
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (optional)</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={profile.location}
                onChange={(e) => updateProfile("location", e.target.value)}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="px-8">
                {isLoading ? "Creating Profile..." : "Complete Setup"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfileSetup;
