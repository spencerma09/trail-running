import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // First, try to get the session from the URL hash/query params
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
        }

        // If we have a session, the user is already authenticated
        if (sessionData.session) {
          console.log("User already authenticated:", sessionData.session.user);
          setTimeout(() => {
            navigate("/");
          }, 1000);
          return;
        }

        // Check if this is an email confirmation callback
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get("access_token");
        const refreshToken = urlParams.get("refresh_token");
        const type = urlParams.get("type");

        // Also check the hash for tokens (some OAuth providers use hash)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1),
        );
        const hashAccessToken = hashParams.get("access_token");
        const hashRefreshToken = hashParams.get("refresh_token");
        const hashType = hashParams.get("type");

        const finalAccessToken = accessToken || hashAccessToken;
        const finalRefreshToken = refreshToken || hashRefreshToken;
        const finalType = type || hashType;

        if (finalAccessToken && finalType === "signup") {
          // This is an email confirmation, set the session
          const { data: authData, error: authError } =
            await supabase.auth.setSession({
              access_token: finalAccessToken,
              refresh_token: finalRefreshToken || "",
            });

          if (authError) {
            console.error("Error setting session:", authError);
            navigate("/");
            return;
          }

          if (authData.session) {
            console.log(
              "Email confirmation successful, user logged in:",
              authData.session.user,
            );
            setTimeout(() => {
              navigate("/");
            }, 1000);
            return;
          }
        }

        // For other OAuth callbacks, try to get the session normally
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("OAuth callback error:", error);
          navigate("/");
          return;
        }

        if (data.session) {
          console.log("OAuth successful:", data.session.user);
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
