import { useRef, useState } from "react";
import LoginForm from "./src/components/LoginForm";
import SignupForm from "./src/components/SignupForm";
import MeetingPage from "./src/components/MeetingPage";
import StudentMeetingPage from "./src/components/StudentMeetingPage";
import TeacherDashboard from "./src/components/TeacherDashboard";
import {createHashRouter, RouterProvider } from "react-router";
import { LogIn } from "lucide-react";
import WXTHomePage from "./src/components/WXTHomePage";




const router = createHashRouter([
  {
    path: '/',
    element: <WXTHomePage />,
    
    children : [
       
       {
        path : "signup",
        element:<SignupForm/>
       },
       {
        path:"teacherDashBoard",
        element:<TeacherDashboard/>
       },
       {
        path:"studentDashBoard",
        element:<StudentMeetingPage/>
       },
       {
        path: "createMeeting",
        element:<MeetingPage/>
       },
       {
        path : "/login",
        element:<LoginForm/>
       },
       {
        path: "joinMeeting",
        element:<MeetingPage/>
       }
    ]
  },
  {
    path:"*" ,
    element:<div className="text-center w-full">404 Error</div>
  }
], {
  // This is important - use a basename that works with your extension
  basename: '/',
})
function App() {
  return <RouterProvider router={router} />;
}

export default App;
