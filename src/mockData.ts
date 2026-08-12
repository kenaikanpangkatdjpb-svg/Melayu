import {
  RoomBooking,
  ItemBooking,
  VehicleBooking,
  FacilityFeedback,
  MonthlyNeed,
  GKMAgreement,
  ScholarshipInfo,
  PerformanceMetric,
  WorkloadMetric,
  RealizationProgress,
  VisitorLog,
  SecurityShift,
  SecurityRosterItem,
  UserAccount
} from './types';

export const INITIAL_ROOM_BOOKINGS: RoomBooking[] = [
  {
    id: 'room-1',
    roomName: 'Aula Lancang Kuning',
    bookerName: 'Andi Wijaya',
    division: 'Bagian Umum',
    date: '2026-07-15',
    startTime: '08:30',
    endTime: '12:00',
    purpose: 'Rapat Koordinasi Wilayah Pelaksanaan Anggaran',
    equipmentNeeded: 'Sound System, Mic Wireless (2 pcs), Proyektor, Layar LED',
    status: 'Disetujui'
  },
  {
    id: 'room-2',
    roomName: 'Aula Zapin',
    bookerName: 'Siti Rahma',
    division: 'Bidang PPA I',
    date: '2026-07-15',
    startTime: '13:30',
    endTime: '15:30',
    purpose: 'Asistensi Penyusunan LKPD Pemerintah Daerah',
    equipmentNeeded: 'Proyektor Epson & Sound System',
    status: 'Disetujui'
  },
  {
    id: 'room-3',
    roomName: 'Soleram',
    bookerName: 'Rudi Hartono',
    division: 'Bidang SKKI',
    date: '2026-07-16',
    startTime: '09:00',
    endTime: '11:00',
    purpose: 'Review Internal Penilaian Kinerja Triwulan II',
    equipmentNeeded: 'Zoom Hybrid PC, Sound System, Mic Wireless',
    status: 'Pending'
  },
  {
    id: 'room-4',
    roomName: 'Gurindam',
    bookerName: 'Eka Lestari',
    division: 'Bidang PAPK',
    date: '2026-07-15',
    startTime: '10:00',
    endTime: '11:30',
    purpose: 'Sharing Session Penggunaan Aplikasi SAKTI',
    equipmentNeeded: 'Proyektor & Pointer Laser',
    status: 'Disetujui'
  }
];

export const INITIAL_ITEM_BOOKINGS: ItemBooking[] = [
  {
    id: 'item-1',
    itemName: 'Proyektor Epson 4K',
    bookerName: 'Andi Wijaya',
    division: 'Bagian Umum',
    date: '2026-07-15',
    quantity: 1,
    status: 'Dipinjam',
    statusNote: 'Sudah diambil di Subbag Rumah Tangga'
  },
  {
    id: 'item-2',
    itemName: 'Sound System Portable 100W',
    bookerName: 'Dewi Lestari',
    division: 'Bidang PAPK',
    date: '2026-07-15',
    quantity: 1,
    status: 'Dipinjam',
    statusNote: 'Dipinjam untuk acara sosialisasi di Aula Zapin'
  },
  {
    id: 'item-3',
    itemName: 'Pointer Presentasi Logitech',
    bookerName: 'Siti Rahma',
    division: 'Bidang PPA I',
    date: '2026-07-15',
    quantity: 1,
    status: 'Dipinjam',
    statusNote: 'Siap dikembalikan sore hari'
  },
  {
    id: 'item-4',
    itemName: 'Laptop Dinas Dell Latitude',
    bookerName: 'Hendra Saputra',
    division: 'Bidang PAPK',
    date: '2026-07-17',
    quantity: 2,
    status: 'Pending',
    statusNote: 'Menunggu persetujuan Bagian Umum'
  }
];

