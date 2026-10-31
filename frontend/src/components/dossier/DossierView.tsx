import React, { useState } from 'react';
import { useCandidate, useAdvanceCandidateStage, useReprocessCandidateCV } from '../../services/api';
import { useNavigation } from '../../context/NavigationContext';
import { mockCandidates } from '../../services/mockData';

export const DossierView: React.FC = () => {
  const { selectedCandidateId, setSelectedCandidateId, setCurrentView } = useNavigation();
  const { data: candidate } = useCandidate(selectedCandidateId);
  const advanceMutation = useAdvanceCandidateStage();
  const reprocessMutation = useReprocessCandidateCV();
  const [reprocessing, setReprocessing] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [notesList, setNotesList] = useState<string[]>([
    candidate?.telemetry?.atsMetadata.hiringManagerNotes ||
      'Exceptional technical depth; demonstrated RAG systems excellence.',
  ]);

  if (!candidate) return null;
  const telemetry = candidate.telemetry;

  const handleAdvanceStage = () => {
    advanceMutation.mutate({
      candidateId: candidate.id,
      newStage: 'Offer Extended',
    });
    alert(`Candidate ${candidate.name} has been advanced to Formal Offer Committee! ATS webhook dispatched.`);
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      await reprocessMutation.mutateAsync(candidate.id);
      alert(`CV for ${candidate.name} has been queued for re-extraction with the LLM pipeline.`);
    } catch {
      alert(`Queued reprocessing for ${candidate.name}.`);
    } finally {
      setReprocessing(false);
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalNote.trim()) return;
    setNotesList((prev) => [
      `Sarah Jenkins (Just now): ${internalNote.trim()}`,
      ...prev,
    ]);
    setInternalNote('');
  };

  return (
    <div className="w-full min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Requisition Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-on-surface-variant">
          <button
            onClick={() => setCurrentView('candidate-search')}
            className="hover:text-primary transition-colors flex items-center gap-1 font-medium"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Candidate Pool
          </button>
          <span>/</span>
          <span>REQ-8042-AI</span>
          <span>/</span>
          <span className="text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded font-semibold">
            {candidate.name}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
          <span>Telemetry Synced:</span>
          <span className="text-on-surface font-semibold">Live (Greenhouse v4.2)</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Candidate Switch Rail */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-5">
          {/* Pool Roster */}
          <div className="bg-surface-container-low rounded-xl p-4 shadow-xl border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                  Applicant Pool
                </span>
                <span className="font-mono text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">
                  4 Qualified
                </span>
              </div>
              <span className="font-mono text-xs text-on-surface-variant">
                Ranked by Fit
              </span>
            </div>

            <div className="space-y-2">
              {mockCandidates.slice(0, 4).map((cand) => {
                const isSelected = cand.id === candidate.id;
                return (
                  <button
                    key={cand.id}
                    onClick={() => setSelectedCandidateId(cand.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-start gap-3 border ${
                      isSelected
                        ? 'bg-surface-container-high border-primary/40 shadow-md ring-1 ring-primary/20'
                        : 'bg-surface-container border-white/5 hover:bg-surface-container-high hover:border-white/10'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={cand.avatarUrl}
                        alt={cand.name}
                        className="w-11 h-11 rounded-lg object-cover"
                      />
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-surface-container-lowest flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-tertiary" />
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-headline text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          {cand.name}
                        </span>
                        <span className="font-mono text-xs text-primary bg-primary/10 px-1.5 py-0.2 rounded font-semibold">
                          {cand.fitScore}%
                        </span>
                      </div>
                      <div className="text-xs text-on-surface truncate mt-0.5">
                        {cand.title}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 font-mono text-[10px]">
                        <span className="text-on-surface-variant bg-surface-container-high px-1 py-0.5 rounded uppercase">
                          {cand.education.split('(')[0]}
                        </span>
                        <span className="text-tertiary bg-tertiary/10 px-1 py-0.5 rounded uppercase font-semibold">
                          Top 1%
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mini Benchmark Card */}
          <div className="bg-surface-container-low rounded-xl p-4 shadow-lg border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Applicant Vector Index
              </span>
              <span className="material-symbols-outlined text-[18px] text-tertiary">hub</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Applicant matches are cross-referenced across 42 distinct architectural, systems latency, and production scaling vectors against team benchmark.
            </p>
            <div className="flex items-center justify-between pt-2 bg-surface-container-lowest p-3 rounded-lg border border-white/5">
              <div>
                <div className="font-mono text-sm text-primary font-bold">
                  Cosine Fit: {telemetry?.cosineFit || 0.984}
                </div>
                <div className="font-mono text-[10px] text-on-surface-variant uppercase">
                  Target Embedding Matrix
                </div>
              </div>
              <span className="material-symbols-outlined text-primary text-[24px]">insights</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Comprehensive Backend Dossier Panel */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          {/* Header Banner Card */}
          <div className="relative bg-surface-container-low rounded-xl p-6 sm:p-7 shadow-xl overflow-hidden border border-white/5">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  <img
                    src={candidate.avatarUrl}
                    alt={candidate.name}
                    className="w-20 h-20 rounded-xl object-cover shadow-2xl ring-2 ring-primary/40"
                  />
                  <span className="absolute -bottom-1 -right-1 bg-tertiary text-black rounded-full p-1 flex items-center justify-center font-bold shadow">
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-headline text-2xl text-on-surface font-bold tracking-tight">
                      {candidate.name}
                    </span>
                    <span className="font-mono text-xs text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded font-semibold">
                      {candidate.education}
                    </span>
                  </div>

                  <div className="text-sm text-on-surface-variant mb-2">
                    Lead AI Engineer Candidate • {candidate.currentCompany}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-tertiary">verified</span>
                      <span>{candidate.email}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      <span>{candidate.location}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">phone</span>
                      <span>{candidate.phone}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-3 font-mono text-xs">
                    <span className="bg-tertiary-container/30 text-tertiary border border-tertiary/30 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">badge</span>
                      {candidate.citizenship}
                    </span>
                    <span className="bg-surface-container-high text-on-surface-variant border border-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      Notice: {candidate.noticePeriod}
                    </span>
                    <a
                      href={candidate.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-secondary hover:underline flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded border border-white/5"
                    >
                      <span className="material-symbols-outlined text-[14px]">code</span>
                      {candidate.githubUrl.replace('https://', '')}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action cluster */}
              <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 items-stretch">
                <button
                  onClick={handleAdvanceStage}
                  className="bg-primary text-black hover:bg-amber-400 font-semibold text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Advance to Offer Stage</span>
                </button>
                <button
                  onClick={() => alert(`Technical panel invited for ${candidate.name}!`)}
                  className="bg-surface-container-high text-on-surface hover:bg-surface-bright text-xs px-4 py-2 rounded-lg flex items-center justify-center gap-1.5 border border-white/5 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  <span>Schedule Technical Loop</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={handleReprocess}
                    disabled={reprocessing}
                    className="flex-1 bg-surface-container text-primary hover:text-amber-400 text-xs py-2 rounded-lg flex items-center justify-center gap-1 border border-primary/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">{reprocessing ? 'sync' : 'auto_fix_high'}</span>
                    <span>{reprocessing ? 'Reprocessing...' : 'Reprocess AI'}</span>
                  </button>
                  <button
                    onClick={() => alert('Exporting full candidate dossier PDF...')}
                    className="flex-1 bg-surface-container text-on-surface-variant hover:text-on-surface text-xs py-2 rounded-lg flex items-center justify-center gap-1 border border-white/5"
                  >
                    <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                    <span>Export PDF</span>
                  </button>
                  <button
                    onClick={() => alert('Candidate flagged as rejected.')}
                    className="bg-surface-container text-error hover:bg-error-container hover:text-white text-xs px-3 py-2 rounded-lg flex items-center justify-center border border-white/5"
                    title="Reject Candidate"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Backend Requisition Telemetry & Scorecards */}
          <div className="bg-surface-container-low rounded-xl p-6 shadow-lg border border-white/5 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">neurology</span>
                <span className="font-headline text-lg text-on-surface font-semibold">
                  Backend Requisition Telemetry & Scorecards
                </span>
              </div>
              <span className="font-mono text-xs text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded font-semibold">
                Hash: {telemetry?.telemetryHash || '0x9b4a11c882e'}
              </span>
            </div>

            {/* Scorecard Bento */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Dial Card */}
              <div className="md:col-span-4 bg-surface-container p-4 rounded-xl flex flex-col justify-between border border-white/5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
                    Overall Hive Match
                  </span>
                  <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                </div>
                <div className="flex items-baseline gap-1 my-2">
                  <span className="font-headline text-4xl text-primary font-bold">
                    {telemetry?.overallScore || candidate.fitScore}
                  </span>
                  <span className="text-on-surface-variant font-headline text-lg">/ 100</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden mb-2">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${telemetry?.overallScore || candidate.fitScore}%` }}
                  />
                </div>
                <div className="font-mono text-xs text-tertiary flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  <span>{telemetry?.percentile || '99th percentile of pool'}</span>
                </div>
              </div>

              {/* Technical Competencies Bars */}
              <div className="md:col-span-8 bg-surface-container p-4 rounded-xl flex flex-col justify-between border border-white/5 shadow-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Technical Competency Evaluation (Algorithmic & Panel)
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">
                    Calibrated N=1,420
                  </span>
                </div>
                <div className="space-y-3">
                  {(telemetry?.competencies || [
                    { name: 'System Architecture & Distributed Scaling', score: 9.8, maxScore: 10 },
                    { name: 'LLM / RAG Engineering & Retrieval Pipelines', score: 9.9, maxScore: 10 },
                    { name: 'Production TypeScript / Python Async Core', score: 9.6, maxScore: 10 },
                  ]).map((comp) => (
                    <div key={comp.name}>
                      <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="text-on-surface font-medium">{comp.name}</span>
                        <span className="font-mono text-primary font-bold">
                          {comp.score} / {comp.maxScore}
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-primary h-full rounded-full"
                          style={{ width: `${(comp.score / comp.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Automated AI Code Repository Analysis */}
            <div className="bg-surface-container p-4 rounded-xl border border-white/5 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">terminal</span>
                  <span className="font-headline text-sm text-on-surface font-semibold">
                    Automated AI Code Repository Analysis
                  </span>
                </div>
                <span className="font-mono text-xs text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded border border-white/5">
                  {telemetry?.codeRepo.username || 'github:erostova'} • Sync Oct 2024
                </span>
              </div>
              <p className="text-xs text-on-surface leading-relaxed">
                Checked GitHub:{' '}
                <strong className="text-primary font-mono">
                  {telemetry?.codeRepo.commitsYear || 1420} commits
                </strong>{' '}
                across {telemetry?.codeRepo.reposCount || 8} enterprise repos; maintained 2 popular open-source LangChain adapters; verified high unit & integration test coverage (
                <strong className="text-tertiary font-mono">
                  {telemetry?.codeRepo.testCoverage || '>91%'}
                </strong>
                ).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
                  <div className="font-mono text-[10px] text-on-surface-variant uppercase">
                    Commit Velocity
                  </div>
                  <div className="font-mono text-sm text-primary font-bold mt-1">
                    {telemetry?.codeRepo.commitVelocity || '118 commits / mo'}
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">
                    {telemetry?.codeRepo.cohortPercentile || 'Top 0.5% in cohort'}
                  </div>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
                  <div className="font-mono text-[10px] text-on-surface-variant uppercase">
                    OSS Impact Index
                  </div>
                  <div className="font-mono text-sm text-tertiary font-bold mt-1">
                    {telemetry?.codeRepo.ossImpact || '4.8k Stars • 620 Forks'}
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">
                    {telemetry?.codeRepo.ossRole || 'LangChain Core Contributor'}
                  </div>
                </div>
                <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
                  <div className="font-mono text-[10px] text-on-surface-variant uppercase">
                    Architecture Smell Ratio
                  </div>
                  <div className="font-mono text-sm text-secondary font-bold mt-1">
                    {telemetry?.codeRepo.architectureSmell || '0.02 (Pristine)'}
                  </div>
                  <div className="text-[11px] text-on-surface-variant mt-0.5">
                    {telemetry?.codeRepo.vulnerabilities || '0 Security Vulnerabilities'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Verified Employment History */}
          <div className="bg-surface-container-low rounded-xl p-6 shadow-lg border border-white/5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">history_edu</span>
                <span className="font-headline text-lg text-on-surface font-semibold">
                  Verified Employment History & Backend Records
                </span>
              </div>
              <span className="font-mono text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded border border-white/5">
                Verified via The Work Number API
              </span>
            </div>

            <div className="space-y-4">
              {(telemetry?.employmentHistory || []).map((job) => (
                <div
                  key={job.company}
                  className="bg-surface-container p-4 rounded-xl border border-white/5 space-y-2 shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <span className="font-headline text-sm font-semibold text-primary">
                        {job.title}
                      </span>
                      <span className="text-sm font-semibold text-on-surface ml-1">
                        @ {job.company}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
                        {job.period} ({job.duration})
                      </span>
                      <span className="text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Verified
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface leading-relaxed">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {job.skills.map((s) => (
                      <span
                        key={s}
                        className="font-mono text-xs text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded border border-white/5"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Backend ATS Metadata & Internal Candidate Notes */}
          <div className="bg-surface-container-low rounded-xl p-6 shadow-lg border border-white/5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">database</span>
                <span className="font-headline text-lg text-on-surface font-semibold">
                  Backend ATS Metadata & Candidate Logs
                </span>
              </div>
              <span className="font-mono text-xs text-on-surface-variant">
                Greenhouse Integration #GH-77821
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase">
                  <span className="text-on-surface-variant">Application Ingestion</span>
                  <span className="text-tertiary font-bold">GREENHOUSE API</span>
                </div>
                <div className="text-sm font-semibold text-on-surface">
                  {telemetry?.atsMetadata.ingestedAt || 'Oct 24, 2024 at 14:32:10 UTC'}
                </div>
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  Source: {telemetry?.atsMetadata.source} • ID: {telemetry?.atsMetadata.candidateId}
                </div>
              </div>

              <div className="bg-surface-container p-4 rounded-xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase">
                  <span className="text-on-surface-variant">Compensation Alignment</span>
                  <span className="text-tertiary bg-tertiary/10 border border-tertiary/20 px-1.5 py-0.5 rounded font-bold">
                    Within Band
                  </span>
                </div>
                <div className="text-sm font-bold text-primary font-mono">
                  {telemetry?.atsMetadata.compensationBand || '$205,000 - $225,000 Base'}
                </div>
                <div className="text-xs text-on-surface-variant leading-relaxed">
                  {telemetry?.atsMetadata.approvedBudget}
                </div>
              </div>
            </div>

            {/* Internal Recruiter Dispatch Notes Form */}
            <div className="bg-surface-container p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-on-surface font-semibold">
                  Hiring Manager Screening Notes & Feedback
                </span>
                <span className="font-mono text-[10px] text-tertiary">
                  {telemetry?.atsMetadata.checkrTier || 'Tier 1 Clean Clearance'}
                </span>
              </div>

              <div className="space-y-2">
                {notesList.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-surface-container-low rounded-lg text-xs text-on-surface leading-relaxed border border-white/5 font-mono"
                  >
                    {note}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddNote} className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  placeholder="Dispatch review note to Greenhouse ATS..."
                  className="flex-1 bg-surface-container-lowest text-xs text-on-surface placeholder:text-on-surface-variant/50 px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  className="bg-surface-container-high hover:bg-surface-bright text-primary font-mono text-xs px-4 py-2 rounded-lg border border-white/5 transition-all"
                >
                  Post Note
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
