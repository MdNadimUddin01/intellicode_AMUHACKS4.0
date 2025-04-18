export interface WXTHomePageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export interface LoginFormProps {
  onTeacherLogin: () => void;
  onStudentLogin: () => void;
  onBackClick: () => void;
  onSignupClick: () => void;
}

export interface SignupFormProps {
  onSignupSuccess: (isTeacher: boolean) => void;
  onBackClick: () => void;
}

export interface TeacherDashboardProps {
  onLogout: () => void;
  onLeaveMeeting : () => void
}

export interface StudentDashboardProps {
  onLogout: () => void;
  onLeaveMeeting: () => void;
}

export interface MeetingPageProps {
  mode: string;
  onSubmit: () => void;
}
