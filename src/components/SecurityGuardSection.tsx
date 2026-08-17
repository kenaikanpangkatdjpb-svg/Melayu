import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  Shield, Plus, Trash2, Edit3, Check, X,
  FileSpreadsheet, Upload, Download, RotateCcw, AlertCircle, FileCheck,
  Search, Users, Home, Calendar, Clock, Sparkles, Filter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { SecurityShift, SecurityRosterItem } from '../types';
import { INITIAL_SECURITY_SHIFTS, INITIAL_SECURITY_ROSTER } from '../mockData';
import { saveFirestoreCollection } from '../lib/firebase';
import { safeLocalStorageSet } from '../lib/storage';

const ID_DAYS_UPPER = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
const ID_MONTHS_TITLE = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function getNextDayDateStr(dateStr: string): string {
  if (!dateStr) return 'MINGGU/ 2 Agustus 2026';
  const trimmed = dateStr.trim();
  const isAllUpper = trimmed === trimmed.toUpperCase();

  let dayNum: number | null = null;
  let monthIdx: number | null = null;
  let yearNum: number | null = null;

  // Regex 1: Word month e.g. "SABTU/ 1 Agustus 2026" or "SABTU, 1 AGUSTUS 2026" or "1 Agustus 2026"
  const wordMatch = trimmed.match(/(\d{1,2})[\s\/\.\-]+([a-zA-Z]{3,10})[\s\/\.\-]+(\d{2,4})/);
  if (wordMatch) {
    dayNum = parseInt(wordMatch[1], 10);
    const mStr = wordMatch[2].toLowerCase();
    let yVal = parseInt(wordMatch[3], 10);
    if (yVal < 100) yVal += 2000;
    yearNum = yVal;

    const findM = ID_MONTHS_TITLE.findIndex((m) =>
      m.toLowerCase().startsWith(mStr) || mStr.startsWith(m.toLowerCase().substring(0, 3))
    );
    if (findM !== -1) {
      monthIdx = findM;
    }
  }

  // Regex 2: Numbers e.g. "1.8.2026" or "01/08/2026" or "2026-08-01"
  if (dayNum === null || monthIdx === null || yearNum === null) {
    const numMatch = trimmed.match(/(\d{1,4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,4})/);
    if (numMatch) {
      const p1 = parseInt(numMatch[1], 10);
      const p2 = parseInt(numMatch[2], 10);
      const p3 = parseInt(numMatch[3], 10);

      if (p1 > 1000) { // YYYY-MM-DD
        yearNum = p1;
        monthIdx = p2 - 1;
        dayNum = p3;
      } else if (p3 > 1000) { // DD-MM-YYYY
        dayNum = p1;
        monthIdx = p2 - 1;
        yearNum = p3;
      } else if (p3 < 100) { // DD-MM-YY
        dayNum = p1;
        monthIdx = p2 - 1;
        yearNum = 2000 + p3;
      }
    }
  }

  if (dayNum !== null && monthIdx !== null && monthIdx >= 0 && monthIdx <= 11 && yearNum !== null) {
    const dObj = new Date(yearNum, monthIdx, dayNum + 1);
    const newDayNum = dObj.getDate();
    const newMonthIdx = dObj.getMonth();
    const newYear = dObj.getFullYear();
    const newDayName = ID_DAYS_UPPER[dObj.getDay()];
    const rawMonthName = ID_MONTHS_TITLE[newMonthIdx];
    const newMonthName = isAllUpper ? rawMonthName.toUpperCase() : rawMonthName;

    if (trimmed.includes('/')) {
      return `${newDayName}/ ${newDayNum} ${newMonthName} ${newYear}`;
    } else if (trimmed.includes(',')) {
      return `${newDayName}, ${newDayNum} ${newMonthName} ${newYear}`;
    } else if (trimmed.includes('.')) {
      return `${newDayName}.${newDayNum}.${newMonthIdx + 1}.${newYear}`;
    } else {
      return `${newDayName}/ ${newDayNum} ${newMonthName} ${newYear}`;
    }
  }

  return dateStr;
}

