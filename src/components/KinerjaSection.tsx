import React, { useState } from 'react';
import { 
  Plus, BarChart2, Users, Clock, FolderHeart, ThumbsUp, 
  TrendingUp, Star, Trash2, Check, Sparkles, Phone, Mail, UserSearch,
  FileSpreadsheet, ExternalLink
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { PerformanceMetric, WorkloadMetric, DamsTask } from '../types';
import { INITIAL_DAMS_TASKS } from '../mockData';
import KatalogIKU from './KatalogIKU';
import { saveFirestoreDoc, deleteFirestoreDoc, saveFirestoreCollection, subscribeFirestoreCollection } from '../lib/firebase';
import { safeLocalStorageSet, safeLocalStorageGet } from '../lib/storage';

interface KinerjaSectionProps {
  subTab: string;
  performanceMetrics: PerformanceMetric[];
  workloadMetrics: WorkloadMetric[];
  isEditMode: boolean;
}

export default function KinerjaSection({
  subTab,
  performanceMetrics,
  workloadMetrics,
  isEditMode
}: KinerjaSectionProps) {
  // DAMS (Matriks Tindak Lanjut) states
  const [damsMtlList, setDamsMtlList] = useState<DamsTask[]>(() => {
    return safeLocalStorageGet<DamsTask[]>('melayu_dams_tasks', INITIAL_DAMS_TASKS);
  });

  // Real-time Firestore sync for DAMS tasks
  React.useEffect(() => {
    const unsub = subscribeFirestoreCollection<DamsTask>('dams_tasks', INITIAL_DAMS_TASKS, setDamsMtlList);
    return () => unsub();
  }, []);

  React.useEffect(() => {
    safeLocalStorageSet('melayu_dams_tasks', JSON.stringify(damsMtlList));
  }, [damsMtlList]);

  const [damsSearch, setDamsSearch] = useState('');
  const [damsStatusFilter, setDamsStatusFilter] = useState<'all' | 'Selesai' | 'On Progress'>('all');
  const [showDamsModal, setShowDamsModal] = useState(false);
  const [damsForm, setDamsForm] = useState({
    perihal: 'Dukungan Manajemen Yang Efektif',
    uraian: '',
    output: 'Laporan',
    pj: '',
    deadline: 'Agustus 2026',
    status: 'On Progress'
  });

  // Katalog HKT Search state
  const [hktSearch, setHktSearch] = useState('');

  // Performance survey states
  const [perfRating, setPerfRating] = useState(5);
  const [perfComment, setPerfComment] = useState('');
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // Monitoring IKU Table State & Data
  const [ikuSearch, setIkuSearch] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState<'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('all');

  const ikuDataList = [
    { no: 1, kode: '1a-CP', nama: 'Indeks Kualitas Nilai IKPA K/L', targetQ1: 3, realisasiQ1: 3.75, indeksQ1: 120, targetQ2: 3, realisasiQ2: null, indeksQ2: null, targetQ3: 3, realisasiQ3: null, indeksQ3: null, targetQ4: 3, realisasiQ4: null, indeksQ4: null, keterangan: 'Tercapai (120%)' },
    { no: 2, kode: '2a-CP', nama: 'Tingkat kepuasan terhadap layanan Kanwil DJPb', targetQ1: 100, realisasiQ1: 116.83, indeksQ1: 116.83, targetQ2: 100, realisasiQ2: null, indeksQ2: null, targetQ3: 100, realisasiQ3: null, indeksQ3: null, targetQ4: 100, realisasiQ4: null, indeksQ4: null, keterangan: 'Sangat Memuaskan (116.83%)' },
    { no: 3, kode: '3a-CP', nama: 'Indeks Efektivitas Pelaksanaan Anggaran Pusat dan Daerah', targetQ1: 4, realisasiQ1: 5, indeksQ1: 120, targetQ2: 4, realisasiQ2: null, indeksQ2: null, targetQ3: 4, realisasiQ3: null, indeksQ3: null, targetQ4: 4, realisasiQ4: null, indeksQ4: null, keterangan: 'Tercapai Maksimal (120%)' },
    { no: 4, kode: '3b-N', nama: 'Indeks kualitas operasional Treasury', targetQ1: 4.1, realisasiQ1: 5, indeksQ1: 120, targetQ2: 4.1, realisasiQ2: null, indeksQ2: null, targetQ3: 4.1, realisasiQ3: null, indeksQ3: null, targetQ4: 4.1, realisasiQ4: null, indeksQ4: null, keterangan: 'Tercapai Maksimal (120%)' },
    { no: 5, kode: '4a-N', nama: 'Indeks Kualitas Laporan Government Finance Statistic (GFS) Tingkat Wilayah', targetQ1: 4.1, realisasiQ1: 5, indeksQ1: 120, targetQ2: 4.1, realisasiQ2: null, indeksQ2: null, targetQ3: 4.1, realisasiQ3: null, indeksQ3: null, targetQ4: 4.1, realisasiQ4: null, indeksQ4: null, keterangan: 'Tercapai Maksimal (120%)' },
    { no: 6, kode: '4b-N', nama: 'Indeks Kualitas Analisis Keuangan BUN Tingkat Wilayah', targetQ1: 4, realisasiQ1: 5, indeksQ1: 120, targetQ2: 4, realisasiQ2: null, indeksQ2: null, targetQ3: 4, realisasiQ3: null, indeksQ3: null, targetQ4: 4, realisasiQ4: null, indeksQ4: null, keterangan: 'Tercapai Maksimal (120%)' },
    { no: 7, kode: '5a-N', nama: 'Indeks Kualitas Pelaksanaan Special Mission di Daerah', targetQ1: 4, realisasiQ1: 5, indeksQ1: 120, targetQ2: 4, realisasiQ2: null, indeksQ2: null, targetQ3: 4, realisasiQ3: null, indeksQ3: null, targetQ4: 4, realisasiQ4: null, indeksQ4: null, keterangan: 'Tercapai Maksimal (120%)' },
    { no: 8, kode: '6a-N', nama: 'Tingkat kualitas pengelolaan kinerja organisasi', targetQ1: 100, realisasiQ1: 120, indeksQ1: 120, targetQ2: 100, realisasiQ2: null, indeksQ2: null, targetQ3: 100, realisasiQ3: null, indeksQ3: null, targetQ4: 100, realisasiQ4: null, indeksQ4: null, keterangan: 'Tercapai Maksimal (120%)' },
    { no: 9, kode: '6b-N', nama: 'Nilai implementasi Learning Organization', targetQ1: 30, realisasiQ1: 55.31, indeksQ1: 120, targetQ2: 50, realisasiQ2: null, indeksQ2: null, targetQ3: 70, realisasiQ3: null, indeksQ3: null, targetQ4: 90, realisasiQ4: null, indeksQ4: null, keterangan: 'Tercapai (120%)' },
    { no: 10, kode: '6c-N', nama: 'Nilai Efektivitas Pelaksanaan Tugas Kepatuhan Internal', targetQ1: 80, realisasiQ1: 97.65, indeksQ1: 120, targetQ2: 80, realisasiQ2: null, indeksQ2: null, targetQ3: 80, realisasiQ3: null, indeksQ3: null, targetQ4: 80, realisasiQ4: null, indeksQ4: null, keterangan: 'Tercapai (120%)' },
    { no: 11, kode: '7a-CP', nama: 'Indeks Kualitas Pengelolaan Keuangan, BMN, Pengadaan, dan Arsip', targetQ1: 100, realisasiQ1: 120, indeksQ1: 120, targetQ2: 100, realisasiQ2: null, indeksQ2: null, targetQ3: 100, realisasiQ3: null, indeksQ3: null, targetQ4: 100, realisasiQ4: null, indeksQ4: null, keterangan: 'Tercapai Maksimal (120%)' },
    { no: 12, kode: '7b-N', nama: 'Nilai Kinerja TIK Kanwil DJPb', targetQ1: 83, realisasiQ1: 100, indeksQ1: 120, targetQ2: 83, realisasiQ2: null, indeksQ2: null, targetQ3: 83, realisasiQ3: null, indeksQ3: null, targetQ4: 83, realisasiQ4: null, indeksQ4: null, keterangan: 'Tercapai Maksimal (120%)' }
  ];

  const filteredIkuList = (ikuDataList || []).filter(item => {
    if (!item) return false;
    const kode = item.kode || '';
    const nama = item.nama || '';
    return kode.toLowerCase().includes(ikuSearch.toLowerCase()) ||
           nama.toLowerCase().includes(ikuSearch.toLowerCase());
  });

  // Monitoring ABK State & Data
  const [abkSearch, setAbkSearch] = useState('');

  const abkDataList = [
    { no: '1', unit: 'Kepala Kantor Wilayah - Kantor Wilayah Direktorat Jenderal Perbendaharaan Provinsi Riau', bebanKerja: '1,506.63', kebutuhan: 1, pegawai: 1, selisih: 0, keterangan: '-' },
    { no: '2', unit: 'Analisis Perbendaharaan Negara Ahli Pertama (ABK) - Kantor Wilayah Direktorat Jenderal Perbendaharaan Provinsi Riau', bebanKerja: '1,373.43', kebutuhan: 0, pegawai: 1, selisih: 1, keterangan: 'Kelebihan 1 Pegawai' },
    { no: '3', unit: 'Pranata Keuangan APBN Mahir - Kantor Direktorat Jenderal Perbendaharaan Provinsi Riau', bebanKerja: '1,226.40', kebutuhan: 1, pegawai: 1, selisih: 0, keterangan: '-' },
    { no: '4', unit: 'Bagian Umum', bebanKerja: '13,822.33', kebutuhan: 11, pegawai: 10, selisih: -1, keterangan: 'Kekurangan 1 Pegawai Pelaksana' },
    { no: '5', unit: 'Bagian Pembinaan Pelaksanaan Anggaran I', bebanKerja: '16,145.07', kebutuhan: 11, pegawai: 9, selisih: -2, keterangan: 'Kekurangan 2 Pegawai Pelaksana' },
    { no: '6', unit: 'Bagian Pembinaan Pelaksanaan Anggaran II', bebanKerja: '12,745.20', kebutuhan: 8, pegawai: 7, selisih: -1, keterangan: 'Kekurangan 1 Pegawai Pelaksana' },
    { no: '7', unit: 'Bidang Pembinaan Akuntansi dan Pelaporan Keuangan', bebanKerja: '11,803.78', kebutuhan: 8, pegawai: 7, selisih: -1, keterangan: 'Kekurangan 1 Pegawai Pelaksana' },
    { no: '9', unit: 'Bidang Supervisi KPPN dan Kepatuhan Internal', bebanKerja: '10,529.73', kebutuhan: 7, pegawai: 6, selisih: -1, keterangan: 'Kekurangan 1 Pejabat Pengawas' },
    { no: '10', unit: 'Kantor Pelayanan Perbendaharaan Negara Tipe A1 Pekanbaru', bebanKerja: '41,101.33', kebutuhan: 27, pegawai: 22, selisih: -5, keterangan: 'Kekurangan 1 Pejabat Pengawas dan 4 Pegawai Pelaksana' },
    { no: '11', unit: 'Kantor Pelayanan Perbendaharaan Negara Tipe A1 Dumai', bebanKerja: '30,469.98', kebutuhan: 18, pegawai: 14, selisih: -4, keterangan: 'Kekurangan 4 Pegawai Pelaksana' },
    { no: '12', unit: 'Kantor Pelayanan Perbendaharaan Negara Tipe A1 Rengat', bebanKerja: '20,841.07', kebutuhan: 13, pegawai: 10, selisih: -3, keterangan: 'Kekurangan 3 Pegawai Pelaksana' },
  ];

  const abkTotalRow = {
    no: '13',
    unit: 'Total',
    bebanKerja: '161,564.95',
    kebutuhan: 104,
    pegawai: 91,
    selisih: -13,
    keterangan: 'Kekurangan 2 Pejabat Pengawas dan 11 Pegawai Pelaksana'
  };

  const filteredAbkList = (abkDataList || []).filter(item => {
    if (!item) return false;
    const unit = item.unit || '';
    const ket = item.keterangan || '';
    return unit.toLowerCase().includes(abkSearch.toLowerCase()) ||
           ket.toLowerCase().includes(abkSearch.toLowerCase());
  });

  const directoryContacts = [
    { name: 'Andi Wijaya, S.E.', role: 'Kepala Subbagian TURT', ext: '101', email: 'andi.wijaya@kemenkeu.go.id', wa: '0812-3456-7890' },
    { name: 'Siti Rahma, M.Acc.', role: 'Kepala Subbagian Kepegawaian', ext: '102', email: 'siti.rahma@kemenkeu.go.id', wa: '0811-1234-5678' },
    { name: 'Rudi Hartono, S.Sos.', role: 'Pranata Komputer Madya', ext: '105', email: 'rudi.hartono@kemenkeu.go.id', wa: '0853-9988-1122' },
    { name: 'Eka Lestari, A.Md.', role: 'Bendahara Pengeluaran Kanwil', ext: '110', email: 'eka.lestari@kemenkeu.go.id', wa: '0813-8877-6655' },
    { name: 'Hendra Saputra, S.E.', role: 'Pelaksana Bidang PAPK', ext: '121', email: 'hendra.s@kemenkeu.go.id', wa: '0812-0000-1111' },
    { name: 'Wulan Ningrum, S.H.', role: 'Analis Hukum Kepatuhan Internal', ext: '135', email: 'wulan.ningrum@kemenkeu.go.id', wa: '0852-5555-4444' }
  ];

  const filteredContacts = (directoryContacts || []).filter(c => {
    if (!c) return false;
    const name = c.name || '';
    const role = c.role || '';
    const ext = c.ext || '';
    return name.toLowerCase().includes(hktSearch.toLowerCase()) || 
           role.toLowerCase().includes(hktSearch.toLowerCase()) ||
           ext.includes(hktSearch);
  });

  // Filter DAMS MTL
  const filteredDamsMtl = (damsMtlList || []).filter(item => {
    if (!item) return false;
    const perihal = item.perihal || '';
    const uraian = item.uraian || '';
    const pj = item.pj || '';
    const output = item.output || '';
    const deadline = item.deadline || '';
    const matchesSearch = 
      perihal.toLowerCase().includes(damsSearch.toLowerCase()) ||
      uraian.toLowerCase().includes(damsSearch.toLowerCase()) ||
      pj.toLowerCase().includes(damsSearch.toLowerCase()) ||
      output.toLowerCase().includes(damsSearch.toLowerCase()) ||
      deadline.toLowerCase().includes(damsSearch.toLowerCase());
    const matchesStatus = damsStatusFilter === 'all' || item.status === damsStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Dams action
  const handleAddDamsMtl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!damsForm.perihal || !damsForm.uraian || !damsForm.pj) return;
    const newItem: DamsTask = {
      id: `dams-${Date.now()}`,
      no: damsMtlList.length + 1,
      perihal: damsForm.perihal,
      uraian: damsForm.uraian,
      output: damsForm.output || 'Laporan',
      pj: damsForm.pj,
      deadline: damsForm.deadline || 'Agustus 2026',
      status: (damsForm.status as 'Selesai' | 'On Progress') || 'On Progress'
    };
    const updated = [...damsMtlList, newItem];
    setDamsMtlList(updated);
    saveFirestoreDoc('dams_tasks', newItem);
    setShowDamsModal(false);
    setDamsForm({
      perihal: 'Dukungan Manajemen Yang Efektif',
      uraian: '',
      output: 'Laporan',
      pj: '',
      deadline: 'Agustus 2026',
      status: 'On Progress'
    });
  };

  const handleToggleDamsMtlStatus = (no: number) => {
    let updatedItem: DamsTask | null = null;
    const updated = damsMtlList.map(item => {
      if (item.no === no) {
        updatedItem = { ...item, status: item.status === 'Selesai' ? 'On Progress' : 'Selesai' };
        return updatedItem;
      }
      return item;
    });
    setDamsMtlList(updated);
    if (updatedItem) {
      saveFirestoreDoc('dams_tasks', updatedItem);
    }
  };

  const handleDeleteDamsMtl = (no: number) => {
    const targetItem = damsMtlList.find(item => item.no === no);
    const updated = damsMtlList.filter(item => item.no !== no);
    setDamsMtlList(updated);
    if (targetItem?.id) {
      deleteFirestoreDoc('dams_tasks', targetItem.id);
    } else {
      saveFirestoreCollection('dams_tasks', updated);
    }
  };

  // Survey action
  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feedbackEntry = {
      id: `survey-perf-${Date.now()}`,
      rating: perfRating,
      comment: perfComment.trim(),
      submittedAt: new Date().toISOString()
    };
    saveFirestoreDoc('feedback_kinerja', feedbackEntry);
    setSurveySubmitted(true);
    setTimeout(() => {
      setSurveySubmitted(false);
      setPerfComment('');
      setPerfRating(5);
    }, 4000);
  };

  return (
    <div className="p-6 space-y-6" id="kinerja-section-root">
      {/* ----------------- SUB-TAB: MONITORING KINERJA ----------------- */}
      {subTab === 'monitoring-kinerja' && (
        <div className="space-y-6" id="kinerja-charts-subtab">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base md:text-lg font-display font-bold text-slate-800">Monitoring Capaian Kinerja Organisasi</h2>
              <p className="text-xs text-slate-500">Nilai Kinerja Organisasi (NKO) bulanan dibandingkan target makro.</p>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href="https://docs.google.com/spreadsheets/d/1gzinSCcnpmKXy1aawRCtK00jam-SCk_zEUkdrJrvRoc/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg border border-emerald-700 shadow-xs transition-colors flex items-center space-x-1.5 shrink-0"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Spreadsheet Data Subbagian Penilaian Kinerja</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
              <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 shrink-0 hidden sm:block">
                IKU Hijau: 94.2% (Sangat Baik)
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="kinerja-metrics-row">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider font-display">NKO S.D JULI 2026</span>
              <span className="text-2xl font-bold font-display text-djpb-blue mt-1 block">103.42%</span>
              <span className="text-[10px] text-green-600 font-medium">▲ Meningkat 1.2% dari triwulan I</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider font-display">IKU TINGKAT MERAH (KENDALA)</span>
              <span className="text-2xl font-bold font-display text-red-500 mt-1 block">0 IKU</span>
              <span className="text-[10px] text-slate-500 font-medium">Sesuai ekspektasi Kemenkeu</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider font-display">INDEX KEPUASAN LAYANAN INTERNAL</span>
              <span className="text-2xl font-bold font-display text-djpb-blue mt-1 block">4.82<span className="text-xs font-normal text-slate-400">/5.00</span></span>
              <span className="text-[10px] text-green-600 font-medium">Kategori: Sangat Memuaskan</span>
            </div>
          </div>

          {/* IKU Data Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4" id="iku-data-table-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-djpb-blue" />
                  <span>Daftar Indikator Kinerja Utama (IKU) Subbagian Penilaian Kinerja</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Target, Realisasi, dan Indeks Capaian IKU Triwulanan Kanwil DJPb Provinsi Riau
                </p>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Cari Kode atau Indikator..."
                    value={ikuSearch}
                    onChange={(e) => setIkuSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-djpb-blue focus:bg-white"
                  />
                  <UserSearch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  {ikuSearch && (
                    <button onClick={() => setIkuSearch('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold">×</button>
                  )}
                </div>

                {/* Quarter selector */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600 border border-slate-200">
                  <button
                    onClick={() => setSelectedQuarter('all')}
                    className={`px-2.5 py-1 rounded-md transition-all ${selectedQuarter === 'all' ? 'bg-white text-djpb-blue shadow-xs font-bold' : 'hover:text-slate-900'}`}
                  >
                    Semua Q
                  </button>
                  <button
                    onClick={() => setSelectedQuarter('Q1')}
                    className={`px-2.5 py-1 rounded-md transition-all ${selectedQuarter === 'Q1' ? 'bg-white text-djpb-blue shadow-xs font-bold' : 'hover:text-slate-900'}`}
                  >
                    Q1
                  </button>
                  <button
                    onClick={() => setSelectedQuarter('Q2')}
                    className={`px-2.5 py-1 rounded-md transition-all ${selectedQuarter === 'Q2' ? 'bg-white text-djpb-blue shadow-xs font-bold' : 'hover:text-slate-900'}`}
                  >
                    Q2
                  </button>
                  <button
                    onClick={() => setSelectedQuarter('Q3')}
                    className={`px-2.5 py-1 rounded-md transition-all ${selectedQuarter === 'Q3' ? 'bg-white text-djpb-blue shadow-xs font-bold' : 'hover:text-slate-900'}`}
                  >
                    Q3
                  </button>
                  <button
                    onClick={() => setSelectedQuarter('Q4')}
                    className={`px-2.5 py-1 rounded-md transition-all ${selectedQuarter === 'Q4' ? 'bg-white text-djpb-blue shadow-xs font-bold' : 'hover:text-slate-900'}`}
                  >
                    Q4
                  </button>
                </div>
              </div>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-800 text-slate-100 text-[11px] font-bold uppercase tracking-wider font-display">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center border-b border-slate-700 whitespace-nowrap">No</th>
                    <th className="py-2.5 px-3 border-b border-slate-700 whitespace-nowrap min-w-[75px]">Kode</th>
                    <th className="py-2.5 px-4 min-w-[260px] border-b border-slate-700">Indikator Kinerja Utama (IKU)</th>
                    
                    {(selectedQuarter === 'all' || selectedQuarter === 'Q1') && (
                      <th className="py-2.5 px-3 text-center bg-slate-900/80 border-b border-slate-700" colSpan={3}>
                        Triwulan I (Q1)
                      </th>
                    )}
                    {(selectedQuarter === 'all' || selectedQuarter === 'Q2') && (
                      <th className="py-2.5 px-3 text-center bg-slate-800/90 border-b border-slate-700" colSpan={3}>
                        Triwulan II (Q2)
                      </th>
                    )}
                    {(selectedQuarter === 'all' || selectedQuarter === 'Q3') && (
                      <th className="py-2.5 px-3 text-center bg-slate-900/80 border-b border-slate-700" colSpan={3}>
                        Triwulan III (Q3)
                      </th>
                    )}
                    {(selectedQuarter === 'all' || selectedQuarter === 'Q4') && (
                      <th className="py-2.5 px-3 text-center bg-slate-800/90 border-b border-slate-700" colSpan={3}>
                        Triwulan IV (Q4)
                      </th>
                    )}
                  </tr>
                  
                  {/* Sub-header for Target / Realisasi / Indeks */}
                  <tr className="bg-slate-700/60 text-[10px] text-slate-300 border-b border-slate-600 font-mono">
                    <th className="py-1 px-2 border-r border-slate-600"></th>
                    <th className="py-1 px-2 border-r border-slate-600"></th>
                    <th className="py-1 px-3 border-r border-slate-600"></th>

                    {(selectedQuarter === 'all' || selectedQuarter === 'Q1') && (
                      <>
                        <th className="py-1 px-2 text-center border-r border-slate-600 font-semibold">Target</th>
                        <th className="py-1 px-2 text-center border-r border-slate-600 font-semibold text-amber-300">Realisasi</th>
                        <th className="py-1 px-2 text-center border-r border-slate-600 font-semibold text-emerald-300">Indeks</th>
                      </>
                    )}
                    {(selectedQuarter === 'all' || selectedQuarter === 'Q2') && (
                      <>
                        <th className="py-1 px-2 text-center border-r border-slate-600 font-semibold">Target</th>
                        <th className="py-1 px-2 text-center border-r border-slate-600 font-semibold">Realisasi</th>
                        <th className="py-1 px-2 text-center border-r border-slate-600 font-semibold">Indeks</th>
                      </>
                    )}
                    {(selectedQuarter === 'all' || selectedQuarter === 'Q3') && (
                      <>
                        <th className="py-1 px-2 text-center border-r border-slate-600 font-semibold">Target</th>
                        <th className="py-1 px-2 text-center border-r border-slate-600 font-semibold">Realisasi</th>
                        <th className="py-1 px-2 text-center border-r border-slate-600 font-semibold">Indeks</th>
                      </>
                    )}
                    {(selectedQuarter === 'all' || selectedQuarter === 'Q4') && (
                      <>
                        <th className="py-1 px-2 text-center border-r border-slate-600 font-semibold">Target</th>
                        <th className="py-1 px-2 text-center border-r border-slate-600 font-semibold">Realisasi</th>
                        <th className="py-1 px-2 text-center border-r border-slate-600 font-semibold">Indeks</th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 font-sans text-slate-800">
                  {filteredIkuList.length === 0 ? (
                    <tr>
                      <td colSpan={15} className="py-8 text-center text-slate-400 italic">
                        Tidak ada data IKU yang cocok dengan pencarian "{ikuSearch}"
                      </td>
                    </tr>
                  ) : (
                    filteredIkuList.map((row) => (
                      <tr key={row.no} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 text-center font-mono text-slate-500 font-bold text-[11px] border-r border-slate-100">
                          {row.no}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-extrabold border-r border-slate-100 whitespace-nowrap">
                          <span className={`inline-block whitespace-nowrap px-2 py-0.5 rounded text-[11px] font-bold ${row.kode.includes('CP') ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-purple-100 text-purple-900 border border-purple-200'}`}>
                            {row.kode}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-900 border-r border-slate-100">
                          {row.nama}
                        </td>

                        {/* Q1 Columns */}
                        {(selectedQuarter === 'all' || selectedQuarter === 'Q1') && (
                          <>
                            <td className="py-2.5 px-2 text-center font-mono font-medium text-slate-600 border-r border-slate-100 bg-slate-50/30">
                              {row.targetQ1}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-bold text-amber-900 border-r border-slate-100 bg-amber-50/30">
                              {row.realisasiQ1 ?? '-'}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono font-extrabold border-r border-slate-100 bg-emerald-50/40">
                              {row.indeksQ1 !== null ? (
                                <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px]">
                                  {row.indeksQ1}
                                </span>
                              ) : '-'}
                            </td>
                          </>
                        )}

                        {/* Q2 Columns */}
                        {(selectedQuarter === 'all' || selectedQuarter === 'Q2') && (
                          <>
                            <td className="py-2.5 px-2 text-center font-mono text-slate-600 border-r border-slate-100">
                              {row.targetQ2}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-slate-400 border-r border-slate-100">
                              {row.realisasiQ2 ?? '-'}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-slate-400 border-r border-slate-100">
                              {row.indeksQ2 ?? '-'}
                            </td>
                          </>
                        )}

                        {/* Q3 Columns */}
                        {(selectedQuarter === 'all' || selectedQuarter === 'Q3') && (
                          <>
                            <td className="py-2.5 px-2 text-center font-mono text-slate-600 border-r border-slate-100 bg-slate-50/30">
                              {row.targetQ3}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-slate-400 border-r border-slate-100 bg-slate-50/30">
                              {row.realisasiQ3 ?? '-'}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-slate-400 border-r border-slate-100 bg-slate-50/30">
                              {row.indeksQ3 ?? '-'}
                            </td>
                          </>
                        )}

                        {/* Q4 Columns */}
                        {(selectedQuarter === 'all' || selectedQuarter === 'Q4') && (
                          <>
                            <td className="py-2.5 px-2 text-center font-mono text-slate-600 border-r border-slate-100">
                              {row.targetQ4}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-slate-400 border-r border-slate-100">
                              {row.realisasiQ4 ?? '-'}
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-slate-400 border-r border-slate-100">
                              {row.indeksQ4 ?? '-'}
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
              <span className="font-medium">
                Menampilkan <strong>{filteredIkuList.length}</strong> dari <strong>12</strong> Indikator Kinerja Utama
              </span>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-300"></span>
                  <span>CP: Target Kemenkeu Wide</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-purple-100 border border-purple-300"></span>
                  <span>N: Target NKO Unit</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: MONITORING ABK ----------------- */}
      {subTab === 'monitoring-abk' && (
        <div className="space-y-6" id="abk-subtab">
          {/* Header & Description */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base md:text-lg font-display font-bold text-slate-800 flex items-center space-x-2">
                <Users className="w-5 h-5 text-djpb-blue" />
                <span>Monitoring Analisis Beban Kerja (ABK) Pegawai</span>
              </h2>
              <p className="text-xs text-slate-500">
                Laporan Hasil Analisis Beban Kerja, Jumlah Kebutuhan Pegawai, Formasi Eksisting, dan Selisih Kekurangan Pegawai.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Cari Unit Organisasi / Keterangan..."
                value={abkSearch}
                onChange={(e) => setAbkSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-djpb-blue shadow-2xs"
              />
              <UserSearch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              {abkSearch && (
                <button onClick={() => setAbkSearch('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold">×</button>
              )}
            </div>
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Beban Kerja Unit</span>
              <div className="text-xl font-bold font-mono text-slate-800">{abkTotalRow.bebanKerja}</div>
              <p className="text-[10px] text-slate-400">Kumulatif seluruh unit & KPPN</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Kebutuhan Pegawai</span>
              <div className="text-xl font-bold font-mono text-djpb-blue">{abkTotalRow.kebutuhan} <span className="text-xs font-normal font-sans text-slate-500">Pegawai</span></div>
              <p className="text-[10px] text-slate-400">Berdasarkan perhitungan ABK</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Jumlah Pegawai Eksisting</span>
              <div className="text-xl font-bold font-mono text-emerald-700">{abkTotalRow.pegawai} <span className="text-xs font-normal font-sans text-slate-500">Pegawai</span></div>
              <p className="text-[10px] text-slate-400">Personil aktif saat ini</p>
            </div>

            <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wider block">Total Defisit / Selisih</span>
              <div className="text-xl font-bold font-mono text-red-600">{abkTotalRow.selisih} <span className="text-xs font-normal font-sans text-red-500">Pegawai</span></div>
              <p className="text-[10px] text-red-700 font-medium truncate">{abkTotalRow.keterangan}</p>
            </div>
          </div>

          {/* Detailed ABK Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-djpb-blue" />
                <span>Tabel Analisis Beban Kerja (ABK) Kanwil DJPb Provinsi Riau & KPPN Lingkup</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md font-semibold">
                Status: Updated 2026
              </span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-800 text-slate-100 text-[11px] font-bold uppercase tracking-wider font-display">
                  <tr>
                    <th className="py-3 px-3 w-12 text-center border-b border-slate-700 whitespace-nowrap">No</th>
                    <th className="py-3 px-4 min-w-[280px] border-b border-slate-700">Unit Organisasi</th>
                    <th className="py-3 px-3 text-right border-b border-slate-700 whitespace-nowrap">Beban Kerja Unit</th>
                    <th className="py-3 px-3 text-center border-b border-slate-700 whitespace-nowrap">Kebutuhan Pegawai</th>
                    <th className="py-3 px-3 text-center border-b border-slate-700 whitespace-nowrap">Jumlah Pegawai</th>
                    <th className="py-3 px-3 text-center border-b border-slate-700 whitespace-nowrap">Selisih</th>
                    <th className="py-3 px-4 min-w-[200px] border-b border-slate-700">Keterangan</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-slate-800 font-sans">
                  {filteredAbkList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400 italic">
                        Tidak ada unit organisasi yang cocok dengan pencarian "{abkSearch}"
                      </td>
                    </tr>
                  ) : (
                    filteredAbkList.map((row) => (
                      <tr key={row.no} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-500 border-r border-slate-100">
                          {row.no}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 border-r border-slate-100">
                          {row.unit}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 border-r border-slate-100 bg-slate-50/40">
                          {row.bebanKerja}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-700 border-r border-slate-100">
                          {row.kebutuhan}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-700 border-r border-slate-100">
                          {row.pegawai}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-bold border-r border-slate-100">
                          {row.selisih < 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-extrabold">
                              {row.selisih}
                            </span>
                          ) : row.selisih > 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                              +{row.selisih}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                              0
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs">
                          {row.keterangan && row.keterangan !== '-' ? (
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] font-medium ${
                              row.selisih < 0 ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}>
                              {row.keterangan}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-mono text-[11px]">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}

                  {/* Total Row */}
                  <tr className="bg-slate-900 text-white font-bold font-display border-t-2 border-slate-700">
                    <td className="py-3.5 px-3 text-center font-mono text-slate-300">
                      {abkTotalRow.no}
                    </td>
                    <td className="py-3.5 px-4 text-sm tracking-wide uppercase text-amber-300 font-extrabold">
                      {abkTotalRow.unit}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono text-amber-200 text-sm">
                      {abkTotalRow.bebanKerja}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-white text-sm">
                      {abkTotalRow.kebutuhan}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-emerald-300 text-sm">
                      {abkTotalRow.pegawai}
                    </td>
                    <td className="py-3.5 px-3 text-center font-mono text-red-300 text-sm font-extrabold">
                      {abkTotalRow.selisih}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-sans text-red-200 font-medium">
                      {abkTotalRow.keterangan}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table Footer information */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
              <span className="font-medium">
                Menampilkan <strong>{filteredAbkList.length}</strong> unit organisasi dari total 11 rincian unit
              </span>
              <div className="flex items-center space-x-2 text-[11px]">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                <span>Defisit Pegawai total 13 personil (2 Pejabat Pengawas, 11 Pelaksana)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: MONITORING DAMS ----------------- */}
      {subTab === 'monitoring-dams' && (
        <div className="space-y-6" id="dams-subtab">
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base md:text-lg font-display font-bold text-slate-800 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-djpb-blue" />
                <span>Monitoring DAMS (Matriks Tindak Lanjut / MTL)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Monitoring Matriks Tindak Lanjut (MTL), Perihal, Uraian Tugas, Penanggung Jawab, Target Output, dan Status Penyelesaian.
              </p>
            </div>

            {isEditMode && (
              <button
                id="btn-add-dams"
                onClick={() => setShowDamsModal(true)}
                className="flex items-center justify-center space-x-1.5 px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Data MTL Baru</span>
              </button>
            )}
          </div>

          {/* Stats / KPI Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Kegiatan MTL</span>
              <div className="text-xl font-bold font-mono text-slate-800">{damsMtlList.length} <span className="text-xs font-sans text-slate-500 font-normal">Item</span></div>
              <p className="text-[10px] text-slate-400">Rencana aksi tindak lanjut</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Kegiatan Selesai</span>
              <div className="text-xl font-bold font-mono text-emerald-700">
                {damsMtlList.filter(i => i.status === 'Selesai').length} <span className="text-xs font-sans text-slate-500 font-normal">Item</span>
              </div>
              <p className="text-[10px] text-emerald-600 font-medium">Telah diterbitkan output</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">Dalam Proses (On Progress)</span>
              <div className="text-xl font-bold font-mono text-amber-600">
                {damsMtlList.filter(i => i.status === 'On Progress').length} <span className="text-xs font-sans text-slate-500 font-normal">Item</span>
              </div>
              <p className="text-[10px] text-amber-600 font-medium">Target Agustus 2026</p>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 shadow-2xs space-y-1">
              <span className="text-[11px] font-semibold text-djpb-blue uppercase tracking-wider block">Progres Capaian MTL</span>
              <div className="text-xl font-bold font-mono text-djpb-blue">
                {Math.round((damsMtlList.filter(i => i.status === 'Selesai').length / (damsMtlList.length || 1)) * 100)}%
              </div>
              <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1">
                <div 
                  className="bg-djpb-blue h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${(damsMtlList.filter(i => i.status === 'Selesai').length / (damsMtlList.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* DAMS MTL Table Container */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-2">
                <BarChart2 className="w-4 h-4 text-djpb-blue" />
                <span>Tabel Matriks Tindak Lanjut (MTL) DAMS Kanwil DJPb Riau</span>
              </h3>

              {/* Search & Status Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Cari Perihal, Uraian, Penanggung Jawab..."
                    value={damsSearch}
                    onChange={(e) => setDamsSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-djpb-blue focus:bg-white"
                  />
                  <UserSearch className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  {damsSearch && (
                    <button onClick={() => setDamsSearch('')} className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold">×</button>
                  )}
                </div>

                <div className="flex bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold text-slate-600 border border-slate-200">
                  <button
                    onClick={() => setDamsStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-md transition-all ${damsStatusFilter === 'all' ? 'bg-white text-djpb-blue shadow-xs font-bold' : 'hover:text-slate-900'}`}
                  >
                    Semua ({damsMtlList.length})
                  </button>
                  <button
                    onClick={() => setDamsStatusFilter('Selesai')}
                    className={`px-2.5 py-1 rounded-md transition-all ${damsStatusFilter === 'Selesai' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
                  >
                    Selesai ({damsMtlList.filter(i => i.status === 'Selesai').length})
                  </button>
                  <button
                    onClick={() => setDamsStatusFilter('On Progress')}
                    className={`px-2.5 py-1 rounded-md transition-all ${damsStatusFilter === 'On Progress' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'hover:text-slate-900'}`}
                  >
                    On Progress ({damsMtlList.filter(i => i.status === 'On Progress').length})
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-800 text-slate-100 text-[11px] font-bold uppercase tracking-wider font-display">
                  <tr>
                    <th className="py-3 px-3 w-10 text-center border-b border-slate-700 whitespace-nowrap">No</th>
                    <th className="py-3 px-4 min-w-[200px] border-b border-slate-700">Perihal MTL</th>
                    <th className="py-3 px-4 min-w-[320px] border-b border-slate-700">Uraian MTL</th>
                    <th className="py-3 px-3 text-center border-b border-slate-700 whitespace-nowrap">Output</th>
                    <th className="py-3 px-4 min-w-[150px] border-b border-slate-700">Penanggung Jawab</th>
                    <th className="py-3 px-3 text-center border-b border-slate-700 whitespace-nowrap">Batas Waktu</th>
                    <th className="py-3 px-3 text-center border-b border-slate-700 whitespace-nowrap">Keterangan</th>
                    {isEditMode && <th className="py-3 px-3 text-center border-b border-slate-700 whitespace-nowrap">Aksi</th>}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-200 text-slate-800 font-sans">
                  {filteredDamsMtl.length === 0 ? (
                    <tr>
                      <td colSpan={isEditMode ? 8 : 7} className="py-8 text-center text-slate-400 italic">
                        Tidak ada data Matriks Tindak Lanjut (MTL) yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredDamsMtl.map((row) => (
                      <tr key={row.no} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center font-mono font-bold text-slate-500 border-r border-slate-100">
                          {row.no}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900 border-r border-slate-100">
                          <span className="inline-block px-2 py-1 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[11px] leading-relaxed">
                            {row.perihal}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 border-r border-slate-100 leading-relaxed font-normal">
                          {row.uraian}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-100">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px] border border-slate-200">
                            {row.output}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800 border-r border-slate-100">
                          {row.pj}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-medium text-slate-600 border-r border-slate-100 whitespace-nowrap">
                          {row.deadline}
                        </td>
                        <td className="py-3 px-3 text-center border-r border-slate-100">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-extrabold shadow-2xs ${
                            row.status === 'Selesai' 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                        {isEditMode && (
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center space-x-1">
                              <button
                                onClick={() => handleToggleDamsMtlStatus(row.no)}
                                className={`p-1.5 rounded transition-colors cursor-pointer ${
                                  row.status === 'Selesai' 
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' 
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                }`}
                                title={row.status === 'Selesai' ? 'Tandai On Progress' : 'Tandai Selesai'}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDamsMtl(row.no)}
                                className="p-1.5 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded border border-slate-200 transition-colors cursor-pointer"
                                title="Hapus MTL"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 gap-2">
              <span className="font-medium">
                Menampilkan <strong>{filteredDamsMtl.length}</strong> dari total <strong>{damsMtlList.length}</strong> Matriks Tindak Lanjut
              </span>
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                  <span>Selesai: Output terbit</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                  <span>On Progress: Proses penyelesaian</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- SUB-TAB: KATALOG HKT ----------------- */}
      {subTab === 'katalog-hkt' && (
        <div className="space-y-6" id="hkt-subtab">
          {/* Katalog IKU / HKT Grid Cards */}
          <KatalogIKU isEditMode={isEditMode} />
        </div>
      )}

      {/* ----------------- SUB-TAB: FEEDBACK KINERJA ----------------- */}
      {subTab === 'feedback-kinerja' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="feedback-kinerja-subtab">
          {/* Survey Input (5 columns) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-3">
              <ThumbsUp className="w-4 h-4 text-djpb-blue" />
              <h3 className="font-display font-bold text-slate-800 text-xs tracking-wide uppercase">Kirim Feedback Layanan</h3>
            </div>

            {surveySubmitted ? (
              <div className="py-8 text-center space-y-2 animate-in fade-in duration-300" id="survey-submitted-state">
                <Sparkles className="w-8 h-8 text-djpb-gold mx-auto animate-bounce" />
                <p className="text-xs font-bold text-slate-800">Terima Kasih Atas Feedback Anda!</p>
                <p className="text-[10px] text-slate-500 leading-relaxed">Saran Anda telah tersimpan dan akan dijadikan bahan tinjauan penilai kepatuhan pelayanan internal.</p>
              </div>
            ) : (
              <form onSubmit={handleSurveySubmit} className="space-y-4" id="feedback-perf-form">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Rating Penilaian Layanan (1-5)</label>
                  <div className="flex items-center space-x-1.5 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setPerfRating(star)}
                        className="p-1 text-amber-500 cursor-pointer"
                      >
                        <Star className={`w-6 h-6 ${star <= perfRating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase">Komentar / Usulan Perbaikan Layanan</label>
                  <textarea 
                    required rows={4}
                    className="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    placeholder="Sebutkan hal yang perlu ditingkatkan, contoh: Kualitas jaringan WiFi, Kebersihan ruang rapat Terubuk..."
                    value={perfComment}
                    onChange={(e) => setPerfComment(e.target.value)}
                  ></textarea>
                </div>

                <button
                  id="btn-submit-perf-feedback"
                  type="submit"
                  className="w-full py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Kirim Kepuasan Layanan
                </button>
              </form>
            )}
          </div>

          {/* Historical satisfaction score (7 columns) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
              Indikator Kepuasan Pengguna Layanan (CSAT) Bulanan
            </h3>

            <div className="h-64 w-full" id="csat-chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  <Bar dataKey="gkmScore" fill="#e5a93b" radius={[4, 4, 0, 0]} name="Skor Kepuasan Layanan (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 font-sans leading-tight">
              *Skor indeks kepuasan dihitung berdasarkan survei umpan balik seluruh satker mitra kerja Kanwil DJPb Provinsi Riau secara real-time. Target minimal Kemenkeu adalah <strong className="text-slate-800">85%</strong>.
            </p>
          </div>
        </div>
      )}


      {/* ----------------- MODAL FORMS ----------------- */}
      
      {/* Dams MTL Modal */}
      {showDamsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" id="dams-modal">
          <form onSubmit={handleAddDamsMtl} className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-display font-bold text-slate-800 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-djpb-blue" />
                <span>Tambah Data Matriks Tindak Lanjut (MTL)</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowDamsModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Perihal MTL</label>
                <input 
                  type="text" 
                  required
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-djpb-blue"
                  value={damsForm.perihal}
                  onChange={(e) => setDamsForm({ ...damsForm, perihal: e.target.value })}
                  placeholder="Contoh: Organisasi dan SDM yang Agile..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Uraian MTL</label>
                <textarea 
                  required 
                  rows={3}
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-djpb-blue"
                  placeholder="Deskripsi detail rencana kegiatan tindak lanjut..."
                  value={damsForm.uraian}
                  onChange={(e) => setDamsForm({ ...damsForm, uraian: e.target.value })}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Output / Hasil</label>
                  <input 
                    type="text" 
                    required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-djpb-blue"
                    value={damsForm.output}
                    onChange={(e) => setDamsForm({ ...damsForm, output: e.target.value })}
                    placeholder="Contoh: Nota Dinas, Sertifikat, Laporan"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Penanggung Jawab</label>
                  <input 
                    type="text" 
                    required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-djpb-blue"
                    value={damsForm.pj}
                    onChange={(e) => setDamsForm({ ...damsForm, pj: e.target.value })}
                    placeholder="Contoh: Bidang SKKI, Bagian Umum"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Batas Waktu Penyelesaian</label>
                  <input 
                    type="text" 
                    required
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-djpb-blue font-mono"
                    value={damsForm.deadline}
                    onChange={(e) => setDamsForm({ ...damsForm, deadline: e.target.value })}
                    placeholder="Contoh: Agustus 2026"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Keterangan / Status</label>
                  <select
                    className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-djpb-blue"
                    value={damsForm.status}
                    onChange={(e) => setDamsForm({ ...damsForm, status: e.target.value })}
                  >
                    <option value="On Progress">On Progress</option>
                    <option value="Selesai">Selesai</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowDamsModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-djpb-blue hover:bg-djpb-blue-light text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Simpan Data MTL
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
