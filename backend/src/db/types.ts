export interface University {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Degree {
  id: string;
  universityId: string;
  name: string;
  code: string;
  createdAt: Date;
}

export interface Challenge {
  id: string;
  degreeId: string;
  title: string;
  type: 'code_fix' | 'design_review' | 'ledger_sort';
  configPayload: Record<string, unknown>;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  degree: string;
  status: 'pending' | 'in_review' | 'accepted' | 'rejected';
  scores: {
    code_fix: number | null;
    design_review: number | null;
    ledger_sort: number | null;
  };
  createdAt: Date;
}

export interface Submission {
  id: string;
  challengeId: string;
  applicantId: string;
  payload: Record<string, unknown>;
  score: number | null;
  aiSummary: string | null;
  aiHintsGiven: number;
  status: 'in_progress' | 'submitted' | 'graded';
  createdAt: Date;
  updatedAt: Date;
}