// Extract normalized YYYY-MM-DD or unique day key from any date string variations
export function normalizeDateKey(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim().toLowerCase();

  // Regex 1: Word month e.g. "KAMIS/ 6 Agustus 2026", "Kamiw/6 Asgutsu 2026", "JUMAT/ 14 Agustus 2026", "SABTU/ 22 Agustus 2026"
  const wordMatch = trimmed.match(/(\d{1,2})[\s\/\.\,\-]+([a-zA-Z]{3,12})[\s\/\.\,\-]?(\d{2,4})?/);
  if (wordMatch) {
    const day = parseInt(wordMatch[1], 10);
    const mStr = wordMatch[2].toLowerCase();
    let month = 8; // Default August
    if (mStr.startsWith('jan')) month = 1;
    else if (mStr.startsWith('feb')) month = 2;
    else if (mStr.startsWith('mar')) month = 3;
    else if (mStr.startsWith('apr')) month = 4;
    else if (mStr.startsWith('mei') || mStr.startsWith('may')) month = 5;
    else if (mStr.startsWith('jun')) month = 6;
    else if (mStr.startsWith('jul')) month = 7;
    else if (mStr.startsWith('agu') || mStr.startsWith('ags') || mStr.startsWith('aug') || mStr.startsWith('asg')) month = 8;
    else if (mStr.startsWith('sep')) month = 9;
    else if (mStr.startsWith('okt') || mStr.startsWith('oct')) month = 10;
    else if (mStr.startsWith('nov')) month = 11;
    else if (mStr.startsWith('des') || mStr.startsWith('dec')) month = 12;

    let year = 2026;
    if (wordMatch[3]) {
      const y = parseInt(wordMatch[3], 10);
      year = y < 100 ? 2000 + y : y;
    }
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Regex 2: Numbers only e.g. "6/8/2026", "06-08-2026", "2026-08-06"
  const numMatch = trimmed.match(/(\d{1,4})[\/\.\-](\d{1,2})[\/\.\-](\d{1,4})/);
  if (numMatch) {
    const p1 = parseInt(numMatch[1], 10);
    const p2 = parseInt(numMatch[2], 10);
    const p3 = parseInt(numMatch[3], 10);
    if (p1 > 1000) {
      return `${p1}-${String(p2).padStart(2, '0')}-${String(p3).padStart(2, '0')}`;
    } else {
      const y = p3 < 100 ? 2000 + p3 : p3;
      return `${y}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
    }
  }

  // Fallback: extract single number as August day
  const dayOnly = trimmed.match(/\b([1-9]|[12]\d|3[01])\b/);
  if (dayOnly) {
    const day = parseInt(dayOnly[1], 10);
    return `2026-08-${String(day).padStart(2, '0')}`;
  }

  return trimmed.replace(/[^a-z0-9]/g, '');
}

// Normalize guard names to canonical official satpam name
export function normalizeGuardName(name: string): string {
  if (!name) return '';
  let clean = name.trim().toUpperCase().replace(/\s+/g, ' ');
  // Remove parenthesis notes
  clean = clean.replace(/\([^)]*\)/g, '').trim();

  if (clean === 'DIAN' || clean === 'DIAN ARIF' || clean === 'DIAN A' || clean === 'DIANARI') return 'DIAN ARI';
  if (clean === 'RATMAN' || clean === 'M. RATMANSYAH' || clean === 'M.RATMANSYAH') return 'RATMANSYAH';
  if (clean === 'M. ARIEF' || clean === 'M.ARIEF' || clean === 'ARIF' || clean === 'M ARIEF') return 'ARIEF';
  if (clean === 'ADIT' || clean === 'ADITYA P' || clean === 'ADITIYA') return 'ADITYA';
  if (clean === 'ROBI' || clean === 'ROBBI') return 'ROBBY';
  if (clean === 'ERWIN S' || clean === 'M. ERWIN') return 'ERWIN';
  return clean;
}

export const OFFICIAL_SECURITY_GUARDS = ['ARIEF', 'ROBBY', 'ADITYA', 'ERWIN', 'RATMANSYAH', 'DIAN ARI'];

// Standard display format for a date string
export function formatStandardDateStr(dateStr: string): string {
  if (!dateStr) return 'SABTU/ 1 Agustus 2026';
  const trimmed = dateStr.trim();
  const dateKey = normalizeDateKey(trimmed);
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = parseInt(match[3], 10);
    const dObj = new Date(year, month, day);
    const dayName = ID_DAYS_UPPER[dObj.getDay()];
    const monthName = ID_MONTHS_TITLE[month] || 'Agustus';
    return `${dayName}/ ${day} ${monthName} ${year}`;
  }
  return trimmed;
}

// Deduplicate roster entries: ensures no guard is duplicated on the same date regardless of string formatting
export function deduplicateRoster(roster: SecurityRosterItem[]): SecurityRosterItem[] {
  if (!roster || roster.length === 0) return [];
  const seenKeys = new Set<string>();
  const cleanList: SecurityRosterItem[] = [];

  for (const rawItem of roster) {
    if (!rawItem) continue;
    const rawName = (rawItem.name || '').trim();
    const rawDate = (rawItem.dateStr || '').trim();
    if (!rawName || !rawDate) continue;

    const normName = normalizeGuardName(rawName);
    const dateKey = normalizeDateKey(rawDate);
    if (!normName || !dateKey) continue;

    // Normalization key: dateKey + normName (e.g. "2026-08-06___RATMANSYAH")
    const key = `${dateKey}___${normName}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      const stdDateStr = formatStandardDateStr(rawDate);
      cleanList.push({
        ...rawItem,
        name: normName,
        dateStr: stdDateStr,
        location: (rawItem.location || 'KANWIL DJPB').trim().toUpperCase(),
        hours: (rawItem.hours || (rawItem.location === 'LIBUR' ? '-' : '06.00/18.00')).trim()
      });
    }
  }

  return cleanList.map((item, idx) => ({
    ...item,
    orderIndex: typeof item.orderIndex === 'number' ? item.orderIndex : idx
  }));
}

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
  // View mode: 'roster' (Individual Guard Table) or 'matrix' (3-Shift View)
  const [viewMode, setViewMode] = useState<'roster' | 'matrix'>('roster');

  // Document Title & Dynamic Headers State (persisted to localStorage)
  const [docTitle, setDocTitle] = useState<string>(() => {
    return localStorage.getItem('melayu_security_doc_title') || 'JADWAL SECURITY BULAN AGUSTUS';
  });

  const [dynamicHeaders, setDynamicHeaders] = useState<string[]>(() => {
    const saved = localStorage.getItem('melayu_security_doc_headers');
    return saved ? JSON.parse(saved) : ['NO.', 'NAMA PETUGAS', 'HARI / TANGGAL', 'LOKASI / POS', 'JAM HADIR'];
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
  const [previewDocTitle, setPreviewDocTitle] = useState<string>('JADWAL SECURITY');
  const [previewDocHeaders, setPreviewDocHeaders] = useState<string[]>(['NO.', 'NAMA PETUGAS', 'HARI / TANGGAL', 'LOKASI / POS', 'JAM HADIR']);
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

  // Count duplicate items in current raw securityRoster
  const duplicateCount = useMemo(() => {
    const list = securityRoster || [];
    const seen = new Set<string>();
    let dupes = 0;
    for (const item of list) {
      if (!item) continue;
      const rawName = (item.name || '').trim();
      const rawDate = (item.dateStr || '').trim();
      if (!rawName || !rawDate) continue;
      const normName = normalizeGuardName(rawName);
      const dateKey = normalizeDateKey(rawDate);
      if (!normName || !dateKey) continue;
      const key = `${dateKey}___${normName}`;
      if (seen.has(key)) {
        dupes++;
      } else {
        seen.add(key);
      }
    }
    return dupes;
  }, [securityRoster]);

  // Automatically cleanse duplicates if detected on load or sync
  useEffect(() => {
    if (securityRoster && securityRoster.length > 0 && duplicateCount > 0) {
      const cleaned = deduplicateRoster(securityRoster);
      if (cleaned.length !== securityRoster.length && setSecurityRoster) {
        setSecurityRoster(cleaned);
        safeLocalStorageSet('melayu_security_roster', JSON.stringify(cleaned));
        saveFirestoreCollection('security_roster', cleaned);
      }
    }
  }, [securityRoster, duplicateCount, setSecurityRoster]);

  // Clean and deduplicate roster handler
  const handleCleanDuplicates = () => {
    if (!setSecurityRoster) return;
    const originalCount = (securityRoster || []).length;
    const cleaned = deduplicateRoster(securityRoster || []);
    const removed = originalCount - cleaned.length;
    setSecurityRoster(cleaned);
    safeLocalStorageSet('melayu_security_roster', JSON.stringify(cleaned));
    saveFirestoreCollection('security_roster', cleaned);
    setSelectedIds([]);
    if (removed > 0) {
      setSuccessNotice(`BERHASIL DIBERSIHKAN! Sebanyak ${removed} data duplikasi nama petugas telah dihapus.`);
    } else {
      setSuccessNotice(`Data roster pengawasan penjagaan keamanan sudah bersih, tidak ada duplikasi nama.`);
    }
    setTimeout(() => setSuccessNotice(''), 6000);
  };

  // Filtered Roster Data (Preserving exact sequential array order, deduplicated)
  const safeRoster = useMemo(() => {
    const list = securityRoster || [];
    const deduplicated = deduplicateRoster(list);
    return [...deduplicated].sort((a, b) => {
      const idxA = typeof a.orderIndex === 'number' ? a.orderIndex : 0;
      const idxB = typeof b.orderIndex === 'number' ? b.orderIndex : 0;
      return idxA - idxB;
    });
  }, [securityRoster]);

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

  // Calculate rowSpans for contiguous identical dateStr rows in filteredRoster
  const rowSpanMap = useMemo(() => {
    const map: { [index: number]: number } = {};
    if (!filteredRoster || filteredRoster.length === 0) return map;

    let i = 0;
    while (i < filteredRoster.length) {
      const currentDate = filteredRoster[i]?.dateStr?.trim();
      let count = 1;
      let j = i + 1;
      while (j < filteredRoster.length && (filteredRoster[j]?.dateStr?.trim() === currentDate)) {
        count++;
        j++;
      }
      map[i] = count;
      i = j;
    }
    return map;
  }, [filteredRoster]);

  // Calculate rowSpans for preview modal
  const previewRowSpanMap = useMemo(() => {
    const map: { [index: number]: number } = {};
    if (!previewRosterData || previewRosterData.length === 0) return map;

    let i = 0;
    while (i < previewRosterData.length) {
      const currentDate = previewRosterData[i]?.dateStr?.trim();
      let count = 1;
      let j = i + 1;
      while (j < previewRosterData.length && (previewRosterData[j]?.dateStr?.trim() === currentDate)) {
        count++;
        j++;
      }
      map[i] = count;
      i = j;
    }
    return map;
  }, [previewRosterData]);

  // Unique list of dates for filter
  const uniqueDates = Array.from(new Set(safeRoster.map(r => r?.dateStr || '').filter(Boolean)));
  const uniqueNames = Array.from(new Set(safeRoster.map(r => r?.name || '').filter(Boolean)));

  // KPI Calculations
  const totalGuards = uniqueNames.length || 6;
  const kanwilCount = safeRoster.filter(r => r.location === 'KANWIL DJPB').length;
  const rumdinCount = safeRoster.filter(r => r.location === 'RUMAH DINAS').length;
  const liburCount = safeRoster.filter(r => r.location === 'LIBUR').length;

  // Handle Excel File Upload with Intelligent Column Detection
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
        
        // Convert sheet to 2D array of rows (formatted strings)
        const rawRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '', raw: false });
        if (!rawRows || rawRows.length < 1) {
          alert('File Excel kosong atau tidak berisi data.');
          return;
        }

        let detectedTitle = 'JADWAL PENGAWASAN PENJAGAAN KEAMANAN';
        let headerRowIdx = -1;
        let bestScore = 0;

        // 1. Scan first 15 rows to detect Title & Header Row
        for (let r = 0; r < Math.min(rawRows.length, 15); r++) {
          const rowArr = rawRows[r] || [];
          const rowStr = rowArr.map(c => String(c || '').trim()).join(' ').toUpperCase();

          // Title detection
          if ((rowStr.includes('JADWAL') || rowStr.includes('SECURITY') || rowStr.includes('PENJAGAAN') || rowStr.includes('SATPAM') || rowStr.includes('KEAMANAN')) && !rowStr.includes('LOKASI') && !rowStr.includes('HADIR')) {
            const nonNullCells = rowArr.map(c => String(c || '').trim()).filter(Boolean);
            if (nonNullCells.length > 0) {
              detectedTitle = nonNullCells.join(' ');
            }
          }

          // Header scoring
          let score = 0;
          rowArr.forEach(c => {
            const val = String(c || '').trim().toUpperCase();
            if (val.includes('NAMA') || val.includes('PETUGAS') || val.includes('PERSONIL') || val.includes('SATPAM') || val.includes('SECURITY')) score += 3;
            if (val.includes('HARI') || val.includes('TANGGAL') || val.includes('TGL') || val.includes('DATE')) score += 3;
            if (val.includes('LOKASI') || val.includes('POS') || val.includes('PENEMPATAN') || val.includes('TEMPAT')) score += 2;
            if (val.includes('JAM') || val.includes('WAKTU') || val.includes('PUKUL') || val.includes('SHIFT')) score += 2;
            if (val === 'NO' || val === 'NO.' || val === 'NOMOR') score += 1;
          });

          if (score > bestScore) {
            bestScore = score;
            headerRowIdx = r;
          }
        }

        if (headerRowIdx === -1 || bestScore < 2) {
          headerRowIdx = 0;
        }

        const headerRow = (rawRows[headerRowIdx] || []).map(c => String(c || '').trim());

        // Check if matrix format (Shift Pagi, Shift Sore, Shift Malam)
        const headerCombined = headerRow.join(' ').toLowerCase();
        const isMatrixFormat = (headerCombined.includes('shift pagi') || headerCombined.includes('shift sore') || headerCombined.includes('shift malam')) && headerCombined.includes('hari');

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
          // Identify columns dynamically
          let colNo = -1;
          let colName = -1;
          let colDate = -1;
          let colLoc = -1;
          let colHours = -1;

          headerRow.forEach((h, colIdx) => {
            const hUp = h.toUpperCase();
            if (colNo === -1 && (hUp === 'NO' || hUp === 'NO.' || hUp === 'NOMOR' || hUp.startsWith('NO '))) {
              colNo = colIdx;
            } else if (colName === -1 && (hUp.includes('NAMA') || hUp.includes('PETUGAS') || hUp.includes('PERSONIL') || hUp.includes('SATPAM') || hUp.includes('SECURITY') || hUp.includes('ANGGOTA'))) {
              colName = colIdx;
            } else if (colDate === -1 && (hUp.includes('HARI') || hUp.includes('TANGGAL') || hUp.includes('TGL') || hUp.includes('DATE') || hUp.includes('WAKTU/TGL'))) {
              colDate = colIdx;
            } else if (colLoc === -1 && (hUp.includes('LOKASI') || hUp.includes('POS') || hUp.includes('PENEMPATAN') || hUp.includes('TEMPAT') || hUp.includes('STATUS'))) {
              colLoc = colIdx;
            } else if (colHours === -1 && (hUp.includes('JAM') || hUp.includes('PUKUL') || hUp.includes('WAKTU') || hUp.includes('SHIFT') || hUp.includes('HOURS'))) {
              colHours = colIdx;
            }
          });

          // Fallback heuristic if headers are not standard
          if (colName === -1 || colDate === -1 || colLoc === -1) {
            const sampleRows = rawRows.slice(headerRowIdx + 1, headerRowIdx + 10).filter(r => r && r.length > 0);
            const numCols = Math.max(...sampleRows.map(r => r.length), 4);
            
            for (let c = 0; c < numCols; c++) {
              if (c === colNo || c === colName || c === colDate || c === colLoc || c === colHours) continue;
              const values = sampleRows.map(r => String(r[c] || '').trim()).filter(Boolean);
              
              // Check if date column (contains day names, month names, slashes or dots)
              const hasDateIndicators = values.some(v => {
                const up = v.toUpperCase();
                return /SENIN|SELASA|RABU|KAMIS|JUMAT|SABTU|MINGGU|JAN|FEB|MAR|APR|MEI|JUN|JUL|AGU|SEP|OKT|NOV|DES|\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}/.test(up);
              });
              if (colDate === -1 && hasDateIndicators) {
                colDate = c;
                continue;
              }

              // Check if location column (contains KANWIL, RUMAH, LIBUR, POS, OFF)
              const hasLocIndicators = values.some(v => {
                const up = v.toUpperCase();
                return up.includes('KANWIL') || up.includes('RUMAH') || up.includes('LIBUR') || up.includes('POS') || up.includes('OFF') || up.includes('DINAS');
              });
              if (colLoc === -1 && hasLocIndicators) {
                colLoc = c;
                continue;
              }

              // Check if hours column (contains numbers like 06.00, 18.00, 07:00, 19:00, or -)
              const hasHoursIndicators = values.some(v => {
                return /\d{1,2}[\.:]\d{2}/.test(v) || v === '-';
              });
              if (colHours === -1 && hasHoursIndicators) {
                colHours = c;
                continue;
              }
            }

            // Assign name to first remaining text column
            if (colName === -1) {
              for (let c = 0; c < numCols; c++) {
                if (c !== colNo && c !== colDate && c !== colLoc && c !== colHours) {
                  colName = c;
                  break;
                }
              }
            }
          }

          // Defaults if still not matched
          if (colName === -1) colName = colNo === 0 ? 1 : 0;
          if (colDate === -1) colDate = colName === 0 ? 1 : (colName === 1 && colNo === 0 ? 2 : 1);
          if (colLoc === -1) colLoc = 2;
          if (colHours === -1) colHours = 3;

          // Parse rows
          const parsedRoster: SecurityRosterItem[] = [];
          let lastActiveDate = '';
          let rowOrder = 0;

          for (let i = headerRowIdx + 1; i < rawRows.length; i++) {
            const row = rawRows[i];
            if (!row || row.length === 0) continue;

            let nameRaw = row[colName] !== undefined ? String(row[colName]).trim() : '';
            let dateRaw = row[colDate] !== undefined ? String(row[colDate]).trim() : '';
            let locRaw = row[colLoc] !== undefined ? String(row[colLoc]).trim() : '';
            let hoursRaw = row[colHours] !== undefined ? String(row[colHours]).trim() : '';

            // Clean name of leading numbers (e.g. "1. ARIEF" -> "ARIEF")
            nameRaw = nameRaw.replace(/^\d+[\.\-\)]\s*/, '').trim();

            // Skip empty/header/summary rows
            const upName = nameRaw.toUpperCase();
            if (!nameRaw || upName === 'NAMA' || upName === 'NAMA PETUGAS' || upName.startsWith('JADWAL') || upName.startsWith('TOTAL') || upName.startsWith('MENGETAHUI') || upName.startsWith('CATATAN')) {
              continue;
            }

            // Forward fill date for merged cells
            if (dateRaw) {
              lastActiveDate = dateRaw;
            } else if (lastActiveDate) {
              dateRaw = lastActiveDate;
            }

            // Normalize location text
            let location = locRaw.toUpperCase();
            if (location.includes('LIBUR') || location.includes('OFF') || location.includes('LEPAS') || location === 'L') {
              location = 'LIBUR';
            } else if (location.includes('RUMAH') || location.includes('RUMDIN') || location.includes('JABATAN')) {
              location = 'RUMAH DINAS';
            } else if (location.includes('KANWIL') || location.includes('DJPB') || location.includes('GEDUNG')) {
              location = 'KANWIL DJPB';
            } else if (!location) {
              location = 'KANWIL DJPB';
            }

            // Normalize hours
            if (!hoursRaw) {
              hoursRaw = location === 'LIBUR' ? '-' : '06.00/18.00';
            }

            parsedRoster.push({
              id: `ros-up-${rowOrder}-${Date.now()}`,
              orderIndex: rowOrder,
              name: nameRaw.toUpperCase(),
              dateStr: dateRaw || 'SABTU/ 1 Agustus 2026',
              location: location,
              hours: hoursRaw
            });
            rowOrder++;
          }

          // Cleanse and deduplicate any duplicate rows or double assignments on same date
          const cleanParsedRoster = deduplicateRoster(parsedRoster);

          setPreviewType('roster');
          setPreviewRosterData(cleanParsedRoster);
          setPreviewDocTitle(detectedTitle);
          setPreviewDocHeaders(['NO.', 'NAMA PETUGAS', 'HARI / TANGGAL', 'LOKASI / POS', 'JAM HADIR']);
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
        const cleanData = deduplicateRoster(previewRosterData);
        // OVERWRITE previous roster array completely
        setSecurityRoster(cleanData);
        setDocTitle(previewDocTitle);
        setDynamicHeaders(previewDocHeaders);

        // Save title, headers and data to localStorage
        safeLocalStorageSet('melayu_security_doc_title', previewDocTitle);
        safeLocalStorageSet('melayu_security_doc_headers', JSON.stringify(previewDocHeaders));
        safeLocalStorageSet('melayu_security_roster', JSON.stringify(cleanData));

        // Save to Firestore for permanent persistence
        saveFirestoreCollection('security_roster', cleanData);

        // Reset filter
        setSearchQuery('');
        setSelectedLocation('ALL');
        setSelectedDate('ALL');

        setSuccessNotice(`BERHASIL MEMUAT DATA EXCEL! Menampilkan ${cleanData.length} baris roster penjagaan dari file "${excelFileName}" secara presisi (bebas duplikasi).`);
      }
    } else {
      if (setSecurityShifts) {
        setSecurityShifts(previewMatrixData);
        saveFirestoreCollection('security_shifts', previewMatrixData);
        safeLocalStorageSet('melayu_security_shifts', JSON.stringify(previewMatrixData));
        setSuccessNotice(`Berhasil menimpa data matrix shift dengan ${previewMatrixData.length} baris data dari file "${excelFileName}".`);
      }
    }
    setShowPreviewModal(false);
    setTimeout(() => setSuccessNotice(''), 7000);
  };

  // Download Templates
  const handleDownloadRosterTemplate = () => {
    const templateRows = (securityRoster.length > 0 ? securityRoster : INITIAL_SECURITY_ROSTER).map((r, idx) => ({
      'NO': idx + 1,
      'NAMA PETUGAS': r.name,
      'HARI / TANGGAL': r.dateStr,
      'LOKASI / POS': r.location,
      'JAM HADIR': r.hours
    }));

    const ws = XLSX.utils.json_to_sheet(templateRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Roster Security');
    XLSX.writeFile(wb, 'Template_Jadwal_Security.xlsx');
  };

  // Export Current
  const handleExportRoster = () => {
    const rows = securityRoster.map((r, idx) => ({
      'NO': idx + 1,
      'NAMA PETUGAS': r.name,
      'HARI / TANGGAL': r.dateStr,
      'LOKASI / POS': r.location,
      'JAM HADIR': r.hours
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
      safeLocalStorageSet('melayu_security_roster', JSON.stringify([]));
      saveFirestoreCollection('security_roster', []);
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
      const updated = (securityRoster || []).filter(r => !filteredIds.has(r.id));
      setSecurityRoster(updated);
      setSelectedIds([]);
      safeLocalStorageSet('melayu_security_roster', JSON.stringify(updated));
      saveFirestoreCollection('security_roster', updated);
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
      const updated = (securityRoster || []).filter(r => !selectedSet.has(r.id));
      setSecurityRoster(updated);
      setSelectedIds([]);
      safeLocalStorageSet('melayu_security_roster', JSON.stringify(updated));
      saveFirestoreCollection('security_roster', updated);
      setSuccessNotice(`Berhasil menghapus ${count} entri pengawasan yang dipilih.`);
      setTimeout(() => setSuccessNotice(''), 6000);
    }
    setShowDeleteModal(false);
  };

  const handleDeleteByLocation = (targetLoc: string) => {
    if (setSecurityRoster) {
      const updated = (securityRoster || []).filter(r => r.location !== targetLoc);
      setSecurityRoster(updated);
      setSelectedIds([]);
      safeLocalStorageSet('melayu_security_roster', JSON.stringify(updated));
      saveFirestoreCollection('security_roster', updated);
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

    const trimmedName = (rosterForm.name || '').trim().toUpperCase();
    const trimmedDate = (rosterForm.dateStr || '').trim();
    const trimmedLoc = (rosterForm.location || 'KANWIL DJPB').trim();
    const trimmedHours = (rosterForm.hours || (trimmedLoc === 'LIBUR' ? '-' : '06.00/18.00')).trim();

    let updated: SecurityRosterItem[] = [];
    if (editingRosterId) {
      updated = securityRoster.map(r => r.id === editingRosterId ? { 
        ...r, 
        name: trimmedName, 
        dateStr: trimmedDate, 
        location: trimmedLoc, 
        hours: trimmedHours 
      } : r);
    } else {
      // Check if this guard is already assigned on the same date to prevent duplication
      const existingIdx = securityRoster.findIndex(
        r => r.name.trim().toUpperCase() === trimmedName && r.dateStr.trim().toLowerCase() === trimmedDate.toLowerCase()
      );

      if (existingIdx !== -1) {
        // Update existing entry instead of creating a duplicate
        updated = securityRoster.map((r, idx) => idx === existingIdx ? {
          ...r,
          name: trimmedName,
          dateStr: trimmedDate,
          location: trimmedLoc,
          hours: trimmedHours
        } : r);
        setSuccessNotice(`Jadwal petugas ${trimmedName} pada ${trimmedDate} diperbarui (duplikasi dicegah).`);
      } else {
        const newItem: SecurityRosterItem = {
          id: `ros-${Date.now()}`,
          orderIndex: securityRoster.length,
          name: trimmedName,
          dateStr: trimmedDate,
          location: trimmedLoc,
          hours: trimmedHours
        };
        updated = [...securityRoster, newItem];
      }
    }

    const cleanUpdated = deduplicateRoster(updated);
    setSecurityRoster(cleanUpdated);
    safeLocalStorageSet('melayu_security_roster', JSON.stringify(cleanUpdated));
    saveFirestoreCollection('security_roster', cleanUpdated);
    setShowRosterModal(false);
    setTimeout(() => setSuccessNotice(''), 5000);
  };

  // Delete Roster Item
  const handleDeleteRoster = (id: string) => {
    if (!setSecurityRoster) return;
    const updated = (securityRoster || []).filter(r => r.id !== id);
    setSecurityRoster(updated);
    setSelectedIds(prev => prev.filter(i => i !== id));
    safeLocalStorageSet('melayu_security_roster', JSON.stringify(updated));
    saveFirestoreCollection('security_roster', updated);
    setSuccessNotice('Berhasil menghapus 1 entri pengawasan.');
    setTimeout(() => setSuccessNotice(''), 4000);
  };

  // Reset Default
  const handleReset = () => {
    if (setSecurityRoster) {
      setSecurityRoster(INITIAL_SECURITY_ROSTER);
      safeLocalStorageSet('melayu_security_roster', JSON.stringify(INITIAL_SECURITY_ROSTER));
      saveFirestoreCollection('security_roster', INITIAL_SECURITY_ROSTER);
    }
    if (setSecurityShifts) {
      setSecurityShifts(INITIAL_SECURITY_SHIFTS);
      safeLocalStorageSet('melayu_security_shifts', JSON.stringify(INITIAL_SECURITY_SHIFTS));
      saveFirestoreCollection('security_shifts', INITIAL_SECURITY_SHIFTS);
    }
    setDocTitle('JADWAL SECURITY BULAN AGUSTUS');
    setDynamicHeaders(['NO.', 'NAMA PETUGAS', 'HARI / TANGGAL', 'LOKASI / POS', 'JAM HADIR']);
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

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Status Libur / Off</span>
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          </div>
          <div className="text-xl font-display font-extrabold text-slate-800">{liburCount} Personil Off</div>
          <p className="text-[11px] text-slate-500 font-medium">Batas Pergantian Hari</p>
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
                  onClick={handleCleanDuplicates}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                  title="Bersihkan Duplikasi Nama Petugas Pada Jadwal"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bersihkan Duplikasi</span>
                  {duplicateCount > 0 && (
                    <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
                      {duplicateCount}
                    </span>
                  )}
                </button>

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
                      let defaultDate = 'SABTU/ 1 Agustus 2026';
                      if (safeRoster.length > 0) {
                        const last = safeRoster[safeRoster.length - 1];
                        if (last.location === 'LIBUR') {
                          defaultDate = getNextDayDateStr(last.dateStr);
                        } else {
                          defaultDate = last.dateStr || defaultDate;
                        }
                      }
                      setRosterForm({ name: 'ARIEF', dateStr: defaultDate, location: 'KANWIL DJPB', hours: '06.00/18.00' });
                      setShowRosterModal(true);
                    }}
                    className="px-3 py-1.5 bg-djpb-blue hover:bg-djpb-blue-light text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
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
                    <span>Tambah Shift</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        {viewMode === 'roster' && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama petugas / tanggal..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-djpb-blue outline-none"
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
        {selectedIds.length > 0 && (
          <div className="bg-rose-50 border border-rose-300 p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs animate-in fade-in duration-150 shadow-xs">
            <div className="flex items-center space-x-2 text-rose-900 font-bold">
              <Check className="w-4 h-4 text-rose-600" />
              <span>{selectedIds.length} entri pengawasan dipilih (centang aktif)</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDeleteSelectedRoster}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-lg text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
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

        {/* ---------------- VIEW MODE 1: INDIVIDUAL ROSTER TABLE ---------------- */}
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
                        title="Pilih / Centang Semua Baris"
                      />
                    </th>
                  )}
                  <th className="py-3 px-3 w-12 text-center border-r border-slate-200">No.</th>
                  <th className="py-3 px-4 border-r border-slate-200">Nama Petugas</th>
                  <th className="py-3 px-4 border-r border-slate-200 text-center">Hari / Tanggal</th>
                  <th className="py-3 px-4 border-r border-slate-200">Lokasi / Pos Penjagaan</th>
                  <th className="py-3 px-4 border-r border-slate-200">Jam Hadir / Shift</th>
                  {isAdmin && <th className="py-3 px-4 text-right w-24">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800 font-mono">
                {filteredRoster.map((item, idx) => {
                  const isLibur = item.location === 'LIBUR';
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id} className={`transition-colors ${isSelected ? 'bg-amber-50/80' : 'hover:bg-slate-50'}`}>
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
                      {/* NO CELL */}
                      <td className="py-3 px-3 text-center font-bold text-slate-500 font-mono border-r border-slate-200">
                        {idx + 1}
                      </td>

                      {/* NAMA CELL */}
                      <td className="py-3 px-4 border-r border-slate-200 font-sans font-extrabold text-slate-900">
                        {item.name}
                      </td>

                      {/* HARI / TANGGAL CELL */}
                      {rowSpanMap[idx] !== undefined ? (
                        <td 
                          rowSpan={rowSpanMap[idx]} 
                          className="py-3 px-4 border-r border-slate-200 font-sans font-extrabold text-slate-800 bg-slate-50/70 text-center align-middle border-b-2 border-b-slate-200"
                        >
                          <div className="font-display font-extrabold text-djpb-blue tracking-wide py-1 text-xs">
                            {item.dateStr}
                          </div>
                        </td>
                      ) : null}

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
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>LIBUR</span>
                          </span>
                        )}
                        {!['KANWIL DJPB', 'RUMAH DINAS', 'LIBUR'].includes(item.location) && (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-bold">
                            <span>{item.location}</span>
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
                    <td colSpan={isAdmin ? 7 : 5} className="py-8 text-center text-slate-400 text-xs">
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
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 font-extrabold uppercase sticky top-0 text-slate-800 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center border-r border-slate-200">No.</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Nama Petugas</th>
                      <th className="py-2.5 px-3 border-r border-slate-200 text-center">Hari / Tanggal</th>
                      <th className="py-2.5 px-3 border-r border-slate-200">Lokasi / Pos</th>
                      <th className="py-2.5 px-3">Jam Hadir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono text-xs">
                    {previewRosterData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-center font-bold text-slate-500 border-r border-slate-200">{idx + 1}</td>
                        <td className="py-2 px-3 font-bold text-slate-800 border-r border-slate-200">{row.name}</td>
                        {previewRowSpanMap[idx] !== undefined ? (
                          <td rowSpan={previewRowSpanMap[idx]} className="py-2 px-3 border-r border-slate-200 text-center align-middle font-bold bg-slate-50/70 text-slate-800">
                            {row.dateStr}
                          </td>
                        ) : null}
                        <td className="py-2 px-3 border-r border-slate-200 font-sans">{row.location}</td>
                        <td className="py-2 px-3">{row.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 font-bold uppercase sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Hari</th>
                      <th className="py-2.5 px-3">Shift Pagi</th>
                      <th className="py-2.5 px-3">Shift Sore</th>
                      <th className="py-2.5 px-3">Shift Malam</th>
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
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-800 text-base">
                {editingRosterId ? 'Edit Entri Roster Penjagaan' : 'Tambah Entri Roster Penjagaan'}
              </h3>
              <button onClick={() => setShowRosterModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoster} className="space-y-4">
              {/* Duplicate guard notice */}
              {(() => {
                const searchName = (rosterForm.name || '').trim().toUpperCase();
                const searchDate = (rosterForm.dateStr || '').trim().toLowerCase();
                if (!searchName || !searchDate) return null;
                const dup = safeRoster.find(
                  r => r.id !== editingRosterId && 
                       r.name.trim().toUpperCase() === searchName && 
                       r.dateStr.trim().toLowerCase() === searchDate
                );
                if (dup) {
                  return (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-bold">Info Duplikasi Nama:</span> Petugas <span className="font-bold">{searchName}</span> sudah memiliki jadwal pada tanggal ini di <span className="font-bold">{dup.location} ({dup.hours})</span>. Menyimpan form ini akan memperbarui penugasannya dan mencegah entri ganda.
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Petugas</label>
                <input
                  type="text"
                  required
                  list="security-guards-datalist"
                  placeholder="Contoh: ARIEF"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-djpb-blue"
                  value={rosterForm.name}
                  onChange={(e) => setRosterForm({ ...rosterForm, name: e.target.value.toUpperCase() })}
                />
                <datalist id="security-guards-datalist">
                  {Array.from(new Set([...OFFICIAL_SECURITY_GUARDS, ...uniqueNames])).map(n => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hari / Tanggal</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SABTU/ 1 Agustus 2026"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-djpb-blue"
                  value={rosterForm.dateStr}
                  onChange={(e) => setRosterForm({ ...rosterForm, dateStr: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lokasi Penjagaan</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-djpb-blue"
                  value={rosterForm.location}
                  onChange={(e) => {
                    const loc = e.target.value;
                    const hrs = loc === 'LIBUR' ? '-' : (rosterForm.hours === '-' ? '06.00/18.00' : rosterForm.hours);
                    setRosterForm({ ...rosterForm, location: loc, hours: hrs });
                  }}
                >
                  <option value="KANWIL DJPB">KANWIL DJPB (Gedung Utama)</option>
                  <option value="RUMAH DINAS">RUMAH DINAS</option>
                  <option value="LIBUR">LIBUR (OFF)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jam Hadir / Jam Kerja</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: 06.00/18.00 atau 18.00/06.00 atau -"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-djpb-blue"
                  value={rosterForm.hours}
                  onChange={(e) => setRosterForm({ ...rosterForm, hours: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRosterModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Simpan Roster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Matrix Shift Modal */}
      {showShiftModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-800 text-base">
                {editingShiftIndex !== null ? 'Edit Matriks Shift Harian' : 'Tambah Matriks Shift Harian'}
              </h3>
              <button onClick={() => setShowShiftModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!setSecurityShifts) return;
                let updated: SecurityShift[] = [];
                if (editingShiftIndex !== null) {
                  updated = securityShifts.map((s, idx) => idx === editingShiftIndex ? shiftForm : s);
                } else {
                  updated = [...securityShifts, shiftForm];
                }
                setSecurityShifts(updated);
                saveFirestoreCollection('security_shifts', updated);
                safeLocalStorageSet('melayu_security_shifts', JSON.stringify(updated));
                setShowShiftModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hari</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Senin"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-djpb-blue"
                  value={shiftForm.day}
                  onChange={(e) => setShiftForm({ ...shiftForm, day: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shift Pagi (07:00 - 15:00)</label>
                <input
                  type="text"
                  placeholder="Nama Petugas Pagi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-djpb-blue"
                  value={shiftForm.shiftMorning}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftMorning: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shift Sore (15:00 - 23:00)</label>
                <input
                  type="text"
                  placeholder="Nama Petugas Sore"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-djpb-blue"
                  value={shiftForm.shiftEvening}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftEvening: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shift Malam (23:00 - 07:00)</label>
                <input
                  type="text"
                  placeholder="Nama Petugas Malam"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-djpb-blue"
                  value={shiftForm.shiftNight}
                  onChange={(e) => setShiftForm({ ...shiftForm, shiftNight: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowShiftModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Simpan Shift
                </button>
              </div>
            </form>
          </div>
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

              {/* Option: Clean Duplicate Guard Names */}
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  handleCleanDuplicates();
                }}
                className="w-full p-3.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-left transition-all cursor-pointer group flex items-center justify-between"
              >
                <div>
                  <div className="font-extrabold text-xs text-indigo-900 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>BERSIHKAN SELURUH DUPLIKASI NAMA PETUGAS</span>
                  </div>
                  <p className="text-[11px] text-indigo-700 mt-0.5 ml-5">
                    Mendeteksi dan menghapus penugasan ganda untuk nama petugas yang sama pada tanggal yang sama.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-600 text-white font-bold text-[10px] rounded-lg shadow-2xs">
                  {duplicateCount > 0 ? `${duplicateCount} Duplikasi Terdeteksi` : 'Bersih (0 Duplikasi)'}
                </span>
              </button>

              {/* Option 1: Delete Selected Rows */}
              {selectedIds.length > 0 ? (
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
                      Eksekusi hapus untuk {selectedIds.length} baris data pengawasan yang sedang dicentang.
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-white text-rose-700 font-extrabold text-[11px] rounded-lg shadow-2xs">
                    Eksekusi Hapus ({selectedIds.length})
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedIds(filteredRoster.map(r => r.id));
                  }}
                  className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-xs text-blue-900 flex items-center space-x-2">
                      <Check className="w-4 h-4 text-blue-600" />
                      <span>PILIH / CENTANG SEMUA DATA TAMPIL ({filteredRoster.length} BARIS)</span>
                    </div>
                    <p className="text-[11px] text-blue-700 mt-0.5 ml-6">
                      Pilih/centang seluruh baris dalam tabel untuk mengaktifkan fitur Hapus Terpilih.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-600 text-white font-bold text-[10px] rounded-lg shadow-2xs">
                    Centang Semua ({filteredRoster.length})
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

              {/* Option 4: Delete By Location */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  4. Hapus Berdasarkan Lokasi Penjagaan
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

              {/* Option 5: Reset Default */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-800 block">5. Kembalikan ke Data Standar Default</span>
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
