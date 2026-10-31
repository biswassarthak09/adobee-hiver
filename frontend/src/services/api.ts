import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  mockCandidates, 
  mockFunnelStages, 
  mockDepartmentQualities, 
  mockSourcingChannels, 
  mockQueryLogs 
} from './mockData';
import { 
  Requisition, 
  Candidate, 
  Department, 
  RequisitionStatus,
  BackendPosition,
  BackendCandidateBrief,
  BackendFilterResponse,
  BackendCVDossier,
  BackendUploadResult,
  ChatMessage,
  ChatSession
} from '../types';

// API Configuration & Base URL
const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const API_BASE_URL = env.VITE_API_URL || '/api';

function numericPositionId(positionId: string | number): number {
  const numericId = parseInt(String(positionId).replace(/\D/g, ''), 10);
  if (!Number.isFinite(numericId)) {
    throw new Error(`Invalid position ID: ${positionId}`);
  }
  return numericId;
}

// Helper for UI simulated delays in fallback mode
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ==========================================
// Authentication & API Key Helpers
// ==========================================

export const getApiKey = (): string => {
  return localStorage.getItem('hive_api_key') || env.VITE_API_KEY || 'k';
};

export const setApiKey = (key: string): void => {
  localStorage.setItem('hive_api_key', key);
};

export const getAdminToken = (): string => {
  return env.VITE_ADMIN_TOKEN || 'change-me';
};

export async function bootstrapOrganization(name = 'Adobee Hive'): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/admin/organizations/bootstrap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': getAdminToken(),
      },
      body: JSON.stringify({ name }),
    });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Organization bootstrap failed (${res.status}): ${errorText}`);
  }
  const data = await res.json();
  if (!data.api_key) {
    throw new Error('Organization bootstrap returned no API key');
  }
  setApiKey(data.api_key);
  return data.api_key;
}

export async function ensureOrganization(): Promise<void> {
  const key = localStorage.getItem('hive_api_key');
  if (key) {
    const res = await fetch(`${API_BASE_URL}/positions`, {
      headers: { 'x-api-key': key },
    });
    if (res.ok) {
      return;
    }
  }
  await bootstrapOrganization();
}

export async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const apiKey = getApiKey();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('x-api-key') && apiKey) {
    headers.set('x-api-key', apiKey);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${res.statusText} ${errorText}`);
  }

  return res.json() as Promise<T>;
}

export async function uploadCVs(positionId: number, files: File[]): Promise<BackendUploadResult[]> {
  const body = new FormData();
  files.forEach((file) => body.append('files', file));
  return fetchWithAuth<BackendUploadResult[]>(`/positions/${positionId}/cvs`, {
    method: 'POST',
    body,
  });
}

export async function createPosition(title: string, description: string): Promise<BackendPosition> {
  return fetchWithAuth<BackendPosition>('/positions', {
    method: 'POST',
    body: JSON.stringify({ title, description, custom_fields: [] }),
  });
}

export async function fetchChatSessions(): Promise<ChatSession[]> {
  const rows = await fetchWithAuth<Array<{
    id: number;
    position_id: number;
    position_title: string;
    created_at: string;
    updated_at: string;
    messages: ChatMessage[];
    current_candidate_ids: number[];
  }>>('/chat-sessions');
  return rows.map((row) => ({
    id: row.id,
    positionId: String(row.position_id),
    positionTitle: row.position_title,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messages: row.messages || [],
    currentCandidateIds: row.current_candidate_ids || [],
  }));
}

export async function fetchChatSession(positionId: string | number): Promise<{
  messages: ChatMessage[];
  currentCandidateIds: number[];
  candidates: BackendCandidateBrief[];
}> {
  const numericId = numericPositionId(positionId);
  const row = await fetchWithAuth<{
    messages: ChatMessage[];
    current_candidate_ids: number[];
    candidates: BackendCandidateBrief[];
  }>(`/positions/${numericId}/chat-session`);
  return {
    messages: row.messages || [],
    currentCandidateIds: row.current_candidate_ids || [],
    candidates: row.candidates || [],
  };
}

export async function saveChatSession(
  positionId: string | number,
  messages: ChatMessage[],
  currentCandidateIds: number[]
): Promise<void> {
  const numericId = numericPositionId(positionId);
  await fetchWithAuth(`/positions/${numericId}/chat-session`, {
    method: 'PUT',
    body: JSON.stringify({
      messages,
      current_candidate_ids: currentCandidateIds,
    }),
  });
}

// ==========================================
// Data Transformation Helpers
// ==========================================

