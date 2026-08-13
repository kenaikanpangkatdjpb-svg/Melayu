import React, { useState, useMemo } from 'react';
import { Search, Download, Upload, Filter, AlertTriangle, Check, RefreshCw, FileSpreadsheet, Eye, Tag, Trash2, Trash, AlertCircle, X } from 'lucide-react';
import * as XLSX from 'xlsx';

export interface MatrixRowData {
  id: string;
  nama: string;
  isYellow?: boolean;
  records: {
    [dateKey: string]: {
      hadir: 'Ada' | 'Tidak';
      pulang: 'Ada' | 'Tidak';
    };
  };
}

// Default 90 employees matching the user's provided Excel matrix screenshot
export const INITIAL_CEK_SERIBU_MATRIX: MatrixRowData[] = [
  {
    id: 'csr-1', nama: 'Abil Fikri Audia', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-2', nama: 'Achmad Djunaidi', isYellow: true,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-3', nama: 'Ade Wahyu Susanto', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-4', nama: 'Ahmad Nauval', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-5', nama: 'Ahmad Widyarma', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-6', nama: 'Ahmad Yusuf', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-7', nama: 'Aldi Putra Hernandes', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Tidak' } }
  },
  {
    id: 'csr-8', nama: 'Alni Agustin', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-9', nama: 'Alviza Fadiya Putri', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-10', nama: 'Amylia Febriyanti', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Tidak' } }
  },
  {
    id: 'csr-11', nama: 'Anang Surya Widayanto', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-12', nama: 'Andi Mulyadi', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-13', nama: 'Angga Firmansyah', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Tidak' } }
  },
  {
    id: 'csr-14', nama: 'Aprina Elisabeth Br Manik', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-15', nama: 'Asep Rudi', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Tidak' } }
  },
  {
    id: 'csr-16', nama: 'Atalia Manurung', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-17', nama: 'Audy Morenta Tatyana Girsang', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-18', nama: 'Ayu Pramita', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-19', nama: 'Betrice Mega Maria Br Pakpahan', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-20', nama: 'Bulan Indah Purnama Siregar', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Tidak' } }
  },
  {
    id: 'csr-21', nama: 'Charis Danindra Charya Nadiaskara', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-22', nama: 'Dea Ivana Christi Br. Ginting', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-23', nama: 'Denny Aulia', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-24', nama: 'Devina Rosa Sitepu', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-25', nama: 'Dicky Priatama', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-26', nama: 'Dirga Paul Samuelson Situmorang', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Tidak' } }
  },
  {
    id: 'csr-27', nama: 'Ditta Arbilla Pratiwi', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-28', nama: 'Donny Sulastiawan', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-29', nama: 'Dwi Prioatmaji', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-30', nama: 'Eko Sambas Priyatna', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-31', nama: 'Eko Supriyanto', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-32', nama: 'Elisa', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-33', nama: 'Elsa Natalia Situmorang', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-34', nama: 'Elyas Setyantoro', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-35', nama: 'Ernita', isYellow: true,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-36', nama: 'Fani Nurfadila Nastitie Ariawan', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Tidak' } }
  },
  {
    id: 'csr-37', nama: 'Farhan Ikram Rahimy', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-38', nama: 'Febri Anastasia Simanjuntak', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-39', nama: 'Fewia Zikri Ramadhani', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-40', nama: 'Firza Yulianti', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-41', nama: 'Franklin Sipayung', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-42', nama: 'Frans Matthew Manurung', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-43', nama: 'Frans Ricky Haholongan Butar Butar', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Tidak' } }
  },
  {
    id: 'csr-44', nama: 'Frediek Mulawan', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-45', nama: 'Gandis Nareswari', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-46', nama: 'Gatut Priyo Sembodo', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-47', nama: 'Halim', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-48', nama: 'Hermawan Saptono', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-49', nama: 'Indra Faizal', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-50', nama: 'Irene Aritonang', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-51', nama: 'Judhistira Adi Noegraha', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-52', nama: 'Kamelia Ulfa', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-53', nama: 'Karno Pandu Wibowo', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-54', nama: 'Kartika Chandra', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-55', nama: 'Kurnia Fitri Anidya', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-56', nama: 'Lina Armila', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-57', nama: 'Mahbub Ulhaq', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-58', nama: 'Maria Siska Tinambunan', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-59', nama: 'Maulana Gilang Firdaus', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-60', nama: 'Meda Febriana Aquares', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-61', nama: 'Michael Amstrong Sidabutar', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-62', nama: 'Mirza Rahmat Suharta', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-63', nama: 'Mohammad Firdaus', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-64', nama: 'Muhammad Ali Mutohar', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-65', nama: 'Nanang Heru Setyo Purdianto', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-66', nama: 'Nila Anggraini', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-67', nama: 'Nindia Dita Putri', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-68', nama: 'Novrenti Yosephine Br. Perangin-Angin', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-69', nama: 'Nur Asri', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-70', nama: 'Ot Hendri Fitrahadi', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-71', nama: 'Puji Hartanto', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-72', nama: 'Rangga Wingit', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-73', nama: 'Resa Kusumasari Saputro', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-74', nama: 'Rose Aprinia Sibuea', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-75', nama: 'Rusdi Z.', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-76', nama: 'Said Sjafrizal', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-77', nama: 'Saifan Abdulloh Muqimuddin', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-78', nama: 'Saor Silitonga', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-79', nama: 'Sari Fadillah', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-80', nama: 'Setia Lassunardo Sitanggang', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Tidak' } }
  },
  {
    id: 'csr-81', nama: 'Shania Carissa', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-82', nama: 'Siti Aminah', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-83', nama: 'Tri Utomo', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-84', nama: 'Tri Widiyono', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-85', nama: 'Winarni Rahayu', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-86', nama: 'Yasmi', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-87', nama: 'Yayat Nurhayat', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-88', nama: 'Yoel Parlaungan Simamora', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Tidak', pulang: 'Tidak' } }
  },
  {
    id: 'csr-89', nama: 'Yohana Miranda Manik', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  },
  {
    id: 'csr-90', nama: 'Yolanda Catherina Sirait', isYellow: false,
    records: { '10-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '11-Aug-26': { hadir: 'Ada', pulang: 'Ada' }, '12-Aug-26': { hadir: 'Ada', pulang: 'Ada' } }
  }
];

