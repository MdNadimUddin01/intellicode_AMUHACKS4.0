import { useState, useEffect } from "react";
import LoginForm from "./src/components/LoginForm";
import SignupForm from "./src/components/SignupForm";
import StudentDashboard from "./src/components/StudentDashboard";
import TeacherDashboard from "./src/components/TeacherDashboard";
import WXTHomePage from "./src/components/WXTHomePage";
import CreateMeeting from "./src/components/CreateMeeting";
import JoinMeeting from "./src/components/JoinMeeting";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check for user in localStorage on component mount
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      setUser(userData);

      // Navigate to appropriate dashboard based on user role
      if (userData.role === "teacher") {
        setCurrentPage("teacherDashboard");
      } else if (userData.role === "student") {
        setCurrentPage("studentDashboard");
      }
    }
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <WXTHomePage
            onLoginClick={() => setCurrentPage("login")}
            onSignupClick={() => setCurrentPage("signup")}
          />
        );
      case "login":
        return (
          <LoginForm
            onTeacherLogin={() => {
              setCurrentPage("teacherDashboard");
            }}
            onStudentLogin={() => {
              setCurrentPage("studentDashboard");
            }}
            onBackClick={() => setCurrentPage("home")}
            onSignupClick={() => setCurrentPage("signup")}
          />
        );
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
        return <TeacherDashboard onLogout={() => setCurrentPage("home")} />;
      case "studentDashboard":
        return (
          <StudentDashboard
            onLogout={() => setCurrentPage("home")}
            onJoinMeeting={() => setCurrentPage("joinMeeting")}
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
