import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';

// Views
import { WelcomeAuthView } from './views/WelcomeAuthView';
import { DashboardView } from './views/DashboardView';
import { GoalSetupView } from './views/GoalSetupView';
import { DiagnosticView } from './views/DiagnosticView';
import { DiagnosticResultsView } from './views/DiagnosticResultsView';
import {
  VoiceSimulationSetupView,
  predefinedScenarios,
} from './views/VoiceSimulationSetupView';
import { LiveVoiceSimulationView } from './views/LiveVoiceSimulationView';
import { SimulationResultsView } from './views/SimulationResultsView';
import { CodingRoundView } from './views/CodingRoundView';
import { StudyPodsView } from './views/StudyPodsView';
import { ProfileSettingsView } from './views/ProfileSettingsView';

import { VoiceScenario, SimulationResult, PracticeTurn } from './types';
import { Menu, X } from 'lucide-react';

export const App: React.FC = () => {
  const { currentRoute, navigateTo, user, saveSimulationResult } = useApp();

  // Mobile drawer state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Active voice simulation state
  const [activeVoiceScenario, setActiveVoiceScenario] = useState<VoiceScenario>(
    predefinedScenarios[0]
  );
  const [completedSimResult, setCompletedSimResult] = useState<{
    scenario: VoiceScenario;
    result: SimulationResult;
    turns: PracticeTurn[];
  } | null>(null);

  // If on welcome route or user is not logged in, show WelcomeAuthView
  if (currentRoute === 'welcome' || !user) {
    return (
      <>
        <WelcomeAuthView />
        <ToastContainer />
      </>
    );
  }

  // Voice simulation navigation handlers
  const handleLaunchVoiceScenario = (scenario: VoiceScenario) => {
    setActiveVoiceScenario(scenario);
    navigateTo('voice-live');
  };

  const handleFinishVoiceSimulation = (
    result: SimulationResult,
    turns: PracticeTurn[]
  ) => {
    saveSimulationResult(activeVoiceScenario.title, result);
    setCompletedSimResult({
      scenario: activeVoiceScenario,
      result,
      turns,
    });
    navigateTo('voice-results');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <Header />

      {/* Mobile Drawer Trigger Strip on small screens */}
      <div className="lg:hidden border-b border-white/10 bg-slate-900/60 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-2"
        >
          {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{mobileSidebarOpen ? 'Close Menu' : 'Open Navigation Menu'}</span>
        </button>

        <span className="text-xs text-slate-400 font-mono capitalize">
          {currentRoute.replace('-', ' ')}
        </span>
      </div>

      <div className="app-body">
        {/* Navigation Sidebar */}
        <Sidebar
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Mobile Backdrop when sidebar is open */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="mobile-backdrop"
          />
        )}

        {/* Main Content Area */}
        <main className="app-main">
          {currentRoute === 'dashboard' && <DashboardView />}
          {currentRoute === 'goals' && <GoalSetupView />}
          {currentRoute === 'diagnostic' && <DiagnosticView />}
          {currentRoute === 'diagnostic-results' && <DiagnosticResultsView />}

          {currentRoute === 'voice-setup' && (
            <VoiceSimulationSetupView onSelectScenario={handleLaunchVoiceScenario} />
          )}

          {currentRoute === 'voice-live' && (
            <LiveVoiceSimulationView
              scenario={activeVoiceScenario}
              onFinishSession={handleFinishVoiceSimulation}
            />
          )}

          {currentRoute === 'voice-results' && completedSimResult && (
            <SimulationResultsView
              scenario={completedSimResult.scenario}
              result={completedSimResult.result}
              turns={completedSimResult.turns}
            />
          )}

          {currentRoute === 'coding' && <CodingRoundView />}
          {currentRoute === 'study-pods' && <StudyPodsView />}
          {currentRoute === 'profile' && <ProfileSettingsView />}
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