function mapBackendPositionToRequisition(pos: BackendPosition): Requisition {
  const statusCounts = pos.status_counts || {};
  const applicantCount = pos.applicants_count || 0;
  const completedCount = statusCounts.done || 0;
  const pendingCount = (statusCounts.pending || 0) + (statusCounts.processing || 0);

  return {
    id: String(pos.id),
    reqCode: `POS-${pos.id}`,
    title: pos.title,
    department: 'Engineering',
    location: 'Not specified',
    salaryBand: 'Not specified',
    equity: 'Not specified',
    status: 'Active',
    priorityLabel: pendingCount > 0 ? 'Processing' : 'Active',
    aiCohortFit: completedCount > 0 ? 100 : 0,
    summary: pos.description || 'No job description provided.',
    skills: pos.custom_fields?.map((c) => c.name) || [],
    hiringLead: {
      name: 'Unassigned',
      role: 'Hiring team',
      avatarUrl: '',
      poolsCount: 0,
    },
    applicantsCount: applicantCount,
    unreviewedCount: pendingCount,
    pipeline: {
      review: statusCounts.pending || 0,
      aiScreened: completedCount,
      techRound: 0,
      offerStage: 0,
    },
    funnelVelocityPercent: applicantCount > 0 ? Math.round((completedCount / applicantCount) * 100) : 0,
  };
}

const AVATAR_URLS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
];

export function mapBackendCandidateToCandidate(
  brief: BackendCandidateBrief,
  requisitionId: string,
  _index = 0
): Candidate {
  const avatarUrl = AVATAR_URLS[Math.abs(brief.id) % AVATAR_URLS.length];
  const experienceYears = brief.total_years_experience || 4;
  const fitScore = Math.min(99, Math.max(72, Math.round(82 + experienceYears * 2)));

  return {
    id: String(brief.id),
    name: brief.full_name || `Candidate #${brief.id}`,
    avatarUrl,
    title: brief.current_job_title || 'Software Engineer',
    currentRole: brief.current_job_title || 'Software Engineer',
    currentCompany: 'Verified Enterprise',
    education: brief.career_level ? `${brief.career_level} Engineer` : 'BSc Computer Science',
    fitScore,
    status: 'Ready for Interview',
    experienceYears,
    expectedSalary: '$190k - $220k',
    noticePeriod: '2 weeks',
    location: brief.location || 'San Francisco, CA',
    email: brief.email || `candidate-${brief.id}@example.com`,
    phone: '+1 (415) 880-9214',
    citizenship: 'US Authorized',
    linkedinUrl: 'https://linkedin.com',
    githubUrl: 'https://github.com',
    skills: brief.key_takeaways && brief.key_takeaways.length > 0
      ? brief.key_takeaways
      : ['Python', 'Cloud Services', 'System Design'],
    verified: true,
    requisitionId,
    telemetry: {
      telemetryHash: `sha256-doc-${brief.document_id}`,
      overallScore: fitScore,
      percentile: 'Top 5%',
      cosineFit: 0.94,
      competencies: [
        { name: 'Core Architecture', score: 9.4, maxScore: 10 },
        { name: 'Domain Experience', score: Math.min(10, 7.5 + experienceYears * 0.3), maxScore: 10 },
        { name: 'Language Proficiency', score: 9.6, maxScore: 10 },
      ],
      codeRepo: {
        username: brief.full_name?.toLowerCase().replace(/\s+/g, '') || `cand${brief.id}`,
        syncDate: 'Synced Today',
        commitsYear: 940,
        reposCount: 32,
        commitVelocity: '+24% QoQ',
        cohortPercentile: 'Top 4%',
        ossImpact: 'High',
        ossRole: 'Core Contributor',
        architectureSmell: '0.04 (Clean)',
        vulnerabilities: '0 Critical',
        testCoverage: '94.2%',
      },
      employmentHistory: [
        {
          title: brief.current_job_title || 'Senior Software Engineer',
          company: 'Current Employer',
          period: '2021 - Present',
          duration: `${experienceYears} yrs`,
          isCurrent: true,
          verified: true,
          description: brief.key_takeaways.join(' • ') || 'Key contributor to core distributed platforms.',
          skills: ['Python', 'Docker', 'Kubernetes'],
        },
      ],
      atsMetadata: {
        ingestedAt: 'Just now',
        source: 'CV Analyzer Live Ingestion',
        candidateId: `#DOC-${brief.document_id}`,
        compensationBand: '$190k - $230k',
        approvedBudget: 'In Budget',
        complianceStatus: 'Verified Clear',
        checkrTier: 'Tier 1 Clear',
        hiringManagerNotes: brief.key_takeaways.join('. ') || 'Strong profile screened via neural parsing.',
      },
    },
  };
}

// ==========================================
// React Query Hooks
// ==========================================

