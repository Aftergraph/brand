/** Framework-neutral UI contracts for Aftergraph actor-presence surfaces. */
export type CharacterRole = 'entity' | 'guide' | 'builder' | 'verifier' | 'observer' | 'researcher';
export type CharacterState =
  | 'idle' | 'thinking' | 'planning' | 'executing' | 'inspecting' | 'waiting'
  | 'blocked' | 'approval-required' | 'verifying' | 'completed' | 'failed';
export type AttentionLevel = 'none' | 'informational' | 'required' | 'critical';
export type VerificationVerdict = 'not-run' | 'running' | 'passed' | 'failed' | 'indeterminate';

export interface ProgressDescriptor {
  current: number;
  total?: number;
  unit?: 'steps' | 'items' | 'percent';
  label?: string;
}

export interface EvidenceRef {
  id: string;
  kind: 'artifact' | 'receipt' | 'trace' | 'attestation' | 'source';
  label?: string;
  href?: string;
  verified?: boolean;
}

export interface ActorPresenceBaseProps {
  actorId: string;
  label: string;
  role: CharacterRole;
  state: CharacterState;
  progress?: ProgressDescriptor;
  evidence?: readonly EvidenceRef[];
  attention?: AttentionLevel;
  ariaLabel?: string;
}

export interface AgentStatusCardProps extends ActorPresenceBaseProps {
  summary?: string;
  detail?: string;
  onInspect?: (actorId: string) => void;
}

export interface ApprovalRequestDescriptor {
  requestId: string;
  authorityBoundary: string;
  requestedAction: string;
  reversible: boolean;
}

export interface ApprovalCardProps extends ActorPresenceBaseProps {
  state: 'approval-required';
  approval: ApprovalRequestDescriptor;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
}

export interface VerificationPanelProps extends ActorPresenceBaseProps {
  role: 'verifier';
  state: 'verifying' | 'completed' | 'failed';
  verdict: VerificationVerdict;
  evidence: readonly EvidenceRef[];
  checkedAt?: string;
  onOpenEvidence?: (evidenceId: string) => void;
}
