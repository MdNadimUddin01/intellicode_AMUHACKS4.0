import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { backendUrl } from "../../environment";
import { useContext } from "react";
import { UserContext } from "../../App";

interface FormState {
  username: string;
  password: string;
  showPassword: boolean;
  rememberMe: boolean;
  isLoading: boolean;
}

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { setUser: setContextUser } = useContext(UserContext);
  // Form state using useState with TypeScript
  const [username, setusername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  const handleSubmit = async (): Promise<void> => {
    // e.preventDefault();
    setIsLoading(true);
    // Simulating API call

    const { data } = await axios.post(backendUrl + "/login/", {
      username,
      password,
    });

    localStorage.setItem("token", JSON.stringify(data.token));
    localStorage.setItem("user", JSON.stringify(data.user));

    // Update the user context so ProtectedRoute knows we're authenticated
    setContextUser(data.user);

    setTimeout(() => {
      console.log("Login attempt with:", { username, password, rememberMe });
      setIsLoading(false);
    }, 1500);

    // Get user role from the response and navigate accordingly
    if (data.user.role === "teacher") {
      navigate("/create-meeting");
    } else {
      navigate("/join-meeting");
    }
  };

  const handleusernameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setusername(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const handleRememberMeChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setRememberMe(e.target.checked);
  };

  return (
    <div className="w-full min-h-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <Lock className="text-white" size={24} />
          </div>
        </div>

        <h1 className="text-xl font-bold text-center text-gray-800 mb-6">
          Sign in to your account
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-400" />
              </div>
              <input
                id="username"
                type="username"
                className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                value={username}
                onChange={handleusernameChange}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              {/* <button 
                type="button" 
                onClick={onBackClick}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Back to Home
              </button> */}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff size={16} className="text-gray-400" />
                ) : (
                  <Eye size={16} className="text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center mb-6">
            <input
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              checked={rememberMe}
              onChange={handleRememberMeChange}
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center"
            disabled={isLoading}
            onClick={() => handleSubmit()}
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/signup")}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Don't have an account? Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
