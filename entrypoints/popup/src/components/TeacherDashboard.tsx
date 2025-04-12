import { useState, useEffect } from "react";
import { Search, Clock, Users, Bell, BarChart, AlertTriangle, CheckCircle, Menu, X, Filter, ChevronDown, ChevronUp } from "lucide-react";

// Define TypeScript interfaces
interface Student {
  id: number;
  name: string;
  email: string;
  focus: number;
  avatar: string;
  joinTime: string;
  isActive: boolean;
  hasCamera: boolean;
  hasMic: boolean;
}

interface WindowSize {
  width: number;
  height: number;
}

type SortBy = "name" | "email" | "focus" | "joinTime";
type SortDirection = "asc" | "desc";

const TeacherDashboard = () => {
  const [meetingTime, setMeetingTime] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState<boolean>(false);
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);
  
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Emily Johnson",
      email: "emily.j@school.edu",
      focus: 95,
      avatar: "/api/placeholder/40/40",
      joinTime: "10:03 AM",
      isActive: true,
      hasCamera: true,
      hasMic: true
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "m.chen@school.edu",
      focus: 78,
      avatar: "/api/placeholder/40/40",
      joinTime: "10:01 AM",
      isActive: true,
      hasCamera: true,
      hasMic: false
    },
    {
      id: 3,
      name: "Sophia Williams",
      email: "s.williams@school.edu",
      focus: 88,
      avatar: "/api/placeholder/40/40",
      joinTime: "10:05 AM",
      isActive: true,
      hasCamera: false,
      hasMic: true
    },
    {
      id: 4,
      name: "Aiden Rodriguez",
      email: "a.rodriguez@school.edu",
      focus: 42,
      avatar: "/api/placeholder/40/40",
      joinTime: "10:02 AM",
      isActive: true,
      hasCamera: true,
      hasMic: true
    },
    {
      id: 5,
      name: "Olivia Martinez",
      email: "o.martinez@school.edu",
      focus: 65,
      avatar: "/api/placeholder/40/40",
      joinTime: "10:07 AM",
      isActive: false,
      hasCamera: true,
      hasMic: true
    },
  ]);

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

  // Format time as hh:mm:ss
  const formatTime = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Simulate meeting timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMeetingTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get focus color based on value
  const getFocusColor = (focus: number): string => {
    if (focus >= 80) return "text-green-500";
    if (focus >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  // Get focus icon based on value
  const getFocusIcon = (focus: number) => {
    if (focus >= 80) return <CheckCircle size={windowSize.width < 640 ? 14 : 16} className="text-green-500" />;
    if (focus >= 60) return <AlertTriangle size={windowSize.width < 640 ? 14 : 16} className="text-yellow-500" />;
    return <AlertTriangle size={windowSize.width < 640 ? 14 : 16} className="text-red-500" />;
  };

  // Handle sorting
  const handleSort = (column: SortBy): void => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  // Filter and sort students
  const filteredAndSortedStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      } else {
        return sortDirection === "asc" 
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

  const getSortIcon = (column: SortBy): string | null => {
    if (sortBy !== column) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // Check if we're in a small viewport (typical for extension popups)
  const isSmallScreen = windowSize.width < 640;
  const isMediumScreen = windowSize.width >= 640 && windowSize.width < 768;

  // Toggle mobile expanded view for a student
  const toggleStudentExpand = (id: number): void => {
    if (expandedStudentId === id) {
      setExpandedStudentId(null);
    } else {
      setExpandedStudentId(id);
    }
  };

  return (
    <div className="bg-gray-100 w-full min-h-screen sm:min-h-0 overflow-hidden flex flex-col relative">
      {/* Header with meeting info */}
      <header className="bg-blue-600 text-white py-2 sm:py-3 px-3 sm:px-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {isSmallScreen && (
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="mr-2 p-1 rounded-md hover:bg-blue-700 focus:outline-none"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            )}
            <div>
              <h1 className="font-medium text-base sm:text-lg truncate">
                {isSmallScreen ? "Geometry Review" : "Mathematics - Geometry Review"}
              </h1>
              {!isSmallScreen && (
                <div className="flex items-center space-x-4 text-blue-100 text-xs sm:text-sm mt-1">
                  <div className="flex items-center">
                    <Clock size={windowSize.width < 768 ? 12 : 14} className="mr-1" />
                    <span>{formatTime(meetingTime)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={windowSize.width < 768 ? 12 : 14} className="mr-1" />
                    <span>{students.filter(s => s.isActive).length} Students</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            {isSmallScreen && (
              <div className="flex items-center mr-2">
                <Users size={16} className="mr-1 text-blue-200" />
                <span className="text-xs text-blue-100">{students.filter(s => s.isActive).length}</span>
              </div>
            )}
            <div className="text-xs sm:text-sm bg-blue-500 px-2 py-1 rounded-full truncate">
              {isSmallScreen ? "ID: XYZ123" : "Meeting ID: XYZ123"}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu (slide-out for small screens) */}
      {isSmallScreen && isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute top-0 left-0 h-full w-64 bg-white shadow-lg z-50 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-medium text-gray-800">Dashboard Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-600 block mb-2">Meeting Info</span>
                <div className="pl-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-700">
                    <Clock size={14} className="mr-1 text-blue-500" />
                    <span>{formatTime(meetingTime)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Users size={14} className="mr-1 text-blue-500" />
                    <span>{students.filter(s => s.isActive).length} Students</span>
                  </div>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium text-gray-600 block mb-2">Focus Summary</span>
                <div className="pl-2 space-y-1">
                  <div className="flex items-center text-sm text-gray-700">
                    <BarChart size={14} className="mr-1 text-blue-500" />
                    <span>Average: {Math.round(students.reduce((sum, s) => sum + s.focus, 0) / students.length)}%</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <AlertTriangle size={14} className="mr-1 text-red-500" />
                    <span>{students.filter(s => s.focus < 60).length} Need Attention</span>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 flex flex-col gap-4 border-t border-gray-200">
                <button className="px-3 py-2 w-full rounded-md bg-blue-600 text-white text-sm">
                  End Meeting
                </button>
                <button className="px-3 py-2 w-full rounded-md bg-blue-600 text-white text-sm">
                  Exclude All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard content */}
      <div className="p-3 sm:p-4 flex-grow overflow-y-auto">
        {/* Search and filters */}
        <div className="mb-3 sm:mb-4">
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search size={isSmallScreen ? 14 : 16} className="absolute left-3 top-2.5 text-gray-400" />
            
            {isSmallScreen && (
              <button 
                className="absolute right-3 top-2.5 text-gray-400"
                onClick={() => setIsFiltersVisible(!isFiltersVisible)}
              >
                <Filter size={14} />
              </button>
            )}
          </div>
          
          {(!isSmallScreen || isFiltersVisible) && (
            <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-2 sm:mb-0 bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-md">
              <button className="flex-grow sm:flex-grow-0 px-2 py-1 text-xs rounded-md border border-gray-300 bg-white">
                All Students ({students.length})
              </button>
              <button className="flex-grow sm:flex-grow-0 px-2 py-1 text-xs rounded-md border border-gray-300 bg-white">
                Needs Attention ({students.filter(s => s.focus < 60).length})
              </button>
              <button className="flex-grow sm:flex-grow-0 px-2 py-1 text-xs rounded-md border border-gray-300 bg-white">
                Engaged ({students.filter(s => s.focus >= 80).length})
              </button>
              <button className="flex-grow sm:flex-grow-0 px-2 py-1 text-xs rounded-md border border-gray-300 bg-white">
                Inactive ({students.filter(s => !s.isActive).length})
              </button>
            </div>
          )}
        </div>

        {/* Student List - For larger screens */}
        {!isSmallScreen && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        <span>Student Name</span>
                        <span className="ml-1">{getSortIcon("name")}</span>
                      </div>
                    </th>
                    {!isMediumScreen && (
                      <th 
                        scope="col" 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => handleSort("email")}
                      >
                        <div className="flex items-center">
                          <span>Email</span>
                          <span className="ml-1">{getSortIcon("email")}</span>
                        </div>
                      </th>
                    )}
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("focus")}
                    >
                      <div className="flex items-center">
                        <span>Focus</span>
                        <span className="ml-1">{getSortIcon("focus")}</span>
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort("joinTime")}
                    >
                      <div className="flex items-center">
                        <span>Joined</span>
                        <span className="ml-1">{getSortIcon("joinTime")}</span>
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedStudents.map((student) => (
                    <tr key={student.id} className={!student.isActive ? "bg-gray-50" : ""}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
                            <img src={student.avatar} alt="" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      {!isMediumScreen && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </td>
                      )}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {getFocusIcon(student.focus)}
                          <div className={`ml-2 text-sm font-medium ${getFocusColor(student.focus)}`}>
                            {student.focus}%
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {student.joinTime}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-1">
                          {student.isActive ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                          
                          {!student.hasCamera && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              No Camera
                            </span>
                          )}
                          
                          {!student.hasMic && (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              No Mic
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Student List - For small screens (card view) */}
        {isSmallScreen && (
          <div className="space-y-2 mb-3">
            {filteredAndSortedStudents.map((student) => (
              <div 
                key={student.id} 
                className={`bg-white rounded-lg border ${!student.isActive ? "border-gray-200" : student.focus < 60 ? "border-red-200" : "border-gray-200"} overflow-hidden`}
              >
                <div 
                  className="p-3 flex justify-between items-center cursor-pointer"
                  onClick={() => toggleStudentExpand(student.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full overflow-hidden">
                      <img src={student.avatar} alt="" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                      <div className="text-xs text-gray-500">{student.joinTime}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`text-sm font-medium ${getFocusColor(student.focus)}`}>
                      {student.focus}%
                    </div>
                    <button>
                      {expandedStudentId === student.id ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                {expandedStudentId === student.id && (
                  <div className="px-3 pb-3 pt-0 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="text-gray-500">Email:</div>
                      <div className="font-medium text-gray-800 truncate">{student.email}</div>
                      
                      <div className="text-gray-500">Status:</div>
                      <div className="font-medium text-gray-800">
                        {student.isActive ? "Active" : "Inactive"}
                      </div>
                      
                      <div className="text-gray-500">Camera:</div>
                      <div className="font-medium text-gray-800">
                        {student.hasCamera ? "On" : "Off"}
                      </div>
                      
                      <div className="text-gray-500">Microphone:</div>
                      <div className="font-medium text-gray-800">
                        {student.hasMic ? "On" : "Off"}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex space-x-2">
                      <button className="flex-1 px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700">
                        Message
                      </button>
                      <button className="flex-1 px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700">
                        Exclude
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Focus Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700">Class Focus</h3>
              <BarChart size={isSmallScreen ? 14 : 16} className="text-gray-400" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {Math.round(students.reduce((sum, student) => sum + student.focus, 0) / students.length)}%
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${Math.round(students.reduce((sum, student) => sum + student.focus, 0) / students.length)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700">Attention Required</h3>
              <AlertTriangle size={isSmallScreen ? 14 : 16} className="text-red-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-red-500">
              {students.filter(s => s.focus < 60).length}
            </div>
            <div className="mt-1 text-xs sm:text-sm text-gray-500">
              Students with focus below 60%
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-700">Engaged Students</h3>
              <CheckCircle size={isSmallScreen ? 14 : 16} className="text-green-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-500">
              {students.filter(s => s.focus >= 80).length}
            </div>
            <div className="mt-1 text-xs sm:text-sm text-gray-500">
              Students with focus above 80%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;