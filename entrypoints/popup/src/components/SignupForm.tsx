import { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, User, UserCheck } from 'lucide-react';
import { SignupFormProps } from '../types/props';

export default function SignupForm({ onSignupSuccess, onBackClick }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);

  const handleSubmit = () => {
    
    if (password !== confirmPassword) {
      setPasswordMatch(false);
      return;
    }
    
    setIsLoading(true);
    
    // Simulating API call
    setTimeout(() => {
      console.log('Signup attempt with:', { email, password, role });
      setIsLoading(false);
    }, 1500);

    onSignupSuccess(role === 'teacher');
  };

  const handleConfirmPasswordChange = (e:any) => {
    setConfirmPassword(e.target.value);
    setPasswordMatch(true); // Reset error state on change
  };

  return (
    <div className="w-full max-h-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <UserCheck className="text-white" size={24} />
          </div>
        </div>
        
        <h1 className="text-xl font-bold text-center text-gray-800 mb-6">Create your account</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div 
                className={`border rounded-md p-3 flex items-center cursor-pointer transition-colors ${role === 'student' ? 'bg-blue-50 border-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}
                onClick={() => setRole('student')}
              >
                <input 
                  type="radio" 
                  name="role" 
                  id="role-student" 
                  checked={role === 'student'} 
                  onChange={() => setRole('student')}
                  className="h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="role-student" className="ml-2 block text-sm font-medium cursor-pointer">
                  Student
                </label>
              </div>
              
              <div 
                className={`border rounded-md p-3 flex items-center cursor-pointer transition-colors ${role === 'teacher' ? 'bg-blue-50 border-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}
                onClick={() => setRole('teacher')}
              >
                <input 
                  type="radio" 
                  name="role" 
                  id="role-teacher" 
                  checked={role === 'teacher'} 
                  onChange={() => setRole('teacher')}
                  className="h-4 w-4 text-blue-600 border-gray-300"
                />
                <label htmlFor="role-teacher" className="ml-2 block text-sm font-medium cursor-pointer">
                  Teacher
                </label>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={16} className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff size={16} className="text-gray-400" />
                ) : (
                  <Eye size={16} className="text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
          </div>

          <div className="mb-6">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={16} className="text-gray-400" />
              </div>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                className={`pl-10 w-full py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${!passwordMatch ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
              />
            </div>
            {!passwordMatch && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center"
            disabled={isLoading}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <div className="text-sm">
            <button
              type="button"
              onClick={onBackClick}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}