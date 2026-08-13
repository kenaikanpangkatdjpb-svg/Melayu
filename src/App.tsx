/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import RunningTextBanner from './components/RunningTextBanner';
import Sidebar from './components/Sidebar';
import WelcomeView from './components/WelcomeView';
import TurtSection from './components/TurtSection';
import KepegawaianSection from './components/KepegawaianSection';
import KinerjaSection from './components/KinerjaSection';
import KeuanganSection from './components/KeuanganSection';
import InformasiSection from './components/InformasiSection';
import UserManagementSection from './components/UserManagementSection';
import LoginView from './components/LoginView';

import {
  RoomBooking, ItemBooking, VehicleBooking,
  FacilityFeedback, MonthlyNeed, GKMAgreement,
  ScholarshipInfo, PerformanceMetric, WorkloadMetric,
  RealizationProgress, VisitorLog, SecurityShift, SecurityRosterItem,
  CurrentUser, UserAccount
} from './types';

import {
  INITIAL_ROOM_BOOKINGS,
  INITIAL_ITEM_BOOKINGS,
  INITIAL_VEHICLE_BOOKINGS,
  INITIAL_FACILITY_FEEDBACK,
  INITIAL_MONTHLY_NEEDS,
  INITIAL_GKM_AGREEMENTS,
  INITIAL_SCHOLARSHIPS,
  INITIAL_PERFORMANCE_METRICS,
  INITIAL_WORKLOAD_METRICS,
  INITIAL_REALIZATION_PROGRESS,
  INITIAL_VISITOR_LOGS,
  INITIAL_SECURITY_SHIFTS,
  INITIAL_SECURITY_ROSTER,
  INITIAL_USERS
} from './mockData';
import { getUsersFromFirestore, subscribeFirestoreCollection, saveFirestoreCollection } from './lib/firebase';

