import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Exchange token from URL fragment for a session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (session) {
        console.log("Authenticated:", session.user);
        navigate("/"); // Redirect to home page
      } else {
        console.error("OAuth error:", error);
        navigate("/"); // Redirect to home page even on error
      }
    });

    // Clean up the URL fragment
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-center text-lg">Signing you in...</p>
    </div>
  );
};

export default AuthCallback;
