import { useState } from "react";
import LoginForm from "./src/components/LoginForm";
import SignupForm from "./src/components/SignupForm";
import MeetingPage from "./src/components/MeetingPage";
import StudentDashboard from "./src/components/StudentDashboard";
import TeacherDashboard from "./src/components/TeacherDashboard";
import WXTHomePage from "./src/components/WXTHomePage";
import StudentMeetingPage from "./src/components/StudentMeetingPage";

type Page =
  | "home"
  | "login"
  | "signup"
  | "teacherDashboard"
  | "studentDashboard"
  | "createMeeting"
  | "joinMeeting";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
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
            onTeacherLogin={() => setCurrentPage("teacherDashboard")}
            onStudentLogin={() => setCurrentPage("studentDashboard")}
            onSignupClick={() => setCurrentPage("signup")}
            onBackClick={() => setCurrentPage("home")}
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
          <MeetingPage
            mode="create"
            onSubmit={() => setCurrentPage("teacherDashboard")}
          />
        );
      case "joinMeeting":
        return (
          <MeetingPage
            mode="join"
            onSubmit={() => setCurrentPage("studentDashboard")}
          />
        );
      default:
        return <div className="text-center w-full">404 Error</div>;
    }
  };

  return <div className="w-full h-full">{renderPage()}</div>;
}

export default App;
