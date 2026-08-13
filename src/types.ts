export interface RoomBooking {
  id: string;
  roomName: string;
  bookerName: string;
  division: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  equipmentNeeded?: string;
  status: 'Disetujui' | 'Pending' | 'Ditolak';
  statusNote?: string;
}

export interface ItemBooking {
  id: string;
  itemName: string;
  bookerName: string;
  division: string;
  date: string;
  quantity: number;
  status: 'Dipinjam' | 'Kembali' | 'Pending' | 'Ditolak';
  statusNote?: string;
}

export interface VehicleBooking {
  id: string;
  vehicleName: string;
  plateNumber: string;
  driverName: string;
  driverOption?: 'Dengan Supir' | 'Tanpa Supir';
  bookerName: string;
  destination: string;
  date: string;
  durationDays: number;
  status: 'Pending' | 'Disetujui' | 'Ditolak' | 'Selesai';
  statusNote?: string;
}

export interface FacilityFeedback {
  id: string;
  category: 'Ruangan' | 'AC' | 'Kebersihan' | 'IT / Jaringan' | 'Lainnya';
  reporterName: string;
  reporterDivision: string;
  description: string;
  rating: number;
  date: string;
  status: 'Open' | 'In Progress' | 'Resolved';
}

export interface MonthlyNeed {
  id: string;
  itemName: string;
  category: 'ATK' | 'Konsumsi' | 'Sarpras' | 'Lain-lain';
  quantity: number;
  unit: string;
  estimatedPrice: number;
  urgency: 'Tinggi' | 'Sedang' | 'Rendah';
  status: 'Diusulkan' | 'Disetujui' | 'Dibatalkan';
}

export interface GKMAgreement {
  id: string;
  roomAndMedia?: string;
  topic: string;
  presenter: string;
  date: string;
  startTime?: string;
  endTime?: string;
  pic?: string;
  participantsCount?: number;
  summary?: string;
  attachmentUrl?: string;
}

export interface ScholarshipInfo {
  id: string;
  name: string;
  provider: string;
  degree: 'S1' | 'S2' | 'S3' | 'Short Course' | string;
  deadline: string;
  description: string;
  eligibility: string[];
}

export interface PerformanceMetric {
  month: string;
  target: number;
  realization: number;
  gkmScore: number;
}

export interface WorkloadMetric {
  division: string;
  employeeCount: number;
  activeTasks: number;
  loadPercentage: number;
}

export interface RealizationProgress {
  id?: string;
  category: string;
  allocated: number;
  realized: number;
}

export interface VisitorLog {
  id: string;
  name: string;
  institution: string;
  purpose: string;
  visitDate: string;
  visitTime: string;
  destinationDivision: string;
  keyCardNumber?: string;
}

export interface SecurityShift {
  id?: string;
  day: string;
  shiftMorning: string;
  shiftEvening: string;
  shiftNight: string;
}

export interface SecurityRosterItem {
  id: string;
  name: string;
  dateStr: string;
  location: 'KANWIL DJPB' | 'RUMAH DINAS' | 'LIBUR' | string;
  hours: string;
}

export interface CurrentUser {
  username: string;
  fullName: string;
  role: 'admin' | 'user';
  division: string;
}

export interface UserAccount {
  id: string;
  employeeId: string;
  fullName: string;
  username: string;
  password?: string;
  role: 'Administrator' | 'Pegawai';
  status: 'Aktif' | 'Nonaktif';
}

