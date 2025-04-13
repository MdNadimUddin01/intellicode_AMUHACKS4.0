import { StudentDashboardProps } from '../types/props';
import { LogOut, Video } from 'lucide-react';

export default function StudentDashboard({ onLogout, onJoinMeeting }: StudentDashboardProps) {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <button
            onClick={onLogout}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </div>

          <div className="grid gap-4">
            <button
              onClick={onJoinMeeting}
              className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center">
                <Video className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Join Meeting</h3>
                  <p className="text-sm text-gray-500">Enter a meeting code to join</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
