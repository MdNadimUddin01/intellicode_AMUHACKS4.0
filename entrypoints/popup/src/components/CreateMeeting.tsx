import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Calendar, ArrowRight, IdCard } from "lucide-react";
import { backendUrl } from "../../environment";
import axios from "axios";

const CreateMeeting: React.FC = () => {
  const navigate = useNavigate();
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [meetingDescription, setMeetingDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any): Promise<void> => {
    e.preventDefault();

    if (!meetingTitle.trim()) {
      setMessage("Please enter a meeting title");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in first");
        return;
      }

      const { data } = await axios.post(
        backendUrl + "/classroom/create/",
        {
          name: meetingTitle,
          meeting_id: meetingId,
          description: meetingDescription || "Just PlaceHolder",
        },
        {
          headers: {
            Authorization: `Token ${JSON.parse(token)}`, // Parse the token from JSON string
          },
        }
      );

      localStorage.setItem("teacherMeetingInfo", JSON.stringify(data));

      const generatedCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

      setMessage(
        `Meeting "${meetingTitle}" created! Share code: ${generatedCode}`
      );
      navigate("/teacher-dashboard");
    } catch (error: any) {
      console.error("Error creating meeting:", error);
      setMessage(
        error.response?.data?.message ||
          "Failed to create meeting. Please try again."
      );
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMeetingTitle("");
      setMeetingId("");
      setMeetingDescription("");
    }, 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Virtual Classroom</h2>
        <div className="flex items-center">
          <span className="text-sm mr-2 text-gray-600">Teacher Mode</span>
          <button
            className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
            onClick={() => navigate("/teacher-dashboard")}
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-center">
        <div className="mr-4 bg-blue-500 text-white p-2 rounded-full">
          <Video size={20} />
        </div>
        <div>
          <h3 className="font-medium text-blue-800">Create a Meeting</h3>
          <p className="text-sm text-blue-600">
            Set up a virtual classroom session
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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

        <div className="mb-4">
          <label
            htmlFor="meetingId"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Meeting Id
          </label>
          <div className="relative">
            <input
              type="text"
              id="meetingId"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Math Class - Geometry Review"
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <IdCard
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
        </div>

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
              Create Meeting
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
};

export default CreateMeeting;
