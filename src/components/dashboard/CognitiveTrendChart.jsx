import React from 'react';

// Sample session trend data for clinical visualization
export const SAMPLE_TREND_HISTORY = [
  { session: 'S1 (Mon)', latencySec: 4.2, tier: 2, errors: 0, alert: false },
  { session: 'S2 (Tue)', latencySec: 5.1, tier: 2, errors: 0, alert: false },
  { session: 'S3 (Wed)', latencySec: 7.8, tier: 2, errors: 1, alert: false },
  { session: 'S4 (Thu)', latencySec: 16.4, tier: 1, errors: 2, alert: true }, // Latency & Error spike
  { session: 'S5 (Fri)', latencySec: 15.2, tier: 1, errors: 1, alert: true }, // Latency spike
  { session: 'S6 (Sat)', latencySec: 9.5, tier: 1, errors: 0, alert: false }  // Stabilized at Tier 1
];

export default function CognitiveTrendChart({
  patientName = 'Bhaben Kalita',
  data = SAMPLE_TREND_HISTORY
}) {
  const maxLatency = 20; // 20s y-axis ceiling
  const alertThreshold = 15; // 15s red alert line

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Biomarker Telemetry
            </span>
          </div>
          <h3 className="font-bold text-slate-900 text-lg mt-1">
            Cognitive Biomarker Trend: {patientName}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-lg leading-relaxed">
            Passive response latency tracking (seconds) & DDA difficulty tier progression across 6 sessions.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-slate-700">
            <span className="w-2.5 h-2.5 bg-teal-600 rounded-sm inline-block" /> Latency (s)
          </span>
          <span className="flex items-center gap-1.5 text-rose-700">
            <span className="w-3 h-0.5 bg-rose-500 border-b border-dashed inline-block" /> 15s Delay Threshold
          </span>
        </div>
      </div>

      {/* SVG Responsive Latency & DDA Bar Chart */}
      <div className="relative pt-4 pb-2">
        <svg
          viewBox="0 0 500 200"
          className="w-full h-52 overflow-visible"
          role="img"
          aria-label="Cognitive Latency and Tier Progression Trend Chart"
        >
          {/* Y-Axis Gridlines (0s, 5s, 10s, 15s, 20s) */}
          {[0, 5, 10, 15, 20].map((val) => {
            const y = 180 - (val / maxLatency) * 160;
            return (
              <g key={val}>
                <line
                  x1="40"
                  y1={y}
                  x2="480"
                  y2={y}
                  stroke={val === 15 ? '#FDA4AF' : '#F1F5F9'}
                  strokeWidth={val === 15 ? 1.5 : 1}
                  strokeDasharray={val === 15 ? '4 4' : 'none'}
                />
                <text x="32" y={y + 4} textAnchor="end" fontSize="10" fill={val === 15 ? '#E11D48' : '#94A3B8'} fontWeight={val === 15 ? '600' : 'normal'}>
                  {val}s
                </text>
              </g>
            );
          })}

          {/* Critical Threshold Alert Label */}
          <text x="475" y="65" textAnchor="end" fontSize="9" fill="#E11D48" fontWeight="600">
            15s Cognitive Alert
          </text>

          {/* Bars and Data Points */}
          {data.map((item, idx) => {
            const barWidth = 34;
            const x = 70 + idx * 70;
            const height = (item.latencySec / maxLatency) * 160;
            const y = 180 - height;
            const isAlert = item.latencySec >= alertThreshold || item.alert;

            return (
              <g key={item.session}>
                {/* Latency Bar */}
                <rect
                  x={x - barWidth / 2}
                  y={y}
                  width={barWidth}
                  height={height}
                  rx="6"
                  fill={isAlert ? '#F97316' : '#0D9488'}
                  opacity={isAlert ? 0.95 : 0.9}
                  className="transition-all hover:opacity-100 cursor-pointer"
                />

                {/* Latency Value Label on top */}
                <text
                  x={x}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={isAlert ? '#C2410C' : '#0F766E'}
                >
                  {item.latencySec}s
                </text>

                {/* X-Axis Session Label */}
                <text x={x} y="196" textAnchor="middle" fontSize="10" fill="#64748B" fontWeight="500">
                  {item.session}
                </text>

                {/* DDA Tier Tag Badge below */}
                <rect
                  x={x - 18}
                  y="204"
                  width="36"
                  height="14"
                  rx="4"
                  fill={item.tier === 1 ? '#FEF3C7' : '#CCFBF1'}
                />
                <text
                  x={x}
                  y={214}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill={item.tier === 1 ? '#B45309' : '#0F766E'}
                >
                  Tier {item.tier}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Clinical Telemetry Annotation Strip */}
      <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl text-xs space-y-1.5 mt-4">
        <span className="font-semibold text-slate-800 uppercase tracking-wider block text-[11px]">
          Clinical Interpretation:
        </span>
        <p className="text-slate-600">
          • <strong className="text-slate-800">Sessions 1–3:</strong> Normal response range (4.2s–7.8s) with Tier 2 task difficulty maintained.
        </p>
        <p className="text-teal-900 font-medium">
          • <strong>Session 4:</strong> Marked delay spike (16.4s) and 2 errors. DDA engine intervened silently to lower difficulty to Tier 1.
        </p>
        <p className="text-teal-900 font-medium">
          • <strong>Session 6:</strong> Patient successfully stabilized at Tier 1 with 0 errors and latency reduced back to 9.5s.
        </p>
      </div>
    </div>
  );
}
