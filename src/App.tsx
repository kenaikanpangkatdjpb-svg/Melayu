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
  CurrentUser, UserAccount, ActivityGalleryItem
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
  INITIAL_USERS,
  INITIAL_ACTIVITY_GALLERY
} from './mockData';
import { getUsersFromFirestore, subscribeFirestoreCollection, saveFirestoreCollection, deleteFirestoreDoc } from './lib/firebase';
import { safeLocalStorageSet, safeLocalStorageGet } from './lib/storage';

function safeParse<T>(key: string, fallback: T): T {
  return safeLocalStorageGet<T>(key, fallback);
}

export default function App() {
  // User Session State
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    return safeParse<CurrentUser | null>('melayu_current_user', null);
  });

  // Navigation & Sidebar State
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('melayu_active_tab') || 'selamat-datang';
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return safeParse<boolean>('melayu_sidebar_collapsed', false);
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    safeLocalStorageSet('melayu_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Edit Mode State
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Sync user state to local storage and guard Edit Mode
  useEffect(() => {
    if (currentUser) {
      safeLocalStorageSet('melayu_current_user', JSON.stringify(currentUser));
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
    safeLocalStorageSet('melayu_active_tab', 'selamat-datang');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('selamat-datang');
    safeLocalStorageSet('melayu_active_tab', 'selamat-datang');
  };

  // Core Persistent States (with LocalStorage backing)
  const [roomBookings, setRoomBookings] = useState<RoomBooking[]>(() => {
    return safeParse<RoomBooking[]>('melayu_rooms', INITIAL_ROOM_BOOKINGS);
  });

  const [itemBookings, setItemBookings] = useState<ItemBooking[]>(() => {
    return safeParse<ItemBooking[]>('melayu_items', INITIAL_ITEM_BOOKINGS);
  });

  const [vehicleBookings, setVehicleBookings] = useState<VehicleBooking[]>(() => {
    return safeParse<VehicleBooking[]>('melayu_vehicles', INITIAL_VEHICLE_BOOKINGS);
  });

  const [feedbacks, setFeedbacks] = useState<FacilityFeedback[]>(() => {
    return safeParse<FacilityFeedback[]>('melayu_feedbacks', INITIAL_FACILITY_FEEDBACK);
  });

  const [needs, setNeeds] = useState<MonthlyNeed[]>(() => {
    return safeParse<MonthlyNeed[]>('melayu_needs', INITIAL_MONTHLY_NEEDS);
  });

  const [gkmList, setGkmList] = useState<GKMAgreement[]>(() => {
    return safeParse<GKMAgreement[]>('melayu_gkm', INITIAL_GKM_AGREEMENTS);
  });

  const [realizations, setRealizations] = useState<RealizationProgress[]>(() => {
    return safeParse<RealizationProgress[]>('melayu_realizations', INITIAL_REALIZATION_PROGRESS);
  });

  const [visitorLogs, setVisitorLogs] = useState<VisitorLog[]>(() => {
    return safeParse<VisitorLog[]>('melayu_visitors', INITIAL_VISITOR_LOGS);
  });

  const [usersList, setUsersList] = useState<UserAccount[]>(() => {
    return safeParse<UserAccount[]>('melayu_users', INITIAL_USERS);
  });

  // Security shifts state with local storage persistence
  const [securityShifts, setSecurityShifts] = useState<SecurityShift[]>(() => {
    return safeParse<SecurityShift[]>('melayu_security_shifts', INITIAL_SECURITY_SHIFTS);
  });

  // Security roster state (individual per-guard schedule) with local storage persistence
  const [securityRoster, setSecurityRoster] = useState<SecurityRosterItem[]>(() => {
    const parsed = safeParse<SecurityRosterItem[]>('melayu_security_roster', INITIAL_SECURITY_ROSTER);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SECURITY_ROSTER;
  });

  const [scholarships, setScholarships] = useState<ScholarshipInfo[]>(() => {
    return safeParse<ScholarshipInfo[]>('melayu_scholarships', INITIAL_SCHOLARSHIPS);
  });

  const [galleryItems, setGalleryItems] = useState<ActivityGalleryItem[]>(() => {
    const deletedIds: string[] = safeParse<string[]>('melayu_deleted_activity_gallery_ids', []);
    const parsed = safeParse<ActivityGalleryItem[]>('melayu_activity_gallery', INITIAL_ACTIVITY_GALLERY);
    const source = Array.isArray(parsed) ? parsed : INITIAL_ACTIVITY_GALLERY;
    return source.filter((it) => !deletedIds.includes(String(it.id)));
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
    const unsubRoster = subscribeFirestoreCollection<SecurityRosterItem>(
      'security_roster', 
      INITIAL_SECURITY_ROSTER, 
      (data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Sort strictly by orderIndex if present, or preserved array order
          const sorted = [...data].sort((a: any, b: any) => {
            const idxA = typeof a.orderIndex === 'number' ? a.orderIndex : (parseInt(String(a.id || '').replace(/\D/g, ''), 10) || 0);
            const idxB = typeof b.orderIndex === 'number' ? b.orderIndex : (parseInt(String(b.id || '').replace(/\D/g, ''), 10) || 0);
            return idxA - idxB;
          });
          setSecurityRoster(sorted);
        }
      }
    );
    const unsubUsers = subscribeFirestoreCollection<UserAccount>('users', INITIAL_USERS, setUsersList);
    const unsubScholarships = subscribeFirestoreCollection<ScholarshipInfo>('scholarships', INITIAL_SCHOLARSHIPS, setScholarships);
    const unsubGallery = subscribeFirestoreCollection<ActivityGalleryItem>('activity_gallery', INITIAL_ACTIVITY_GALLERY, setGalleryItems);

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
      unsubGallery();
    };
  }, []);

  // Sync state to local storage
  useEffect(() => {
    safeLocalStorageSet('melayu_scholarships', JSON.stringify(scholarships));
  }, [scholarships]);

  useEffect(() => {
    safeLocalStorageSet('melayu_activity_gallery', JSON.stringify(galleryItems));
  }, [galleryItems]);

  useEffect(() => {
    safeLocalStorageSet('melayu_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    safeLocalStorageSet('melayu_rooms', JSON.stringify(roomBookings));
  }, [roomBookings]);

  useEffect(() => {
    safeLocalStorageSet('melayu_items', JSON.stringify(itemBookings));
  }, [itemBookings]);

  useEffect(() => {
    safeLocalStorageSet('melayu_vehicles', JSON.stringify(vehicleBookings));
  }, [vehicleBookings]);

  useEffect(() => {
    safeLocalStorageSet('melayu_feedbacks', JSON.stringify(feedbacks));
  }, [feedbacks]);

  useEffect(() => {
    safeLocalStorageSet('melayu_needs', JSON.stringify(needs));
  }, [needs]);

  useEffect(() => {
    safeLocalStorageSet('melayu_gkm', JSON.stringify(gkmList));
  }, [gkmList]);

  useEffect(() => {
    safeLocalStorageSet('melayu_realizations', JSON.stringify(realizations));
  }, [realizations]);

  useEffect(() => {
    safeLocalStorageSet('melayu_visitors', JSON.stringify(visitorLogs));
  }, [visitorLogs]);

  useEffect(() => {
    safeLocalStorageSet('melayu_security_shifts', JSON.stringify(securityShifts));
  }, [securityShifts]);

  useEffect(() => {
    safeLocalStorageSet('melayu_security_roster', JSON.stringify(securityRoster));
  }, [securityRoster]);

  useEffect(() => {
    safeLocalStorageSet('melayu_users', JSON.stringify(usersList));
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
      localStorage.removeItem('melayu_activity_gallery');

      setRoomBookings(INITIAL_ROOM_BOOKINGS);
      setItemBookings(INITIAL_ITEM_BOOKINGS);
      setVehicleBookings(INITIAL_VEHICLE_BOOKINGS);
      setFeedbacks(INITIAL_FACILITY_FEEDBACK);
      setNeeds(INITIAL_MONTHLY_NEEDS);
      setGkmList(INITIAL_GKM_AGREEMENTS);
      setRealizations(INITIAL_REALIZATION_PROGRESS);
      setVisitorLogs(INITIAL_VISITOR_LOGS);
      setUsersList(INITIAL_USERS);
      setGalleryItems(INITIAL_ACTIVITY_GALLERY);
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
            galleryItems={galleryItems}
            setGalleryItems={setGalleryItems}
            onSaveGalleryToFirebase={(items) => saveFirestoreCollection('activity_gallery', items)}
            onDeleteGalleryFromFirebase={(id) => deleteFirestoreDoc('activity_gallery', id)}
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
