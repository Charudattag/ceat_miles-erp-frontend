import { jwtDecode } from "jwt-decode";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      navigate("/");
      return;
    }

    let userRole = null;
    try {
      const decodedToken = jwtDecode(authToken);
      // userRole = decodedToken?.username;
    } catch(error) {
      console.error("Invalid token format:", error);
      navigate("/");
      return;
    }

    // if (userRole !== "ADMIN") {
    //   navigate("/");
    // }
  }, [navigate]);

  return children;
};

export default ProtectedRoute;
 