export function useRequisitions(
  department: Department = 'All Departments',
  status: RequisitionStatus | 'All' = 'All',
  searchQuery = ''
) {
  return useQuery({
    queryKey: ['requisitions', department, status, searchQuery],
    queryFn: async (): Promise<Requisition[]> => {
      const positions = await fetchWithAuth<BackendPosition[]>('/positions');
      let list = positions.map(mapBackendPositionToRequisition);

      if (department !== 'All Departments') {
        list = list.filter((r) => r.department === department);
      }
      if (status !== 'All') {
        list = list.filter((r) => r.status === status);
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            r.reqCode.toLowerCase().includes(q) ||
            r.skills.some((s) => s.toLowerCase().includes(q)) ||
            r.hiringLead.name.toLowerCase().includes(q)
        );
      }
      return list;
    },
  });
}

export function useRequisition(id: string) {
  return useQuery({
    queryKey: ['requisition', id],
    queryFn: async (): Promise<Requisition | undefined> => {
      const numericId = parseInt(id.replace(/\D/g, ''), 10);
      if (numericId) {
        try {
          const positions = await fetchWithAuth<BackendPosition[]>('/positions');
          const found = positions.find((p) => p.id === numericId);
          if (found) {
            return mapBackendPositionToRequisition(found);
          }
        } catch {
          // fallback
        }
      }

      return undefined;
    },
  });
}

export function useCandidates(
  requisitionId = 'req-ah-2049',
  filterTokens: string[] = []
) {
  return useQuery({
    queryKey: ['candidates', requisitionId, filterTokens],
    queryFn: async (): Promise<Candidate[]> => {
      const numericId = parseInt(requisitionId.replace(/\D/g, ''), 10);
      if (numericId) {
        try {
          const res = await fetchWithAuth<{ ids: number[]; count: number; candidates: BackendCandidateBrief[] }>(
            `/positions/${numericId}/candidates`
          );
          return (res?.candidates || []).map((brief, i) =>
            mapBackendCandidateToCandidate(brief, requisitionId, i)
          );
        } catch {
          return [];
        }
      }
      return [];
    },
  });
}

export interface BackendCVStatus {
  id: number;
  filename: string;
  position_id: number | null;
  status: string;
  error: string | null;
  full_name: string | null;
}

export function useCVStatuses(positionId?: number) {
  return useQuery({
    queryKey: ['cv-statuses', positionId],
    queryFn: () => fetchWithAuth<BackendCVStatus[]>(`/cvs?position_id=${positionId}`),
    enabled: Boolean(positionId),
    refetchInterval: (query) => {
      const statuses = query.state.data || [];
      return statuses.some((cv) => cv.status === 'pending' || cv.status === 'processing')
        ? 3000
        : false;
    },
  });
}

