import { useState } from "react";
import { Users, ArrowRight } from "lucide-react";
import { backendUrl } from "../../environment";
import axios from "axios";

interface JoinMeetingProps {
  onSubmit: () => void;
}

const JoinMeeting: React.FC<JoinMeetingProps> = ({ onSubmit }) => {
  const [meetingCode, setMeetingCode] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any): Promise<void> => {
    e.preventDefault();

    if (!meetingCode.trim()) {
      setMessage("Please enter a meeting code");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Please log in first");
        return;
      }

      const { data } = await axios.post(
        backendUrl + `/classroom/${meetingCode}/join/`,
        {},
        {
          headers: {
            Authorization: `Token ${JSON.parse(token)}`,
          },
        }
      );

      localStorage.setItem("studentMeetingInfo", JSON.stringify(data.room));
      setMessage(`Joining meeting with code: ${meetingCode}`);
      onSubmit();
    } catch (error: any) {
      console.error("Error joining meeting:", error);
      setMessage(
        error.response?.data?.message ||
          "Failed to join meeting. Please check the code and try again."
      );
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMeetingCode("");
    }, 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Virtual Classroom</h2>
        <div className="flex items-center">
          <span className="text-sm mr-2 text-gray-600">Student Mode</span>
          <button
            className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors"
            onClick={() => onSubmit()}
          >
            Back
          </button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-6 flex items-center">
        <div className="mr-4 bg-blue-500 text-white p-2 rounded-full">
          <Users size={20} />
        </div>
        <div>
          <h3 className="font-medium text-blue-800">Join a Meeting</h3>
          <p className="text-sm text-blue-600">
            Enter a code to join a classroom
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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
              Join Meeting
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

export default JoinMeeting;
