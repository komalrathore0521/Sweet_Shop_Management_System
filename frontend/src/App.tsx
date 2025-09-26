import React, { useState } from 'react';
import { AuthProvider } from './components/AuthProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { AdminPanel } from './components/AdminPanel';
import { Loader as Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading Sweet Shop...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <LoginForm
        isRegister={isRegister}
        onToggleMode={() => setIsRegister(!isRegister)}
      />
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'admin':
        return <AdminPanel />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;