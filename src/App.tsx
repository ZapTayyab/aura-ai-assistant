import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthLayout } from "@/components/layouts/AuthLayout";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import NewAudit from "./pages/NewAudit";
import Settings from "./pages/Settings";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Protected dashboard routes */}
              <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/app/projects" replace />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/:projectId" element={<ProjectDetail />} />
                <Route path="projects/:projectId/audits/new" element={<NewAudit />} />
                <Route path="settings" element={<Settings />} />
                <Route path="billing" element={<Billing />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
