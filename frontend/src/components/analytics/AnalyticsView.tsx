import React, { useState } from 'react';
import { useAnalytics } from '../../services/api';

export const AnalyticsView: React.FC = () => {
  const { data: analytics, isLoading } = useAnalytics();
  const [timeRange, setTimeRange] = useState<'30d' | 'qtd' | 'ytd'>('30d');

  if (isLoading || !analytics) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3 min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="font-mono text-xs text-on-surface-variant">
          Calculating pipeline conversion velocity...
        </span>
      </div>
    );
  }

  const { kpis, funnelStages, departmentQualities, sourcingChannels, queryLogs } = analytics;

  return (
    <div className="w-full min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Context & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1 font-mono text-xs text-on-surface-variant">
            <span className="text-primary font-semibold uppercase tracking-wider">
              Executive Overview
            </span>
            <span>•</span>
            <span>Q3 Performance Snapshot</span>
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
            Talent Pipeline Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl mt-1 leading-relaxed">
            Real-time candidate conversion velocity, autonomous sourcing telemetry, and multi-department algorithmic screening metrics.
          </p>
        </div>

        {/* Date Selector & Export */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="bg-surface-container-low p-1 rounded-xl flex items-center border border-white/5 shadow-inner">
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1 rounded-lg font-mono text-xs transition-all ${
                timeRange === '30d'
                  ? 'bg-surface-container text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setTimeRange('qtd')}
              className={`px-3 py-1 rounded-lg font-mono text-xs transition-all ${
                timeRange === 'qtd'
                  ? 'bg-surface-container text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Quarter-to-Date
            </button>
            <button
              onClick={() => setTimeRange('ytd')}
              className={`px-3 py-1 rounded-lg font-mono text-xs transition-all ${
                timeRange === 'ytd'
                  ? 'bg-surface-container text-primary font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Year-to-Date
            </button>
          </div>

          <button
            onClick={() => alert('Exporting Talent Intelligence Executive Summary (PDF/XLSX)...')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-black font-semibold font-mono text-xs hover:bg-amber-400 transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">ios_share</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-surface-container-low rounded-xl p-5 relative overflow-hidden shadow-sm border border-white/5 flex flex-col justify-between group hover:border-primary/40 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none group-hover:bg-primary/10 transition-all" />
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Total Active Pipeline
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-headline text-3xl text-on-surface font-bold tracking-tight">
                {kpis.totalPipeline.toLocaleString()}
              </span>
              <span className="font-mono text-xs text-on-surface-variant">candidates</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-1 text-tertiary font-bold">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>{kpis.pipelineGrowth}</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">Month-over-Month</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-surface-container-low rounded-xl p-5 relative overflow-hidden shadow-sm border border-white/5 flex flex-col justify-between group hover:border-secondary/40 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full blur-xl pointer-events-none group-hover:bg-secondary/10 transition-all" />
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Avg. Time to Fill
              </span>
              <span className="material-symbols-outlined text-secondary text-[20px]">timelapse</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-headline text-3xl text-on-surface font-bold tracking-tight">
                {kpis.avgTimeToFillDays}
              </span>
              <span className="font-mono text-xs text-on-surface-variant">Days</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-1 text-tertiary font-bold">
              <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
              <span>{kpis.timeToFillDelta}</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">vs 28d benchmark</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-surface-container-low rounded-xl p-5 relative overflow-hidden shadow-sm border border-white/5 flex flex-col justify-between group hover:border-tertiary/40 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary/5 rounded-full blur-xl pointer-events-none group-hover:bg-tertiary/10 transition-all" />
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                AI Screening Accuracy
              </span>
              <span className="material-symbols-outlined text-tertiary text-[20px]">neurology</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-headline text-3xl text-on-surface font-bold tracking-tight">
                {kpis.screeningAccuracyPercent}%
              </span>
              <span className="font-mono text-xs text-tertiary font-semibold">Verified</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-1 text-on-surface-variant truncate">
              <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
              <span>Eng Hiring Managers</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">{kpis.evalsCount} evals</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-surface-container-low rounded-xl p-5 relative overflow-hidden shadow-sm border border-white/5 flex flex-col justify-between group hover:border-primary/40 transition-all">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none group-hover:bg-primary/10 transition-all" />
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Offer Acceptance Rate
              </span>
              <span className="material-symbols-outlined text-primary text-[20px]">assignment_turned_in</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-headline text-3xl text-on-surface font-bold tracking-tight">
                {kpis.offerAcceptancePercent}%
              </span>
              <span className="font-mono text-xs text-on-surface-variant">rate</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-1 text-primary font-bold">
              <span className="material-symbols-outlined text-[16px]">thumb_up</span>
              <span>{kpis.acceptedCount}</span>
            </div>
            <span className="text-[11px] text-on-surface-variant">Accepted Q3</span>
          </div>
        </div>
      </div>

      {/* Primary Analytics: Funnel & Quality Mosaic */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Requisition Funnel Progression (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-6 flex flex-col justify-between shadow-sm border border-white/5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">filter_alt</span>
                <h2 className="font-headline text-base text-on-surface font-semibold">
                  Requisition Funnel Progression
                </h2>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <span>Global Active (1,280)</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mb-6">
              Dynamic stage drop-off and machine-validated candidate velocity across current open requisitions.
            </p>

            {/* Funnel Steps */}
            <div className="space-y-4">
              {funnelStages.map((stage) => (
                <div key={stage.stageNumber} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-on-surface font-medium flex items-center gap-2">
                      <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded border border-white/5">
                        {stage.stageNumber}
                      </span>
                      {stage.name}
                    </span>
                    <div className="flex items-center gap-4 font-mono">
                      <span className="text-on-surface font-semibold">{stage.count}</span>
                      <span className="text-on-surface-variant w-12 text-right">
                        {stage.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full ${stage.colorClass} rounded-full transition-all duration-700`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 bg-surface-container/40 p-3 rounded-lg flex items-center justify-between border border-white/5">
            <div className="flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
              <span className="text-on-surface">
                Velocity Index: Screen-to-Offer speed has improved by{' '}
                <strong className="text-primary font-bold">28%</strong> with AI-assisted loops
              </span>
            </div>
            <button className="font-mono text-xs text-primary hover:underline">
              Stage Diagnostics →
            </button>
          </div>
        </div>

        {/* Candidate Quality Distribution by Department (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-low rounded-xl p-6 flex flex-col justify-between shadow-sm border border-white/5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  stacked_bar_chart
                </span>
                <h2 className="font-headline text-base text-on-surface font-semibold">
                  Department Quality Distribution
                </h2>
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                Percentiles
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-5">
              Algorithmic fit score percentiles (P50 / P75 / P90) indexed across operational disciplines.
            </p>

            <div className="space-y-4">
              {departmentQualities.map((item) => (
                <div key={item.department} className="bg-surface-container p-3 rounded-lg border border-white/5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]" style={{ color: item.accentColor }}>
                        {item.icon}
                      </span>
                      <span className="text-on-surface font-medium">{item.department}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-on-surface-variant text-[11px]">Top Tier:</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-xs font-semibold"
                        style={{ backgroundColor: `${item.accentColor}20`, color: item.accentColor }}
                      >
                        {item.topTierScore}
                      </span>
                    </div>
                  </div>

                  <div className="w-full bg-surface-container-high h-2 rounded-full relative overflow-hidden">
                    <div
                      className="absolute left-[45%] right-[10%] h-full rounded-full opacity-70"
                      style={{ backgroundColor: item.accentColor }}
                    />
                    <div
                      className="absolute left-[88%] w-1.5 h-full rounded-full"
                      style={{ backgroundColor: item.accentColor }}
                    />
                  </div>

                  <div className="flex justify-between items-center font-mono text-[10px] text-on-surface-variant">
                    <span>P50: {item.p50}</span>
                    <span>P75: {item.p75}</span>
                    <span style={{ color: item.accentColor }} className="font-bold">
                      P90: {item.p90}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between font-mono text-xs text-on-surface-variant">
            <span>Benchmark: Global Engineering Top Decile</span>
            <span className="text-tertiary flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
              Calibration Calibrated
            </span>
          </div>
        </div>
      </div>

      {/* Sourcing Breakdown & AI Query Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Candidate Sourcing Channels Donut (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-low rounded-xl p-6 flex flex-col justify-between shadow-sm border border-white/5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">donut_large</span>
                <h2 className="font-headline text-base text-on-surface font-semibold">
                  Candidate Sourcing Channels
                </h2>
              </div>
              <span className="font-mono text-xs text-on-surface-variant">Q3 Volume</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Channel attribution demonstrating autonomous AI inbound expansion.
            </p>

            {/* Donut SVG Representation */}
            <div className="flex items-center justify-center py-2">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Track */}
                  <circle
                    className="text-surface-container"
                    cx="18"
                    cy="18"
                    fill="none"
                    r="15.9155"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  {/* Direct Applicant 42% (Amber) */}
                  <circle
                    cx="18"
                    cy="18"
                    fill="none"
                    r="15.9155"
                    stroke="#f59e0b"
                    strokeWidth="3.5"
                    strokeDasharray="42 58"
                    strokeDashoffset="0"
                  />
                  {/* AI Auto Inbound 31% (Cyan) */}
                  <circle
                    cx="18"
                    cy="18"
                    fill="none"
                    r="15.9155"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                    strokeDasharray="31 69"
                    strokeDashoffset="-42"
                  />
                  {/* Referrals 18% (Emerald) */}
                  <circle
                    cx="18"
                    cy="18"
                    fill="none"
                    r="15.9155"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeDasharray="18 82"
                    strokeDashoffset="-73"
                  />
                  {/* Exec Search 9% (Light Amber) */}
                  <circle
                    cx="18"
                    cy="18"
                    fill="none"
                    r="15.9155"
                    stroke="#ffddb8"
                    strokeWidth="3.5"
                    strokeDasharray="9 91"
                    strokeDashoffset="-91"
                  />
                </svg>

                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-headline text-2xl text-on-surface font-bold leading-none">
                    1,280
                  </span>
                  <span className="font-mono text-[9px] text-on-surface-variant uppercase mt-1">
                    Total Sourced
                  </span>
                </div>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              {sourcingChannels.map((ch) => (
                <div
                  key={ch.name}
                  className="bg-surface-container p-2.5 rounded-lg flex items-center justify-between border border-white/5 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${ch.dotColor}`} />
                    <span className="text-on-surface">{ch.name}</span>
                  </div>
                  <span className="font-mono font-bold text-on-surface">{ch.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-2 text-center text-xs text-on-surface-variant border-t border-white/5">
            AI Sourcing conversion yield is <strong className="text-tertiary">2.4x</strong> higher than cold inbound
          </div>
        </div>

        {/* Top AI Natural Language Queries (7 Cols) */}
        <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-6 flex flex-col justify-between shadow-sm border border-white/5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  travel_explore
                </span>
                <h2 className="font-headline text-base text-on-surface font-semibold">
                  Top AI Natural Language Queries
                </h2>
              </div>
              <span className="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded font-semibold">
                Semantic Engine V3
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mb-4">
              Aggregated recruitment query themes dispatched by sourcing leads and hiring managers this week.
            </p>

            <div className="space-y-2.5">
              {queryLogs.map((item) => (
                <div
                  key={item.id}
                  className="bg-surface-container p-3 rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-between border border-white/5 gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-on-surface font-semibold truncate">
                          {item.query}
                        </span>
                        {item.tag && (
                          <span className="font-mono text-[9px] uppercase bg-primary/20 text-primary px-1.5 py-0.2 rounded font-bold">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[11px] text-on-surface-variant mt-0.5">
                        {item.retrievedCount} candidates retrieved • {item.accuracyPercent}% accuracy
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono text-xs text-tertiary font-bold block">
                      {item.matchedCount} matched
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                      {item.team}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