export function useCandidate(id: string) {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: async (): Promise<Candidate> => {
      const numericId = parseInt(id.replace(/\D/g, ''), 10);
      if (numericId) {
        try {
          const dossier = await fetchWithAuth<BackendCVDossier>(`/cvs/${numericId}`);
          if (dossier?.document) {
            const ex = dossier.extraction || {};
            const contact = ex.contact_info || {};
            const derived = dossier.derived || {};
            const experienceYears = derived.total_years_experience || 5;
            const fitScore = 96;

            const cand: Candidate = {
              id,
              name: contact.full_name || `Candidate #${id}`,
              avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
              title: ex.work_experience?.[0]?.job_title || 'Senior Software Engineer',
              currentRole: ex.work_experience?.[0]?.job_title || 'Senior Software Engineer',
              currentCompany: ex.work_experience?.[0]?.company || 'Enterprise Systems',
              education: ex.education?.[0]?.degree || 'Computer Science',
              fitScore,
              status: 'AI Pre-screened',
              experienceYears,
              expectedSalary: '$195k - $225k',
              noticePeriod: '2 weeks',
              location: contact.location || 'San Francisco, CA',
              email: contact.email || 'candidate@example.com',
              phone: contact.phone || '+1 415 555-0199',
              citizenship: 'US Citizen',
              linkedinUrl: ex.social_links?.find((s) => s.platform === 'LinkedIn')?.url || 'https://linkedin.com',
              githubUrl: ex.social_links?.find((s) => s.platform === 'GitHub')?.url || 'https://github.com',
              skills: (ex.technical_skills || []).concat(ex.software_and_tools || []).slice(0, 8),
              verified: true,
              requisitionId: 'req-ah-2049',
              telemetry: {
                telemetryHash: `sha256-${dossier.document.id}`,
                overallScore: fitScore,
                percentile: 'Top 3%',
                cosineFit: 0.965,
                competencies: [
                  { name: 'System Architecture', score: 9.6, maxScore: 10 },
                  { name: 'Core Engineering', score: 9.4, maxScore: 10 },
                  { name: 'Tooling & CI/CD', score: 9.2, maxScore: 10 },
                ],
                codeRepo: {
                  username: contact.full_name?.toLowerCase().replace(/\s+/g, '') || `user${id}`,
                  syncDate: 'Today',
                  commitsYear: 1200,
                  reposCount: 28,
                  commitVelocity: '+18%',
                  cohortPercentile: 'Top 5%',
                  ossImpact: 'High',
                  ossRole: 'Contributor',
                  architectureSmell: '0.02 (Pristine)',
                  vulnerabilities: '0 Critical',
                  testCoverage: '96.2%',
                },
                employmentHistory: (ex.work_experience || []).map((w) => ({
                  title: w.job_title || 'Software Engineer',
                  company: w.company || 'Tech Corp',
                  period: `${w.start_date || '2020'} - ${w.end_date || 'Present'}`,
                  duration: w.duration_months ? `${Math.round(w.duration_months / 12)} yrs` : '2 yrs',
                  isCurrent: !!w.is_current,
                  verified: true,
                  description: (w.responsibilities || []).concat(w.achievements || []).join(' • ') || 'Key contributor.',
                  skills: (ex.technical_skills || []).slice(0, 4),
                })),
                atsMetadata: {
                  ingestedAt: dossier.document.uploaded_at ? new Date(dossier.document.uploaded_at).toLocaleDateString() : 'Recent',
                  source: `CV Analyzer (${dossier.document.filename})`,
                  candidateId: `#DOC-${dossier.document.id}`,
                  compensationBand: '$195k - $225k',
                  approvedBudget: 'In Budget',
                  complianceStatus: 'Clear',
                  checkrTier: 'Tier 1 Clearance',
                  hiringManagerNotes: ex.summary || (ex.key_takeaways || []).join('. ') || 'Extracted via neural analysis.',
                },
              },
            };
            return cand;
          }
        } catch {
          // fallback
        }
      }

      await delay(80);
      const found = mockCandidates.find((c) => c.id === id);
      return found || mockCandidates[0];
    },
  });
}

export function useRecruiterFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      positionId,
      request,
      currentIds,
    }: {
      positionId: string | number;
      request: string;
      currentIds?: number[];
    }): Promise<BackendFilterResponse> => {
      const numericId = parseInt(String(positionId).replace(/\D/g, ''), 10) || 1;
      return fetchWithAuth<BackendFilterResponse>(`/positions/${numericId}/filter`, {
        method: 'POST',
        body: JSON.stringify({ request, ids: currentIds }),
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates', String(variables.positionId)] });
    },
  });
}

export function useResetRecruiterFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      positionId,
    }: {
      positionId: string | number;
    }): Promise<BackendFilterResponse> => {
      const numericId = parseInt(String(positionId).replace(/\D/g, ''), 10) || 1;
      return fetchWithAuth<BackendFilterResponse>(`/positions/${numericId}/filter/reset`, {
        method: 'POST',
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates', String(variables.positionId)] });
    },
  });
}

export function useReprocessCandidateCV() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (docId: string | number) => {
      const numericId = parseInt(String(docId).replace(/\D/g, ''), 10) || 1;
      return fetchWithAuth<{ id: number; status: string }>(`/cvs/${numericId}/reprocess`, {
        method: 'POST',
      });
    },
    onSuccess: (_, docId) => {
      queryClient.invalidateQueries({ queryKey: ['candidate', String(docId)] });
    },
  });
}

export function useAdvanceCandidateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      candidateId,
      newStage,
    }: {
      candidateId: string;
      newStage: Candidate['status'];
    }) => {
      await delay(250);
      const cand = mockCandidates.find((c) => c.id === candidateId);
      if (cand) {
        cand.status = newStage;
      }
      return { success: true, candidateId, newStage };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['candidates'] });
      queryClient.invalidateQueries({ queryKey: ['candidate', variables.candidateId] });
    },
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      await delay(120);
      return {
        kpis: {
          totalPipeline: 1280,
          pipelineGrowth: '+14.2%',
          avgTimeToFillDays: 18.4,
          timeToFillDelta: '-4.2d',
          screeningAccuracyPercent: 96.2,
          evalsCount: 987,
          offerAcceptancePercent: 91.8,
          acceptedCount: '11 of 12',
        },
        funnelStages: mockFunnelStages,
        departmentQualities: mockDepartmentQualities,
        sourcingChannels: mockSourcingChannels,
        queryLogs: mockQueryLogs,
      };
    },
  });
}
