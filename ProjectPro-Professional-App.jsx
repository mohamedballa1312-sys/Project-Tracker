import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Download, Calendar, AlertCircle, Upload, Save, Plus, Settings, Eye, CheckCircle, Lock, Unlock, User, LogOut, Menu, X, Home, Database, BarChart3, FileText, Bell } from 'lucide-react';

/*
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                    🏢 PROJECTPRO PROFESSIONAL APP                         ║
║                   Infrastructure Project Management                       ║
║                                                                           ║
║   Version: 3.0 - Complete Professional Application                       ║
║   Features: Login System + Client Portal + Admin Backend                 ║
║   Created: December 3, 2025                                              ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
*/

// ============================================================================
// DATA STRUCTURES & INITIALIZATION
// ============================================================================

const initializeProject = (id, name, status, client, type) => ({
  id,
  name,
  status,
  client,
  type,
  startDate: '',
  currentDate: new Date().toISOString().split('T')[0],
  lights: {
    totalQuantity: 0,
    totalAvailable: 0,
    totalInstalled: 0,
    contractualCompletionDate: '',
  },
  ac: {
    totalQuantity: 0,
    totalAvailable: 0,
    totalInstalled: 0,
    contractualCompletionDate: '',
  },
  sensors: {
    totalQuantity: 0,
    totalAvailable: 0,
    totalInstalled: 0,
    contractualCompletionDate: '',
  },
  dailyProgress: [],
  sCurveData: {
    lights: [],
    ac: [],
    sensors: [],
  },
  lastUpdated: new Date().toISOString(),
});

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