export const INITIAL_VEHICLE_BOOKINGS: VehicleBooking[] = [
  {
    id: 'v-1',
    vehicleName: 'Toyota Kijang Innova BM 1679 T',
    plateNumber: 'BM 1679 T',
    driverName: 'Pak Budi',
    bookerName: 'Kepala Kanwil',
    destination: 'Kantor Gubernur Riau, Pekanbaru',
    date: '2026-07-15',
    durationDays: 1,
    status: 'Disetujui'
  },
  {
    id: 'v-2',
    vehicleName: 'Toyota Kijang Innova Reborn B 1932 PQS',
    plateNumber: 'B 1932 PQS',
    driverName: 'Pak Agus',
    bookerName: 'Tim PPA II',
    destination: 'KPPN Pekanbaru',
    date: '2026-07-15',
    durationDays: 1,
    status: 'Disetujui'
  },
  {
    id: 'v-3',
    vehicleName: 'Wuling Cortez BM 1888 T',
    plateNumber: 'BM 1888 T',
    driverName: 'Pak Hendra',
    bookerName: 'Kabid PAPK',
    destination: 'Dinas Pengelola Keuangan Kabupaten Kampar',
    date: '2026-07-16',
    durationDays: 2,
    status: 'Pending'
  }
];

export const INITIAL_FACILITY_FEEDBACK: FacilityFeedback[] = [
  {
    id: 'f-1',
    category: 'AC',
    reporterName: 'Supriadi',
    reporterDivision: 'Bidang PPA II',
    description: 'AC di Ruang Rapat Melati kurang dingin, mohon dicek freonnya.',
    rating: 2,
    date: '2026-07-14',
    status: 'In Progress'
  },
  {
    id: 'f-2',
    category: 'Kebersihan',
    reporterName: 'Wulan',
    reporterDivision: 'Bidang PAPK',
    description: 'Tempat sampah di toilet lantai 2 sudah penuh dan belum dikosongkan.',
    rating: 3,
    date: '2026-07-14',
    status: 'Resolved'
  },
  {
    id: 'f-3',
    category: 'IT / Jaringan',
    reporterName: 'Rian',
    reporterDivision: 'Bidang SKKI',
    description: 'Koneksi internet Wi-Fi Kanwil-Public sering disconnect di pojok ruangan.',
    rating: 2,
    date: '2026-07-13',
    status: 'Open'
  },
  {
    id: 'f-4',
    category: 'Ruangan',
    reporterName: 'Aris',
    reporterDivision: 'Bagian Umum',
    description: 'Engsel pintu masuk Aula Lancang Kuning berbunyi derit keras saat dibuka.',
    rating: 4,
    date: '2026-07-12',
    status: 'Resolved'
  }
];

export const INITIAL_MONTHLY_NEEDS: MonthlyNeed[] = [
  {
    id: 'need-1',
    itemName: 'Kertas HVS A4 80gr Sinar Dunia',
    category: 'ATK',
    quantity: 30,
    unit: 'Rim',
    estimatedPrice: 55000,
    urgency: 'Tinggi',
    status: 'Disetujui'
  },
  {
    id: 'need-2',
    itemName: 'Tinta Printer Epson L3110 Black original',
    category: 'ATK',
    quantity: 10,
    unit: 'Botol',
    estimatedPrice: 110000,
    urgency: 'Tinggi',
    status: 'Disetujui'
  },
  {
    id: 'need-3',
    itemName: 'Air Mineral Gelas AXO 240ml',
    category: 'Konsumsi',
    quantity: 25,
    unit: 'Dus',
    estimatedPrice: 28000,
    urgency: 'Sedang',
    status: 'Diusulkan'
  },
  {
    id: 'need-4',
    itemName: 'Kabel HDMI Gold Plated 5 Meter',
    category: 'Sarpras',
    quantity: 3,
    unit: 'Pcs',
    estimatedPrice: 125000,
    urgency: 'Rendah',
    status: 'Diusulkan'
  }
];

