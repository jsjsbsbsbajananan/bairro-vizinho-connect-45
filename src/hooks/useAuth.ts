import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useAuthRequired = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      }
      setIsChecking(false);
    }
  }, [user, loading, navigate]);

  return { user, loading: loading || isChecking };
};