import React, { useState, useEffect, createContext, useContext } from "react";
import { MemoryRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import LoginForm from "./src/components/LoginForm";
import SignupForm from "./src/components/SignupForm";
import StudentDashboard from "./src/components/StudentDashboard";
import TeacherDashboard from "./src/components/TeacherDashboard";
import WXTHomePage from "./src/components/WXTHomePage";
import CreateMeeting from "./src/components/CreateMeeting";
import JoinMeeting from "./src/components/JoinMeeting";

interface User {
  id: string;
  email: string;
  role: "teacher" | "student";
  // Add other user properties as needed
}

// Context provider to manage user state across the application
export const UserContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
  handleLogin: (userData: User) => void;
}>({ user: null, setUser: () => {}, handleLogin: () => {} });

// Custom hook to use the user context
const useUser = () => useContext(UserContext);

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for user in localStorage on component mount
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser) as User;
      setUser(userData);
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", "your_token_here");
  };

  return (
    <UserContext.Provider value={{ user, setUser, handleLogin }}>
      <div className="w-full h-full">
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<InitialRedirect />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/teacher-dashboard" element={
              <ProtectedRoute role="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student-dashboard" element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/create-meeting" element={
              <ProtectedRoute role="teacher">
                <CreateMeeting />
              </ProtectedRoute>
            } />
            <Route path="/join-meeting" element={
              <ProtectedRoute role="student">
                <JoinMeeting />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </MemoryRouter>
      </div>
    </UserContext.Provider>
  );
}

// Protected route component to handle authentication and role-based access
interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: "teacher" | "student";
}

function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (role && user.role !== role) {
      navigate(user.role === "teacher" ? "/create-meeting" : "/join-meeting");
    }

    // Check for meeting info to determine if user should be in a dashboard
    const meetingInfo = localStorage.getItem(
      user.role === "teacher" ? "teacherMeetingInfo" : "studentMeetingInfo"
    );

    if (meetingInfo) {
      // If on meeting creation/join page but meeting exists, redirect to dashboard
      if (
        (user.role === "teacher" && location.pathname === "/create-meeting") ||
        (user.role === "student" && location.pathname === "/join-meeting")
      ) {
        navigate(user.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard");
      }
    } else {
      // If on dashboard but no meeting exists, redirect to creation/join page
      if (
        (user.role === "teacher" && location.pathname === "/teacher-dashboard") ||
        (user.role === "student" && location.pathname === "/student-dashboard")
      ) {
        navigate(user.role === "teacher" ? "/create-meeting" : "/join-meeting");
      }
    }
  }, [user, role, navigate, location]);

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return <>{children}</>;
}



// Component to handle initial redirection when the extension popup opens
function InitialRedirect() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  
  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    
    if (storedUser && storedToken) {
      // User is logged in, update context
      const userData = JSON.parse(storedUser) as User;
      setUser(userData);
      
      // Check if there's meeting info
      const meetingInfo = localStorage.getItem(
        userData.role === "teacher" ? "teacherMeetingInfo" : "studentMeetingInfo"
      );
      
      if (meetingInfo) {
        // User has an active meeting, redirect to dashboard
        navigate(userData.role === "teacher" ? "/teacher-dashboard" : "/student-dashboard");
      } else {
        // User is logged in but no meeting, redirect to create/join meeting
        navigate(userData.role === "teacher" ? "/create-meeting" : "/join-meeting");
      }
    }
    // If no user is logged in, stay on the home page
  }, [navigate, setUser]);
  
  // Show the home page while checking, it will redirect if needed
  return <WXTHomePage />;
}

export default App;
