
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ClipboardList, Tag, Settings as SettingsIcon, Home, FileText } from 'lucide-react';
import Dashboard from './components/Dashboard';
import LabelMaker from './components/LabelMaker';
import TemperatureLog from './components/TemperatureLog';
import SettingsPage from './components/SettingsPage';
import ReportPage from './components/ReportPage';
import { Fridge, DailyLog, Settings } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('chefaiuto_settings');
    return saved ? JSON.parse(saved) : {
      googleSheetsUrl: '',
      fridges: [
        { id: '1', name: 'Frigo Carni' },
        { id: '2', name: 'Frigo Verdure' },
        { id: '3', name: 'Congelatore' }
      ]
    };
  });

  const [logs, setLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('chefaiuto_logs');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('chefaiuto_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('chefaiuto_logs', JSON.stringify(logs));
  }, [logs]);

  const addLog = (newLog: DailyLog) => {
    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50 pb-20 md:pb-0 md:pl-64">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full left-0 top-0">
          <div className="p-6 border-b border-slate-800">
            <h1 className="text-2xl font-bold text-white tracking-tight">ChefAiuto</h1>
            <p className="text-slate-400 text-xs">HACCP Management</p>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <NavLink to="/" icon={<Home size={20} />} label="Dashboard" />
            <NavLink to="/temperature" icon={<ClipboardList size={20} />} label="Temperature" />
            <NavLink to="/etichette" icon={<Tag size={20} />} label="Etichette" />
            <NavLink to="/report" icon={<FileText size={20} />} label="Report Mensile" />
            <NavLink to="/settings" icon={<SettingsIcon size={20} />} label="Impostazioni" />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard logs={logs} />} />
            <Route path="/temperature" element={<TemperatureLog fridges={settings.fridges} onSave={addLog} settings={settings} />} />
            <Route path="/etichette" element={<LabelMaker />} />
            <Route path="/report" element={<ReportPage logs={logs} />} />
            <Route path="/settings" element={<SettingsPage settings={settings} setSettings={setSettings} />} />
          </Routes>
        </main>

        {/* Mobile Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 text-white flex justify-around items-center h-16 border-t border-slate-800 z-50">
          <MobileNavLink to="/" icon={<Home size={24} />} />
          <MobileNavLink to="/temperature" icon={<ClipboardList size={24} />} />
          <MobileNavLink to="/etichette" icon={<Tag size={24} />} />
          <MobileNavLink to="/report" icon={<FileText size={24} />} />
          <MobileNavLink to="/settings" icon={<SettingsIcon size={24} />} />
        </nav>
      </div>
    </Router>
  );
};

const NavLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
        isActive ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </Link>
  );
};

const MobileNavLink: React.FC<{ to: string; icon: React.ReactNode }> = ({ to, icon }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`p-2 rounded-full transition-colors ${
        isActive ? 'bg-blue-600 text-white' : 'text-slate-400'
      }`}
    >
      {icon}
    </Link>
  );
};

export default App;
