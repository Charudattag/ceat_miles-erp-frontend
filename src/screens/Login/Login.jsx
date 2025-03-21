import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.scss";
import logo from "../../assets/logo/logo.png";
import { useMutation } from "@tanstack/react-query";
import { loginAPI } from "../../../src/api/api";
import { ToastContainer, toast } from "react-toastify"; // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import the default styles for the toast

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const { mutate, isLoading, isError, error } = useMutation({
    mutationFn: loginAPI,
    onSuccess: (data) => {
      // console.log(data, "data");
      localStorage.setItem("authToken", data.accessToken);
      localStorage.setItem("mobile", mobile);
      toast.success("Login successful! "); // Success toast
      navigate("/dashboard");
    },
    onError: () => {
      toast.error("Invalid credentials, please try again."); // Error toast
    },
  });

  const handleLogin = () => {
    mutate({ mobile, password });
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center vh-100">
      <div className="card p-4 login-card">
        <div className="text-center mb-4">
          <img
            src={logo}
            alt="Logo"
            className="logo mb-3"
            style={{ width: "200px" }}
          />
          <h4 className="login-title">CEAT MILES ADMIN PANEL</h4>
        </div>
        <div className="form-group mb-3">
          <label>Mobile No.</label>
          <input
            type="mobile"
            className="form-control"
            placeholder="Enter your mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>
        <div className="form-group mb-3">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary w-100 mt-3"
          onClick={handleLogin}
          disabled={isLoading} // Disable button when loading
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>

        {/* Show error message */}
        {isError && (
          <div className="error-message text-danger mt-2">
            {error?.message || "Something went wrong"}
          </div>
        )}
      </div>

      {/* Toast container to show toasts */}
      <ToastContainer />
    </div>
  );
};

export default Login;