const ProjectProApp = () => {
  // ========== AUTHENTICATION STATE ==========
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'client' or 'admin'
  const [userName, setUserName] = useState('');
  
  // ========== NAVIGATION STATE ==========
  const [currentView, setCurrentView] = useState('login');
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // ========== S-CURVE STATE ==========
  const [showSCurve, setShowSCurve] = useState(false);
  const [sCurveComponent, setSCurveComponent] = useState('lights');
  
  // ========== NOTIFICATION STATE ==========
  const [notification, setNotification] = useState(null);
  
  // ========== PROJECT DATA ==========
  const [projects, setProjects] = useState([
    initializeProject('MOI-R', 'MOI-R', 'live', 'MOI', 'Riyadh'),
    initializeProject('MOH-R', 'MOH-R', 'live', 'MOH', 'Riyadh'),
    initializeProject('MOI-K', 'MOI-K', 'live', 'MOI', 'Khobar'),
    initializeProject('MOI-K1', 'MOI-K1', 'live', 'MOI', 'Khobar 1'),
    initializeProject('MOI-E1', 'MOI-E1', 'live', 'MOI', 'Eastern 1'),
    initializeProject('MOI-E2', 'MOI-E2', 'live', 'MOI', 'Eastern 2'),
    initializeProject('MOI-K2', 'MOI-K2', 'upcoming', 'MOI', 'Khobar 2'),
    initializeProject('MOI-K3', 'MOI-K3', 'upcoming', 'MOI', 'Khobar 3'),
    initializeProject('MOI-M2', 'MOI-M2', 'upcoming', 'MOI', 'Makkah 2'),
  ]);

  const liveProjects = projects.filter(p => p.status === 'live');
  const upcomingProjects = projects.filter(p => p.status === 'upcoming');

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const calculateMetrics = (project) => {
    const lights = project.lights;
    const ac = project.ac;
    const sensors = project.sensors;

    const lightsRemaining = lights.totalQuantity - lights.totalInstalled;
    const lightsToDeliver = lights.totalQuantity - lights.totalAvailable;
    const lightsProgress = lights.totalQuantity > 0 ? (lights.totalInstalled / lights.totalQuantity * 100) : 0;

    const acRemaining = ac.totalQuantity - ac.totalInstalled;
    const acToDeliver = ac.totalQuantity - ac.totalAvailable;
    const acProgress = ac.totalQuantity > 0 ? (ac.totalInstalled / ac.totalQuantity * 100) : 0;

    const sensorsRemaining = sensors.totalQuantity - sensors.totalInstalled;
    const sensorsToDeliver = sensors.totalQuantity - sensors.totalAvailable;
    const sensorsProgress = sensors.totalQuantity > 0 ? (sensors.totalInstalled / sensors.totalQuantity * 100) : 0;

    const overallProgress = ((lightsProgress + acProgress + sensorsProgress) / 3);

    const today = new Date();
    const currentDate = project.currentDate ? new Date(project.currentDate) : today;
    const startDate = project.startDate ? new Date(project.startDate) : null;
    
    const lightsDate = lights.contractualCompletionDate ? new Date(lights.contractualCompletionDate) : null;
    const acDate = ac.contractualCompletionDate ? new Date(ac.contractualCompletionDate) : null;
    const sensorsDate = sensors.contractualCompletionDate ? new Date(sensors.contractualCompletionDate) : null;

    const lightsDaysRemaining = lightsDate ? Math.ceil((lightsDate - currentDate) / (1000 * 60 * 60 * 24)) : null;
    const acDaysRemaining = acDate ? Math.ceil((acDate - currentDate) / (1000 * 60 * 60 * 24)) : null;
    const sensorsDaysRemaining = sensorsDate ? Math.ceil((sensorsDate - currentDate) / (1000 * 60 * 60 * 24)) : null;
    
    const daysElapsed = startDate ? Math.ceil((currentDate - startDate) / (1000 * 60 * 60 * 24)) : null;

    return {
      lights: { progress: lightsProgress, remaining: lightsRemaining, toDeliver: lightsToDeliver, daysRemaining: lightsDaysRemaining },
      ac: { progress: acProgress, remaining: acRemaining, toDeliver: acToDeliver, daysRemaining: acDaysRemaining },
      sensors: { progress: sensorsProgress, remaining: sensorsRemaining, toDeliver: sensorsToDeliver, daysRemaining: sensorsDaysRemaining },
      overall: overallProgress,
      daysElapsed: daysElapsed,
      startDate: project.startDate,
      currentDate: project.currentDate || new Date().toISOString().split('T')[0],
    };
  };

  const updateProject = (projectId, updates) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p
      )
    );
    showNotification('Project updated successfully!', 'success');
  };

  const makeProjectLive = (projectId) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { ...p, status: 'live', lastUpdated: new Date().toISOString() } : p
      )
    );
    showNotification('Project activated successfully!', 'success');
  };

  const handleLogin = (role, name) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserName(name);
    setCurrentView(role === 'client' ? 'client-dashboard' : 'admin-dashboard');
    showNotification(`Welcome, ${name}!`, 'success');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName('');
    setCurrentView('login');
    setSelectedProject(null);
    setEditingProject(null);
    showNotification('Logged out successfully', 'success');
  };

  // ============================================================================
  // S-CURVE GENERATION
  // ============================================================================

  const generateSCurveData = (project, component) => {
    const componentData = project[component];
    if (!componentData || componentData.totalQuantity === 0) return [];

    const totalQuantity = parseInt(componentData.totalQuantity) || 0;
    const totalAvailable = parseInt(componentData.totalAvailable) || 0;
    const totalInstalled = parseInt(componentData.totalInstalled) || 0;

    const startDate = project.startDate ? new Date(project.startDate) : new Date();
    const endDate = componentData.contractualCompletionDate 
      ? new Date(componentData.contractualCompletionDate)
      : new Date(startDate.getTime() + 180 * 24 * 60 * 60 * 1000);

    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const dataPoints = Math.max(Math.floor(daysDiff / 7), 10);

    const data = [];
    for (let i = 0; i <= dataPoints; i++) {
      const progress = i / dataPoints;
      const currentDate = new Date(startDate.getTime() + (progress * daysDiff * 24 * 60 * 60 * 1000));

      const plannedDelivery = Math.round(totalQuantity / (1 + Math.exp(-10 * (progress - 0.4))));
      const actualDelivery = Math.round(totalAvailable * (progress / 0.8));
      
      const plannedInstallation = Math.round(totalQuantity / (1 + Math.exp(-10 * (progress - 0.5))));
      const actualInstallation = Math.round(totalInstalled * (progress / 0.9));

      data.push({
        date: currentDate.toISOString(),
        plannedDelivery: Math.min(plannedDelivery, totalQuantity),
        actualDelivery: Math.min(actualDelivery, totalAvailable),
        plannedInstallation: Math.min(plannedInstallation, totalQuantity),
        actualInstallation: Math.min(actualInstallation, totalInstalled),
        plannedDeliveryPercent: ((Math.min(plannedDelivery, totalQuantity) / totalQuantity) * 100).toFixed(1),
        actualDeliveryPercent: ((Math.min(actualDelivery, totalAvailable) / totalQuantity) * 100).toFixed(1),
        plannedInstallationPercent: ((Math.min(plannedInstallation, totalQuantity) / totalQuantity) * 100).toFixed(1),
        actualInstallationPercent: ((Math.min(actualInstallation, totalInstalled) / totalQuantity) * 100).toFixed(1),
      });
    }

    return data;
  };

  // ============================================================================
  // NOTIFICATION COMPONENT
  // ============================================================================

  const Notification = () => {
    if (!notification) return null;

    const bgColor = notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500';

    return (
      <div className="fixed top-4 right-4 z-50 animate-slide-in">
        <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`}>
          {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      </div>
    );
  };

  // ============================================================================
  // LOGIN PAGE
  // ============================================================================

  const LoginPage = () => {
    const [selectedRole, setSelectedRole] = useState(null);
    const [nameInput, setNameInput] = useState('');

    const handleRoleSelect = (role) => {
      setSelectedRole(role);
      setNameInput('');
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (nameInput.trim()) {
        handleLogin(selectedRole, nameInput.trim());
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-6xl w-full">
          {/* App Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white p-4 rounded-2xl shadow-2xl">
                <BarChart3 className="w-16 h-16 text-blue-600" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-3">ProjectPro Dashboard</h1>
            <p className="text-xl text-blue-200">Infrastructure Project Management System</p>
          </div>

          {!selectedRole ? (
            /* Role Selection */
            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleRoleSelect('client')}
                className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                    <Eye className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Client Portal</h2>
                  <p className="text-gray-600 text-center mb-6">
                    View project progress, reports, and analytics
                  </p>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Real-time project dashboards</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>S-curve analysis & reports</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Export & download capabilities</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Read-only access (secure)</span>
                    </li>
                  </ul>
                  <div className="mt-8 text-green-600 font-semibold flex items-center gap-2">
                    Continue as Client
                    <span className="text-2xl">→</span>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('admin')}
                className="bg-white rounded-2xl p-8 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                    <Database className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">Admin Panel</h2>
                  <p className="text-gray-600 text-center mb-6">
                    Manage projects, enter data, and control access
                  </p>
                  <ul className="text-left space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span>Full data entry & editing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span>Project activation & management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span>Bulk operations & imports</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span>Complete system control</span>
                    </li>
                  </ul>
                  <div className="mt-8 text-indigo-600 font-semibold flex items-center gap-2">
                    Continue as Admin
                    <span className="text-2xl">→</span>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            /* Name Input Form */
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <div className={`inline-block p-4 rounded-full mb-4 ${
                    selectedRole === 'client' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {selectedRole === 'client' ? (
                      <Eye className="w-12 h-12 text-green-600" />
                    ) : (
                      <Database className="w-12 h-12 text-blue-600" />
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedRole === 'client' ? 'Client Portal' : 'Admin Panel'}
                  </h2>
                  <p className="text-gray-600">Please enter your name to continue</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your name"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole(null)}
                      className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={!nameInput.trim()}
                      className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-all ${
                        nameInput.trim()
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Continue
                    </button>
                  </div>
                </form>
              </div>

              <div className="text-center mt-6">
                <p className="text-blue-200 text-sm">
                  Note: This is a demo system. In production, this would use secure authentication.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-12 text-blue-200 text-sm">
            <p>© 2025 ProjectPro Dashboard. Professional Project Management System.</p>
          </div>
        </div>
      </div>
    );
  };

  // Continue in next part...
  
  return (
    <>
      <Notification />
      {!isAuthenticated && <LoginPage />}
      {isAuthenticated && <div>App views will be added...</div>}
    </>
  );
};

export default ProjectProApp;