interface Props {
  data?: MatrixRowData[];
  onDataChange?: (newData: MatrixRowData[]) => void;
  canManageAdmin?: boolean;
}

export const CekSeribuMatrixTable: React.FC<Props> = ({
  data = INITIAL_CEK_SERIBU_MATRIX,
  onDataChange,
  canManageAdmin = true,
}) => {
  const [matrixData, setMatrixData] = useState<MatrixRowData[]>(data);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'ANOMALI' | 'TIDAK_HADIR'>('ALL');

  // Sync external props if updated
  React.useEffect(() => {
    if (data && data.length > 0) {
      setMatrixData(data);
    }
  }, [data]);

  const updateMatrix = (updated: MatrixRowData[]) => {
    setMatrixData(updated);
    if (onDataChange) {
      onDataChange(updated);
    }
  };

  // Extract all unique dates dynamically
  const dates = useMemo(() => {
    const setOfDates = new Set<string>();
    matrixData.forEach((row) => {
      if (row.records) {
        Object.keys(row.records).forEach((d) => setOfDates.add(d));
      }
    });
    const list = Array.from(setOfDates);
    return list.length > 0 ? list : ['10-Aug-26', '11-Aug-26', '12-Aug-26'];
  }, [matrixData]);

  // Check if row has an anomaly (e.g. Hadir Ada & Pulang Tidak, or vice-versa)
  const hasAnomaly = (row: MatrixRowData) => {
    if (!row.records) return false;
    return Object.values(row.records).some(
      (rec) =>
        (rec.hadir === 'Ada' && rec.pulang === 'Tidak') ||
        (rec.hadir === 'Tidak' && rec.pulang === 'Ada')
    );
  };

  // Check if row has any "Tidak"
  const hasTidakHadir = (row: MatrixRowData) => {
    if (!row.records) return false;
    return Object.values(row.records).some(
      (rec) => rec.hadir === 'Tidak' || rec.pulang === 'Tidak'
    );
  };

  const filteredData = useMemo(() => {
    return matrixData.filter((row) => {
      const matchSearch = row.nama.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchSearch) return false;

      if (filterMode === 'ANOMALI') {
        return row.isYellow || hasAnomaly(row);
      }
      if (filterMode === 'TIDAK_HADIR') {
        return hasTidakHadir(row);
      }
      return true;
    });
  }, [matrixData, searchQuery, filterMode]);

  // Toggle yellow highlight on employee name click
  const toggleYellowHighlight = (id: string) => {
    if (!canManageAdmin) return;
    const updated = matrixData.map((row) =>
      row.id === id ? { ...row, isYellow: !row.isYellow } : row
    );
    updateMatrix(updated);
  };

  // Handle Export to Excel Matrix
  const handleExportMatrixExcel = () => {
    const rowsForExport: any[] = [];

    matrixData.forEach((row) => {
      const rowObj: any = { 'Nama Pegawai': row.nama };
      dates.forEach((d) => {
        const rec = row.records[d] || { hadir: 'Tidak', pulang: 'Tidak' };
        rowObj[`${d} (Hadir)`] = rec.hadir;
        rowObj[`${d} (Pulang)`] = rec.pulang;
      });
      rowsForExport.push(rowObj);
    });

    const worksheet = XLSX.utils.json_to_sheet(rowsForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Presensi_CekSeribu');
    XLSX.writeFile(workbook, 'Konversi_Matrix_Presensi_CekSeribu.xlsx');
  };

  // Selection State for Bulk Delete
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [rowToDelete, setRowToDelete] = useState<MatrixRowData | null>(null);
  const [showConfirmDeleteSelected, setShowConfirmDeleteSelected] = useState(false);
  const [showConfirmDeleteAll, setShowConfirmDeleteAll] = useState(false);

  // Toggle selection
  const toggleSelectAll = () => {
    if (selectedRowIds.length === filteredData.length) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(filteredData.map((r) => r.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Delete Actions
  const handleConfirmDeleteSingle = () => {
    if (!rowToDelete) return;
    const updated = matrixData.filter((r) => r.id !== rowToDelete.id);
    updateMatrix(updated);
    setSelectedRowIds((prev) => prev.filter((i) => i !== rowToDelete.id));
    setRowToDelete(null);
  };

  const handleConfirmDeleteSelected = () => {
    const updated = matrixData.filter((r) => !selectedRowIds.includes(r.id));
    updateMatrix(updated);
    setSelectedRowIds([]);
    setShowConfirmDeleteSelected(false);
  };

  const handleConfirmDeleteAll = () => {
    updateMatrix([]);
    setSelectedRowIds([]);
    setShowConfirmDeleteAll(false);
  };

  // Reset to default sample
  const handleResetSample = () => {
    updateMatrix(INITIAL_CEK_SERIBU_MATRIX);
    setSelectedRowIds([]);
  };

  return (
    <div className="space-y-4" id="cek-seribu-matrix-container">
      {/* Top Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center space-x-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0" />
          <div>
            <h3 className="font-display font-extrabold text-sm text-slate-900">
              Hasil Konversi Presensi Cek Seribu (Tampilan Matrix Excel)
            </h3>
            <p className="text-[11px] text-slate-500">
              Format matriks per tanggal presensi ({dates.join(', ')}) • Total {matrixData.length} Pegawai
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pegawai..."
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-djpb-blue focus:bg-white w-48 transition-all"
            />
          </div>

          {/* Filter Dropdown */}
          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as any)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-djpb-blue cursor-pointer"
          >
            <option value="ALL">Semua Data ({matrixData.length})</option>
            <option value="ANOMALI">Anomali / Sorot Kuning ({matrixData.filter((r) => r.isYellow || hasAnomaly(r)).length})</option>
            <option value="TIDAK_HADIR">Ada 'Tidak' Hadir/Pulang ({matrixData.filter(hasTidakHadir).length})</option>
          </select>

          {/* Export Excel */}
          <button
            type="button"
            onClick={handleExportMatrixExcel}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer"
            title="Unduh Tabel Matrix ke File Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Excel</span>
          </button>

          {/* Admin Delete Selected Button */}
          {canManageAdmin && selectedRowIds.length > 0 && (
            <button
              type="button"
              onClick={() => setShowConfirmDeleteSelected(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-2xs cursor-pointer animate-fade-in"
              title="Hapus Pegawai Terpilih"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Terpilih ({selectedRowIds.length})</span>
            </button>
          )}

          {/* Admin Delete All Cek Seribu Button */}
          {canManageAdmin && matrixData.length > 0 && (
            <button
              type="button"
              onClick={() => setShowConfirmDeleteAll(true)}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 cursor-pointer"
              title="Hapus Seluruh Data Matrix Presensi Cek Seribu"
            >
              <Trash className="w-3.5 h-3.5 text-rose-600" />
              <span>Hapus Semua Data</span>
            </button>
          )}

          {/* Reset Data */}
          <button
            type="button"
            onClick={handleResetSample}
            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
            title="Muat Ulang Data Default Cek Seribu"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Muat Reset Data</span>
          </button>
        </div>
      </div>

      {/* Main Excel Matrix Table Frame */}
      <div className="overflow-x-auto rounded-xl border border-slate-300 shadow-sm bg-white">
        <table className="w-full border-collapse font-sans text-xs">
          <thead>
            {/* Header Row 1: Nama & Date Headers */}
            <tr className="bg-[#E2EFDA] text-slate-900 font-extrabold text-[12px] border-b border-slate-300">
              {canManageAdmin && (
                <th
                  rowSpan={2}
                  className="py-2 px-2 text-center border-r border-slate-300 bg-[#E2EFDA] text-slate-900 w-10 align-middle"
                >
                  <input
                    type="checkbox"
                    checked={filteredData.length > 0 && selectedRowIds.length === filteredData.length}
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    title="Pilih Semua Pegawai"
                  />
                </th>
              )}

              <th
                rowSpan={2}
                className="py-2 px-4 text-left border-r border-slate-300 bg-[#E2EFDA] text-slate-900 w-64 uppercase tracking-wider align-middle"
              >
                Nama Pegawai
              </th>

              {dates.map((d) => (
                <th
                  key={d}
                  colSpan={2}
                  className="py-2 px-3 text-center border-r border-slate-300 bg-[#E2EFDA] text-slate-900 font-bold"
                >
                  {d}
                </th>
              ))}

              {canManageAdmin && (
                <th
                  rowSpan={2}
                  className="py-2 px-3 text-center border-l border-slate-300 bg-[#E2EFDA] text-slate-900 w-16 uppercase tracking-wider align-middle"
                >
                  Aksi
                </th>
              )}
            </tr>

            {/* Header Row 2: Sub-headers Hadir | Pulang */}
            <tr className="bg-[#E2EFDA] text-slate-900 font-bold text-[11px] border-b border-slate-300">
              {dates.map((d) => (
                <React.Fragment key={`${d}-sub`}>
                  <th className="py-1.5 px-3 text-center border-r border-slate-300 bg-[#E2EFDA] w-20">
                    Hadir
                  </th>
                  <th className="py-1.5 px-3 text-center border-r border-slate-300 bg-[#E2EFDA] w-20">
                    Pulang
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-300 text-slate-900 text-[11px]">
            {filteredData.length > 0 ? (
              filteredData.map((row) => {
                const isYellowRow = Boolean(row.isYellow);
                const isSelected = selectedRowIds.includes(row.id);

                return (
                  <tr
                    key={row.id}
                    className={`transition-colors ${isSelected ? 'bg-rose-50/70' : 'hover:bg-blue-50/50'}`}
                  >
                    {/* Select Checkbox Column */}
                    {canManageAdmin && (
                      <td className="py-1.5 px-2 text-center border-r border-slate-300 bg-white">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => toggleSelectRow(row.id, e as any)}
                          className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Nama Cell (with Yellow Highlight exact match) */}
                    <td
                      onClick={() => toggleYellowHighlight(row.id)}
                      className={`py-1.5 px-4 font-bold border-r border-slate-300 text-slate-900 cursor-pointer select-none transition-colors ${
                        isYellowRow ? 'bg-[#FFFF00] text-slate-900' : 'bg-white'
                      }`}
                      title={canManageAdmin ? 'Klik untuk aktifkan/nonaktifkan sorotan warna kuning' : undefined}
                    >
                      <div className="flex items-center justify-between space-x-2">
                        <span>{row.nama}</span>
                        {isYellowRow && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="Kategori Anomali / Disorot Admin" />
                        )}
                      </div>
                    </td>

                    {/* Date Presensi Columns */}
                    {dates.map((d) => {
                      const rec = row.records?.[d] || { hadir: 'Tidak', pulang: 'Tidak' };
                      const isHadirAda = rec.hadir === 'Ada';
                      const isPulangAda = rec.pulang === 'Ada';

                      return (
                        <React.Fragment key={`${row.id}-${d}`}>
                          {/* Hadir Cell */}
                          <td
                            className={`py-1.5 px-2 text-center font-semibold border-r border-slate-300 ${
                              isHadirAda
                                ? 'bg-white text-slate-900'
                                : 'bg-[#F4CCCC] text-[#900C3F] font-bold'
                            }`}
                          >
                            {rec.hadir}
                          </td>

                          {/* Pulang Cell */}
                          <td
                            className={`py-1.5 px-2 text-center font-semibold border-r border-slate-300 ${
                              isPulangAda
                                ? 'bg-white text-slate-900'
                                : 'bg-[#F4CCCC] text-[#900C3F] font-bold'
                            }`}
                          >
                            {rec.pulang}
                          </td>
                        </React.Fragment>
                      );
                    })}

                    {/* Admin Action Row Delete Button */}
                    {canManageAdmin && (
                      <td className="py-1.5 px-2 text-center border-l border-slate-300 bg-white">
                        <button
                          type="button"
                          onClick={() => setRowToDelete(row)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          title={`Hapus data Cek Seribu untuk ${row.nama}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={1 + (canManageAdmin ? 2 : 0) + dates.length * 2}
                  className="py-8 text-center text-slate-500 font-medium bg-slate-50"
                >
                  <AlertTriangle className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                  <span>Tidak ada data pegawai yang sesuai dengan pencarian atau filter.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Legend & Quick Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-bold text-slate-800">Petunjuk Warna Matrix:</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 bg-white border border-slate-300 rounded-xs" />
            <span>Ada = Hadir / Pulang Terrekam</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 bg-[#F4CCCC] border border-rose-300 rounded-xs" />
            <span className="text-[#900C3F] font-bold">Tidak = Belum Presensi / Absen</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 bg-[#FFFF00] border border-amber-300 rounded-xs" />
            <span className="font-bold text-slate-900">Kuning = Anomali Cek Seribu (Klik Nama Pegawai)</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 font-mono shrink-0">
          Tampil: <strong>{filteredData.length}</strong> / <strong>{matrixData.length}</strong> Pegawai
        </div>
      </div>

      {/* Modal Confirm Delete Single Employee */}
      {rowToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-600 font-bold text-base">
                <AlertCircle className="w-5 h-5" />
                <span>Hapus Data Cek Seribu</span>
              </div>
              <button
                type="button"
                onClick={() => setRowToDelete(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Apakah Anda yakin ingin menghapus data presensi Cek Seribu untuk pegawai{' '}
              <strong className="text-slate-900 font-bold">{rowToDelete.nama}</strong>? Data yang dihapus tidak dapat dikembalikan.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setRowToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSingle}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Pegawai Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete Selected Rows */}
      {showConfirmDeleteSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-600 font-bold text-base">
                <AlertCircle className="w-5 h-5" />
                <span>Hapus Data Terpilih ({selectedRowIds.length})</span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmDeleteSelected(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              Apakah Anda yakin ingin menghapus <strong className="text-rose-700">{selectedRowIds.length} pegawai terpilih</strong> dari rekapitulasi Cek Seribu?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDeleteSelected(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSelected}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus {selectedRowIds.length} Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete All Cek Seribu */}
      {showConfirmDeleteAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-rose-600 font-bold text-base">
                <AlertCircle className="w-5 h-5" />
                <span>Hapus Seluruh Data Cek Seribu</span>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmDeleteAll(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed">
              <strong className="text-rose-600 font-bold">PERHATIAN:</strong> Tindakan ini akan menghapus seluruh data matriks rekapitulasi presensi Cek Seribu ({matrixData.length} pegawai). Apakah Anda yakin?
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmDeleteAll(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus Semua Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CekSeribuMatrixTable;
