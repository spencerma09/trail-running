import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("OAuth callback error:", error);
          navigate("/");
          return;
        }

        if (data.session) {
          console.log("OAuth successful:", data.session.user);
          // Wait a moment for the auth state to propagate
          setTimeout(() => {
            navigate("/");
          }, 1000);
        } else {
          console.log("No session found, redirecting to home");
          navigate("/");
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        navigate("/");
      } finally {
        setIsProcessing(false);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-lg mb-2">
          {isProcessing ? "Signing you in..." : "Redirecting..."}
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
