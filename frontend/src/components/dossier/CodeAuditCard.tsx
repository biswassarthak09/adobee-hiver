import React from 'react';
import { CandidateTelemetry } from '../../types';

interface CodeAuditCardProps {
  telemetry?: CandidateTelemetry;
}

export const CodeAuditCard: React.FC<CodeAuditCardProps> = ({ telemetry }) => {
  return (
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
  );
};
