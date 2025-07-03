import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import UserProfile from "@/components/UserProfile";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

const UserProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);

        // If no user is logged in, redirect to home
        if (!user) {
          navigate("/");
        }
      } catch (error) {
        console.error("Error getting current user:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };
    getCurrentUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate("/");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleClose = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to UltraSherpa
            </Button>
            <div className="flex items-center gap-3">
              <img
                src="/ultrasherpa-icon.png"
                alt="UltraSherpa"
                className="h-8 w-8"
              />
              <h1 className="text-xl font-bold">User Profile</h1>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Component */}
      <UserProfile user={user} onClose={handleClose} />
    </div>
  );
};

export default UserProfilePage;
