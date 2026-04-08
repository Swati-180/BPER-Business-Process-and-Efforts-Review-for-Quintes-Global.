import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { FormWizard } from "./components/FormWizard/FormWizard";
import { ProcessAnalytics } from "./components/ProcessAnalytics";
import { AdminUsers } from "./components/AdminUsers";
import { BperFormStatus } from "./components/BperFormStatus";
import { Employee360 } from "./components/Employee360";
import { EperDashboard } from "./components/EperDashboard";
import { WdtReview } from "./components/WdtReview";
import { SixBySixScoring } from "./components/SixBySixScoring";
import { FitmentScoring } from "./components/FitmentScoring";
import { DeepReports } from "./components/DeepReports";
import { Login } from "./components/Login";
import { Register } from "./components/RequestAccess";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";
import { EmployeeLayout } from "./components/EmployeeLayout";
import { AdminLayout } from "./components/AdminLayout";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Navigate to="/bper/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-2xl font-bold text-red-600">Access Denied</h1><p className="text-gray-600 mt-2">You don't have permission to access this page.</p><a href="/login" className="text-blue-600 hover:underline mt-4 inline-block">Go to Login</a></div></div>} />

      {/* Employee Routes */}
      <Route
        path="/bper"
        element={
          <ProtectedRoute requiredRole="employee">
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="status" element={<BperFormStatus />} />
        <Route path="wizard" element={<FormWizard />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/client-manager"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<EperDashboard />} />
        <Route path="analytics" element={<ProcessAnalytics />} />
        <Route path="employee360" element={<Employee360 />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="wdt-review" element={<WdtReview />} />
        <Route path="sixbysix" element={<SixBySixScoring />} />
        <Route path="fitment" element={<FitmentScoring />} />
        <Route path="reports" element={<DeepReports />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/bper/dashboard" replace />} />
    </Routes>
  );
}

export default App;
