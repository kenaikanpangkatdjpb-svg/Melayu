import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Trash2, Check, X, ShieldAlert, Shield, ShieldCheck,
  HelpCircle, Sparkles, Star, ClipboardList, PenTool, Pencil,
  CheckCircle2, Clock, Filter, AlertCircle, FileCheck, FileText, Car, UserCheck, Home
} from 'lucide-react';
import { 
  RoomBooking, ItemBooking, VehicleBooking, 
  FacilityFeedback, MonthlyNeed, CurrentUser
} from '../types';
import { formatIDR } from '../mockData';
import SuratPermintaanBarangPersediaan from './SuratPermintaanBarangPersediaan';

interface TurtSectionProps {
  subTab: string;
  roomBookings: RoomBooking[];
  setRoomBookings: React.Dispatch<React.SetStateAction<RoomBooking[]>>;
  itemBookings: ItemBooking[];
  setItemBookings: React.Dispatch<React.SetStateAction<ItemBooking[]>>;
  vehicleBookings: VehicleBooking[];
  setVehicleBookings: React.Dispatch<React.SetStateAction<VehicleBooking[]>>;
  feedbacks: FacilityFeedback[];
  setFeedbacks: React.Dispatch<React.SetStateAction<FacilityFeedback[]>>;
  needs: MonthlyNeed[];
  setNeeds: React.Dispatch<React.SetStateAction<MonthlyNeed[]>>;
  isEditMode: boolean;
  onToggleEditMode?: () => void;
  currentUser?: CurrentUser | null;
  onNavigateToTab?: (tabId: string) => void;
}

