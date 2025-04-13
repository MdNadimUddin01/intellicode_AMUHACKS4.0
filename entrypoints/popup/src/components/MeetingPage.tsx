import { useState } from "react";
import { Calendar, ArrowRight, Users, Video } from "lucide-react";
import { MeetingPageProps } from "../types/props";

export default function MeetingPage({ mode, onSubmit }: MeetingPageProps) {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingCode, setMeetingCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const [userRole, setUserRole] = useState("Teacher");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (userRole === "Teacher") {
      if (!meetingTitle.trim()) {
        setMessage("Please enter a meeting title");
        return;
      }
      // Generate a random meeting code for demonstration
      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setMessage(`Meeting "${meetingTitle}" created! Share code: ${generatedCode}`);
      onSubmit();
    } else {
      if (!meetingCode.trim()) {
        setMessage("Please enter a meeting code");
        return;
      }
      setMessage(`Joining meeting with code: ${meetingCode}`);

      onSubmit();
    }
    
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      if (userRole === "Teacher") {
        setMeetingTitle("");
      } else {
        setMeetingCode("");
      }
    }, 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Virtual Classroom</h2>
        <div className="flex items-center">
          <span className="text-sm mr-2 text-gray-600">
            {userRole === "Teacher" ? "Teacher Mode" : "Student Mode"}
          </span>
          <button
            // onClick={o}
            className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-center">
        <div className="mr-4 bg-blue-500 text-white p-2 rounded-full">
          {userRole === "Teacher" ? <Video size={20} /> : <Users size={20} />}
        </div>
        <div>
          <h3 className="font-medium text-blue-800">
            {userRole === "Teacher" ? "Create a Meeting" : "Join a Meeting"}
          </h3>
          <p className="text-sm text-blue-600">
            {userRole === "Teacher"
              ? "Set up a virtual classroom session"
              : "Enter a code to join a classroom"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {userRole === "Teacher" ? (
          <div className="mb-4">
            <label
              htmlFor="meetingTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Meeting Title
            </label>
            <div className="relative">
              <input
                type="text"
                id="meetingTitle"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Math Class - Geometry Review"
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Calendar
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <label
              htmlFor="meetingCode"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Meeting Code
            </label>
            <div className="relative">
              <input
                type="text"
                id="meetingCode"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="absolute left-3 top-2.5 text-gray-400">#</div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-white font-medium transition-colors ${
            submitted ? "bg-green-500" : "bg-blue-600 hover:bg-blue-700"
          }`}
          disabled={submitted}
        >
          {submitted ? (
            "Success!"
          ) : (
            <>
              {userRole === "Teacher" ? "Create Meeting" : "Join Meeting"}
              <ArrowRight size={16} className="ml-2" />
            </>
          )}
        </button>
      </form>

      {message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            message.includes("Please")
              ? "bg-yellow-50 text-yellow-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
