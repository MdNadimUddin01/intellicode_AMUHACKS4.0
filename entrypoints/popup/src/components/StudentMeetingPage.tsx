import { useState, useEffect } from "react";
import { Clock, X, Mic, MicOff, Video, VideoOff, ChevronDown, ChevronUp } from "lucide-react";

const StudentMeetingPage = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [meetingTime, setMeetingTime] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format time as mm:ss
  const formatTime = (timeInSeconds:any) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Simulate meeting timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine if we're in a small viewport
  const isSmallScreen = windowSize.width < 480;

  return (
    <div className="bg-gray-100 w-full max-w-full sm:max-w-md mx-auto rounded-lg shadow-lg overflow-hidden">
      {/* Header with meeting info */}
      <header className="bg-blue-600 text-white py-2 sm:py-3 px-3 sm:px-4">
        <div className="flex justify-between items-center flex-wrap sm:flex-nowrap">
          <div className={isSmallScreen ? "w-full mb-1" : ""}>
            <h1 className="font-medium text-base sm:text-lg truncate">Math Class - Geometry Review</h1>
            <div className="flex items-center text-blue-100 text-xs sm:text-sm mt-1">
              <div className="flex items-center">
                <Clock size={isSmallScreen ? 12 : 14} className="mr-1" />
                <span>{formatTime(meetingTime)}</span>
              </div>
            </div>
          </div>
          
          <div className={`text-xs sm:text-sm bg-blue-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full ${isSmallScreen ? "ml-auto mt-1" : ""}`}>
            ID: XYZ123
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="p-3 sm:p-4 bg-white">
        {/* Video area - adjust height based on screen size */}
        <div className={`bg-gray-900 rounded-lg mb-3 sm:mb-4 relative flex items-center justify-center ${isSmallScreen ? "h-48" : "h-56 sm:h-64"}`}>
          <div className="text-center text-white p-2 sm:p-4">
            <div className={`mx-auto bg-gray-700 rounded-full overflow-hidden mb-2 relative ${isSmallScreen ? "w-16 h-16" : "w-20 h-20 sm:w-24 sm:h-24"}`}>
              <img 
                src="/api/placeholder/96/96" 
                alt="Your video" 
                className={`w-full h-full object-cover ${isVideoOff ? 'opacity-0' : ''}`}
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                  <div className={`font-bold text-gray-500 ${isSmallScreen ? "text-base" : "text-lg sm:text-xl"}`}>You</div>
                </div>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">Camera {isVideoOff ? 'off' : 'on'}</p>
          </div>
          
          {/* Meeting controls - smaller on mobile */}
          <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center">
            <div className="bg-gray-800 rounded-full px-2 sm:px-3 py-1 flex space-x-1 sm:space-x-2">
              <button 
                onClick={() => setIsMuted(prev => !prev)}
                className={`p-1.5 sm:p-2 rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>
                {isMuted ? <MicOff size={isSmallScreen ? 14 : 16} /> : <Mic size={isSmallScreen ? 14 : 16} />}
              </button>
              <button 
                onClick={() => setIsVideoOff(prev => !prev)}
                className={`p-1.5 sm:p-2 rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>
                {isVideoOff ? <VideoOff size={isSmallScreen ? 14 : 16} /> : <Video size={isSmallScreen ? 14 : 16} />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Meeting details - collapsible on small screens */}
        <div className="mb-3 sm:mb-4 bg-blue-50 rounded-lg border border-blue-100 overflow-hidden">
          <div 
            className="flex justify-between items-center p-2 sm:p-3 cursor-pointer"
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
          >
            <h2 className="font-medium text-blue-800 text-xs sm:text-sm">Meeting Details</h2>
            <button className="text-blue-500">
              {isDetailsExpanded ? 
                <ChevronUp size={isSmallScreen ? 14 : 16} /> : 
                <ChevronDown size={isSmallScreen ? 14 : 16} />
              }
            </button>
          </div>
          
          {isDetailsExpanded && (
            <div className="px-2 sm:px-3 pb-2 sm:pb-3 pt-0">
              <div className="grid grid-cols-2 gap-1 sm:gap-2 text-xs sm:text-sm">
                <div className="text-gray-600">Subject:</div>
                <div className="font-medium">Mathematics</div>
                <div className="text-gray-600">Topic:</div>
                <div className="font-medium">Geometry Review</div>
                <div className="text-gray-600">Teacher:</div>
                <div className="font-medium">Ms. Johnson</div>
                <div className="text-gray-600">Duration:</div>
                <div className="font-medium">45 minutes</div>
              </div>
            </div>
          )}
        </div>
        
        {/* End meeting button - adjust sizing for mobile */}
        <button 
          onClick={() => setShowExitConfirm(true)}
          className="w-full bg-red-500 hover:bg-red-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-md flex items-center justify-center transition-colors text-sm sm:text-base">
          <X size={isSmallScreen ? 14 : 16} className="mr-1 sm:mr-2" />
          End Meeting
        </button>
      </div>

      {/* Exit confirmation modal - responsive sizing */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white rounded-lg p-3 sm:p-4 max-w-xs w-full">
            <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Leave Meeting?</h3>
            <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">Are you sure you want to leave this meeting?</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setShowExitConfirm(false)}
                className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-xs sm:text-sm">
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowExitConfirm(false);
                  // Here you would typically navigate away or close the meeting
                }}
                className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs sm:text-sm">
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentMeetingPage;