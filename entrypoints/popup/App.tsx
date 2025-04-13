import { useState, useEffect } from "react";
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

function App() {
  const [currentPage, setCurrentPage] = useState<
    | "home"
    | "login"
    | "signup"
    | "teacherDashboard"
    | "studentDashboard"
    | "createMeeting"
    | "joinMeeting"
  >("home");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for user in localStorage on component mount
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const meetingInfo =
      localStorage.getItem("studentMeetingInfo") ||
      localStorage.getItem("teacherMeetingInfo");

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser) as User;
      setUser(userData);

      // If meetingInfo exists, go directly to dashboard
      if (meetingInfo) {
        if (userData.role === "teacher") {
          setCurrentPage("teacherDashboard");
        } else if (userData.role === "student") {
          setCurrentPage("studentDashboard");
        }
        return;
      }

      // Navigate to appropriate dashboard based on user role
      if (userData.role === "teacher") {
        setCurrentPage("createMeeting");
      } else if (userData.role === "student") {
        setCurrentPage("joinMeeting");
      }
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", "your_token_here");

    // Check for meetingInfo after login
    const meetingInfo =
      localStorage.getItem("studentMeetingInfo") ||
      localStorage.getItem("teacherMeetingInfo");
    if (meetingInfo) {
      if (userData.role === "teacher") {
        setCurrentPage("teacherDashboard");
      } else if (userData.role === "student") {
        setCurrentPage("studentDashboard");
      }
      return;
    }

    // Navigate to appropriate dashboard based on user role
    if (userData.role === "teacher") {
      setCurrentPage("createMeeting");
    } else if (userData.role === "student") {
      setCurrentPage("joinMeeting");
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <WXTHomePage
            onLoginClick={() => setCurrentPage("login")}
            onSignupClick={() => setCurrentPage("signup")}
          />
        );
      // case "login":
      //   return (
      //     // <LoginForm
      //     //   onTeacherLogin={(userData: User) => {
      //     //     handleLogin(userData);
      //     //   }}
      //     //   onStudentLogin={(userData: User) => {
      //     //     handleLogin(userData);
      //     //   }}
      //     //   onBackClick={() => setCurrentPage("home")}
      //     //   onSignupClick={() => setCurrentPage("signup")}
      //     // />
      //   );
      case "signup":
        return (
          <SignupForm
            onSignupSuccess={(isTeacher: boolean) =>
              setCurrentPage(isTeacher ? "createMeeting" : "joinMeeting")
            }
            onBackClick={() => setCurrentPage("home")}
          />
        );
      case "teacherDashboard":
        return <TeacherDashboard onLeaveMeeting={() => setCurrentPage("createMeeting")} onLogout={() => setCurrentPage("home")} />;
      case "studentDashboard":
        return (
          <StudentDashboard
            onLogout={() => setCurrentPage("home")}
            onLeaveMeeting ={() => setCurrentPage("joinMeeting")}
          />
        );
      case "createMeeting":
        return (
          <CreateMeeting onSubmit={() => setCurrentPage("teacherDashboard")} />
        );
      case "joinMeeting":
        return (
          <JoinMeeting onSubmit={() => setCurrentPage("studentDashboard")} />
        );
      default:
        return <div className="text-center w-full">404 Error</div>;
    }
  };

  return <div className="w-full h-full">{renderPage()}</div>;
}

export default App;
