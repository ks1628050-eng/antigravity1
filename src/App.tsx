import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Toast } from './components/layout/Toast';
import { DashboardView } from './components/dashboard/DashboardView';
import { ChatView } from './components/chat/ChatView';
import { AgentView } from './components/agent/AgentView';
import { ExamSolverView } from './components/academic/ExamSolverView';
import { VivaSimulatorView } from './components/academic/VivaSimulatorView';
import { LabRecordView } from './components/academic/LabRecordView';
import { ProjectArchitectView } from './components/academic/ProjectArchitectView';
import { TasksView } from './components/tasks/TasksView';
import { LearningView } from './components/learning/LearningView';
import { CodingView } from './components/coding/CodingView';
import { CareerView } from './components/career/CareerView';
import { ContentView } from './components/content/ContentView';
import { BusinessView } from './components/business/BusinessView';
import { AffiliateView } from './components/affiliate/AffiliateView';
import { MemoryView } from './components/memory/MemoryView';
import { SettingsView } from './components/settings/SettingsView';
import { AuthView } from './components/auth/AuthView';

const MainContent: React.FC = () => {
  const { currentSection, session, isCloudConfigured } = useApp();

  if (isCloudConfigured && !session) return <AuthView />;

  return (
    <div className="app-container flex min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-600 selection:text-white transition-colors duration-200">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 transition-all duration-300">
        <Header />
        
        <main className="flex-1 min-w-0 overflow-y-auto">
          {currentSection === 'dashboard' && <DashboardView />}
          {currentSection === 'chat' && <ChatView />}
          {currentSection === 'agent' && <AgentView />}
          
          {/* New Academic & Viva Modules */}
          {currentSection === 'exam-solver' && <ExamSolverView />}
          {currentSection === 'viva-simulator' && <VivaSimulatorView />}
          {currentSection === 'lab-record' && <LabRecordView />}
          {currentSection === 'project-architect' && <ProjectArchitectView />}
          
          {/* Core Productivity & Engineering */}
          {currentSection === 'tasks' && <TasksView />}
          {currentSection === 'learning' && <LearningView />}
          {currentSection === 'coding' && <CodingView />}
          {currentSection === 'career' && <CareerView />}
          {currentSection === 'content' && <ContentView />}
          {currentSection === 'business' && <BusinessView />}
          {currentSection === 'affiliate' && <AffiliateView />}
          {currentSection === 'memory' && <MemoryView />}
          {currentSection === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Animated Toast */}
      <Toast />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
