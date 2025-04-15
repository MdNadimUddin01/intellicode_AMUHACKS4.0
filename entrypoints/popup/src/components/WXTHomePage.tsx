import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  MessageSquare,
  User,
  Users,
} from "lucide-react";

export default function WXTHomePage() {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const features = [
    {
      title: "Join Virtual Classes",
      description:
        "Connect with teachers and classmates in real-time video sessions",
      icon: <Users className="h-6 w-6 text-blue-500" />,
    },
    {
      title: "Interactive Learning",
      description:
        "Participate in polls, quizzes, and collaborative activities",
      icon: <MessageSquare className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Accessible Education",
      description: "Learn from anywhere with our browser extension",
      icon: <BookOpen className="h-6 w-6 text-purple-500" />,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setIsAnimating(false);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="px-4 py-3 bg-white shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-1 rounded">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-bold text-blue-900 text-lg">
              LearnConnect
            </span>
          </div>


          {/* For small screens - show user icon */}
          <div className="sm:hidden">
            <button className="p-1.5 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col md:flex-row px-4 py-8 max-w-7xl mx-auto w-full">
        {/* Left Column - Hero Text */}
        <div className="md:w-1/2 flex flex-col justify-center pb-8 md:pb-0">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Virtual Classroom <span className="text-blue-600">Made Simple</span>
          </h1>

          <p className="text-gray-600 mb-6">
            Connect with teachers and students instantly through our browser
            extension. No downloads required, just seamless educational
            experiences.
          </p>

          <ul className="space-y-3 mb-8">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Check className="h-4 w-4 text-blue-600" />
                </span>
                <span className="text-gray-700">{feature.title}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center justify-center sm:justify-start"
            >
              Log In
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Right Column - Interactive Demo */}
        <div className="md:w-1/2 flex items-center justify-center">
          <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            {/* Demo Header */}
            <div className="bg-blue-600 px-4 py-3 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Virtual Classroom</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 rounded-full bg-red-400"></div>
                <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
              </div>
            </div>

            {/* Interactive Feature Showcase */}
            <div className="p-6">
              <div
                className={`transition-opacity duration-500 ${
                  isAnimating ? "opacity-0" : "opacity-100"
                }`}
              >
                <div className="flex items-center mb-4">
                  {features[currentFeature].icon}
                  <h3 className="text-lg font-medium text-gray-900 ml-3">
                    {features[currentFeature].title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {features[currentFeature].description}
                </p>

                {/* Animated Dots */}
                <div className="flex justify-center space-x-2 mt-8">
                  {features.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                        index === currentFeature ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
          <div className="text-sm text-gray-600 mb-2 sm:mb-0">
            © 2025 LearnConnect. All rights reserved.
          </div>
          <div className="flex space-x-4 text-sm text-gray-500">
            <a href="#" className="hover:text-blue-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-blue-600 transition-colors">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