export default function App() {
  // User Session State
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    const saved = localStorage.getItem('melayu_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation & Sidebar State
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('melayu_active_tab') || 'selamat-datang';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    const saved = localStorage.getItem('melayu_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('melayu_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Sync user state to local storage and guard Edit Mode
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('melayu_current_user', JSON.stringify(currentUser));
      if (currentUser.role !== 'admin') {
        setIsEditMode(false);
      }
    } else {
      localStorage.removeItem('melayu_current_user');
      setIsEditMode(false);
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: CurrentUser) => {
    setCurrentUser(user);
    setActiveTab('selamat-datang');
    localStorage.setItem('melayu_active_tab', 'selamat-datang');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('selamat-datang');
    localStorage.setItem('melayu_active_tab', 'selamat-datang');
  };

  // Core Persistent States (with LocalStorage backing)
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>(() => {
    const saved = localStorage.getItem('melayu_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOM_BOOKINGS;
  });

  const [itemBookings, setItemBookings] = useState<ItemBooking[]>(() => {
    const saved = localStorage.getItem('melayu_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEM_BOOKINGS;
  });

  const [vehicleBookings, setVehicleBookings] = useState<VehicleBooking[]>(() => {
    const saved = localStorage.getItem('melayu_vehicles');
    return saved ? JSON.parse(saved) : INITIAL_VEHICLE_BOOKINGS;
  });

  const [feedbacks, setFeedbacks] = useState<FacilityFeedback[]>(() => {
    const saved = localStorage.getItem('melayu_feedbacks');
    return saved ? JSON.parse(saved) : INITIAL_FACILITY_FEEDBACK;
  });

  const [needs, setNeeds] = useState<MonthlyNeed[]>(() => {
    const saved = localStorage.getItem('melayu_needs');
    return saved ? JSON.parse(saved) : INITIAL_MONTHLY_NEEDS;
  });

  const [gkmList, setGkmList] = useState<GKMAgreement[]>(() => {
    const saved = localStorage.getItem('melayu_gkm');
    return saved ? JSON.parse(saved) : INITIAL_GKM_AGREEMENTS;
  });

  const [realizations, setRealizations] = useState<RealizationProgress[]>(() => {
    const saved = localStorage.getItem('melayu_realizations');
    return saved ? JSON.parse(saved) : INITIAL_REALIZATION_PROGRESS;
  });

  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>(() => {
    const saved = localStorage.getItem('melayu_visitors');
    return saved ? JSON.parse(saved) : INITIAL_VISITOR_LOGS;
  });

  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('melayu_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  // Security shifts state with local storage persistence
  const [securityShifts, setSecurityShifts] = useState<SecurityShift[]>(() => {
    const saved = localStorage.getItem('melayu_security_shifts');
    return saved ? JSON.parse(saved) : INITIAL_SECURITY_SHIFTS;
  });

  // Security roster state (individual per-guard schedule) with local storage persistence
  const [securityRoster, setSecurityRoster] = useState<SecurityRosterItem[]>(() => {
    const saved = localStorage.getItem('melayu_security_roster');
    const raw: SecurityRosterItem[] = saved ? JSON.parse(saved) : INITIAL_SECURITY_ROSTER;
    return raw.map(item => {
      if (!item.dateStr || item.dateStr === 'AGUSTUS 2026' || item.dateStr === 'SABTU.1.8.2026') {
        return { ...item, dateStr: 'SABTU/ 1 Agustus 2026' };
      }
      if (item.dateStr === 'MINGGU.2.8.2026') {
        return { ...item, dateStr: 'MINGGU/ 2 Agustus 2026' };
      }
      if (item.dateStr === 'SENIN.3.8.2026') {
        return { ...item, dateStr: 'SENIN/ 3 Agustus 2026' };
      }
      return item;
    });
  });

  const [scholarships, setScholarships] = useState<ScholarshipInfo[]>(() => {
    const saved = localStorage.getItem('melayu_scholarships');
    return saved ? JSON.parse(saved) : INITIAL_SCHOLARSHIPS;
  });
  const performanceMetrics: PerformanceMetric[] = INITIAL_PERFORMANCE_METRICS;
  const workloadMetrics: WorkloadMetric[] = INITIAL_WORKLOAD_METRICS;

  // Real-time sync with Firebase Firestore on mount across all devices (Handphone <-> PC)
  useEffect(() => {
    const unsubRooms = subscribeFirestoreCollection<RoomBooking>('rooms', INITIAL_ROOM_BOOKINGS, setRoomBookings);
    const unsubItems = subscribeFirestoreCollection<ItemBooking>('items', INITIAL_ITEM_BOOKINGS, setItemBookings);
    const unsubVehicles = subscribeFirestoreCollection<VehicleBooking>('vehicles', INITIAL_VEHICLE_BOOKINGS, setVehicleBookings);
    const unsubFeedbacks = subscribeFirestoreCollection<FacilityFeedback>('feedbacks', INITIAL_FACILITY_FEEDBACK, setFeedbacks);
    const unsubNeeds = subscribeFirestoreCollection<MonthlyNeed>('needs', INITIAL_MONTHLY_NEEDS, setNeeds);
    const unsubGkm = subscribeFirestoreCollection<GKMAgreement>('gkm', INITIAL_GKM_AGREEMENTS, setGkmList);
    const unsubRealizations = subscribeFirestoreCollection<RealizationProgress>('realizations', INITIAL_REALIZATION_PROGRESS, setRealizations);
    const unsubVisitors = subscribeFirestoreCollection<VisitorLog>('visitors', INITIAL_VISITOR_LOGS, setVisitorLogs);
    const unsubShifts = subscribeFirestoreCollection<SecurityShift>('security_shifts', INITIAL_SECURITY_SHIFTS, setSecurityShifts);
    const unsubRoster = subscribeFirestoreCollection<SecurityRosterItem>('security_roster', INITIAL_SECURITY_ROSTER, setSecurityRoster);
    const unsubUsers = subscribeFirestoreCollection<UserAccount>('users', INITIAL_USERS, setUsersList);
    const unsubScholarships = subscribeFirestoreCollection<ScholarshipInfo>('scholarships', INITIAL_SCHOLARSHIPS, setScholarships);

    return () => {
      unsubRooms();
      unsubItems();
      unsubVehicles();
      unsubFeedbacks();
      unsubNeeds();
      unsubGkm();
      unsubRealizations();
      unsubVisitors();
      unsubShifts();
      unsubRoster();
      unsubUsers();
      unsubScholarships();
    };
  }, []);

  // Sync state to local storage and Firestore
  useEffect(() => {
    localStorage.setItem('melayu_scholarships', JSON.stringify(scholarships));
    saveFirestoreCollection('scholarships', scholarships);
  }, [scholarships]);

  useEffect(() => {
    localStorage.setItem('melayu_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('melayu_rooms', JSON.stringify(roomBookings));
    saveFirestoreCollection('rooms', roomBookings);
  }, [roomBookings]);

  useEffect(() => {
    localStorage.setItem('melayu_items', JSON.stringify(itemBookings));
    saveFirestoreCollection('items', itemBookings);
  }, [itemBookings]);

  useEffect(() => {
    localStorage.setItem('melayu_vehicles', JSON.stringify(vehicleBookings));
    saveFirestoreCollection('vehicles', vehicleBookings);
  }, [vehicleBookings]);

  useEffect(() => {
    localStorage.setItem('melayu_feedbacks', JSON.stringify(feedbacks));
    saveFirestoreCollection('feedbacks', feedbacks);
  }, [feedbacks]);

  useEffect(() => {
    localStorage.setItem('melayu_needs', JSON.stringify(needs));
    saveFirestoreCollection('needs', needs);
  }, [needs]);

  useEffect(() => {
    localStorage.setItem('melayu_gkm', JSON.stringify(gkmList));
    saveFirestoreCollection('gkm', gkmList);
  }, [gkmList]);

  useEffect(() => {
    localStorage.setItem('melayu_realizations', JSON.stringify(realizations));
    saveFirestoreCollection('realizations', realizations);
  }, [realizations]);

  useEffect(() => {
    localStorage.setItem('melayu_visitors', JSON.stringify(visitorLogs));
    saveFirestoreCollection('visitors', visitorLogs);
  }, [visitorLogs]);

  useEffect(() => {
    localStorage.setItem('melayu_security_shifts', JSON.stringify(securityShifts));
    saveFirestoreCollection('security_shifts', securityShifts);
  }, [securityShifts]);

  useEffect(() => {
    localStorage.setItem('melayu_security_roster', JSON.stringify(securityRoster));
    saveFirestoreCollection('security_roster', securityRoster);
  }, [securityRoster]);

  useEffect(() => {
    localStorage.setItem('melayu_users', JSON.stringify(usersList));
    saveFirestoreCollection('users', usersList);
  }, [usersList]);

  // Reset Handler
  const handleResetData = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang seluruh data dashboard ke pengaturan awal?')) {
      localStorage.removeItem('melayu_rooms');
      localStorage.removeItem('melayu_items');
      localStorage.removeItem('melayu_vehicles');
      localStorage.removeItem('melayu_feedbacks');
      localStorage.removeItem('melayu_needs');
      localStorage.removeItem('melayu_gkm');
      localStorage.removeItem('melayu_realizations');
      localStorage.removeItem('melayu_visitors');
      localStorage.removeItem('melayu_users');

      setRoomBookings(INITIAL_ROOM_BOOKINGS);
      setItemBookings(INITIAL_ITEM_BOOKINGS);
      setVehicleBookings(INITIAL_VEHICLE_BOOKINGS);
      setFeedbacks(INITIAL_FACILITY_FEEDBACK);
      setNeeds(INITIAL_MONTHLY_NEEDS);
      setGkmList(INITIAL_GKM_AGREEMENTS);
      setRealizations(INITIAL_REALIZATION_PROGRESS);
      setVisitorLogs(INITIAL_VISITOR_LOGS);
      setUsersList(INITIAL_USERS);
      setActiveTab('selamat-datang');
      setIsEditMode(false);
    }
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  // Helper to determine the section layout category
  const renderMainContent = () => {
    switch (activeTab) {
      case 'selamat-datang':
        return (
          <WelcomeView 
            roomBookings={roomBookings}
            vehicleBookings={vehicleBookings}
            itemBookings={itemBookings}
            onNavigateToTab={(tabId) => setActiveTab(tabId)}
            currentUser={currentUser}
            onLogout={handleLogout}
            isEditMode={isEditMode}
          />
        );

      case 'peminjaman-ruangan':
      case 'persetujuan-ruangan':
      case 'peminjaman-barang':
      case 'peminjaman-kendaraan':
      case 'persetujuan-kendaraan':
      case 'feedback-sarpras':
      case 'rencana-kebutuhan':
        return (
          <TurtSection 
            subTab={activeTab}
            roomBookings={roomBookings}
            setRoomBookings={setRoomBookings}
            itemBookings={itemBookings}
            setItemBookings={setItemBookings}
            vehicleBookings={vehicleBookings}
            setVehicleBookings={setVehicleBookings}
            feedbacks={feedbacks}
            setFeedbacks={setFeedbacks}
            needs={needs}
            setNeeds={setNeeds}
            isEditMode={isEditMode}
            onToggleEditMode={handleToggleEditMode}
            currentUser={currentUser}
            onNavigateToTab={(tabId) => setActiveTab(tabId)}
          />
        );

      case 'informasi-gkm':
      case 'cek-seribu':
      case 'informasi-beasiswa':
      case 'kelola-beasiswa':
      case 't-lego':
        return (
          <KepegawaianSection 
            subTab={activeTab}
            gkmList={gkmList}
            setGkmList={setGkmList}
            scholarships={scholarships}
            setScholarships={setScholarships}
            isEditMode={isEditMode}
            currentUser={currentUser}
          />
        );

      case 'monitoring-kinerja':
      case 'monitoring-abk':
      case 'monitoring-dams':
      case 'katalog-hkt':
      case 'feedback-kinerja':
        return (
          <KinerjaSection 
            subTab={activeTab}
            performanceMetrics={performanceMetrics}
            workloadMetrics={workloadMetrics}
            isEditMode={isEditMode}
          />
        );

      case 'progress-realisasi':
        return (
          <KeuanganSection 
            subTab={activeTab}
            realizations={realizations}
            setRealizations={setRealizations}
            isEditMode={isEditMode}
          />
        );

      case 'pengawasan-penjagaan':
      case 'rencana-pengadaan':
        return (
          <InformasiSection 
            subTab={activeTab}
            visitorLogs={visitorLogs}
            setVisitorLogs={setVisitorLogs}
            securityShifts={securityShifts}
            setSecurityShifts={setSecurityShifts}
            securityRoster={securityRoster}
            setSecurityRoster={setSecurityRoster}
            isEditMode={isEditMode}
            currentUser={currentUser}
          />
        );

      case 'manajemen-user':
        return (
          <UserManagementSection 
            users={usersList}
            setUsers={setUsersList}
            isEditMode={isEditMode}
            currentUser={currentUser}
          />
        );

      default:
        return (
          <div className="p-8 text-center" id="page-not-found">
            <h3 className="text-sm font-semibold text-slate-500">Halaman tidak ditemukan</h3>
          </div>
        );
    }
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800" id="melayu-app-root">
      {/* 1. Header Bar */}
      <Header 
        onReset={handleResetData}
        isEditMode={isEditMode}
        onToggleEditMode={handleToggleEditMode}
        currentUser={currentUser}
        onLogout={handleLogout}
        onToggleSidebar={() => {
          if (window.innerWidth < 768) {
            setIsMobileSidebarOpen(!isMobileSidebarOpen);
          } else {
            setIsSidebarCollapsed(!isSidebarCollapsed);
          }
        }}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Running Text Banner */}
      <RunningTextBanner />

      {/* Edit Mode Alert Bar */}
      {isEditMode && (
        <div className="bg-amber-500 text-white text-xs font-semibold py-1.5 px-6 text-center shrink-0 flex items-center justify-center space-x-2 animate-in slide-in-from-top duration-200" id="edit-mode-alert">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span>Anda berada dalam Mode Edit (Administrator). Anda dapat menyetujui, menolak, atau membatalkan berbagai pengajuan berkas.</span>
        </div>
      )}

      {/* 2. Main Body with Sidebar & Content Panel */}
      <div className="flex-1 flex flex-col md:flex-row relative" id="app-body-layout">
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
        />

        {/* Content Viewer (scrollable area) */}
        <main className="flex-1 h-[calc(100vh-3.5rem)] overflow-y-auto min-w-0 transition-all duration-300" id="app-content-viewer">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}