export const INITIAL_GKM_AGREEMENTS: GKMAgreement[] = [
  {
    id: 'gkm-1',
    roomAndMedia: 'LESTARI (Learning Station)',
    presenter: 'Nur Asri',
    topic: 'Sosialisasi Peraturan Implementasi Kinerja',
    date: '16 April 2026',
    startTime: '1:30:00 PM',
    endTime: '2:00:00 PM',
    pic: 'Bidang PAPK',
    participantsCount: 42,
    summary: 'Sosialisasi Peraturan Implementasi Kinerja Pegawai di lingkungan Kanwil DJPb Riau.'
  },
  {
    id: 'gkm-2',
    roomAndMedia: 'LESTARI (Learning Station)',
    presenter: 'Karno Pandu dan Dewi',
    topic: 'Peran penting inovasi di DJPb',
    date: '8 Juli 2026',
    startTime: '9:00:00 AM',
    endTime: '10:00:00 AM',
    pic: 'Bidang SKKI',
    participantsCount: 50,
    summary: 'Diskusi peran penting inovasi dan efisiensi tata kelola di DJPb.'
  },
  {
    id: 'gkm-3',
    roomAndMedia: 'LESTARI (Learning Station)',
    presenter: 'Ahmad Nauval dan Tim',
    topic: 'Layanan Umum Melalui Digitalisasi',
    date: '1 Juli 2026',
    startTime: '3:00:00 PM',
    endTime: '4:00:00 PM',
    pic: 'Bagian Umum',
    participantsCount: 38,
    summary: 'Pemaparan portal media layanan umum berbasis digital di Kanwil DJPb Riau.'
  }
];

export const INITIAL_SCHOLARSHIPS: ScholarshipInfo[] = [
  {
    id: 'sch-1',
    name: 'Beasiswa LPDP Kemenkeu - S2/S3 Dalam & Luar Negeri',
    provider: 'Lembaga Pengelola Dana Pendidikan',
    degree: 'S2',
    deadline: '2026-08-31',
    description: 'Program beasiswa penuh untuk PNS Kementerian Keuangan guna menempuh studi lanjut di universitas unggulan dunia.',
    eligibility: ['PNS Aktif minimal 2 tahun masa kerja', 'IPK minimal 3.00', 'TOEFL iBT 80 atau IELTS 6.5', 'Usia maksimal 37 tahun']
  },
  {
    id: 'sch-2',
    name: 'STIS (AAS) Australia Awards Scholarship',
    provider: 'Pemerintah Australia',
    degree: 'S2',
    deadline: '2026-09-15',
    description: 'Beasiswa dari Pemerintah Australia untuk pembangunan kapasitas SDM di bidang kebijakan publik, ekonomi keuangan, dan digitalisasi sektor publik.',
    eligibility: ['PNS Kemenkeu bidang terkait', 'IELTS minimal 6.0', 'Proposal riset / rencana kontribusi bagi instansi']
  }
];

export const INITIAL_PERFORMANCE_METRICS: PerformanceMetric[] = [
  { month: 'Jan', target: 92, realization: 94.5, gkmScore: 90 },
  { month: 'Feb', target: 92, realization: 93.8, gkmScore: 92 },
  { month: 'Mar', target: 92, realization: 95.2, gkmScore: 95 },
  { month: 'Apr', target: 94, realization: 94.1, gkmScore: 91 },
  { month: 'May', target: 94, realization: 96.0, gkmScore: 93 },
  { month: 'Jun', target: 94, realization: 97.4, gkmScore: 96 },
  { month: 'Jul', target: 95, realization: 96.8, gkmScore: 94 }
];

export const INITIAL_WORKLOAD_METRICS: WorkloadMetric[] = [
  { division: 'Bagian Umum', employeeCount: 12, activeTasks: 48, loadPercentage: 85 },
  { division: 'Bidang PPA I', employeeCount: 8, activeTasks: 32, loadPercentage: 78 },
  { division: 'Bidang PPA II', employeeCount: 9, activeTasks: 35, loadPercentage: 81 },
  { division: 'Bidang PAPK', employeeCount: 10, activeTasks: 42, loadPercentage: 88 },
  { division: 'Bidang SKKI', employeeCount: 6, activeTasks: 18, loadPercentage: 65 }
];

