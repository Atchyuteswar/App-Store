import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/Home";
import AppDetail from "@/pages/AppDetail";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import UserAuth from "@/pages/UserAuth";
import Profile from "@/pages/Profile";
import TesterLayout from "@/layouts/TesterLayout";
import TesterOverview from "@/pages/tester/TesterOverview";
import MyAppList from "@/pages/tester/MyAppList";
import BugTracker from "@/pages/tester/BugTracker";
import IdeaBoard from "@/pages/tester/IdeaBoard";
import MessageCenter from "@/pages/tester/MessageCenter";
import ActivityCalendar from "@/pages/tester/ActivityCalendar";
import NotificationCenter from "@/pages/tester/NotificationCenter";
import TesterProfile from "@/pages/tester/TesterProfile";
import Tasks from "@/pages/tester/Tasks";
import Timeline from "@/pages/tester/Timeline";
import Polls from "@/pages/tester/Polls";
import Leaderboard from "@/pages/tester/Leaderboard";
import PublicProfile from "@/pages/tester/PublicProfile";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app/:slug" element={<AppDetail />} />
          <Route path="/login" element={<UserAuth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/t/:username" element={<PublicProfile />} />
          
          {/* Tester Nested Routes */}
          <Route path="/tester" element={<TesterLayout />}>
            <Route index element={<Navigate to="/tester/dashboard" replace />} />
            <Route path="dashboard" element={<TesterOverview />} />
            <Route path="apps" element={<MyAppList />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="bugs" element={<BugTracker />} />
            <Route path="ideas" element={<IdeaBoard />} />
            <Route path="polls" element={<Polls />} />
            <Route path="messages" element={<MessageCenter />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="activity" element={<ActivityCalendar />} />
            <Route path="notifications" element={<NotificationCenter />} />
            <Route path="profile" element={<TesterProfile />} />
          </Route>
          
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}

