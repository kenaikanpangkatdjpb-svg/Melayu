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
  UserAccount,
  ActivityGalleryItem
} from './types';

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getRelativeDateStr = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TODAY_STR = getTodayStr();
const YESTERDAY_STR = getRelativeDateStr(-1);
const TOMORROW_STR = getRelativeDateStr(1);

export const INITIAL_ROOM_BOOKINGS: RoomBooking[] = [
  {
    id: 'room-1',
    roomName: 'Aula Lancang Kuning',
    bookerName: 'Andi Wijaya',
    division: 'Bagian Umum',
    date: TODAY_STR,
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
    date: TODAY_STR,
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
    date: TOMORROW_STR,
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
    date: YESTERDAY_STR,
    startTime: '10:00',
    endTime: '11:30',
    purpose: 'Sharing Session Penggunaan Aplikasi SAKTI (Kemarin)',
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
    date: TODAY_STR,
    quantity: 1,
    status: 'Dipinjam',
    statusNote: 'Sudah diambil di Subbag Rumah Tangga'
  },
  {
    id: 'item-2',
    itemName: 'Sound System Portable 100W',
    bookerName: 'Dewi Lestari',
    division: 'Bidang PAPK',
    date: TODAY_STR,
    quantity: 1,
    status: 'Dipinjam',
    statusNote: 'Dipinjam untuk acara sosialisasi di Aula Zapin'
  },
  {
    id: 'item-3',
    itemName: 'Pointer Presentasi Logitech',
    bookerName: 'Siti Rahma',
    division: 'Bidang PPA I',
    date: YESTERDAY_STR,
    quantity: 1,
    status: 'Dipinjam',
    statusNote: 'Sudah dikembalikan (Kemarin)'
  },
  {
    id: 'item-4',
    itemName: 'Laptop Dinas Dell Latitude',
    bookerName: 'Hendra Saputra',
    division: 'Bidang PAPK',
    date: TOMORROW_STR,
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
    driverName: 'Dengan Supir',
    driverOption: 'Dengan Supir',
    bookerName: 'Kepala Kanwil',
    destination: 'Kantor Gubernur Riau, Pekanbaru',
    date: TODAY_STR,
    durationDays: 1,
    status: 'Disetujui'
  },
  {
    id: 'v-2',
    vehicleName: 'Toyota Kijang Innova Reborn B 1932 PQS',
    plateNumber: 'B 1932 PQS',
    driverName: 'Dengan Supir',
    driverOption: 'Dengan Supir',
    bookerName: 'Tim PPA II',
    destination: 'KPPN Pekanbaru',
    date: TODAY_STR,
    durationDays: 1,
    status: 'Disetujui'
  },
  {
    id: 'v-3',
    vehicleName: 'Wuling Cortez BM 1888 T',
    plateNumber: 'BM 1888 T',
    driverName: 'Dengan Supir',
    driverOption: 'Dengan Supir',
    bookerName: 'Kabid PAPK',
    destination: 'Dinas Pengelola Keuangan Kabupaten Kampar',
    date: TOMORROW_STR,
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

const DAYS_OF_WEEK = ['SABTU', 'MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];

// 6-day rotation patterns for security guard shifts:
// Position 1: KANWIL DJPB (06.00/18.00)
// Position 2: KANWIL DJPB (06.00/18.00)
// Position 3: KANWIL DJPB (18.00/06.00)
// Position 4: KANWIL DJPB (18.00/06.00)
// Position 5: RUMAH DINAS (18.00/06.00)
// Position 6: LIBUR (-)
const ROTATION_PATTERNS = [
  ['ARIEF', 'ROBBY', 'ADITYA', 'ERWIN', 'RATMANSYAH', 'DIAN ARI'],
  ['ROBBY', 'DIAN ARI', 'ERWIN', 'RATMANSYAH', 'ARIEF', 'ADITYA'],
  ['DIAN ARI', 'ADITYA', 'RATMANSYAH', 'ARIEF', 'ROBBY', 'ERWIN'],
  ['ADITYA', 'ERWIN', 'ARIEF', 'ROBBY', 'DIAN ARI', 'RATMANSYAH'],
  ['ERWIN', 'RATMANSYAH', 'ROBBY', 'DIAN ARI', 'ADITYA', 'ARIEF'],
  ['RATMANSYAH', 'ARIEF', 'DIAN ARI', 'ADITYA', 'ERWIN', 'ROBBY'],
];

export function generateAugustSecurityRoster(): SecurityRosterItem[] {
  const roster: SecurityRosterItem[] = [];
  let idCounter = 1;

  for (let day = 1; day <= 31; day++) {
    const dayOfWeek = DAYS_OF_WEEK[(day - 1) % 7];
    const dateStr = `${dayOfWeek}/ ${day} Agustus 2026`;
    const pattern = ROTATION_PATTERNS[(day - 1) % 6];

    roster.push(
      { id: `ros-${String(idCounter).padStart(3, '0')}`, orderIndex: idCounter - 1, name: pattern[0], dateStr, location: 'KANWIL DJPB', hours: '06.00/18.00' },
      { id: `ros-${String(idCounter + 1).padStart(3, '0')}`, orderIndex: idCounter, name: pattern[1], dateStr, location: 'KANWIL DJPB', hours: '06.00/18.00' },
      { id: `ros-${String(idCounter + 2).padStart(3, '0')}`, orderIndex: idCounter + 1, name: pattern[2], dateStr, location: 'KANWIL DJPB', hours: '18.00/06.00' },
      { id: `ros-${String(idCounter + 3).padStart(3, '0')}`, orderIndex: idCounter + 2, name: pattern[3], dateStr, location: 'KANWIL DJPB', hours: '18.00/06.00' },
      { id: `ros-${String(idCounter + 4).padStart(3, '0')}`, orderIndex: idCounter + 3, name: pattern[4], dateStr, location: 'RUMAH DINAS', hours: '18.00/06.00' },
      { id: `ros-${String(idCounter + 5).padStart(3, '0')}`, orderIndex: idCounter + 4, name: pattern[5], dateStr, location: 'LIBUR', hours: '-' }
    );
    idCounter += 6;
  }

  return roster;
}

export const INITIAL_SECURITY_ROSTER: SecurityRosterItem[] = generateAugustSecurityRoster();

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

export const INITIAL_ACTIVITY_GALLERY: ActivityGalleryItem[] = [
  {
    id: 'act-001',
    title: 'Rapat Koordinasi Daerah (RAKORDA) Pelaksanaan Anggaran Kanwil DJPb Riau TA 2026',
    date: '2026-08-10',
    division: 'Bidang PPA I & Bagian Umum',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&w=1200&q=80',
    additionalPhotos: [
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80'
    ],
    category: 'Rapat & Forum',
    narration: 'Kanwil Ditjen Perbendaharaan Provinsi Riau menyelenggarakan Rapat Koordinasi Daerah (RAKORDA) Pelaksanaan Anggaran Semester I Tahun 2026 di Aula Lancang Kuning. Acara dihadiri oleh seluruh pimpinan Satker mitra kerja dan KPPN se-wilayah Riau guna memperkuat sinergi akselerasi belanja negara yang akuntabel, tepat sasaran, serta berdaya dorong optimal bagi pertumbuhan ekonomi daerah.',
    authorName: 'Tim Humas & TI Kanwil DJPb Riau',
    createdAt: '2026-08-10T14:30:00Z',
    location: 'Aula Lancang Kuning, Kanwil DJPb Prov. Riau',
    tags: ['Rakorda', 'IKPA', 'Perbendaharaan', 'APBN']
  },
  {
    id: 'act-002',
    title: 'Gugus Kendali Mutu (GKM) Internalisasi Budaya Kerja BerAKHLAK & Zona Integritas WBBM',
    date: '2026-08-08',
    division: 'Subbagian Kepegawaian & SKKI',
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    category: 'GKM Kepegawaian',
    narration: 'Kegiatan rutin Gugus Kendali Mutu (GKM) yang diinisiasi oleh Subbagian Kepegawaian dan Tim Pembangunan ZI-WBBM. Mengusung tema "Penguatan Integritas dan Pelayanan Prima", kegiatan ini mempertegas komitmen seluruh pejabat dan pegawai dalam menerapkan nilai-nilai BerAKHLAK serta menolak gratifikasi dalam seluruh rantai layanan publik.',
    authorName: 'Septina Puspa Prabowo',
    createdAt: '2026-08-08T10:15:00Z',
    location: 'Ruang Rapat Zapin & Media Zoom Hybrid',
    tags: ['GKM', 'BerAKHLAK', 'WBBM', 'Kepegawaian']
  },
  {
    id: 'act-003',
    title: 'Sosialisasi Digitalisasi Pembayaran & Penguatan Kartu Kredit Pemerintah (KKP) Domestik',
    date: '2026-08-04',
    division: 'Bidang PPA II & KPPN Pekanbaru',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    category: 'Sosialisasi & Edukasi',
    narration: 'Bimbingan teknis dan sosialisasi implementasi KKP Domestik serta optimalisasi platform Digipay Satu bersama Pejabat Pembuat Komitmen (PPK) dan Bendahara Pengeluaran satuan kerja kementerian/lembaga. Langkah ini mempercepat modernisasi transaksi non-tunai pemerintah dan memberdayakan UMKM lokal.',
    authorName: 'Bidang PPA II',
    createdAt: '2026-08-04T16:00:00Z',
    location: 'Hotel Pangeran Pekanbaru',
    tags: ['KKP', 'Digipay', 'Digitalisasi', 'Cashless']
  },
  {
    id: 'act-004',
    title: 'Bakti Sosial & Santunan Peduli Kemenkeu Satu Riau Menyambut Hari Kemerdekaan RI',
    date: '2026-08-02',
    division: 'Dharma Wanita Persatuan (DWP) & Bagian Umum',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80',
    category: 'Bakti Sosial & Dharma Wanita',
    narration: 'Dalam rangka memeriahkan peringatan Kemerdekaan Republik Indonesia, DWP Kanwil DJPb Provinsi Riau menggelar aksi kepedulian sosial berupa penyerahan puluhan paket sembako dan perlengkapan sekolah bagi anak-anak di panti asuhan serta warga sekitar, sebagai wujud nyata bakti sosial Kemenkeu Mengabdi.',
    authorName: 'Pengurus DWP DJPb Riau',
    createdAt: '2026-08-02T11:45:00Z',
    location: 'Panti Asuhan Fajar Harapan, Pekanbaru',
    tags: ['Bakti Sosial', 'DWP', 'Kemenkeu Mengabdi', 'HUT RI']
  },
  {
    id: 'act-005',
    title: 'Senam Kebugaran Jasmani Bersama & Turnamen Olahraga Insan Perbendaharaan Riau',
    date: '2026-07-31',
    division: 'Bapor DJPb Riau & Bagian Umum',
    mediaType: 'video',
    mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80',
    category: 'Olahraga & Seni',
    narration: 'Guna menjaga kesehatan raga, semangat kerja, dan keakraban antar pegawai, Kanwil DJPb Riau menggelar senam kesegaran jasmani bersama yang diikuti antusias oleh seluruh staf dan pejabat struktural di lapangan terbuka kantor, dirangkaikan dengan laga persahabatan tenis meja dan bulutangkis.',
    authorName: 'Tim Bapor Kanwil DJPb Riau',
    createdAt: '2026-07-31T08:30:00Z',
    location: 'Halaman & Lapangan Kanwil DJPb Riau',
    tags: ['Senam Sehat', 'Olahraga', 'WorkLifeBalance', 'Kebersamaan']
  },
  {
    id: 'act-006',
    title: 'Kunjungan Kerja Edukatif & Pembinaan Pengelolaan Keuangan Desa di Kabupaten Kampar',
    date: '2026-07-25',
    division: 'Bidang PAPK & Tim Monev Desa',
    mediaType: 'photo',
    mediaUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    category: 'Kunjungan Kerja',
    narration: 'Tim Monitoring dan Evaluasi Penyaluran Transfer ke Daerah (TKD) Kanwil DJPb Riau melakukan kunjungan kerja lapangan dan asistensi pengelolaan Dana Desa kepada perangkat desa di Kabupaten Kampar untuk memastikan transparansi realisasi dan ketepatan pemanfaatan dana bagi kesejahteraan masyarakat.',
    authorName: 'Bidang PAPK',
    createdAt: '2026-07-25T15:20:00Z',
    location: 'Kantor Bupati Kampar & Balai Desa Mitra',
    tags: ['TKD', 'Dana Desa', 'Kunjungan Kerja', 'Monev']
  }
];


// Helper to convert formatted currency
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amount);
}