export const INITIAL_REALIZATION_PROGRESS: RealizationProgress[] = [
  { category: 'Belanja Pegawai', allocated: 8500000000, realized: 4675000000 },
  { category: 'Belanja Barang Operasional', allocated: 4200000000, realized: 2310000000 },
  { category: 'Belanja Barang Non-Operasional', allocated: 1800000000, realized: 980000000 },
  { category: 'Belanja Modal', allocated: 1200000000, realized: 450000000 }
];

export const INITIAL_VISITOR_LOGS: VisitorLog[] = [
  {
    id: 'vis-1',
    name: 'M. Yusuf',
    institution: 'BPKAD Provinsi Riau',
    purpose: 'Konsolidasi LKPD Unaudited',
    visitDate: '2026-07-15',
    visitTime: '09:15',
    destinationDivision: 'Bidang PAPK',
    keyCardNumber: 'CARD-04'
  },
  {
    id: 'vis-2',
    name: 'Siti Aminah',
    institution: 'KPPN Pekanbaru',
    purpose: 'Penyerahan Laporan Kepatuhan Internal',
    visitDate: '2026-07-15',
    visitTime: '10:30',
    destinationDivision: 'Bidang SKKI',
    keyCardNumber: 'CARD-12'
  }
];

export const INITIAL_SECURITY_SHIFTS: SecurityShift[] = [
  { day: 'Senin', shiftMorning: 'Sertu Dani / Prasetyo', shiftEvening: 'Agus / Jaka', shiftNight: 'Rudi / Slamet' },
  { day: 'Selasa', shiftMorning: 'Rudi / Slamet', shiftEvening: 'Sertu Dani / Prasetyo', shiftNight: 'Agus / Jaka' },
  { day: 'Rabu', shiftMorning: 'Agus / Jaka', shiftEvening: 'Rudi / Slamet', shiftNight: 'Sertu Dani / Prasetyo' },
  { day: 'Kamis', shiftMorning: 'Sertu Dani / Prasetyo', shiftEvening: 'Agus / Jaka', shiftNight: 'Rudi / Slamet' },
  { day: 'Jumat', shiftMorning: 'Rudi / Slamet', shiftEvening: 'Sertu Dani / Prasetyo', shiftNight: 'Agus / Jaka' },
  { day: 'Sabtu', shiftMorning: 'Agus / Jaka', shiftEvening: 'Rudi / Slamet', shiftNight: 'Sertu Dani / Prasetyo' },
  { day: 'Minggu', shiftMorning: 'Sertu Dani / Prasetyo', shiftEvening: 'Agus / Jaka', shiftNight: 'Rudi / Slamet' }
];

