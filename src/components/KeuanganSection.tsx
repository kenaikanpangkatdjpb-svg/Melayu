import React, { useState } from 'react';
import { 
  Plus, TrendingUp, AlertTriangle, CheckCircle2, 
  Sparkles, DollarSign, PieChart, Calculator 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, AreaChart, Area 
} from 'recharts';
import { RealizationProgress } from '../types';
import { formatIDR } from '../mockData';

interface KeuanganSectionProps {
  subTab: string;
  realizations: RealizationProgress[];
  setRealizations: React.Dispatch<React.SetStateAction<RealizationProgress[]>>;
  isEditMode: boolean;
}

export default function KeuanganSection({
  subTab,
  realizations,
  setRealizations,
  isEditMode
}: KeuanganSectionProps) {
  // Budget calculator state
  const [absorbTarget, setAbsorbTarget] = useState(75); // Target absorb percentage

  const totalAllocated = realizations.reduce((acc, curr) => acc + curr.allocated, 0);
  const totalRealized = realizations.reduce((acc, curr) => acc + curr.realized, 0);
  const totalPercentage = totalAllocated > 0 ? (totalRealized / totalAllocated) * 100 : 0;

  // Calculated stats based on target slider
  const targetAbsorbAmount = (absorbTarget / 100) * totalAllocated;
  const gapToTarget = targetAbsorbAmount - totalRealized;

  const chartData = realizations.map(r => ({
    name: r.category.replace('Belanja ', ''),
    Pagu: r.allocated,
    Realisasi: r.realized,
    Sisa: r.allocated - r.realized
  }));

  return (
    <div className="p-6 space-y-6" id="keuangan-section-root">
      {subTab === 'progress-realisasi' && (
        <div className="space-y-6" id="keuangan-realisasi-subtab">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base md:text-lg font-display font-bold text-slate-800">Monitoring Realisasi Anggaran (DIPA Kanwil Riau)</h2>
              <p className="text-xs text-slate-500">Visualisasi komparasi pagu anggaran belanja dengan pencairan SP2D aktif.</p>
            </div>
            <div className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 shrink-0">
              Sisa Pagu: {formatIDR(totalAllocated - totalRealized)}
            </div>
          </div>

          {/* Stat Panels */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="keuangan-stat-row">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-display">TOTAL ALOKASI PAGU DIPA</span>
              <span className="text-base font-bold font-mono text-slate-800 block mt-1">{formatIDR(totalAllocated)}</span>
              <span className="text-[9px] text-slate-400">Tahun Anggaran 2026</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-display">TOTAL REALISASI</span>
              <span className="text-base font-bold font-mono text-green-700 block mt-1">{formatIDR(totalRealized)}</span>
              <span className="text-[9px] text-green-600 font-semibold font-mono">{totalPercentage.toFixed(2)}% Terpakai</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-display">PROYEKSI TARGET SERAPAN</span>
              <span className="text-base font-bold font-mono text-djpb-blue block mt-1">{formatIDR(targetAbsorbAmount)}</span>
              <span className="text-[9px] text-djpb-blue font-semibold">Berdasarkan Target {absorbTarget}%</span>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 block uppercase font-display">GAP KEKURANGAN SERAPAN</span>
              <span className={`text-base font-bold font-mono block mt-1 ${gapToTarget > 0 ? 'text-amber-600' : 'text-green-700'}`}>
                {gapToTarget > 0 ? formatIDR(gapToTarget) : 'Target Terpenuhi'}
              </span>
              <span className="text-[9px] text-slate-400">Untuk mencapai target {absorbTarget}%</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Realization Bar Chart */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-3">
                Grafik Alokasi Pagu vs Realisasi Belanja
              </h3>

              <div className="h-64 w-full" id="keuangan-bar-chart-wrapper">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 8, fontFamily: 'monospace' }} />
                    <Tooltip formatter={(value) => formatIDR(value as number)} contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="Pagu" fill="#083c74" radius={[4, 4, 0, 0]} name="Alokasi Pagu" />
                    <Bar dataKey="Realisasi" fill="#e5a93b" radius={[4, 4, 0, 0]} name="Realisasi" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Target Calculator Slider Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 self-start">
              <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-3">
                <Calculator className="w-4 h-4 text-djpb-blue" />
                <h3 className="font-display font-bold text-slate-800 text-xs tracking-wide uppercase">Simulasi Target Serapan</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Target Penyerapan:</span>
                    <span className="font-mono text-djpb-blue text-sm">{absorbTarget}%</span>
                  </div>
                  <input 
                    type="range" min={1} max={100}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-djpb-blue"
                    value={absorbTarget}
                    onChange={(e) => setAbsorbTarget(parseInt(e.target.value))}
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>1%</span>
                    <span>50% (Smt I)</span>
                    <span>100% (Akhir Tahun)</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Laporan Analisis Serapan:</h4>
                  {gapToTarget > 0 ? (
                    <div className="flex items-start space-x-2 text-xs text-amber-800 leading-relaxed">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p>
                        Saat ini realisasi berada di <strong className="font-mono text-slate-800">{totalPercentage.toFixed(1)}%</strong>. Dibutuhkan tambahan pencairan anggaran sebesar <strong className="font-semibold text-slate-800">{formatIDR(gapToTarget)}</strong> untuk mencapai sasaran penyerapan {absorbTarget}%.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-2 text-xs text-green-800 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                      <p>
                        <strong>Selamat!</strong> Realisasi saat ini (<strong className="font-mono text-slate-800">{totalPercentage.toFixed(1)}%</strong>) sudah melebihi batas minimum target serapan simulasi Anda (<strong className="font-mono text-slate-800">{absorbTarget}%</strong>).
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 italic">
                  *Target penyerapan nasional DIPA Kantor Wilayah Ditjen Perbendaharaan Semester II diatur minimal mencapai <strong className="text-slate-700">75%</strong> pada akhir Triwulan III.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
