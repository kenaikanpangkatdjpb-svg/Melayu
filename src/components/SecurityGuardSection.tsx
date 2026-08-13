import React, { useState, useRef } from 'react';
import { 
  Shield, Plus, Trash2, Edit3, Check, X,
  FileSpreadsheet, Upload, Download, RotateCcw, AlertCircle, FileCheck,
  Search, Users, Home, Calendar, Clock, Sparkles, Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SecurityShift, SecurityRosterItem } from '../types';
import { INITIAL_SECURITY_SHIFTS, INITIAL_SECURITY_ROSTER } from '../mockData';

interface SecurityGuardSectionProps {
  securityShifts: SecurityShift[];
  setSecurityShifts?: React.Dispatch<React.SetStateAction<SecurityShift[]>>;
  securityRoster?: SecurityRosterItem[];
  setSecurityRoster?: React.Dispatch<React.SetStateAction<SecurityRosterItem[]>>;
  isAdmin: boolean;
}

export default function SecurityGuardSection({
  securityShifts,
  setSecurityShifts,
  securityRoster = [],
  setSecurityRoster,
  isAdmin
}: SecurityGuardSectionProps) {
  // View mode: 'roster' (Individual Guard Table - like user's image) or 'matrix' (3-Shift View)
  const [viewMode, setViewMode] = useState<'roster' | 'matrix'>('roster');

  // Document Title & Dynamic Headers State (persisted to localStorage)
  const [docTitle, setDocTitle] = useState<string>(() => {
    return localStorage.getItem('melayu_security_doc_title') || 'JADWAL SECURITY BULAN AGUSTUS';
  });

  const [dynamicHeaders, setDynamicHeaders] = useState<string[]>(() => {
    const saved = localStorage.getItem('melayu_security_doc_headers');
    return saved ? JSON.parse(saved) : ['NAMA', 'HARI / TANGGAL', 'LOKASI', 'JAM HADIR'];
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('ALL');

  // File Upload & Preview States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewType, setPreviewType] = useState<'roster' | 'matrix'>('roster');
  const [previewRosterData, setPreviewRosterData] = useState<SecurityRosterItem[]>([]);
  const [previewMatrixData, setPreviewMatrixData] = useState<SecurityShift[]>([]);
  const [previewDocTitle, setPreviewDocTitle] = useState<string>('JADWAL SECURITY BULAN AGUSTUS');
  const [previewDocHeaders, setPreviewDocHeaders] = useState<string[]>(['NAMA', 'HARI / TANGGAL', 'LOKASI', 'JAM HADIR']);
  const [excelFileName, setExcelFileName] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Roster Add / Edit Modal
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [editingRosterId, setEditingRosterId] = useState<string | null>(null);
  const [rosterForm, setRosterForm] = useState<Omit<SecurityRosterItem, 'id'>>({
    name: 'ARIEF',
    dateStr: 'SABTU/ 1 Agustus 2026',
    location: 'KANWIL DJPB',
    hours: '06.00/18.00'
  });

  // Matrix Shift Add / Edit Modal
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [editingShiftIndex, setEditingShiftIndex] = useState<number | null>(null);
  const [shiftForm, setShiftForm] = useState<SecurityShift>({
    day: 'Senin',
    shiftMorning: '',
    shiftEvening: '',
    shiftNight: ''
  });

  // Filtered Roster Data
  const safeRoster = securityRoster || [];
  const filteredRoster = safeRoster.filter(item => {
    if (!item) return false;
    const name = item.name || '';
    const dateStr = item.dateStr || '';
    const location = item.location || '';
    const matchName = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      dateStr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchLoc = selectedLocation === 'ALL' || location.toUpperCase() === selectedLocation.toUpperCase();
    const matchDate = selectedDate === 'ALL' || dateStr.toUpperCase().includes(selectedDate.toUpperCase());
    return matchName && matchLoc && matchDate;
  });

  // Unique list of dates for filter
  const uniqueDates = Array.from(new Set(safeRoster.map(r => r?.dateStr || '').filter(Boolean)));
  const uniqueNames = Array.from(new Set(safeRoster.map(r => r?.name || '').filter(Boolean)));

  // KPI Calculations
  const totalGuards = uniqueNames.length || 6;
  const kanwilCount = securityRoster.filter(r => r.location === 'KANWIL DJPB').length;
  const rumdinCount = securityRoster.filter(r => r.location === 'RUMAH DINAS').length;
  const liburCount = securityRoster.filter(r => r.location === 'LIBUR').length;

  // Handle Excel File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        
        // Convert sheet to 2D array of rows
        const rawRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });
        if (!rawRows || rawRows.length < 1) {
          alert('File Excel kosong atau tidak berisi data.');
          return;
        }

        let detectedTitle = 'JADWAL SECURITY';
        let detectedHeaders = ['NAMA', 'HARI / TANGGAL', 'LOKASI', 'JAM HADIR'];
        let headerRowIdx = -1;

        // 1. Scan first 5 rows to detect Title & Header Row
        for (let r = 0; r < Math.min(rawRows.length, 5); r++) {
          const rowArr = rawRows[r] || [];
          const rowStr = rowArr.join(' ').toUpperCase().trim();

          // Title detection
          if ((rowStr.includes('JADWAL') || rowStr.includes('SECURITY') || rowStr.includes('PENJAGAAN') || rowStr.includes('BULAN')) && !rowStr.includes('LOKASI')) {
            const nonNullCells = rowArr.map(c => String(c || '').trim()).filter(Boolean);
            if (nonNullCells.length > 0) {
              detectedTitle = nonNullCells.join(' ');
            }
          }

          // Header row detection
          if (rowStr.includes('NAMA') || rowStr.includes('HARI') || rowStr.includes('TANGGAL') || rowStr.includes('LOKASI')) {
            headerRowIdx = r;
            const headers = rowArr.map(c => String(c || '').trim()).filter(Boolean);
            if (headers.length > 0) {
              detectedHeaders = headers;
            }
            break;
          }
        }

        if (headerRowIdx === -1) {
          headerRowIdx = 0;
        }

        // Check if matrix format (Shift Pagi, Sore, Malam)
        let isMatrixFormat = false;
        const headerCombined = detectedHeaders.join(' ').toLowerCase();
        if (headerCombined.includes('shift pagi') || headerCombined.includes('shift sore') || headerCombined.includes('shift malam')) {
          isMatrixFormat = true;
        }

        if (isMatrixFormat) {
          const parsedShifts: SecurityShift[] = [];
          for (let i = headerRowIdx + 1; i < rawRows.length; i++) {
            const row = rawRows[i];
            if (!row || row.length === 0) continue;
            const day = row[0] ? String(row[0]).trim() : '';
            if (day && day.toLowerCase() !== 'hari') {
              parsedShifts.push({
                day,
                shiftMorning: row[1] ? String(row[1]).trim() : '-',
                shiftEvening: row[2] ? String(row[2]).trim() : '-',
                shiftNight: row[3] ? String(row[3]).trim() : '-'
              });
            }
          }
          setPreviewType('matrix');
          setPreviewMatrixData(parsedShifts);
        } else {
          // Parse Individual Roster with merged-cell date carry forward
          const parsedRoster: SecurityRosterItem[] = [];
          let lastActiveDate = '';

          for (let i = headerRowIdx + 1; i < rawRows.length; i++) {
            const row = rawRows[i];
            if (!row || row.length === 0) continue;

            const nameRaw = row[0] ? String(row[0]).trim() : '';
            let dateRaw = row[1] ? String(row[1]).trim() : '';
            const locRaw = row[2] ? String(row[2]).trim().toUpperCase() : '';
            let hoursRaw = row[3] ? String(row[3]).trim() : '';

            // Skip header repeat lines or empty name
            if (!nameRaw || nameRaw.toUpperCase() === 'NAMA' || nameRaw.toUpperCase().startsWith('JADWAL')) {
              continue;
            }

            // Forward fill date for merged cells
            if (dateRaw) {
              lastActiveDate = dateRaw;
            } else if (lastActiveDate) {
              dateRaw = lastActiveDate;
            }

            // Normalize location
            let location = locRaw;
            if (locRaw.includes('LIBUR') || locRaw.includes('OFF') || locRaw.includes('LEPAS')) {
              location = 'LIBUR';
            } else if (locRaw.includes('RUMAH') || locRaw.includes('RUMDIN')) {
              location = 'RUMAH DINAS';
            } else if (locRaw.includes('KANWIL') || locRaw.includes('DJPB')) {
              location = 'KANWIL DJPB';
            } else if (!location) {
              location = 'KANWIL DJPB';
            }

            if (!hoursRaw) {
              hoursRaw = location === 'LIBUR' ? '-' : '06.00/18.00';
            }

            parsedRoster.push({
              id: `ros-up-${i}-${Date.now()}`,
              name: nameRaw.toUpperCase(),
              dateStr: dateRaw || 'SABTU/ 1 Agustus 2026',
              location: location,
              hours: hoursRaw
            });
          }

          setPreviewType('roster');
          setPreviewRosterData(parsedRoster);
          setPreviewDocTitle(detectedTitle);
          setPreviewDocHeaders(detectedHeaders);
        }

        setExcelFileName(file.name);
        setShowPreviewModal(true);
      } catch (err) {
        console.error('Error reading Excel:', err);
        alert('Gagal membaca file Excel.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Apply Excel Data & Overwrite Previous Excel Completely
  const handleApplyExcel = () => {
    if (previewType === 'roster') {
      if (setSecurityRoster) {
        // OVERWRITE previous roster array completely
        setSecurityRoster(previewRosterData);
        setDocTitle(previewDocTitle);
        setDynamicHeaders(previewDocHeaders);

        // Save title and dynamic headers to localStorage
        localStorage.setItem('melayu_security_doc_title', previewDocTitle);
        localStorage.setItem('melayu_security_doc_headers', JSON.stringify(previewDocHeaders));

        // Reset filter
        setSearchQuery('');
        setSelectedLocation('ALL');
        setSelectedDate('ALL');

        setSuccessNotice(`BERHASIL MENIMPA DATA EXCEL LAMA! Memuat ${previewRosterData.length} baris roster terbaru dari file "${excelFileName}". Tampilan telah disesuaikan.`);
      }
    } else {
      if (setSecurityShifts) {
        setSecurityShifts(previewMatrixData);
        setSuccessNotice(`Berhasil menimpa data matrix shift dengan ${previewMatrixData.length} baris data dari file "${excelFileName}".`);
      }
    }
    setShowPreviewModal(false);
    setTimeout(() => setSuccessNotice(''), 7000);
  };

  // Download Templates
  const handleDownloadRosterTemplate = () => {
    const templateRows = [
      { 'NAMA': 'ARIEF', 'HARI/TANGGAL': 'SABTU.1.8.2026', 'LOKASI': 'KANWIL DJPB', 'JAM HADIR': '06.00/18.00' },
      { 'NAMA': 'ROBBY', 'HARI/TANGGAL': 'SABTU.1.8.2026', 'LOKASI': 'KANWIL DJPB', 'JAM HADIR': '06.00/18.00' },
      { 'NAMA': 'ADITYA', 'HARI/TANGGAL': 'SABTU.1.8.2026', 'LOKASI': 'KANWIL DJPB', 'JAM HADIR': '18.00/06.00' },
      { 'NAMA': 'ERWIN', 'HARI/TANGGAL': 'SABTU.1.8.2026', 'LOKASI': 'KANWIL DJPB', 'JAM HADIR': '18.00/06.00' },
      { 'NAMA': 'RATMANSYAH', 'HARI/TANGGAL': 'SABTU.1.8.2026', 'LOKASI': 'RUMAH DINAS', 'JAM HADIR': '18.00/06.00' },
      { 'NAMA': 'DIAN ARI', 'HARI/TANGGAL': 'SABTU.1.8.2026', 'LOKASI': 'LIBUR', 'JAM HADIR': '-' }
    ];

    const ws = XLSX.utils.json_to_sheet(templateRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Roster Security');
    XLSX.writeFile(wb, 'Template_Jadwal_Security.xlsx');
  };

  // Export Current
  const handleExportRoster = () => {
    const rows = securityRoster.map(r => ({
      [dynamicHeaders[0] || 'NAMA']: r.name,
      [dynamicHeaders[1] || 'HARI/TANGGAL']: r.dateStr,
      [dynamicHeaders[2] || 'LOKASI']: r.location,
      [dynamicHeaders[3] || 'JAM HADIR']: r.hours
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Roster Security');
    XLSX.writeFile(wb, `${docTitle.replace(/\s+/g, '_')}.xlsx`);
  };

  // Selection & Delete Modal state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Bulk / Clear Delete Handlers
  const handleClearAllRoster = () => {
    const total = securityRoster.length;
    if (total === 0) return;
    if (setSecurityRoster) {
      setSecurityRoster([]);
      setSelectedIds([]);
      setSuccessNotice(`Berhasil menghapus SELURUH ${total} data Pengawasan Penjagaan Keamanan.`);
      setTimeout(() => setSuccessNotice(''), 6000);
    }
    setShowDeleteModal(false);
  };

  const handleDeleteFilteredRoster = () => {
    const count = filteredRoster.length;
    if (count === 0) return;
    if (setSecurityRoster) {
      const filteredIds = new Set(filteredRoster.map(r => r.id));
      setSecurityRoster(prev => (prev || []).filter(r => !filteredIds.has(r.id)));
      setSelectedIds([]);
      setSuccessNotice(`Berhasil menghapus ${count} entri pengawasan terfilter.`);
      setTimeout(() => setSuccessNotice(''), 6000);
    }
    setShowDeleteModal(false);
  };

  const handleDeleteSelectedRoster = () => {
    const count = selectedIds.length;
    if (count === 0) return;
    if (setSecurityRoster) {
      const selectedSet = new Set(selectedIds);
      setSecurityRoster(prev => (prev || []).filter(r => !selectedSet.has(r.id)));
      setSelectedIds([]);
      setSuccessNotice(`Berhasil menghapus ${count} entri pengawasan yang dipilih.`);
      setTimeout(() => setSuccessNotice(''), 6000);
    }
    setShowDeleteModal(false);
  };

  const handleDeleteByLocation = (targetLoc: string) => {
    if (setSecurityRoster) {
      let removedCount = 0;
      setSecurityRoster(prev => {
        const current = prev || [];
        const countBefore = current.length;
        const updated = current.filter(r => r.location !== targetLoc);
        removedCount = countBefore - updated.length;
        return updated;
      });
      setSelectedIds([]);
      setSuccessNotice(`Berhasil menghapus data pengawasan lokasi ${targetLoc}.`);
      setTimeout(() => setSuccessNotice(''), 6000);
    }
    setShowDeleteModal(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRoster.length && filteredRoster.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRoster.map(r => r.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  const handleSaveRoster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setSecurityRoster) return;

    if (editingRosterId) {
      setSecurityRoster(securityRoster.map(r => r.id === editingRosterId ? { ...r, ...rosterForm } : r));
    } else {
      const newItem: SecurityRosterItem = {
        id: `ros-${Date.now()}`,
        ...rosterForm
      };
      setSecurityRoster([...securityRoster, newItem]);
    }
    setShowRosterModal(false);
  };

  // Delete Roster Item
  const handleDeleteRoster = (id: string) => {
    if (!setSecurityRoster) return;
    setSecurityRoster(prev => (prev || []).filter(r => r.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
    setSuccessNotice('Berhasil menghapus 1 entri pengawasan.');
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  // Reset Default
  const handleReset = () => {
    if (setSecurityRoster) setSecurityRoster(INITIAL_SECURITY_ROSTER);
    if (setSecurityShifts) setSecurityShifts(INITIAL_SECURITY_SHIFTS);
    setDocTitle('JADWAL SECURITY BULAN AGUSTUS');
    setDynamicHeaders(['NAMA', 'HARI / TANGGAL', 'LOKASI', 'JAM HADIR']);
    localStorage.removeItem('melayu_security_doc_title');
    localStorage.removeItem('melayu_security_doc_headers');
    setSelectedIds([]);
    setSuccessNotice('Jadwal berhasil dikembalikan ke pengaturan default.');
    setTimeout(() => setSuccessNotice(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".xlsx, .xls, .csv" 
        onChange={handleFileUpload} 
      />

      {/* Header Title & Mode Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-djpb-blue p-5 rounded-2xl text-white shadow-md">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
              <Shield className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-display font-bold tracking-wide">
              Pengawasan Penjagaan Keamanan Kanwil DJPb Riau
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Sistem pengawasan piket satpam 24/7, alokasi pos KANWIL DJPB, RUMAH DINAS, serta pemantauan personil libur/piket.
          </p>
        </div>

        {/* View mode toggle pill */}
        <div className="flex items-center space-x-1.5 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setViewMode('roster')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'roster' 
                ? 'bg-djpb-blue text-white shadow-xs' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Format Roster (Tabel Excel)</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              viewMode === 'matrix' 
                ? 'bg-djpb-blue text-white shadow-xs' 
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Format Shift Harian</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successNotice && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-800 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center space-x-2">
            <FileCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
          <button onClick={() => setSuccessNotice('')} className="text-emerald-500 hover:text-emerald-800 p-1 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Personil</span>
            <Users className="w-4 h-4 text-djpb-blue" />
          </div>
          <div className="text-xl font-display font-extrabold text-slate-800">{totalGuards} Personil</div>
          <p className="text-[11px] text-slate-500">Anggota Satpam Aktif</p>
        </div>

        <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-2xs space-y-1 bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Pos Kanwil DJPb</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-display font-extrabold text-blue-900">{kanwilCount} Penjagaan</div>
          <p className="text-[11px] text-blue-600 font-medium">Gedung Utama & Lobi</p>
        </div>

        <div className="bg-white border border-teal-100 rounded-2xl p-4 shadow-2xs space-y-1 bg-gradient-to-br from-white to-teal-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider">Rumah Dinas</span>
            <Home className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-display font-extrabold text-teal-900">{rumdinCount} Penjagaan</div>
          <p className="text-[11px] text-teal-600 font-medium">Patroli Rumah Jabatan</p>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Status Libur / Off</span>
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
          </div>
          <div className="text-xl font-display font-extrabold text-rose-800">{liburCount} Personil Off</div>
          <p className="text-[11px] text-rose-600 font-semibold">Tanda Merah di Roster</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        {/* Controls Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-djpb-blue" />
            <div>
              <h3 className="font-display font-extrabold text-slate-800 text-sm md:text-base tracking-wide uppercase flex items-center space-x-2">
                <span>{viewMode === 'roster' ? docTitle : 'MATRIKS SHIFT KEAMANAN MINGGUAN'}</span>
                {viewMode === 'roster' && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    Dokumen Excel Aktif
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                {viewMode === 'roster' 
                  ? `Menampilkan ${filteredRoster.length} entri roster penjagaan (Dapat ditimpa via Upload Excel)` 
                  : `Menampilkan ${securityShifts.length} baris pembagian shift`}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {viewMode === 'roster' && (
              <button
                onClick={handleExportRoster}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer border border-slate-200"
                title="Download Excel Roster"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Excel</span>
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                  title="Menu Hapus Pengawasan Penjagaan Keamanan Kanwil DJPb Riau"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Menu Hapus</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                  title="Upload File Excel Jadwal Security Terbaru (Akan Menimpa Data Lama)"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Excel Baru</span>
                </button>

                <button
                  onClick={handleDownloadRosterTemplate}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-djpb-blue font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer border border-blue-200"
                  title="Download Format Template Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Template Excel</span>
                </button>

                {viewMode === 'roster' ? (
                  <button
                    onClick={() => {
                      setEditingRosterId(null);
                      setRosterForm({ name: 'ARIEF', dateStr: 'SABTU/ 1 Agustus 2026', location: 'KANWIL DJPB', hours: '06.00/18.00' });
                      setShowRosterModal(true);
                    }}
                    className="px-3 py-1.5 bg-djpb-blue hover:bg-djpb-blue-light text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Duty Roster</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingShiftIndex(null);
                      setShiftForm({ day: 'Senin', shiftMorning: '', shiftEvening: '', shiftNight: '' });
                      setShowShiftModal(true);
                    }}
                    className="px-3 py-1.5 bg-djpb-blue hover:bg-djpb-blue-light text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris Shift</span>
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors cursor-pointer border border-slate-200"
                  title="Reset Ke Default"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters Bar (Only for Roster View) */}
        {viewMode === 'roster' && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama / tanggal..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-djpb-blue"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="ALL">Semua Lokasi</option>
                <option value="KANWIL DJPB">KANWIL DJPB</option>
                <option value="RUMAH DINAS">RUMAH DINAS</option>
                <option value="LIBUR">LIBUR (OFF)</option>
              </select>

              <select
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="ALL">Semua Tanggal</option>
                {uniqueDates.map((d, idx) => (
                  <option key={idx} value={d}>{d}</option>
                ))}
              </select>

              {(searchQuery || selectedLocation !== 'ALL' || selectedDate !== 'ALL') && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedLocation('ALL'); setSelectedDate('ALL'); }}
                  className="text-[11px] text-djpb-blue font-bold hover:underline px-2 cursor-pointer"
                >
                  Reset Filter
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bulk Action Bar (When rows selected) */}
        {isAdmin && selectedIds.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-150">
            <div className="flex items-center space-x-2 text-rose-900 font-bold">
              <Check className="w-4 h-4 text-rose-600" />
              <span>{selectedIds.length} entri pengawasan dipilih</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDeleteSelectedRoster}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center space-x-1 transition-all cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus {selectedIds.length} Terpilih</span>
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
              >
                Batal Pilih
              </button>
            </div>
          </div>
        )}

        {/* ---------------- VIEW MODE 1: INDIVIDUAL ROSTER TABLE (FORMAT SAMA SEPERTI GAMBAR USER) ---------------- */}
        {viewMode === 'roster' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-800 font-extrabold uppercase font-display tracking-wider">
                  {isAdmin && (
                    <th className="py-3 px-3 w-10 text-center border-r border-slate-200">
                      <input
                        type="checkbox"
                        className="rounded text-djpb-blue focus:ring-djpb-blue cursor-pointer"
                        checked={selectedIds.length === filteredRoster.length && filteredRoster.length > 0}
                        onChange={toggleSelectAll}
                        title="Pilih Semua Baris"
                      />
                    </th>
                  )}
                  {dynamicHeaders.map((headerText, idx) => (
                    <th key={idx} className="py-3 px-4 border-r border-slate-200">{headerText}</th>
                  ))}
                  {isAdmin && <th className="py-3 px-4 text-right">AKSI ADMIN</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-mono">
                {filteredRoster.map((item) => {
                  const isLibur = item.location === 'LIBUR';
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id} className={`transition-colors ${isSelected ? 'bg-amber-50/80' : isLibur ? 'bg-rose-50/60' : 'hover:bg-slate-50'}`}>
                      {isAdmin && (
                        <td className="py-3 px-3 text-center border-r border-slate-200">
                          <input
                            type="checkbox"
                            className="rounded text-djpb-blue focus:ring-djpb-blue cursor-pointer"
                            checked={isSelected}
                            onChange={() => toggleSelectRow(item.id)}
                          />
                        </td>
                      )}
                      {/* NAMA CELL: Highlighted RED if LIBUR (Matching user's Excel image!) */}
                      <td className={`py-3 px-4 border-r border-slate-200 font-sans font-extrabold ${
                        isLibur 
                          ? 'bg-red-600 text-white shadow-xs rounded-xs font-black tracking-wide text-center' 
                          : 'text-slate-900 font-bold'
                      }`}>
                        {item.name}
                      </td>

                      {/* HARI / TANGGAL CELL */}
                      <td className="py-3 px-4 border-r border-slate-200 font-sans font-semibold text-slate-700">
                        {item.dateStr}
                      </td>

                      {/* LOKASI CELL */}
                      <td className="py-3 px-4 border-r border-slate-200 font-sans font-bold">
                        {item.location === 'KANWIL DJPB' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-blue-100 text-blue-900 border border-blue-200 text-[11px]">
                            <Shield className="w-3 h-3 text-blue-600" />
                            <span>KANWIL DJPB</span>
                          </span>
                        )}
                        {item.location === 'RUMAH DINAS' && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-teal-100 text-teal-900 border border-teal-200 text-[11px]">
                            <Home className="w-3 h-3 text-teal-600" />
                            <span>RUMAH DINAS</span>
                          </span>
                        )}
                        {isLibur && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-red-100 text-red-800 border border-red-300 text-[11px] font-black">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                            <span>LIBUR (OFF)</span>
                          </span>
                        )}
                      </td>

                      {/* JAM HADIR CELL */}
                      <td className="py-3 px-4 border-r border-slate-200 font-mono font-bold text-slate-800">
                        {item.hours}
                      </td>

                      {/* ADMIN ACTIONS */}
                      {isAdmin && (
                        <td className="py-3 px-4 text-right font-sans">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setEditingRosterId(item.id);
                                setRosterForm({
                                  name: item.name,
                                  dateStr: item.dateStr,
                                  location: item.location,
                                  hours: item.hours
                                });
                                setShowRosterModal(true);
                              }}
                              className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                              title="Edit Roster"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteRoster(item.id)}
                              className="p-1.5 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Roster"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}

                {filteredRoster.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada entri roster yang sesuai dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ---------------- VIEW MODE 2: MATRIX SHIFT TABLE ---------------- */}
        {viewMode === 'matrix' && (
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase font-display">
                  <th className="py-3.5 px-4">Hari</th>
                  <th className="py-3.5 px-4">Shift Pagi (07:00 - 15:00)</th>
                  <th className="py-3.5 px-4">Shift Sore (15:00 - 23:00)</th>
                  <th className="py-3.5 px-4">Shift Malam (23:00 - 07:00)</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Aksi Admin</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {securityShifts.map((shift, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-sans font-bold text-slate-800">{shift.day}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{shift.shiftMorning}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{shift.shiftEvening}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{shift.shiftNight}</td>
                    {isAdmin && (
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => {
                              setEditingShiftIndex(i);
                              setShiftForm({ ...shift });
                              setShowShiftModal(true);
                            }}
                            className="p-1.5 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---------------- MODALS ---------------- */}

      {/* Excel Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-sm md:text-base">
                    Konfirmasi Import Excel Security
                  </h3>
                  <p className="text-xs text-slate-500">File: <span className="font-mono font-bold text-slate-700">{excelFileName}</span></p>
                </div>
              </div>

              <button onClick={() => setShowPreviewModal(false)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-xl cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start space-x-2.5 shadow-2xs">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block text-amber-900">Perhatian: Pengunggahan ini akan MENIMPA data lama!</span>
                <span className="text-amber-800">
                  Seluruh data jadwal Excel sebelumnya akan digantikan secara penuh dengan dokumen baru: <strong className="underline">{previewDocTitle}</strong> ({previewRosterData.length} baris data).
                </span>
              </div>
            </div>

            <div className="overflow-y-auto max-h-60 border border-slate-200 rounded-xl">
              {previewType === 'roster' ? (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold uppercase sticky top-0 text-slate-800 border-b border-slate-200">
                    <tr>
                      {previewDocHeaders.map((headerText, hIdx) => (
                        <th key={hIdx} className="py-2.5 px-3 border-r border-slate-200">{headerText}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {previewRosterData.map((row, idx) => (
                      <tr key={idx} className={row.location === 'LIBUR' ? 'bg-red-50 text-red-700 font-bold' : ''}>
                        <td className={`py-2 px-3 ${row.location === 'LIBUR' ? 'bg-red-600 text-white font-black text-center' : ''}`}>{row.name}</td>
                        <td className="py-2 px-3">{row.dateStr}</td>
                        <td className="py-2 px-3">{row.location}</td>
                        <td className="py-2 px-3">{row.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 font-bold uppercase sticky top-0">
                    <tr>
                      <th className="py-2 px-3">Hari</th>
                      <th className="py-2 px-3">Shift Pagi</th>
                      <th className="py-2 px-3">Shift Sore</th>
                      <th className="py-2 px-3">Shift Malam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {previewMatrixData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3">{row.day}</td>
                        <td className="py-2 px-3">{row.shiftMorning}</td>
                        <td className="py-2 px-3">{row.shiftEvening}</td>
                        <td className="py-2 px-3">{row.shiftNight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleApplyExcel}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center space-x-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Terapkan Jadwal Baru</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roster Add / Edit Modal */}
      {showRosterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveRoster} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-display font-bold text-slate-800">
                {editingRosterId ? 'Edit Duty Roster' : 'Tambah Duty Roster Security'}
              </h3>
              <button type="button" onClick={() => setShowRosterModal(false)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Nama Petugas Security</label>
                <input
                  type="text" required
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold uppercase"
                  value={rosterForm.name}
                  onChange={(e) => setRosterForm({ ...rosterForm, name: e.target.value.toUpperCase() })}
                  placeholder="Contoh: ARIEF"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Hari / Tanggal</label>
                <input
                  type="text" required
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                  value={rosterForm.dateStr}
                  onChange={(e) => setRosterForm({ ...rosterForm, dateStr: e.target.value })}
                  placeholder="Contoh: SABTU.1.8.2026"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Lokasi Penjagaan</label>
                <select
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  value={rosterForm.location}
                  onChange={(e) => {
                    const loc = e.target.value;
                    let hrs = rosterForm.hours;
                    if (loc === 'LIBUR') hrs = '-';
                    else if (hrs === '-') hrs = '06.00/18.00';
                    setRosterForm({ ...rosterForm, location: loc, hours: hrs });
                  }}
                >
                  <option value="KANWIL DJPB">KANWIL DJPB</option>
                  <option value="RUMAH DINAS">RUMAH DINAS</option>
                  <option value="LIBUR">LIBUR (OFF / MERAH)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Jam Hadir</label>
                <input
                  type="text" required
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
                  value={rosterForm.hours}
                  onChange={(e) => setRosterForm({ ...rosterForm, hours: e.target.value })}
                  placeholder="Contoh: 06.00/18.00 atau 18.00/06.00 atau -"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowRosterModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-djpb-blue text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Simpan Duty Roster
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shift Matrix Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!setSecurityShifts) return;
            if (editingShiftIndex !== null) {
              const updated = [...securityShifts];
              updated[editingShiftIndex] = shiftForm;
              setSecurityShifts(updated);
            } else {
              setSecurityShifts([...securityShifts, shiftForm]);
            }
            setShowShiftModal(false);
          }} className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-display font-bold text-slate-800">
                {editingShiftIndex !== null ? 'Edit Baris Shift' : 'Tambah Shift'}
              </h3>
              <button type="button" onClick={() => setShowShiftModal(false)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Hari</label>
                <input
                  type="text" required
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  value={shiftForm.day}
                  onChange={(e) => setShiftForm({ ...shiftForm, day: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Shift Pagi</label>
                <input
                  type="text" required
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  value={shiftForm.shiftMorning}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftMorning: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Shift Sore</label>
                <input
                  type="text" required
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  value={shiftForm.shiftEvening}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftEvening: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Shift Malam</label>
                <input
                  type="text" required
                  className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  value={shiftForm.shiftNight}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftNight: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
              <button type="button" onClick={() => setShowShiftModal(false)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer">
                Batal
              </button>
              <button type="submit" className="px-4 py-2 bg-djpb-blue text-white text-xs font-bold rounded-xl cursor-pointer">
                Simpan Shift
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Hapus Pengawasan Penjagaan Keamanan Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150 border border-slate-100">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-rose-100 rounded-xl text-rose-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-extrabold text-slate-800">
                    Menu Hapus Pengawasan Penjagaan Keamanan
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Kanwil DJPb Provinsi Riau ({securityRoster.length} total entri aktif)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-xl cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Pilih metode penghapusan data jadwal security pengawasan penjagaan keamanan:
              </p>

              {/* Option 1: Delete Selected Rows (if any rows checked) */}
              {selectedIds.length > 0 && (
                <button
                  onClick={handleDeleteSelectedRoster}
                  className="w-full p-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-left transition-all cursor-pointer shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-xs uppercase flex items-center space-x-2 text-white">
                      <Check className="w-4 h-4 text-rose-200" />
                      <span>HAPUS {selectedIds.length} DATA TERPILIH (CENTANG AKTIF)</span>
                    </div>
                    <p className="text-[11px] text-rose-100/90 mt-0.5 ml-6">
                      Eksekusi hapus untuk {selectedIds.length} baris data pengawasan yang sedang centang dipilih.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-white text-rose-700 font-extrabold text-[11px] rounded-lg shadow-2xs">
                    Eksekusi Hapus ({selectedIds.length})
                  </span>
                </button>
              )}

              {/* Option 2: Delete Filtered / Currently Displayed Rows */}
              {filteredRoster.length > 0 && (
                <button
                  onClick={handleDeleteFilteredRoster}
                  className="w-full p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-xs text-amber-900 flex items-center space-x-1.5">
                      <Filter className="w-4 h-4 text-amber-600" />
                      <span>Hapus Data Tampil Saat Ini ({filteredRoster.length} Baris)</span>
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5 ml-5">
                      Menghapus {filteredRoster.length} baris data pengawasan yang sedang tampak pada layar/tabel.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-600 text-white font-bold text-[10px] rounded-lg shadow-2xs">
                    Hapus Tampil ({filteredRoster.length})
                  </span>
                </button>
              )}

              {/* Option 3: Delete ALL Data */}
              <button
                onClick={handleClearAllRoster}
                className="w-full p-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="font-extrabold text-xs text-rose-800 group-hover:text-rose-900 flex items-center space-x-1.5">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    <span>Hapus SELURUH Total Data ({securityRoster.length} Baris)</span>
                  </div>
                  <p className="text-[11px] text-rose-700/80 mt-0.5 ml-5">
                    Menghapus seluruh jadwal roster security tanpa sisa (kosongkan tabel).
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-rose-600 text-white font-bold text-[10px] rounded-lg shadow-2xs">
                  Kosongkan Total ({securityRoster.length})
                </span>
              </button>

              {/* Option 3: Delete By Location */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  3. Hapus Berdasarkan Lokasi Penjagaan
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleDeleteByLocation('KANWIL DJPB')}
                    className="p-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg text-center text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    KANWIL DJPB
                  </button>
                  <button
                    onClick={() => handleDeleteByLocation('RUMAH DINAS')}
                    className="p-2 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-center text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    RUMAH DINAS
                  </button>
                  <button
                    onClick={() => handleDeleteByLocation('LIBUR')}
                    className="p-2 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-300 rounded-lg text-center text-xs font-bold text-red-700 transition-colors cursor-pointer shadow-2xs"
                  >
                    LIBUR (OFF)
                  </button>
                </div>
              </div>

              {/* Option 4: Reset Default */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-800 block">4. Kembalikan ke Data Standar Default</span>
                  <span className="text-[11px] text-slate-500 block">Mengatur ulang jadwal ke data awal sistem.</span>
                </div>
                <button
                  onClick={() => { setShowDeleteModal(false); handleReset(); }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-lg cursor-pointer flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Tutup Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
