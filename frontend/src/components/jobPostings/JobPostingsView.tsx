import React, { useState } from 'react';
import { useRequisitions } from '../../services/api';
import { Department, RequisitionStatus } from '../../types';
import { DepartmentTabs } from './DepartmentTabs';
import { RequisitionCard } from './RequisitionCard';
import { useNavigation } from '../../context/NavigationContext';

export const JobPostingsView: React.FC = () => {
  const [selectedDept, setSelectedDept] = useState<Department>('All Departments');
  const [selectedStatus, setSelectedStatus] = useState<RequisitionStatus | 'All'>('All');
  const [searchInput, setSearchInput] = useState('');
  const { globalSearchQuery } = useNavigation();

  const effectiveSearch = searchInput || globalSearchQuery;
  const { data: requisitions = [], isLoading } = useRequisitions(
    selectedDept,
    selectedStatus,
    effectiveSearch
  );

  const featuredReq = requisitions.find((r) => r.reqCode === 'AH-2049') || requisitions[0];
  const regularReqs = requisitions.filter((r) => r.id !== featuredReq?.id);

  return (
    <div className="w-full min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Command & Metrics Strip */}
      <div className="relative bg-surface-container-low rounded-xl p-6 sm:p-8 overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-64 h-32 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-primary uppercase tracking-widest bg-surface-container-high px-2.5 py-0.5 rounded border border-white/5">
                Requisition Orchestration
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-tertiary">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
                Sync Active: 14 Nodes
              </span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl text-on-surface font-bold tracking-tight">
              Active Job Postings & Requisitions
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Algorithmic sourcing, real-time candidate triage, and predictive conversion vectors across active organizational cohorts.
            </p>
          </div>

          {/* Summary Pill Matrix & Sync Status */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-surface-container-lowest p-2 rounded-xl border border-white/5 shadow-inner">
              <div className="flex flex-col px-3 py-1.5">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                  Open Roles
                </span>
                <span className="font-mono text-lg text-primary font-bold">{requisitions.length}</span>
              </div>
              <div className="flex flex-col px-3 py-1.5">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                  Total Talent
                </span>
                <span className="font-mono text-lg text-on-surface font-bold">
                  {requisitions.reduce((acc, r) => acc + (r.applicantsCount || 24), 0)}
                </span>
              </div>
              <div className="flex flex-col px-3 py-1.5">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                  Shortlisted
                </span>
                <span className="font-mono text-lg text-secondary font-bold">
                  {requisitions.reduce((acc, r) => acc + (r.pipeline?.review || 6), 0)}
                </span>
              </div>
              <div className="flex flex-col px-3 py-1.5">
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                  In Interview
                </span>
                <span className="font-mono text-lg text-tertiary font-bold">
                  {requisitions.reduce((acc, r) => acc + (r.pipeline?.techRound || 3), 0)}
                </span>
              </div>
            </div>

            <div className="inline-flex items-center justify-center gap-2 bg-surface-container-high text-on-surface font-mono text-xs px-4 py-3 rounded-lg border border-white/10 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span>CV Analyzer Live Sync</span>
            </div>
          </div>
        </div>

        {/* Department Selector Tabs */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <DepartmentTabs
            selectedDepartment={selectedDept}
            onSelectDepartment={setSelectedDept}
          />
        </div>
      </div>

      {/* Filter & Utility Control Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-surface-container-lowest p-3 rounded-xl border border-white/5 shadow-md">
        {/* Search input */}
        <div className="flex flex-1 items-center gap-2.5 bg-surface-container-low px-3.5 py-2 rounded-lg border border-white/5">
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
            filter_list
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Filter by req code, title, tech stack or hiring lead..."
            className="w-full bg-transparent text-on-surface placeholder:text-on-surface-variant/50 text-xs sm:text-sm focus:outline-none"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="font-mono text-[11px] text-on-surface-variant hover:text-on-surface bg-surface-container px-2 py-0.5 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-white/5">
            {(['All', 'Active', 'Urgent', 'Draft', 'Closed'] as const).map((status) => {
              const active = selectedStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`font-mono text-xs px-3 py-1.5 rounded transition-all ${
                    active
                      ? 'bg-surface-container-high text-primary font-bold shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>

          <div className="h-6 w-px bg-surface-container-high hidden sm:block" />

          <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-lg border border-white/5 text-on-surface-variant">
            <span className="font-mono text-[10px] uppercase">Sort:</span>
            <span className="font-mono text-xs text-on-surface flex items-center gap-1 font-semibold">
              AI Fit Index (High-Low)
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </span>
          </div>
        </div>
      </div>

      {/* Requisitions Bento Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="font-mono text-xs text-on-surface-variant">
            Synchronizing telemetry across 14 clusters...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
          {featuredReq && <RequisitionCard requisition={featuredReq} featured />}

          {regularReqs.map((req) => (
            <div key={req.id} className="md:col-span-1 xl:col-span-6">
              <RequisitionCard requisition={req} />
            </div>
          ))}
        </div>
      )}

      {/* Bottom Efficiency & Analytics Intelligence Bar */}
      <div className="bg-surface-container-low rounded-xl p-6 shadow-lg border border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-white/5">
            <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[28px]">speed</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">
                Mean Time-to-Hire
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl text-on-surface font-bold">18.4</span>
                <span className="text-xs text-tertiary font-semibold">-4.2 days vs Q2 benchmark</span>
              </div>
              <span className="font-mono text-xs text-on-surface-variant">AI Auto-Screening active</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-white/5">
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[28px]">handshake</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">
                Offer Acceptance Index
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl text-on-surface font-bold">91.8%</span>
                <span className="text-xs text-tertiary font-semibold">+6.4% acceptance delta</span>
              </div>
              <span className="font-mono text-xs text-on-surface-variant">11 of 12 accepted</span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-white/5">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[28px]">auto_awesome</span>
            </div>
            <div>
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">
                Autonomous Inbound Yield
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-headline text-2xl text-on-surface font-bold">2.4x</span>
                <span className="text-xs text-secondary font-semibold">vs traditional cold sourcing</span>
              </div>
              <span className="font-mono text-xs text-on-surface-variant">Continuous candidate indexing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
