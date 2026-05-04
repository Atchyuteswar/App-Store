import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import ActiveTests from "@/pages/tester/ActiveTests";
import TestingHub from "@/pages/tester/TestingHub";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/app/:slug" element={<AppDetail />} />
          <Route path="/login" element={<UserAuth />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Tester Nested Routes */}
          <Route path="/tester" element={<TesterLayout />}>
            <Route path="dashboard" element={<TesterOverview />} />
            <Route path="active" element={<ActiveTests />} />
            <Route path="apps/:slug" element={<TestingHub />} />
            <Route path="settings" element={<div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">Tester settings coming soon</div>} />
          </Route>
          
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </AuthProvider>
  );
}