export default function TurtSection({
  subTab,
  roomBookings,
  setRoomBookings,
  itemBookings,
  setItemBookings,
  vehicleBookings,
  setVehicleBookings,
  feedbacks,
  setFeedbacks,
  needs,
  setNeeds,
  isEditMode,
  onToggleEditMode,
  currentUser,
  onNavigateToTab
}: TurtSectionProps) {
  const isAdmin = currentUser ? currentUser.role === 'admin' : isEditMode;
  // Inner active sub-tab for room and vehicle
  const [roomActiveTab, setRoomActiveTab] = useState<'daftar' | 'persetujuan'>('daftar');
  const [vehicleActiveTab, setVehicleActiveTab] = useState<'daftar' | 'persetujuan'>('daftar');

  useEffect(() => {
    if (subTab === 'persetujuan-ruangan') {
      setRoomActiveTab('persetujuan');
    } else if (subTab === 'peminjaman-ruangan') {
      setRoomActiveTab('daftar');
    }

    if (subTab === 'persetujuan-kendaraan') {
      setVehicleActiveTab('persetujuan');
    } else if (subTab === 'peminjaman-kendaraan') {
      setVehicleActiveTab('daftar');
    }
  }, [subTab]);

  // Needs View Mode ('spbp' for Surat Permintaan Official, 'rekap' for Table)
  const [needsViewMode, setNeedsViewMode] = useState<'spbp' | 'rekap'>('spbp');

  // Modal states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showNeedModal, setShowNeedModal] = useState(false);

  // Edit states
  const [editingRoomBooking, setEditingRoomBooking] = useState<RoomBooking | null>(null);
  const [editingItemBooking, setEditingItemBooking] = useState<ItemBooking | null>(null);

  // Item Approval Panel states
  const [itemFilter, setItemFilter] = useState<'semua' | 'pending' | 'dipinjam' | 'kembali' | 'ditolak'>('semua');
  const [itemApprovalNotes, setItemApprovalNotes] = useState<Record<string, string>>({});

  // Room Approval Panel states
  const [roomFilterStatus, setRoomFilterStatus] = useState<'semua' | 'pending' | 'disetujui' | 'ditolak'>('semua');
  const [roomFilterName, setRoomFilterName] = useState<string>('semua');
  const [roomApprovalNotes, setRoomApprovalNotes] = useState<Record<string, string>>({});

  // Vehicle Approval Panel states
  const [vehicleFilterStatus, setVehicleFilterStatus] = useState<'semua' | 'pending' | 'disetujui' | 'ditolak' | 'selesai'>('semua');
  const [vehicleApprovalNotes, setVehicleApprovalNotes] = useState<Record<string, string>>({});

  // Form states - Room
  const [roomForm, setRoomForm] = useState({
    roomName: 'Aula Lancang Kuning',
    bookerName: '',
    division: 'Bagian Umum',
    date: '2026-07-15',
    startTime: '09:00',
    endTime: '11:00',
    purpose: '',
    equipmentNeeded: '',
    status: 'Pending' as 'Disetujui' | 'Pending' | 'Ditolak'
  });

  // Form states - Item
  const [itemForm, setItemForm] = useState({
    itemName: '',
    bookerName: '',
    division: 'Bagian Umum',
    date: '2026-07-15',
    quantity: 1,
    status: 'Pending' as 'Dipinjam' | 'Kembali' | 'Pending' | 'Ditolak',
    statusNote: ''
  });

  // Form states - Vehicle
  const [vehicleForm, setVehicleForm] = useState({
    vehicleName: 'Toyota Kijang Innova BM 1679 T',
    driverOption: 'Dengan Supir' as 'Dengan Supir' | 'Tanpa Supir',
    driverName: 'Pak Budi',
    bookerName: '',
    destination: '',
    date: '2026-07-15',
    durationDays: 1
  });

  // Form states - Feedback
  const [feedbackForm, setFeedbackForm] = useState({
    category: 'AC' as 'AC' | 'Ruangan' | 'Kebersihan' | 'IT / Jaringan' | 'Lainnya',
    reporterName: '',
    reporterDivision: 'Bagian Umum',
    description: '',
    rating: 5
  });

  // Form states - Monthly Need
  const [needForm, setNeedForm] = useState({
    itemName: '',
    category: 'ATK' as 'ATK' | 'Konsumsi' | 'Sarpras' | 'Lain-lain',
    quantity: 1,
    unit: 'Rim',
    estimatedPrice: 50000,
    urgency: 'Sedang' as 'Tinggi' | 'Sedang' | 'Rendah'
  });

  // Open Room Modals
  const handleOpenNewRoomModal = () => {
    setEditingRoomBooking(null);
    setRoomForm({
      roomName: 'Aula Lancang Kuning',
      bookerName: '',
      division: 'Bagian Umum',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '11:00',
      purpose: '',
      equipmentNeeded: '',
      status: 'Pending'
    });
    setShowRoomModal(true);
  };

  const handleOpenEditRoomModal = (booking: RoomBooking) => {
    setEditingRoomBooking(booking);
    setRoomForm({
      roomName: booking.roomName,
      bookerName: booking.bookerName,
      division: booking.division,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose,
      equipmentNeeded: booking.equipmentNeeded || '',
      status: booking.status
    });
    setShowRoomModal(true);
  };

  // Actions Room
  const handleAddRoomBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.bookerName || !roomForm.purpose) return;

    if (editingRoomBooking) {
      setRoomBookings(roomBookings.map(b => 
        b.id === editingRoomBooking.id ? {
          ...b,
          roomName: roomForm.roomName,
          bookerName: roomForm.bookerName,
          division: roomForm.division,
          date: roomForm.date,
          startTime: roomForm.startTime,
          endTime: roomForm.endTime,
          purpose: roomForm.purpose,
          equipmentNeeded: roomForm.equipmentNeeded,
          status: roomForm.status
        } : b
      ));
    } else {
      const newBooking: RoomBooking = {
        id: `room-${Date.now()}`,
        roomName: roomForm.roomName,
        bookerName: roomForm.bookerName,
        division: roomForm.division,
        date: roomForm.date,
        startTime: roomForm.startTime,
        endTime: roomForm.endTime,
        purpose: roomForm.purpose,
        equipmentNeeded: roomForm.equipmentNeeded,
        status: roomForm.status
      };
      setRoomBookings([newBooking, ...roomBookings]);
    }
    setShowRoomModal(false);
    setEditingRoomBooking(null);
  };

  const handleApproveRoom = (id: string, approve: boolean, customNote?: string) => {
    const enteredNote = customNote !== undefined ? customNote : roomApprovalNotes[id];
    const defaultNote = approve 
      ? 'Disetujui oleh Admin Subbag Rumah Tangga - Kunci ruangan siap diambil' 
      : 'Permohonan peminjaman ruangan ditolak oleh Admin';
    const finalNote = enteredNote && enteredNote.trim() !== '' ? enteredNote.trim() : defaultNote;

    setRoomBookings(roomBookings.map(b => 
      b.id === id ? { ...b, status: approve ? 'Disetujui' : 'Ditolak', statusNote: finalNote } : b
    ));
  };

  const handleDeleteRoom = (id: string) => {
    setRoomBookings(roomBookings.filter(b => b.id !== id));
  };

  // Open Item Modals
  const handleOpenNewItemModal = () => {
    setEditingItemBooking(null);
    setItemForm({
      itemName: '',
      bookerName: '',
      division: 'Bagian Umum',
      date: new Date().toISOString().split('T')[0],
      quantity: 1,
      status: 'Pending',
      statusNote: ''
    });
    setShowItemModal(true);
  };

  const handleOpenEditItemModal = (item: ItemBooking) => {
    setEditingItemBooking(item);
    setItemForm({
      itemName: item.itemName,
      bookerName: item.bookerName,
      division: item.division,
      date: item.date,
      quantity: item.quantity,
      status: item.status,
      statusNote: item.statusNote || ''
    });
    setShowItemModal(true);
  };

  // Actions Items
  const handleAddItemBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.bookerName || !itemForm.itemName) return;

    if (editingItemBooking) {
      setItemBookings(itemBookings.map(item => 
        item.id === editingItemBooking.id ? {
          ...item,
          itemName: itemForm.itemName,
          bookerName: itemForm.bookerName,
          division: itemForm.division,
          date: itemForm.date,
          quantity: itemForm.quantity,
          status: itemForm.status,
          statusNote: itemForm.statusNote
        } : item
      ));
    } else {
      const newBooking: ItemBooking = {
        id: `item-${Date.now()}`,
        itemName: itemForm.itemName,
        bookerName: itemForm.bookerName,
        division: itemForm.division,
        date: itemForm.date,
        quantity: itemForm.quantity,
        status: itemForm.status || 'Pending',
        statusNote: itemForm.statusNote || 'Menunggu persetujuan'
      };
      setItemBookings([newBooking, ...itemBookings]);
    }
    setShowItemModal(false);
    setEditingItemBooking(null);
  };

  const handleUpdateItemStatus = (id: string, status: 'Dipinjam' | 'Kembali') => {
    setItemBookings(itemBookings.map(item => 
      item.id === id ? { ...item, status } : item
    ));
  };

  const handleApproveItem = (id: string, approve: boolean, customNote?: string) => {
    const enteredNote = customNote !== undefined ? customNote : itemApprovalNotes[id];
    const defaultNote = approve 
      ? 'Disetujui oleh Admin - Barang siap diambil di Subbag Rumah Tangga' 
      : 'Permohonan peminjaman barang ditolak oleh Admin';
    const finalNote = enteredNote && enteredNote.trim() !== '' ? enteredNote.trim() : defaultNote;

    setItemBookings(itemBookings.map(item => 
      item.id === id ? { 
        ...item, 
        status: approve ? 'Dipinjam' : 'Ditolak',
        statusNote: finalNote
      } : item
    ));
  };

  const handleDeleteItem = (id: string) => {
    setItemBookings(itemBookings.filter(b => b.id !== id));
  };

  // Actions Vehicle
  const handleAddVehicleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleForm.bookerName || !vehicleForm.destination) return;
    
    let driver = 'Tanpa Supir (Lepas Kunci)';
    if (vehicleForm.driverOption === 'Dengan Supir') {
      driver = 'Pak Budi';
      if (vehicleForm.vehicleName.includes('Reborn') || vehicleForm.vehicleName.includes('Fortuner')) {
        driver = 'Pak Agus';
      } else if (vehicleForm.vehicleName.includes('Cortez') || vehicleForm.vehicleName.includes('Expander')) {
        driver = 'Pak Hendra';
      }
    }

    const words = vehicleForm.vehicleName.split(' ');
    const plateNumber = words.length >= 3 ? words.slice(-3).join(' ') : 'BM 0000 XX';

    const newBooking: VehicleBooking = {
      id: `v-${Date.now()}`,
      vehicleName: vehicleForm.vehicleName,
      plateNumber: plateNumber,
      driverName: driver,
      driverOption: vehicleForm.driverOption,
      bookerName: vehicleForm.bookerName,
      destination: vehicleForm.destination,
      date: vehicleForm.date,
      durationDays: vehicleForm.durationDays,
      status: 'Pending'
    };
    setVehicleBookings([newBooking, ...vehicleBookings]);
    setShowVehicleModal(false);
    setVehicleForm({ ...vehicleForm, bookerName: '', destination: '', driverOption: 'Dengan Supir' });
  };

  const handleApproveVehicle = (id: string, approve: boolean, customNote?: string) => {
    const enteredNote = customNote !== undefined ? customNote : vehicleApprovalNotes[id];
    const defaultNote = approve 
      ? 'Disetujui oleh Admin Subbag Rumah Tangga - Kendaraan dan Supir Siap Operational' 
      : 'Permohonan peminjaman kendaraan ditolak oleh Admin';
    const finalNote = enteredNote && enteredNote.trim() !== '' ? enteredNote.trim() : defaultNote;

    setVehicleBookings(vehicleBookings.map(v => 
      v.id === id ? { ...v, status: approve ? 'Disetujui' : 'Ditolak', statusNote: finalNote } : v
    ));
  };

  const handleCompleteVehicle = (id: string) => {
    setVehicleBookings(vehicleBookings.map(v => 
      v.id === id ? { ...v, status: 'Selesai' } : v
    ));
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicleBookings(vehicleBookings.filter(b => b.id !== id));
  };

  // Actions Feedback
  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.reporterName || !feedbackForm.description) return;
    const newFeedback: FacilityFeedback = {
      id: `f-${Date.now()}`,
      category: feedbackForm.category,
      reporterName: feedbackForm.reporterName,
      reporterDivision: feedbackForm.reporterDivision,
      description: feedbackForm.description,
      rating: feedbackForm.rating,
      date: new Date().toISOString().split('T')[0],
      status: 'Open'
    };
    setFeedbacks([newFeedback, ...feedbacks]);
    setShowFeedbackModal(false);
    setFeedbackForm({ ...feedbackForm, reporterName: '', description: '', rating: 5 });
  };

  const handleUpdateFeedbackStatus = (id: string, status: 'In Progress' | 'Resolved') => {
    setFeedbacks(feedbacks.map(f => 
      f.id === id ? { ...f, status } : f
    ));
  };

  const handleDeleteFeedback = (id: string) => {
    setFeedbacks(feedbacks.filter(f => f.id !== id));
  };

  // Actions Monthly Need
  const handleAddNeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!needForm.itemName) return;
    const newNeed: MonthlyNeed = {
      id: `need-${Date.now()}`,
      itemName: needForm.itemName,
      category: needForm.category,
      quantity: needForm.quantity,
      unit: needForm.unit,
      estimatedPrice: needForm.estimatedPrice,
      urgency: needForm.urgency,
      status: 'Diusulkan'
    };
    setNeeds([newNeed, ...needs]);
    setShowNeedModal(false);
    setNeedForm({
      itemName: '',
      category: 'ATK',
      quantity: 1,
      unit: 'Rim',
      estimatedPrice: 50000,
      urgency: 'Sedang'
    });
  };

  const handleApproveNeed = (id: string, status: 'Disetujui' | 'Dibatalkan') => {
    setNeeds(needs.map(n => 
      n.id === id ? { ...n, status } : n
    ));
  };

  const handleDeleteNeed = (id: string) => {
    setNeeds(needs.filter(n => n.id !== id));
  };


  return (
    <div className="p-6 space-y-6" id="turt-section-root">
      {/* ----------------- SUB-TAB: PERSETUJUAN PEMINJAMAN RUANGAN (ADMIN) ----------------- */}
      {(subTab === 'persetujuan-ruangan' || (subTab === 'peminjaman-ruangan' && roomActiveTab === 'persetujuan')) && (
        <div className="space-y-6" id="persetujuan-ruangan-subtab">
          {/* Admin Inner Navigation Tabs */}
          {isAdmin && (
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3" id="admin-room-persetujuan-tab-switcher">
              <button
                type="button"
                onClick={() => setRoomActiveTab('daftar')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  roomActiveTab === 'daftar'
                    ? 'bg-djpb-blue text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Daftar Peminjaman Ruangan</span>
              </button>
              <button
                type="button"
                onClick={() => setRoomActiveTab('persetujuan')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  roomActiveTab === 'persetujuan'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Menu Persetujuan Peminjaman Ruangan</span>
                {roomBookings.filter(b => b.status === 'Pending').length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-red-600 text-white animate-pulse">
                    {roomBookings.filter(b => b.status === 'Pending').length} Pending
                  </span>
                )}
              </button>
            </div>
          )}
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-djpb-blue text-white rounded-xl shadow-xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base md:text-lg font-display font-bold text-slate-800">Menu Persetujuan Peminjaman Ruangan</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Akses Administrator</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Modul khusus Administrator untuk memverifikasi, menyetujui, menolak, dan memberikan catatan pada pengajuan peminjaman ruang rapat & aula.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                id="btn-add-room-booking-persetujuan"
                onClick={handleOpenNewRoomModal}
                className="flex items-center space-x-1 px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Booking Baru</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Menunggu Persetujuan</span>
                <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
              </div>
              <div className="text-2xl font-bold font-display text-amber-900 mt-2">
                {roomBookings.filter(b => b.status === 'Pending').length}
              </div>
              <p className="text-[10px] text-amber-700 mt-1">Permohonan butuh tindakan admin</p>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Disetujui</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-display text-emerald-900 mt-2">
                {roomBookings.filter(b => b.status === 'Disetujui').length}
              </div>
              <p className="text-[10px] text-emerald-700 mt-1">Peminjaman telah disetujui</p>
            </div>

            <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Ditolak</span>
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="text-2xl font-bold font-display text-rose-900 mt-2">
                {roomBookings.filter(b => b.status === 'Ditolak').length}
              </div>
              <p className="text-[10px] text-rose-700 mt-1">Permohonan tidak disetujui</p>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">Total Permohonan</span>
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-display text-blue-900 mt-2">
                {roomBookings.length}
              </div>
              <p className="text-[10px] text-blue-700 mt-1">Seluruh data riwayat booking</p>
            </div>
          </div>

          {/* Quick Pending Approval Action Panel */}
          <div className="bg-gradient-to-r from-amber-50/90 via-slate-50 to-blue-50/80 border border-amber-200/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-4" id="room-approval-pending-panel">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-display font-bold text-slate-800">
                  Daftar Permohonan Menunggu Keputusan Admin ({roomBookings.filter(b => b.status === 'Pending').length})
                </h3>
              </div>
              <span className="text-[11px] text-amber-800 font-medium hidden sm:inline">
                Pilih Setujui / Tolak dan berikan catatan instruksi untuk peminjam
              </span>
            </div>

            {roomBookings.filter(b => b.status === 'Pending').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roomBookings.filter(b => b.status === 'Pending').map((pending) => (
                  <div key={pending.id} className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-sm font-bold text-slate-900">{pending.roomName}</span>
                          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
                            Pending
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1.5">
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Pemohon:</span>
                          <span className="font-semibold text-slate-800">{pending.bookerName} ({pending.division})</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Waktu:</span>
                          <span className="font-mono text-slate-800">{pending.date} | {pending.startTime} - {pending.endTime}</span>
                        </div>
                        <div className="pt-1.5 text-slate-700 border-t border-slate-200/60 space-y-1">
                          <div><span className="text-slate-500 font-medium">Kegiatan:</span> <span className="font-semibold text-slate-800">{pending.purpose}</span></div>
                          <div className="text-xs"><span className="text-slate-500 font-medium">Perlengkapan / Kebutuhan:</span> <span className="font-semibold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/80 inline-block mt-0.5">{pending.equipmentNeeded || '-'}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Catatan Admin Input */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Catatan Persetujuan Admin / Lokasi Kunci:
                      </label>
                      <input 
                        type="text"
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-djpb-blue"
                        placeholder="Contoh: Disetujui. Kunci dapat diambil di Subbag Rumah Tangga..."
                        value={roomApprovalNotes[pending.id] || ''}
                        onChange={(e) => setRoomApprovalNotes({ ...roomApprovalNotes, [pending.id]: e.target.value })}
                      />
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          id={`btn-approve-room-card-${pending.id}`}
                          onClick={() => handleApproveRoom(pending.id, true)}
                          className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui Peminjaman</span>
                        </button>
                        <button
                          id={`btn-reject-room-card-${pending.id}`}
                          onClick={() => handleApproveRoom(pending.id, false)}
                          className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak Peminjaman</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-white/60 border border-dashed border-amber-200 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700">Semua Permohonan Telah Diproses</h4>
                <p className="text-[11px] text-slate-500">Tidak ada permohonan peminjaman ruangan yang menunggu persetujuan saat ini.</p>
              </div>
            )}
          </div>

          {/* Table Container with Filters */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-3 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              {/* Filter Status Tabs */}
              <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setRoomFilterStatus('semua')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    roomFilterStatus === 'semua'
                      ? 'bg-djpb-blue text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Semua ({roomBookings.length})
                </button>
                <button
                  onClick={() => setRoomFilterStatus('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    roomFilterStatus === 'pending'
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Pending ({roomBookings.filter(b => b.status === 'Pending').length})
                </button>
                <button
                  onClick={() => setRoomFilterStatus('disetujui')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    roomFilterStatus === 'disetujui'
                      ? 'bg-green-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Disetujui ({roomBookings.filter(b => b.status === 'Disetujui').length})
                </button>
                <button
                  onClick={() => setRoomFilterStatus('ditolak')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    roomFilterStatus === 'ditolak'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Ditolak ({roomBookings.filter(b => b.status === 'Ditolak').length})
                </button>
              </div>

              {/* Filter Room Name Dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Filter Ruangan:</span>
                <select
                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none"
                  value={roomFilterName}
                  onChange={(e) => setRoomFilterName(e.target.value)}
                >
                  <option value="semua">Semua Ruangan</option>
                  <option value="Aula Lancang Kuning">Aula Lancang Kuning</option>
                  <option value="Aula Zapin">Aula Zapin</option>
                  <option value="Soleram">Soleram</option>
                  <option value="Gurindam">Gurindam</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-display">
                    <th className="py-3.5 px-4">Ruangan</th>
                    <th className="py-3.5 px-4">Peminjam</th>
                    <th className="py-3.5 px-4">Tanggal / Waktu</th>
                    <th className="py-3.5 px-4">Kegiatan</th>
                    <th className="py-3.5 px-4">Perlengkapan / Kebutuhan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Catatan Admin</th>
                    <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {roomBookings
                    .filter(b => {
                      if (roomFilterStatus === 'pending') return b.status === 'Pending';
                      if (roomFilterStatus === 'disetujui') return b.status === 'Disetujui';
                      if (roomFilterStatus === 'ditolak') return b.status === 'Ditolak';
                      return true;
                    })
                    .filter(b => {
                      if (roomFilterName !== 'semua') return b.roomName === roomFilterName;
                      return true;
                    })
                    .map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{booking.roomName}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold">{booking.bookerName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{booking.division}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium">{booking.date}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{booking.startTime} - {booking.endTime}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs truncate font-medium text-slate-800" title={booking.purpose}>{booking.purpose}</td>
                        <td className="py-3.5 px-4 max-w-xs text-slate-600 font-sans" title={booking.equipmentNeeded || '-'}>
                          {booking.equipmentNeeded ? (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-md text-[11px] font-medium">
                              {booking.equipmentNeeded}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            booking.status === 'Disetujui' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : booking.status === 'Ditolak'
                              ? 'bg-red-50 text-red-600 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs text-slate-600 italic text-[11px]">
                          {booking.statusNote || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              id={`btn-edit-room-persetujuan-${booking.id}`}
                              onClick={() => handleOpenEditRoomModal(booking)}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md border border-blue-200 transition-colors cursor-pointer flex items-center space-x-1 text-[10px] font-semibold"
                              title="Ubah Data Booking"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Ubah</span>
                            </button>
                            {booking.status !== 'Disetujui' && (
                              <button
                                id={`btn-approve-room-row-${booking.id}`}
                                onClick={() => handleApproveRoom(booking.id, true)}
                                className="p-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-md border border-green-200 transition-colors cursor-pointer"
                                title="Setujui"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {booking.status !== 'Ditolak' && (
                              <button
                                id={`btn-reject-room-row-${booking.id}`}
                                onClick={() => handleApproveRoom(booking.id, false)}
                                className="p-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-md border border-red-200 transition-colors cursor-pointer"
                                title="Tolak"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              id={`btn-delete-room-persetujuan-${booking.id}`}
                              onClick={() => handleDeleteRoom(booking.id)}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: PERSETUJUAN PEMINJAMAN KENDARAAN (ADMIN) ----------------- */}
      {(subTab === 'persetujuan-kendaraan' || (subTab === 'peminjaman-kendaraan' && vehicleActiveTab === 'persetujuan')) && (
        <div className="space-y-6" id="persetujuan-kendaraan-subtab">
          {/* Admin Inner Navigation Tabs */}
          {isAdmin && (
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3" id="admin-vehicle-persetujuan-tab-switcher">
              <button
                type="button"
                onClick={() => setVehicleActiveTab('daftar')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  vehicleActiveTab === 'daftar'
                    ? 'bg-djpb-blue text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Daftar Peminjaman Kendaraan</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleActiveTab('persetujuan')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  vehicleActiveTab === 'persetujuan'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Menu Persetujuan Peminjaman Kendaraan</span>
                {vehicleBookings.filter(v => v.status === 'Pending').length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-red-600 text-white animate-pulse">
                    {vehicleBookings.filter(v => v.status === 'Pending').length} Pending
                  </span>
                )}
              </button>
            </div>
          )}
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-djpb-blue text-white rounded-xl shadow-xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base md:text-lg font-display font-bold text-slate-800">Menu Persetujuan Peminjaman Kendaraan Dinas</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    <span>Akses Administrator</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Modul khusus Administrator untuk memverifikasi, menyetujui, menolak, menetapkan supir/kendaraan, dan memberikan catatan instruksi pada pengajuan peminjaman mobil dinas.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                id="btn-add-vehicle-booking-persetujuan"
                onClick={() => setShowVehicleModal(true)}
                className="flex items-center space-x-1 px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Peminjaman Kendaraan</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Menunggu Persetujuan</span>
                <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
              </div>
              <div className="text-2xl font-bold font-display text-amber-900 mt-2">
                {vehicleBookings.filter(b => b.status === 'Pending').length}
              </div>
              <p className="text-[10px] text-amber-700 mt-1">Permohonan butuh tindakan admin</p>
            </div>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Disetujui</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-display text-emerald-900 mt-2">
                {vehicleBookings.filter(b => b.status === 'Disetujui').length}
              </div>
              <p className="text-[10px] text-emerald-700 mt-1">Siap Beroperasi</p>
            </div>

            <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Ditolak</span>
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="text-2xl font-bold font-display text-rose-900 mt-2">
                {vehicleBookings.filter(b => b.status === 'Ditolak').length}
              </div>
              <p className="text-[10px] text-rose-700 mt-1">Permohonan ditolak admin</p>
            </div>

            <div className="bg-slate-100/80 border border-slate-300 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Selesai</span>
                <Check className="w-5 h-5 text-slate-600" />
              </div>
              <div className="text-2xl font-bold font-display text-slate-800 mt-2">
                {vehicleBookings.filter(b => b.status === 'Selesai').length}
              </div>
              <p className="text-[10px] text-slate-600 mt-1">Perjalanan telah selesai</p>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Total Peminjaman</span>
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold font-display text-blue-900 mt-2">
                {vehicleBookings.length}
              </div>
              <p className="text-[10px] text-blue-700 mt-1">Seluruh riwayat peminjaman</p>
            </div>
          </div>

          {/* Quick Pending Approval Action Panel */}
          <div className="bg-gradient-to-r from-amber-50/90 via-slate-50 to-blue-50/80 border border-amber-200/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-4" id="vehicle-approval-pending-panel">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-amber-500 text-white rounded-lg">
                  <FileCheck className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-display font-bold text-slate-800">
                  Daftar Permohonan Menunggu Keputusan Admin ({vehicleBookings.filter(b => b.status === 'Pending').length})
                </h3>
              </div>
              <span className="text-[11px] text-amber-800 font-medium hidden sm:inline">
                Pilih Setujui / Tolak dan berikan catatan instruksi driver atau lokasi keberangkatan
              </span>
            </div>

            {vehicleBookings.filter(b => b.status === 'Pending').length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicleBookings.filter(b => b.status === 'Pending').map((pending) => (
                  <div key={pending.id} className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-sm font-bold text-slate-900">{pending.vehicleName}</span>
                          <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full border border-amber-200">
                            Pending
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs space-y-1">
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Plat / Supir:</span>
                          <span className="font-semibold text-slate-800">{pending.plateNumber} ({pending.driverName})</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Pemohon:</span>
                          <span className="font-semibold text-slate-800">{pending.bookerName}</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Tujuan:</span>
                          <span className="font-semibold text-slate-800">{pending.destination}</span>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span className="text-slate-500">Tanggal & Durasi:</span>
                          <span className="font-mono text-slate-800">{pending.date} ({pending.durationDays} hari)</span>
                        </div>
                      </div>
                    </div>

                    {/* Catatan Admin Input */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">
                        Catatan Persetujuan Admin / Lokasi Driver:
                      </label>
                      <input 
                        type="text"
                        className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-djpb-blue"
                        placeholder="Contoh: Disetujui. Driver Pak Budi siap di lobi depan..."
                        value={vehicleApprovalNotes[pending.id] || ''}
                        onChange={(e) => setVehicleApprovalNotes({ ...vehicleApprovalNotes, [pending.id]: e.target.value })}
                      />
                      <div className="flex items-center space-x-2 pt-1">
                        <button
                          id={`btn-approve-vehicle-card-${pending.id}`}
                          onClick={() => handleApproveVehicle(pending.id, true)}
                          className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Setujui</span>
                        </button>
                        <button
                          id={`btn-reject-vehicle-card-${pending.id}`}
                          onClick={() => handleApproveVehicle(pending.id, false)}
                          className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Tolak</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/80 border border-emerald-200 rounded-xl p-4 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-slate-800">Semua Permohonan Kendaraan Dinas Telah Diproses!</p>
                <p className="text-[11px] text-slate-500">Tidak ada pengajuan peminjaman mobil dinas yang sedang menunggu keputusan saat ini.</p>
              </div>
            )}
          </div>

          {/* Filter Status & Table */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 pt-1">
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Status:</span>
              </span>
              <button
                id="filter-vehicle-semua"
                onClick={() => setVehicleFilterStatus('semua')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  vehicleFilterStatus === 'semua' 
                    ? 'bg-djpb-blue text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({vehicleBookings.length})
              </button>
              <button
                id="filter-vehicle-pending"
                onClick={() => setVehicleFilterStatus('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                  vehicleFilterStatus === 'pending' 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span>Pending</span>
                <span className="px-1.5 py-0.2 bg-amber-200/80 text-amber-900 rounded-full text-[10px]">
                  {vehicleBookings.filter(b => b.status === 'Pending').length}
                </span>
              </button>
              <button
                id="filter-vehicle-disetujui"
                onClick={() => setVehicleFilterStatus('disetujui')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  vehicleFilterStatus === 'disetujui' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Disetujui ({vehicleBookings.filter(b => b.status === 'Disetujui').length})
              </button>
              <button
                id="filter-vehicle-ditolak"
                onClick={() => setVehicleFilterStatus('ditolak')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  vehicleFilterStatus === 'ditolak' 
                    ? 'bg-rose-600 text-white shadow-xs' 
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Ditolak ({vehicleBookings.filter(b => b.status === 'Ditolak').length})
              </button>
              <button
                id="filter-vehicle-selesai"
                onClick={() => setVehicleFilterStatus('selesai')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  vehicleFilterStatus === 'selesai' 
                    ? 'bg-slate-700 text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Selesai ({vehicleBookings.filter(b => b.status === 'Selesai').length})
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-display">
                    <th className="py-3.5 px-4">Kendaraan Dinas</th>
                    <th className="py-3.5 px-4">Plat / Supir</th>
                    <th className="py-3.5 px-4">Pemohon</th>
                    <th className="py-3.5 px-4">Destinasi & Tanggal</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Catatan Persetujuan Admin</th>
                    <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vehicleBookings
                    .filter(b => {
                      if (vehicleFilterStatus === 'pending') return b.status === 'Pending';
                      if (vehicleFilterStatus === 'disetujui') return b.status === 'Disetujui';
                      if (vehicleFilterStatus === 'ditolak') return b.status === 'Ditolak';
                      if (vehicleFilterStatus === 'selesai') return b.status === 'Selesai';
                      return true;
                    })
                    .map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-800">{booking.vehicleName}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{booking.plateNumber}</div>
                          <div className="text-[10px] text-amber-700 font-medium">Supir: {booking.driverName}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium">{booking.bookerName}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{booking.destination}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{booking.date} ({booking.durationDays} hari)</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            booking.status === 'Disetujui' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : booking.status === 'Ditolak'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : booking.status === 'Selesai'
                              ? 'bg-slate-100 text-slate-600 border border-slate-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs text-slate-600 italic text-[11px]">
                          {booking.statusNote || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {booking.status !== 'Disetujui' && booking.status !== 'Selesai' && (
                              <button
                                id={`btn-approve-vehicle-row-${booking.id}`}
                                onClick={() => handleApproveVehicle(booking.id, true)}
                                className="p-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-md border border-green-200 transition-colors cursor-pointer"
                                title="Setujui"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {booking.status !== 'Ditolak' && booking.status !== 'Selesai' && (
                              <button
                                id={`btn-reject-vehicle-row-${booking.id}`}
                                onClick={() => handleApproveVehicle(booking.id, false)}
                                className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-md border border-rose-200 transition-colors cursor-pointer"
                                title="Tolak"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {booking.status === 'Disetujui' && (
                              <button
                                id={`btn-complete-vehicle-row-${booking.id}`}
                                onClick={() => handleCompleteVehicle(booking.id)}
                                className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold rounded-md transition-colors cursor-pointer"
                              >
                                Selesai
                              </button>
                            )}
                            <button
                              id={`btn-delete-vehicle-persetujuan-${booking.id}`}
                              onClick={() => handleDeleteVehicle(booking.id)}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  {vehicleBookings.filter(b => {
                    if (vehicleFilterStatus === 'pending') return b.status === 'Pending';
                    if (vehicleFilterStatus === 'disetujui') return b.status === 'Disetujui';
                    if (vehicleFilterStatus === 'ditolak') return b.status === 'Ditolak';
                    if (vehicleFilterStatus === 'selesai') return b.status === 'Selesai';
                    return true;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-slate-400 font-sans italic text-xs">
                        Tidak ada data peminjaman kendaraan dengan filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: PEMINJAMAN RUANGAN ----------------- */}
      {(subTab === 'peminjaman-ruangan' && roomActiveTab === 'daftar') && (
        <div className="space-y-4" id="room-subtab">
          {/* Admin Inner Navigation Tabs */}
          {isAdmin && (
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3" id="admin-room-tab-switcher">
              <button
                type="button"
                onClick={() => setRoomActiveTab('daftar')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  roomActiveTab === 'daftar'
                    ? 'bg-djpb-blue text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Daftar Peminjaman Ruangan</span>
              </button>
              <button
                type="button"
                onClick={() => setRoomActiveTab('persetujuan')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  roomActiveTab === 'persetujuan'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                <FileCheck className="w-4 h-4 text-amber-700" />
                <span>Menu Persetujuan Peminjaman Ruangan</span>
                {roomBookings.filter(b => b.status === 'Pending').length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-red-500 text-white animate-pulse">
                    {roomBookings.filter(b => b.status === 'Pending').length} Pending
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base md:text-lg font-display font-bold text-slate-800">Peminjaman Ruang Rapat & Aula</h2>
              <p className="text-xs text-slate-500">Kelola pemesanan Aula Lancang Kuning, Aula Zapin, Soleram, dan Gurindam.</p>
            </div>
            <button
              id="btn-add-room-booking"
              onClick={handleOpenNewRoomModal}
              className="flex items-center space-x-1 px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Peminjaman Ruangan</span>
            </button>
          </div>

          {/* Admin Room Approval Banner */}
          {isAdmin && (
            <div className="bg-gradient-to-r from-amber-50 via-slate-50 to-blue-50 border border-amber-200/80 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3" id="admin-room-banner">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500 text-white rounded-lg shadow-xs">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-display font-bold text-slate-800 flex items-center space-x-2">
                    <span>Menu Persetujuan Admin Peminjaman Ruangan</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Akses Administrator
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Terdapat <strong className="text-amber-800 font-bold">{roomBookings.filter(b => b.status === 'Pending').length} permohonan</strong> yang memerlukan persetujuan administrator.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  id="btn-open-persetujuan-ruangan-page"
                  onClick={() => setRoomActiveTab('persetujuan')}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buka Halaman Persetujuan Ruangan</span>
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-display">
                    <th className="py-3.5 px-4">Ruangan</th>
                    <th className="py-3.5 px-4">Peminjam</th>
                    <th className="py-3.5 px-4">Tanggal / Waktu</th>
                    <th className="py-3.5 px-4">Kegiatan</th>
                    <th className="py-3.5 px-4">Perlengkapan / Kebutuhan</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Catatan Admin</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {roomBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{booking.roomName}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold">{booking.bookerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{booking.division}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium">{booking.date}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{booking.startTime} - {booking.endTime}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate font-medium text-slate-800" title={booking.purpose}>{booking.purpose}</td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-600 font-sans" title={booking.equipmentNeeded || '-'}>
                        {booking.equipmentNeeded ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-md text-[11px] font-medium">
                            {booking.equipmentNeeded}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          booking.status === 'Disetujui' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : booking.status === 'Ditolak'
                            ? 'bg-red-50 text-red-600 border border-red-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-600 italic text-[11px]">
                        {booking.statusNote || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isEditMode && (
                            <button
                              id={`btn-edit-room-${booking.id}`}
                              onClick={() => handleOpenEditRoomModal(booking)}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md border border-blue-200 transition-colors cursor-pointer flex items-center space-x-1 text-[10px] font-semibold"
                              title="Ubah Data Booking"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Ubah</span>
                            </button>
                          )}
                          {isEditMode && booking.status === 'Pending' && (
                            <>
                              <button
                                id={`btn-approve-room-${booking.id}`}
                                onClick={() => handleApproveRoom(booking.id, true)}
                                className="p-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-md border border-green-200 transition-colors cursor-pointer"
                                title="Setujui"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`btn-reject-room-${booking.id}`}
                                onClick={() => handleApproveRoom(booking.id, false)}
                                className="p-1 bg-red-50 hover:bg-red-100 text-red-500 rounded-md border border-red-200 transition-colors cursor-pointer"
                                title="Tolak"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <button
                            id={`btn-delete-room-${booking.id}`}
                            onClick={() => handleDeleteRoom(booking.id)}
                            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: PEMINJAMAN BARANG ----------------- */}
      {subTab === 'peminjaman-barang' && (
        <div className="space-y-5" id="item-subtab">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base md:text-lg font-display font-bold text-slate-800">Peminjaman Barang Inventaris Kantor</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-djpb-blue/10 text-djpb-blue border border-djpb-blue/20 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Sistem Persetujuan Admin</span>
                </span>
              </div>
              <p className="text-xs text-slate-500">Peminjaman proyektor, portable speaker, laser pointer, dan laptop dinas Subbag Rumah Tangga / Bagian Umum.</p>
            </div>
            <div className="flex items-center space-x-2">
              {isAdmin && onToggleEditMode && (
                <button
                  id="btn-toggle-admin-item-approval"
                  onClick={onToggleEditMode}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 border transition-colors cursor-pointer ${
                    isEditMode 
                      ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100' 
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5 text-djpb-gold" />
                  <span>{isEditMode ? 'Mode Admin Aktif' : 'Aktifkan Mode Admin'}</span>
                </button>
              )}
              <button
                id="btn-add-item-booking"
                onClick={handleOpenNewItemModal}
                className="flex items-center space-x-1 px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Pinjam Barang</span>
              </button>
            </div>
          </div>

          {/* ----------------- FITUR PERSETUJUAN ADMIN (PANEL UTAMA) ----------------- */}
          {isAdmin && (
            <div className="bg-gradient-to-r from-amber-50/90 via-slate-50 to-blue-50/80 border border-amber-200/80 rounded-xl p-4 sm:p-5 shadow-xs space-y-4" id="admin-item-approval-panel">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/50 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-amber-500 text-white rounded-lg shadow-xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-display font-bold text-slate-800 flex items-center space-x-2">
                      <span>Fitur Persetujuan Admin (Peminjaman Barang Inventaris Kantor)</span>
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Modul verifikasi & persetujuan permohonan peminjaman barang oleh Subbag Rumah Tangga
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300/80 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                    <span>{itemBookings.filter(i => i.status === 'Pending').length} Permohonan Menunggu Persetujuan</span>
                  </span>
                </div>
              </div>

              {/* List of Pending Items for Quick Approval */}
              {itemBookings.filter(i => i.status === 'Pending').length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-700">Daftar Permohonan Menunggu Keputusan Admin:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {itemBookings.filter(i => i.status === 'Pending').map((pendingItem) => (
                      <div key={pendingItem.id} className="bg-white border border-amber-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-xs font-bold text-slate-900">{pendingItem.itemName}</span>
                              <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-mono rounded font-semibold">
                                {pendingItem.quantity} Unit
                              </span>
                            </div>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                              Pending
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 flex items-center justify-between">
                            <span>Pemohon: <strong className="text-slate-800">{pendingItem.bookerName}</strong> ({pendingItem.division})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Tgl Peminjaman: {pendingItem.date}
                          </div>
                        </div>

                        {/* Catatan Persetujuan Input */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase">
                            Catatan Persetujuan / Lokasi Pengambilan:
                          </label>
                          <input 
                            type="text" 
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-colors"
                            placeholder="Contoh: Silakan diambil di Subbag Rumah Tangga lantai 1..."
                            value={itemApprovalNotes[pendingItem.id] || ''}
                            onChange={(e) => setItemApprovalNotes({ ...itemApprovalNotes, [pendingItem.id]: e.target.value })}
                          />
                        </div>

                        {/* Action Approval Buttons */}
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            id={`btn-approve-panel-${pendingItem.id}`}
                            onClick={() => handleApproveItem(pendingItem.id, true)}
                            className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1 shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Setujui Peminjaman</span>
                          </button>
                          <button
                            id={`btn-reject-panel-${pendingItem.id}`}
                            onClick={() => handleApproveItem(pendingItem.id, false)}
                            className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center space-x-1 shadow-xs"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 border border-emerald-200 rounded-xl p-4 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">Semua Permohonan Telah Diproses!</p>
                  <p className="text-[11px] text-slate-500">Tidak ada peminjaman barang inventaris kantor yang sedang menunggu persetujuan saat ini.</p>
                </div>
              )}
            </div>
          )}

          {/* Filter Status Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 pt-1">
            <div className="flex items-center space-x-1.5 overflow-x-auto">
              <span className="text-xs font-bold text-slate-500 mr-1 flex items-center space-x-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter Status:</span>
              </span>
              <button
                id="filter-item-semua"
                onClick={() => setItemFilter('semua')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  itemFilter === 'semua' 
                    ? 'bg-djpb-blue text-white shadow-xs' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua ({itemBookings.length})
              </button>
              <button
                id="filter-item-pending"
                onClick={() => setItemFilter('pending')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                  itemFilter === 'pending' 
                    ? 'bg-amber-500 text-white shadow-xs' 
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span>Pending</span>
                <span className="px-1.5 py-0.2 bg-amber-200/80 text-amber-900 rounded-full text-[10px]">
                  {itemBookings.filter(i => i.status === 'Pending').length}
                </span>
              </button>
              <button
                id="filter-item-dipinjam"
                onClick={() => setItemFilter('dipinjam')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  itemFilter === 'dipinjam' 
                    ? 'bg-blue-600 text-white shadow-xs' 
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                Dipinjam ({itemBookings.filter(i => i.status === 'Dipinjam').length})
              </button>
              <button
                id="filter-item-kembali"
                onClick={() => setItemFilter('kembali')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  itemFilter === 'kembali' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Kembali ({itemBookings.filter(i => i.status === 'Kembali').length})
              </button>
              <button
                id="filter-item-ditolak"
                onClick={() => setItemFilter('ditolak')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  itemFilter === 'ditolak' 
                    ? 'bg-rose-600 text-white shadow-xs' 
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                Ditolak ({itemBookings.filter(i => i.status === 'Ditolak').length})
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-display">
                    <th className="py-3.5 px-4">Nama Barang</th>
                    <th className="py-3.5 px-4">Peminjam</th>
                    <th className="py-3.5 px-4">Jumlah / Tanggal</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Keterangan Persetujuan Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi Admin / User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {itemBookings
                    .filter(item => {
                      if (itemFilter === 'pending') return item.status === 'Pending';
                      if (itemFilter === 'dipinjam') return item.status === 'Dipinjam';
                      if (itemFilter === 'kembali') return item.status === 'Kembali';
                      if (itemFilter === 'ditolak') return item.status === 'Ditolak';
                      return true;
                    })
                    .map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{item.itemName}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold">{item.bookerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{item.division}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        <div>{item.quantity} unit</div>
                        <div className="text-[10px] text-slate-400">{item.date}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.status === 'Dipinjam' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse' 
                            : item.status === 'Kembali'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : item.status === 'Ditolak'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-300 font-bold'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs font-sans">
                        {item.statusNote || <span className="text-slate-400 italic text-[10px]">-</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isAdmin && item.status === 'Pending' && (
                            <div className="flex items-center space-x-1 bg-amber-50/90 p-0.5 rounded-lg border border-amber-200">
                              <button
                                id={`btn-approve-item-${item.id}`}
                                onClick={() => handleApproveItem(item.id, true)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors cursor-pointer flex items-center space-x-1 text-[10px] font-bold shadow-xs"
                                title="Setujui Peminjaman Barang"
                              >
                                <Check className="w-3 h-3" />
                                <span>Setujui</span>
                              </button>
                              <button
                                id={`btn-reject-item-${item.id}`}
                                onClick={() => handleApproveItem(item.id, false)}
                                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors cursor-pointer flex items-center space-x-1 text-[10px] font-bold shadow-xs"
                                title="Tolak Peminjaman Barang"
                              >
                                <X className="w-3 h-3" />
                                <span>Tolak</span>
                              </button>
                            </div>
                          )}
                          {isAdmin && (
                            <button
                              id={`btn-edit-item-${item.id}`}
                              onClick={() => handleOpenEditItemModal(item)}
                              className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md border border-blue-200 transition-colors cursor-pointer flex items-center space-x-1 text-[10px] font-semibold"
                              title="Ubah Data & Keterangan Status"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Ubah</span>
                            </button>
                          )}
                          {item.status === 'Dipinjam' && (
                            <button
                              id={`btn-return-item-${item.id}`}
                              onClick={() => handleUpdateItemStatus(item.id, 'Kembali')}
                              className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 text-[10px] font-semibold rounded-md border border-green-200 transition-colors cursor-pointer"
                            >
                              Kembalikan
                            </button>
                          )}
                          {isAdmin && (
                            <button
                              id={`btn-delete-item-${item.id}`}
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {itemBookings.filter(item => {
                    if (itemFilter === 'pending') return item.status === 'Pending';
                    if (itemFilter === 'dipinjam') return item.status === 'Dipinjam';
                    if (itemFilter === 'kembali') return item.status === 'Kembali';
                    if (itemFilter === 'ditolak') return item.status === 'Ditolak';
                    return true;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400 font-sans italic text-xs">
                        Tidak ada data peminjaman barang dengan filter ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: PEMINJAMAN KENDARAAN ----------------- */}
      {(subTab === 'peminjaman-kendaraan' && vehicleActiveTab === 'daftar') && (
        <div className="space-y-4" id="vehicle-subtab">
          {/* Admin Inner Navigation Tabs */}
          {isAdmin && (
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3" id="admin-vehicle-tab-switcher">
              <button
                type="button"
                onClick={() => setVehicleActiveTab('daftar')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  vehicleActiveTab === 'daftar'
                    ? 'bg-djpb-blue text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Car className="w-4 h-4" />
                <span>Daftar Peminjaman Kendaraan</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleActiveTab('persetujuan')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all cursor-pointer ${
                  vehicleActiveTab === 'persetujuan'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300'
                }`}
              >
                <FileCheck className="w-4 h-4 text-amber-700" />
                <span>Menu Persetujuan Peminjaman Kendaraan</span>
                {vehicleBookings.filter(v => v.status === 'Pending').length > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-red-500 text-white animate-pulse">
                    {vehicleBookings.filter(v => v.status === 'Pending').length} Pending
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base md:text-lg font-display font-bold text-slate-800">Peminjaman Kendaraan Dinas & Supir</h2>
              <p className="text-xs text-slate-500">Layanan pengantaran mobil dinas operasional Kanwil DJPb Riau.</p>
            </div>
            <button
              id="btn-add-vehicle-booking"
              onClick={() => setShowVehicleModal(true)}
              className="flex items-center space-x-1 px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Peminjaman Kendaraan</span>
            </button>
          </div>

          {/* Admin Vehicle Approval Banner */}
          {isAdmin && (
            <div className="bg-gradient-to-r from-amber-50 via-slate-50 to-blue-50 border border-amber-200/80 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3" id="admin-vehicle-banner">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500 text-white rounded-lg shadow-xs">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-display font-bold text-slate-800 flex items-center space-x-2">
                    <span>Menu Persetujuan Admin Peminjaman Kendaraan</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                      Akses Administrator
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Terdapat <strong className="text-amber-800 font-bold">{vehicleBookings.filter(v => v.status === 'Pending').length} permohonan</strong> yang memerlukan persetujuan administrator.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  id="btn-open-persetujuan-kendaraan-page"
                  onClick={() => setVehicleActiveTab('persetujuan')}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buka Halaman Persetujuan Kendaraan</span>
                </button>
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-display">
                    <th className="py-3.5 px-4">Kendaraan Dinas</th>
                    <th className="py-3.5 px-4">Plat / Driver</th>
                    <th className="py-3.5 px-4">Pemohon</th>
                    <th className="py-3.5 px-4">Destinasi / Durasi</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {vehicleBookings.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{vehicle.vehicleName}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{vehicle.plateNumber}</div>
                        <div className="flex items-center space-x-1.5 mt-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            vehicle.driverOption === 'Tanpa Supir' || vehicle.driverName.includes('Tanpa Supir')
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-blue-100 text-blue-800 border border-blue-300'
                          }`}>
                            {vehicle.driverOption || (vehicle.driverName.includes('Tanpa Supir') ? 'Tanpa Supir' : 'Dengan Supir')}
                          </span>
                          <span className="text-[10px] text-slate-600 font-medium">
                            {vehicle.driverName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium">{vehicle.bookerName}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{vehicle.destination}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{vehicle.date} ({vehicle.durationDays} hari)</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          vehicle.status === 'Disetujui' 
                            ? 'bg-green-50 text-green-700 border border-green-200' 
                            : vehicle.status === 'Ditolak'
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : vehicle.status === 'Selesai'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {vehicle.status}
                        </span>
                        {vehicle.statusNote && (
                          <div className="text-[10px] text-slate-500 italic mt-0.5">{vehicle.statusNote}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {isEditMode && vehicle.status === 'Pending' && (
                            <>
                              <button
                                id={`btn-approve-vehicle-${vehicle.id}`}
                                onClick={() => handleApproveVehicle(vehicle.id, true)}
                                className="p-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-md border border-green-200 transition-colors cursor-pointer"
                                title="Setujui"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                id={`btn-reject-vehicle-${vehicle.id}`}
                                onClick={() => handleApproveVehicle(vehicle.id, false)}
                                className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-md border border-rose-200 transition-colors cursor-pointer"
                                title="Tolak"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {vehicle.status === 'Disetujui' && (
                            <button
                              id={`btn-complete-vehicle-${vehicle.id}`}
                              onClick={() => handleCompleteVehicle(vehicle.id)}
                              className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-semibold rounded-md transition-colors cursor-pointer"
                            >
                              Selesai
                            </button>
                          )}
                          <button
                            id={`btn-delete-vehicle-${vehicle.id}`}
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded-md transition-colors cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: FEEDBACK SARPRAS ----------------- */}
      {subTab === 'feedback-sarpras' && (
        <div className="space-y-4" id="feedback-subtab">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base md:text-lg font-display font-bold text-slate-800">Aduan & Feedback Sarana Prasarana</h2>
              <p className="text-xs text-slate-500">Laporkan kerusakan AC, kebersihan, IT, atau kebutuhan ruangan lainnya.</p>
            </div>
            <button
              id="btn-add-feedback"
              onClick={() => setShowFeedbackModal(true)}
              className="flex items-center space-x-1 px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Laporan</span>
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="feedback-cards-grid">
            {feedbacks.map((f) => (
              <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      f.category === 'AC' ? 'bg-sky-50 text-sky-700' :
                      f.category === 'IT / Jaringan' ? 'bg-purple-50 text-purple-700' :
                      f.category === 'Kebersihan' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {f.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      f.status === 'Resolved' ? 'bg-green-50 text-green-700' :
                      f.status === 'In Progress' ? 'bg-amber-50 text-amber-700 animate-pulse' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {f.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 leading-snug">{f.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  <div>
                    <div className="font-semibold text-slate-700">{f.reporterName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{f.reporterDivision} • {f.date}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < f.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} />
                      ))}
                    </div>

                    <div className="flex space-x-1">
                      {f.status === 'Open' && (
                        <button
                          id={`btn-inprogress-fb-${f.id}`}
                          onClick={() => handleUpdateFeedbackStatus(f.id, 'In Progress')}
                          className="px-1.5 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-[9px] font-semibold cursor-pointer"
                        >
                          Proses
                        </button>
                      )}
                      {f.status === 'In Progress' && (
                        <button
                          id={`btn-resolve-fb-${f.id}`}
                          onClick={() => handleUpdateFeedbackStatus(f.id, 'Resolved')}
                          className="px-1.5 py-0.5 bg-green-600 hover:bg-green-700 text-white rounded text-[9px] font-semibold cursor-pointer"
                        >
                          Selesai
                        </button>
                      )}
                      <button
                        id={`btn-delete-fb-${f.id}`}
                        onClick={() => handleDeleteFeedback(f.id)}
                        className="p-1 hover:bg-slate-50 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: RENCANA KEBUTUHAN / SURAT PERMINTAAN BARANG PERSEDIAAN ----------------- */}
      {(subTab === 'rencana-kebutuhan' || subTab === 'persetujuan-spbp') && (
        <div className="space-y-4" id="needs-subtab">
          
          {/* SubTab Toggle Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base md:text-lg font-display font-extrabold text-slate-800">
                {subTab === 'persetujuan-spbp' 
                  ? 'Persetujuan, Kelola & Hapus Surat SPBP (Persediaan) Admin' 
                  : 'Formulir Permintaan Barang Persediaan (SPBP)'}
              </h2>
              <p className="text-xs text-slate-500">
                Dokumen Resmi & Formulir Pengajuan Alat Tulis Kantor (ATK) Kanwil DJPb Provinsi Riau
              </p>
            </div>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setNeedsViewMode('spbp')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                  needsViewMode === 'spbp'
                    ? 'bg-djpb-blue text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Dokumen Official Surat SPBP</span>
              </button>

              <button
                type="button"
                onClick={() => setNeedsViewMode('rekap')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
                  needsViewMode === 'rekap'
                    ? 'bg-djpb-blue text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                <span>Tabel Usulan Kebutuhan</span>
              </button>
            </div>
          </div>

          {/* MODE 1: OFFICIAL SURAT PERMINTAAN BARANG PERSEDIAAN */}
          {needsViewMode === 'spbp' ? (
            <SuratPermintaanBarangPersediaan 
              currentUserRole={currentUser?.role} 
              isEditMode={isEditMode} 
            />
          ) : (
            /* MODE 2: TABLE REKAPITULASI USULAN KEBUTUHAN BULANAN */
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Tabel Usulan Kebutuhan Bulanan</h3>
                  <p className="text-xs text-slate-500">Daftar usulan pengadaan kertas, printer, tinta, konsumsi, dan sarpras.</p>
                </div>
                <button
                  id="btn-add-need"
                  onClick={() => setShowNeedModal(true)}
                  className="flex items-center space-x-1 px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Usul Barang</span>
                </button>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold font-display">
                        <th className="py-3.5 px-4">Nama Usulan Barang</th>
                        <th className="py-3.5 px-4">Kategori</th>
                        <th className="py-3.5 px-4">Volume / Satuan</th>
                        <th className="py-3.5 px-4">Estimasi Harga Satuan</th>
                        <th className="py-3.5 px-4">Total Estimasi</th>
                        <th className="py-3.5 px-4">Urgensi</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {needs.map((n) => {
                        const total = n.quantity * n.estimatedPrice;
                        return (
                          <tr key={n.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-800">{n.itemName}</td>
                            <td className="py-3.5 px-4 font-medium">{n.category}</td>
                            <td className="py-3.5 px-4 font-mono">{n.quantity} {n.unit}</td>
                            <td className="py-3.5 px-4 font-mono">{formatIDR(n.estimatedPrice)}</td>
                            <td className="py-3.5 px-4 font-bold text-djpb-blue font-mono">{formatIDR(total)}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                n.urgency === 'Tinggi' ? 'bg-red-50 text-red-600' :
                                n.urgency === 'Sedang' ? 'bg-amber-50 text-amber-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {n.urgency}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                n.status === 'Disetujui' ? 'bg-green-50 text-green-700' :
                                n.status === 'Dibatalkan' ? 'bg-red-50 text-red-600' :
                                'bg-amber-50 text-amber-700'
                              }`}>
                                {n.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                {isEditMode && n.status === 'Diusulkan' && (
                                  <>
                                    <button
                                      id={`btn-approve-need-${n.id}`}
                                      onClick={() => handleApproveNeed(n.id, 'Disetujui')}
                                      className="p-1 bg-green-50 hover:bg-green-100 text-green-600 rounded border border-green-200 cursor-pointer"
                                      title="Setujui"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      id={`btn-reject-need-${n.id}`}
                                      onClick={() => handleApproveNeed(n.id, 'Dibatalkan')}
                                      className="p-1 bg-red-50 hover:bg-red-100 text-red-500 rounded border border-red-200 cursor-pointer"
                                      title="Batalkan"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                                <button
                                  id={`btn-delete-need-${n.id}`}
                                  onClick={() => handleDeleteNeed(n.id)}
                                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}


      {/* ----------------- POPUP MODALS ----------------- */}

      {/* 1. Room Booking Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" id="room-modal">
          <form onSubmit={handleAddRoomBooking} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-display font-bold text-slate-800">
              {editingRoomBooking ? 'Ubah Booking Ruang Rapat & Aula' : 'Booking Ruang Rapat & Aula'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Pilih Ruangan</label>
                <select 
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  value={roomForm.roomName}
                  onChange={(e) => setRoomForm({ ...roomForm, roomName: e.target.value })}
                >
                  <option>Aula Lancang Kuning</option>
                  <option>Aula Zapin</option>
                  <option>Soleram</option>
                  <option>Gurindam</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Nama Peminjam</label>
                  <input 
                    type="text" required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={roomForm.bookerName}
                    onChange={(e) => setRoomForm({ ...roomForm, bookerName: e.target.value })}
                    placeholder="Contoh: Andi Wijaya"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Bagian / Bidang</label>
                  <select 
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={roomForm.division}
                    onChange={(e) => setRoomForm({ ...roomForm, division: e.target.value })}
                  >
                    <option>Bagian Umum</option>
                    <option>Bidang PPA I</option>
                    <option>Bidang PPA II</option>
                    <option>Bidang PAPK</option>
                    <option>Bidang SKKI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Tanggal Kegiatan</label>
                <input 
                  type="date" required
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  value={roomForm.date}
                  onChange={(e) => setRoomForm({ ...roomForm, date: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Mulai Jam</label>
                  <input 
                    type="time" required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={roomForm.startTime}
                    onChange={(e) => setRoomForm({ ...roomForm, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Selesai Jam</label>
                  <input 
                    type="time" required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={roomForm.endTime}
                    onChange={(e) => setRoomForm({ ...roomForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Nama / Deskripsi Kegiatan</label>
                <textarea 
                  required rows={2}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  placeholder="Contoh: Rapat Evaluasi Kinerja Semester I / Sosialisasi SAKTI..."
                  value={roomForm.purpose}
                  onChange={(e) => setRoomForm({ ...roomForm, purpose: e.target.value })}
                ></textarea>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Perlengkapan / Kebutuhan Yang Diperlukan</label>
                <textarea 
                  rows={2}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  placeholder="Contoh: Sound System, Mic Wireless (2 pcs), Proyektor, Zoom Hybrid, Layar LED..."
                  value={roomForm.equipmentNeeded}
                  onChange={(e) => setRoomForm({ ...roomForm, equipmentNeeded: e.target.value })}
                ></textarea>
              </div>

              {(isEditMode || editingRoomBooking) && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Status Peminjaman</label>
                  <select 
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                    value={roomForm.status}
                    onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as any })}
                  >
                    <option value="Pending">Pending (Menunggu Persetujuan)</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowRoomModal(false);
                  setEditingRoomBooking(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {editingRoomBooking ? 'Simpan Perubahan' : 'Simpan Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Item Booking Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" id="item-modal">
          <form onSubmit={handleAddItemBooking} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-display font-bold text-slate-800">
              {editingItemBooking ? 'Ubah Pinjam Barang Inventaris' : 'Pinjam Barang Inventaris'}
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Nama Barang</label>
                <input 
                  type="text" required
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  value={itemForm.itemName}
                  onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                  placeholder="Ketik nama barang (contoh: Proyektor Epson, Laptop Dell, Speaker Portable...)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Nama Peminjam</label>
                  <input 
                    type="text" required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={itemForm.bookerName}
                    onChange={(e) => setItemForm({ ...itemForm, bookerName: e.target.value })}
                    placeholder="Contoh: Andi"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Jumlah Unit</label>
                  <input 
                    type="number" min={1} required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Bagian / Bidang</label>
                  <select 
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={itemForm.division}
                    onChange={(e) => setItemForm({ ...itemForm, division: e.target.value })}
                  >
                    <option>Bagian Umum</option>
                    <option>Bidang PPA I</option>
                    <option>Bidang PPA II</option>
                    <option>Bidang PAPK</option>
                    <option>Bidang SKKI</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Tanggal Pinjam</label>
                  <input 
                    type="date" required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={itemForm.date}
                    onChange={(e) => setItemForm({ ...itemForm, date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Keterangan Status Peminjaman</label>
                <textarea 
                  rows={2}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  value={itemForm.statusNote}
                  onChange={(e) => setItemForm({ ...itemForm, statusNote: e.target.value })}
                  placeholder="Contoh: Barang siap diambil di Subbag Rumah Tangga, kondisi lengkap, dll."
                />
              </div>

              {(isEditMode || editingItemBooking) && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Status Peminjaman</label>
                  <select 
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                    value={itemForm.status}
                    onChange={(e) => setItemForm({ ...itemForm, status: e.target.value as any })}
                  >
                    <option value="Pending">Pending (Menunggu Persetujuan)</option>
                    <option value="Dipinjam">Dipinjam (Disetujui)</option>
                    <option value="Kembali">Kembali (Sudah Dikembalikan)</option>
                    <option value="Ditolak">Ditolak (Peminjaman Ditolak)</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowItemModal(false);
                  setEditingItemBooking(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {editingItemBooking ? 'Simpan Perubahan' : 'Ajukan Pinjam'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Vehicle Booking Modal */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" id="vehicle-modal">
          <form onSubmit={handleAddVehicleBooking} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-display font-bold text-slate-800">Booking Kendaraan Dinas & Supir</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Pilih Kendaraan</label>
                <select 
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  value={vehicleForm.vehicleName}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, vehicleName: e.target.value })}
                >
                  <option>Toyota Kijang Innova BM 1679 T</option>
                  <option>Toyota Kijang Innova Reborn B 1932 PQS</option>
                  <option>Wuling Cortez BM 1888 T</option>
                  <option>Toyota Rush BM 1737 T</option>
                  <option>Toyota Fortuner BM 1987 T</option>
                  <option>Mitsubishi Expander BM 1737 T</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Pilihan Layanan Supir</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVehicleForm({ ...vehicleForm, driverOption: 'Dengan Supir' })}
                    className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                      vehicleForm.driverOption === 'Dengan Supir'
                        ? 'bg-blue-50/80 border-djpb-blue text-djpb-blue font-bold shadow-2xs ring-1 ring-djpb-blue/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <UserCheck className={`w-4 h-4 shrink-0 ${vehicleForm.driverOption === 'Dengan Supir' ? 'text-djpb-blue' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs">Dengan Supir</div>
                      <div className="text-[9px] text-slate-400 font-normal">Disiapkan pengemudi</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicleForm({ ...vehicleForm, driverOption: 'Tanpa Supir' })}
                    className={`p-2.5 rounded-lg border text-left flex items-center space-x-2 transition-all cursor-pointer ${
                      vehicleForm.driverOption === 'Tanpa Supir'
                        ? 'bg-amber-50/80 border-amber-500 text-amber-900 font-bold shadow-2xs ring-1 ring-amber-500/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                    }`}
                  >
                    <Car className={`w-4 h-4 shrink-0 ${vehicleForm.driverOption === 'Tanpa Supir' ? 'text-amber-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="text-xs">Tanpa Supir</div>
                      <div className="text-[9px] text-slate-400 font-normal">Lepas kunci</div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Nama Pemohon</label>
                  <input 
                    type="text" required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={vehicleForm.bookerName}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, bookerName: e.target.value })}
                    placeholder="Contoh: Eka"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Durasi Hari</label>
                  <input 
                    type="number" min={1} required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    value={vehicleForm.durationDays}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, durationDays: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Destinasi / Tujuan Perjalanan</label>
                <input 
                  type="text" required
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  value={vehicleForm.destination}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, destination: e.target.value })}
                  placeholder="Contoh: KPPN Dumai"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Tanggal Keberangkatan</label>
                <input 
                  type="date" required
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  value={vehicleForm.date}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, date: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowVehicleModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Ajukan Kendaraan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" id="feedback-modal">
          <form onSubmit={handleAddFeedback} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-display font-bold text-slate-800">Buat Laporan / Feedback Sarpras</h3>
            
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Kategori Aduan</label>
                  <select 
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={feedbackForm.category}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value as any })}
                  >
                    <option>AC</option>
                    <option>Ruangan</option>
                    <option>Kebersihan</option>
                    <option>IT / Jaringan</option>
                    <option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Nama Pelapor</label>
                  <input 
                    type="text" required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={feedbackForm.reporterName}
                    onChange={(e) => setFeedbackForm({ ...feedbackForm, reporterName: e.target.value })}
                    placeholder="Contoh: Supri"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Bagian / Bidang</label>
                <select 
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  value={feedbackForm.reporterDivision}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, reporterDivision: e.target.value })}
                >
                  <option>Bagian Umum</option>
                  <option>Bidang PPA I</option>
                  <option>Bidang PPA II</option>
                  <option>Bidang PAPK</option>
                  <option>Bidang SKKI</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Rating Kepuasan Fasilitas</label>
                <div className="flex items-center space-x-1.5 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      className="p-1 hover:scale-110 transition-transform text-amber-500 cursor-pointer"
                    >
                      <Star className={`w-6 h-6 ${star <= feedbackForm.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Keterangan / Detil Masalah</label>
                <textarea 
                  required rows={3}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  placeholder="Deskripsikan komplain atau feedback Anda..."
                  value={feedbackForm.description}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, description: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Kirim Laporan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Need Modal */}
      {showNeedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" id="need-modal">
          <form onSubmit={handleAddNeed} className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-display font-bold text-slate-800">Usulkan Kebutuhan Barang</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Nama Barang Usulan</label>
                <input 
                  type="text" required
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  value={needForm.itemName}
                  onChange={(e) => setNeedForm({ ...needForm, itemName: e.target.value })}
                  placeholder="Contoh: Kertas HVS F4 80gr"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Kategori</label>
                  <select 
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={needForm.category}
                    onChange={(e) => setNeedForm({ ...needForm, category: e.target.value as any })}
                  >
                    <option>ATK</option>
                    <option>Konsumsi</option>
                    <option>Sarpras</option>
                    <option>Lain-lain</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Urgensi</label>
                  <select 
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={needForm.urgency}
                    onChange={(e) => setNeedForm({ ...needForm, urgency: e.target.value as any })}
                  >
                    <option>Tinggi</option>
                    <option>Sedang</option>
                    <option>Rendah</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Volume</label>
                  <input 
                    type="number" min={1} required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    value={needForm.quantity}
                    onChange={(e) => setNeedForm({ ...needForm, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Satuan</label>
                  <input 
                    type="text" required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    value={needForm.unit}
                    onChange={(e) => setNeedForm({ ...needForm, unit: e.target.value })}
                    placeholder="Rim / Dus / Pcs"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Harga Satuan (Rp)</label>
                  <input 
                    type="number" min={100} required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    value={needForm.estimatedPrice}
                    onChange={(e) => setNeedForm({ ...needForm, estimatedPrice: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowNeedModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Kirim Usulan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
