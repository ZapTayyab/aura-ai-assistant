// User types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Project types
export interface Project {
  id: string;
  name: string;
  domain?: string;
  createdAt: string;
  updatedAt: string;
  auditCount: number;
}

// Audit types
export type AuditStatus = 'pending' | 'processing' | 'done' | 'failed';
export type AuditMode = 'url' | 'content';
export type IssueSeverity = 'P0' | 'P1' | 'P2';

export interface Audit {
  id: string;
  projectId: string;
  status: AuditStatus;
  createdAt: string;
  url?: string;
  targetQuery: string;
  mode: AuditMode;
}

export interface AuditIssue {
  id: string;
  severity: IssueSeverity;
  title: string;
  whyItMatters: string;
  howToFix: string;
}

export interface AuditChunk {
  headingPath: string[];
  text: string;
  similarity: number;
}

export interface AuditOutput {
  answerFirstIntro: string;
  outline: Array<{ heading: string; bullets?: string[] }>;
  faqs: Array<{ q: string; a: string }>;
  keyTakeaways: string[];
  schemaJsonLd: string;
}

export interface AuditExtracted {
  title?: string;
  metaDescription?: string;
  headings?: Array<{ level: number; text: string }>;
}

export interface AuditReport {
  auditId: string;
  overallScore: number;
  retrievalScore: number;
  citationReadinessScore: number;
  categories: {
    technical: number;
    structure: number;
    coverage: number;
    trust: number;
  };
  issues: AuditIssue[];
  bestChunk: AuditChunk;
  outputs: AuditOutput;
  extracted: AuditExtracted;
}

// API types
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