export const INITIAL_SECURITY_ROSTER: SecurityRosterItem[] = [
  // SABTU, 1.8.2026
  { id: 'ros-1', name: 'ARIEF', dateStr: 'SABTU/ 1 Agustus 2026', location: 'KANWIL DJPB', hours: '06.00/18.00' },
  { id: 'ros-2', name: 'ROBBY', dateStr: 'SABTU/ 1 Agustus 2026', location: 'KANWIL DJPB', hours: '06.00/18.00' },
  { id: 'ros-3', name: 'ADITYA', dateStr: 'SABTU/ 1 Agustus 2026', location: 'KANWIL DJPB', hours: '18.00/06.00' },
  { id: 'ros-4', name: 'ERWIN', dateStr: 'SABTU/ 1 Agustus 2026', location: 'KANWIL DJPB', hours: '18.00/06.00' },
  { id: 'ros-5', name: 'RATMANSYAH', dateStr: 'SABTU/ 1 Agustus 2026', location: 'RUMAH DINAS', hours: '18.00/06.00' },
  { id: 'ros-6', name: 'DIAN ARI', dateStr: 'SABTU/ 1 Agustus 2026', location: 'LIBUR', hours: '-' },

  // MINGGU, 2.8.2026
  { id: 'ros-7', name: 'ROBBY', dateStr: 'MINGGU/ 2 Agustus 2026', location: 'KANWIL DJPB', hours: '06.00/18.00' },
  { id: 'ros-8', name: 'DIAN ARI', dateStr: 'MINGGU/ 2 Agustus 2026', location: 'KANWIL DJPB', hours: '06.00/18.00' },
  { id: 'ros-9', name: 'ERWIN', dateStr: 'MINGGU/ 2 Agustus 2026', location: 'KANWIL DJPB', hours: '18.00/06.00' },
  { id: 'ros-10', name: 'RATMANSYAH', dateStr: 'MINGGU/ 2 Agustus 2026', location: 'KANWIL DJPB', hours: '18.00/06.00' },
  { id: 'ros-11', name: 'ARIEF', dateStr: 'MINGGU/ 2 Agustus 2026', location: 'RUMAH DINAS', hours: '18.00/06.00' },
  { id: 'ros-12', name: 'ADITYA', dateStr: 'MINGGU/ 2 Agustus 2026', location: 'LIBUR', hours: '-' },

  // SENIN, 3.8.2026
  { id: 'ros-13', name: 'DIAN ARI', dateStr: 'SENIN/ 3 Agustus 2026', location: 'KANWIL DJPB', hours: '06.00/18.00' },
  { id: 'ros-14', name: 'ADITYA', dateStr: 'SENIN/ 3 Agustus 2026', location: 'KANWIL DJPB', hours: '06.00/18.00' },
  { id: 'ros-15', name: 'RATMANSYAH', dateStr: 'SENIN/ 3 Agustus 2026', location: 'KANWIL DJPB', hours: '18.00/06.00' },
  { id: 'ros-16', name: 'ARIEF', dateStr: 'SENIN/ 3 Agustus 2026', location: 'KANWIL DJPB', hours: '18.00/06.00' },
  { id: 'ros-17', name: 'ROBBY', dateStr: 'SENIN/ 3 Agustus 2026', location: 'RUMAH DINAS', hours: '18.00/06.00' },
  { id: 'ros-18', name: 'ERWIN', dateStr: 'SENIN/ 3 Agustus 2026', location: 'LIBUR', hours: '-' }
];

export const INITIAL_USERS: UserAccount[] = [
  { id: 'PEG-001', employeeId: 'PEG-001', fullName: 'DWI SUPRIYONO', username: 'dwi', password: 'dwi123', role: 'Administrator', status: 'Aktif' },
  { id: 'PEG-002', employeeId: 'PEG-002', fullName: 'SEPTINA PUSPA PRABOWO', username: 'septina', password: 'septina123', role: 'Pegawai', status: 'Aktif' },
  { id: 'PEG-003', employeeId: 'PEG-003', fullName: 'ABDUL AZIZ KUSBIANTORO', username: 'aziz', password: 'user123', role: 'Pegawai', status: 'Aktif' },
  { id: 'PEG-004', employeeId: 'PEG-004', fullName: 'ANDHI WIBOWO', username: 'andhi', password: 'user123', role: 'Pegawai', status: 'Aktif' },
  { id: 'PEG-005', employeeId: 'PEG-005', fullName: 'BUDI SANTOSO', username: 'budi', password: 'user123', role: 'Pegawai', status: 'Aktif' },
  { id: 'PEG-006', employeeId: 'PEG-006', fullName: 'SITI AMINAH', username: 'siti', password: 'user123', role: 'Pegawai', status: 'Aktif' },
  { id: 'PEG-007', employeeId: 'PEG-007', fullName: 'HENDRA WIJAYA', username: 'hendra', password: 'user123', role: 'Pegawai', status: 'Aktif' },
  { id: 'PEG-008', employeeId: 'PEG-008', fullName: 'RINA WATI', username: 'rina', password: 'user123', role: 'Pegawai', status: 'Aktif' },
  { id: 'PEG-009', employeeId: 'PEG-009', fullName: 'AHMAD FAUZI', username: 'ahmad', password: 'user123', role: 'Pegawai', status: 'Aktif' },
];


// Helper to convert formatted currency
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}
