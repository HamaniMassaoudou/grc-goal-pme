import { 
  Risk, 
  SoAControl, 
  CorrectiveAction, 
  Asset, 
  Organization, 
  Collaborator, 
  TestProtocolLog, 
  UserTestSheet,
  EvidenceFile 
} from '../types/grc';
import { 
  UserAccount, 
  RoleDefinition, 
  SecurityAuditLog, 
  SecuritySettings 
} from '../types/auth';
import { AppNotification } from '../types/notification';

// ==================== ORGANISATIONS ====================
export function fromApiOrg(raw: any): Organization {
  return {
    id: raw.id,
    slug: raw.slug || '',
    name: raw.name,
    legalName: raw.legal_name || '',
    sector: raw.sector || '',
    size: raw.size || '',
    address: raw.address || '',
    phone: raw.phone || '',
    contactName: raw.contact_name || '',
    contactEmail: raw.contact_email || '',
    securityOfficer: raw.security_officer || '',
    description: raw.description || '',
    grcScope: raw.grc_scope || '',
    status: raw.status || 'active',
    isDemo: Boolean(raw.is_demo),
    creatorUserId: raw.creator_user_id || undefined,
    createdAt: raw.created_at ? String(raw.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
    updatedAt: raw.updated_at ? String(raw.updated_at).slice(0, 10) : undefined
  };
}

export function toApiOrg(org: Partial<Organization>): any {
  const payload: any = {};
  if (org.id !== undefined) payload.id = org.id;
  if (org.slug !== undefined) payload.slug = org.slug;
  if (org.name !== undefined) payload.name = org.name;
  if (org.legalName !== undefined) payload.legal_name = org.legalName;
  if (org.sector !== undefined) payload.sector = org.sector;
  if (org.size !== undefined) payload.size = org.size;
  if (org.address !== undefined) payload.address = org.address;
  if (org.phone !== undefined) payload.phone = org.phone;
  if (org.contactName !== undefined) payload.contact_name = org.contactName;
  if (org.contactEmail !== undefined) payload.contact_email = org.contactEmail;
  if (org.securityOfficer !== undefined) payload.security_officer = org.securityOfficer;
  if (org.description !== undefined) payload.description = org.description;
  if (org.grcScope !== undefined) payload.grc_scope = org.grcScope;
  if (org.status !== undefined) payload.status = org.status;
  if (org.isDemo !== undefined) payload.is_demo = org.isDemo;
  if (org.creatorUserId !== undefined) payload.creator_user_id = org.creatorUserId;
  return payload;
}

// ==================== COLLABORATEURS ====================
export function fromApiCollaborator(raw: any): Collaborator {
  const orgId = typeof raw.organization === 'object' && raw.organization ? raw.organization.id : (raw.organization || raw.organization_id || '');
  const userId = typeof raw.user === 'object' && raw.user ? raw.user.id : (raw.user || raw.user_id || undefined);
  return {
    id: raw.id,
    organizationId: orgId,
    userId: userId,
    fullName: raw.full_name,
    email: raw.email,
    phone: raw.phone || '',
    department: raw.department || '',
    jobTitle: raw.job_title || '',
    roleId: raw.role_id || 'role-viewer',
    grcResponsibilities: raw.grc_responsibilities || '',
    isPlatformUser: Boolean(raw.is_platform_user),
    invitationStatus: raw.invitation_status || 'invite',
    invitedAt: raw.invited_at ? String(raw.invited_at).slice(0, 10) : undefined,
    joinedAt: raw.joined_at ? String(raw.joined_at).slice(0, 10) : undefined,
    createdAt: raw.created_at ? String(raw.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
    updatedAt: raw.updated_at ? String(raw.updated_at).slice(0, 10) : undefined
  };
}

export function toApiCollaborator(c: Partial<Collaborator>): any {
  const payload: any = {};
  if (c.id !== undefined) payload.id = c.id;
  if (c.organizationId !== undefined) payload.organization = c.organizationId;
  if (c.userId !== undefined) payload.user = c.userId || null;
  if (c.fullName !== undefined) payload.full_name = c.fullName;
  if (c.email !== undefined) payload.email = c.email;
  if (c.phone !== undefined) payload.phone = c.phone;
  if (c.department !== undefined) payload.department = c.department;
  if (c.jobTitle !== undefined) payload.job_title = c.jobTitle;
  if (c.roleId !== undefined) payload.role_id = c.roleId;
  if (c.grcResponsibilities !== undefined) payload.grc_responsibilities = c.grcResponsibilities;
  if (c.isPlatformUser !== undefined) payload.is_platform_user = c.isPlatformUser;
  if (c.invitationStatus !== undefined) payload.invitation_status = c.invitationStatus;
  if (c.invitedAt !== undefined) payload.invited_at = c.invitedAt;
  if (c.joinedAt !== undefined) payload.joined_at = c.joinedAt;
  return payload;
}

// ==================== ACTIFS ====================
export function fromApiAsset(raw: any): Asset {
  const orgId = typeof raw.organization === 'object' && raw.organization ? raw.organization.id : (raw.organization || '');
  return {
    id: raw.id,
    name: raw.name,
    category: raw.category,
    description: raw.description,
    owner: raw.owner,
    criticality: raw.criticality,
    location: raw.location || '',
    createdAt: raw.created_at ? String(raw.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
    organizationId: orgId
  };
}

export function toApiAsset(a: Partial<Asset>): any {
  const payload: any = {};
  if (a.id !== undefined) payload.id = a.id;
  if (a.name !== undefined) payload.name = a.name;
  if (a.category !== undefined) payload.category = a.category;
  if (a.description !== undefined) payload.description = a.description;
  if (a.owner !== undefined) payload.owner = a.owner;
  if (a.criticality !== undefined) payload.criticality = a.criticality;
  if (a.location !== undefined) payload.location = a.location;
  if (a.organizationId !== undefined) payload.organization = a.organizationId;
  return payload;
}

// ==================== RISQUES ====================
export function fromApiRisk(raw: any): Risk {
  const assetId = typeof raw.asset === 'object' && raw.asset ? raw.asset.id : (raw.asset || '');
  const orgId = typeof raw.organization === 'object' && raw.organization ? raw.organization.id : (raw.organization || '');
  return {
    id: raw.id,
    code: raw.code,
    title: raw.title,
    description: raw.description,
    assetId: assetId,
    threat: raw.threat,
    vulnerability: raw.vulnerability,
    owner: raw.owner,
    probability: raw.probability,
    impact: raw.impact,
    score: raw.score,
    level: raw.level,
    strategy: raw.strategy,
    treatmentNotes: raw.treatment_notes || '',
    residualProbability: raw.residual_probability !== null ? raw.residual_probability : undefined,
    residualImpact: raw.residual_impact !== null ? raw.residual_impact : undefined,
    residualScore: raw.residual_score !== null ? raw.residual_score : undefined,
    residualLevel: raw.residual_level || undefined,
    status: raw.status,
    createdAt: raw.created_at ? String(raw.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
    updatedAt: raw.updated_at ? String(raw.updated_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
    organizationId: orgId
  };
}

export function toApiRisk(r: Partial<Risk>): any {
  const payload: any = {};
  if (r.id !== undefined) payload.id = r.id;
  if (r.code !== undefined) payload.code = r.code;
  if (r.title !== undefined) payload.title = r.title;
  if (r.description !== undefined) payload.description = r.description;
  if (r.assetId !== undefined) payload.asset = r.assetId;
  if (r.threat !== undefined) payload.threat = r.threat;
  if (r.vulnerability !== undefined) payload.vulnerability = r.vulnerability;
  if (r.owner !== undefined) payload.owner = r.owner;
  if (r.probability !== undefined) payload.probability = r.probability;
  if (r.impact !== undefined) payload.impact = r.impact;
  if (r.score !== undefined) payload.score = r.score;
  if (r.level !== undefined) payload.level = r.level;
  if (r.strategy !== undefined) payload.strategy = r.strategy;
  if (r.treatmentNotes !== undefined) payload.treatment_notes = r.treatmentNotes;
  if (r.residualProbability !== undefined) payload.residual_probability = r.residualProbability;
  if (r.residualImpact !== undefined) payload.residual_impact = r.residualImpact;
  if (r.residualScore !== undefined) payload.residual_score = r.residualScore;
  if (r.residualLevel !== undefined) payload.residual_level = r.residualLevel;
  if (r.status !== undefined) payload.status = r.status;
  if (r.organizationId !== undefined) payload.organization = r.organizationId;
  return payload;
}

// ==================== SoA CONTROLS ====================
export function fromApiSoA(raw: any): SoAControl {
  const orgId = typeof raw.organization === 'object' && raw.organization ? raw.organization.id : (raw.organization || undefined);
  return {
    id: raw.id,
    code: raw.code,
    title: raw.title,
    domain: raw.domain,
    description: raw.description,
    isApplicable: Boolean(raw.is_applicable),
    justification: raw.justification || '',
    implementationStatus: raw.implementation_status,
    maturityLevel: raw.maturity_level as any,
    evidenceRef: raw.evidence_ref || '',
    gapDescription: raw.gap_description || '',
    linkedActionId: raw.linked_action_id || undefined,
    lastReviewDate: raw.last_review_date ? String(raw.last_review_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
    reviewedBy: raw.reviewed_by || '',
    organizationId: orgId
  };
}

export function toApiSoA(c: Partial<SoAControl>): any {
  const payload: any = {};
  if (c.id !== undefined) payload.id = c.id;
  if (c.code !== undefined) payload.code = c.code;
  if (c.title !== undefined) payload.title = c.title;
  if (c.domain !== undefined) payload.domain = c.domain;
  if (c.description !== undefined) payload.description = c.description;
  if (c.isApplicable !== undefined) payload.is_applicable = c.isApplicable;
  if (c.justification !== undefined) payload.justification = c.justification;
  if (c.implementationStatus !== undefined) payload.implementation_status = c.implementationStatus;
  if (c.maturityLevel !== undefined) payload.maturity_level = c.maturityLevel;
  if (c.evidenceRef !== undefined) payload.evidence_ref = c.evidenceRef;
  if (c.gapDescription !== undefined) payload.gap_description = c.gapDescription;
  if (c.linkedActionId !== undefined) payload.linked_action_id = c.linkedActionId || null;
  if (c.lastReviewDate !== undefined) payload.last_review_date = c.lastReviewDate;
  if (c.reviewedBy !== undefined) payload.reviewed_by = c.reviewedBy;
  if (c.organizationId !== undefined) payload.organization = c.organizationId;
  return payload;
}

// ==================== ACTIONS CORRECTIVES ====================
export function fromApiAction(raw: any): CorrectiveAction {
  const orgId = typeof raw.organization === 'object' && raw.organization ? raw.organization.id : (raw.organization || '');
  return {
    id: raw.id,
    code: raw.code,
    title: raw.title,
    description: raw.description,
    source: raw.source,
    linkedRiskId: raw.linked_risk_id || undefined,
    linkedControlCode: raw.linked_control_code || undefined,
    owner: raw.owner,
    priority: raw.priority,
    dueDate: raw.due_date ? String(raw.due_date).slice(0, 10) : '',
    status: raw.status,
    evidenceOfClosure: raw.evidence_of_closure || '',
    comments: Array.isArray(raw.comments) ? raw.comments : [],
    organizationId: orgId,
    createdAt: raw.created_at ? String(raw.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
    closedAt: raw.closed_at ? String(raw.closed_at).slice(0, 10) : undefined
  };
}

export function toApiAction(a: Partial<CorrectiveAction>): any {
  const payload: any = {};
  if (a.id !== undefined) payload.id = a.id;
  if (a.code !== undefined) payload.code = a.code;
  if (a.title !== undefined) payload.title = a.title;
  if (a.description !== undefined) payload.description = a.description;
  if (a.source !== undefined) payload.source = a.source;
  if (a.linkedRiskId !== undefined) payload.linked_risk_id = a.linkedRiskId || null;
  if (a.linkedControlCode !== undefined) payload.linked_control_code = a.linkedControlCode || null;
  if (a.owner !== undefined) payload.owner = a.owner;
  if (a.priority !== undefined) payload.priority = a.priority;
  if (a.dueDate !== undefined) payload.due_date = a.dueDate;
  if (a.status !== undefined) payload.status = a.status;
  if (a.evidenceOfClosure !== undefined) payload.evidence_of_closure = a.evidenceOfClosure;
  if (a.comments !== undefined) payload.comments = a.comments;
  if (a.organizationId !== undefined) payload.organization = a.organizationId;
  if (a.closedAt !== undefined) payload.closed_at = a.closedAt || null;
  return payload;
}

// ==================== UTILISATEURS ====================
export function fromApiUser(raw: any): UserAccount {
  return {
    id: raw.id,
    firstName: raw.first_name || '',
    lastName: raw.last_name || '',
    name: raw.name || `${raw.first_name || ''} ${raw.last_name || ''}`.trim(),
    email: raw.email,
    phone: raw.phone || '',
    jobTitle: raw.job_title || '',
    department: raw.department || '',
    organizationId: raw.organization_id || '',
    organizationIds: Array.isArray(raw.organization_ids) ? raw.organization_ids : (raw.organization_id ? [raw.organization_id] : []),
    organizationName: raw.organization_name || '',
    roleIds: Array.isArray(raw.role_ids) ? raw.role_ids : ['role-viewer'],
    status: raw.status || 'actif',
    passwordSalt: 'django_managed',
    passwordHash: 'django_pbkdf2_sha256',
    mustChangePassword: Boolean(raw.must_change_password),
    mfaEnabled: Boolean(raw.mfa_enabled),
    failedLoginAttempts: raw.failed_login_attempts || 0,
    lockedUntil: raw.locked_until || null,
    createdAt: raw.created_at ? String(raw.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10),
    lastLoginAt: raw.last_login_at ? String(raw.last_login_at).slice(0, 16) : null,
    lastLoginIp: raw.last_login_ip || null,
    avatarColor: raw.avatar_color || 'bg-indigo-600'
  };
}

export function toApiUser(u: Partial<UserAccount>, plainPassword?: string): any {
  const payload: any = {};
  if (u.id !== undefined) payload.id = u.id;
  if (u.firstName !== undefined) payload.first_name = u.firstName;
  if (u.lastName !== undefined) payload.last_name = u.lastName;
  if (u.name !== undefined) payload.name = u.name;
  if (u.email !== undefined) payload.email = u.email;
  if (u.phone !== undefined) payload.phone = u.phone;
  if (u.jobTitle !== undefined) payload.job_title = u.jobTitle;
  if (u.department !== undefined) payload.department = u.department;
  if (u.organizationId !== undefined && u.organizationId !== '') payload.organization_id = u.organizationId;
  if (u.organizationIds !== undefined) payload.organization_ids = u.organizationIds;
  if (u.organizationName !== undefined) payload.organization_name = u.organizationName;
  if (u.roleIds !== undefined) payload.role_ids = u.roleIds;
  if (u.status !== undefined) payload.status = u.status;
  if (u.mustChangePassword !== undefined) payload.must_change_password = u.mustChangePassword;
  if (u.mfaEnabled !== undefined) payload.mfa_enabled = u.mfaEnabled;
  if (u.avatarColor !== undefined) payload.avatar_color = u.avatarColor;
  if (plainPassword) payload.password = plainPassword;
  return payload;
}

// ==================== RÔLES ====================
export function fromApiRole(raw: any): RoleDefinition {
  return {
    id: raw.id,
    code: raw.code,
    name: raw.name,
    description: raw.description || '',
    isSystem: Boolean(raw.is_system),
    isActive: Boolean(raw.is_active),
    color: raw.color || 'bg-blue-600',
    permissions: raw.permissions || {}
  };
}

export function toApiRole(r: Partial<RoleDefinition>): any {
  const payload: any = {};
  if (r.id !== undefined) payload.id = r.id;
  if (r.code !== undefined) payload.code = r.code;
  if (r.name !== undefined) payload.name = r.name;
  if (r.description !== undefined) payload.description = r.description;
  if (r.isSystem !== undefined) payload.is_system = r.isSystem;
  if (r.isActive !== undefined) payload.is_active = r.isActive;
  if (r.color !== undefined) payload.color = r.color;
  if (r.permissions !== undefined) payload.permissions = r.permissions;
  return payload;
}

// ==================== NOTIFICATIONS ====================
export function fromApiNotification(raw: any): AppNotification {
  return {
    id: raw.id,
    recipientUserId: raw.target_user_id || undefined,
    type: raw.type as any,
    priority: 'info' as any,
    category: (raw.resource_type || 'system') as any,
    title: raw.title,
    message: raw.message,
    createdAt: raw.created_at || new Date().toISOString(),
    isRead: Boolean(raw.is_read),
    readAt: raw.read_at || undefined,
    targetModule: raw.resource_type || undefined,
    targetResourceId: raw.resource_id || undefined,
    actionLabel: 'Consulter',
    organizationId: 'org-pme-demo'
  };
}

// ==================== PROTOCOLE & FICHES DE TEST ====================
export function fromApiTestProtocol(raw: any): TestProtocolLog {
  return {
    id: raw.id,
    date: raw.date ? String(raw.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
    testerName: raw.tester_name,
    testerRole: raw.tester_role,
    organizationName: raw.organization_name,
    durationMinutes: raw.duration_minutes || 0,
    scenariosCompleted: Array.isArray(raw.scenarios_completed) ? raw.scenarios_completed : [],
    feedbackNotes: raw.feedback_notes || '',
    perceivedUtility: raw.perceived_utility as any,
    signedByTester: Boolean(raw.signed_by_tester)
  };
}

export function toApiTestProtocol(p: Partial<TestProtocolLog>): any {
  const payload: any = {};
  if (p.id !== undefined) payload.id = p.id;
  if (p.date !== undefined) payload.date = p.date;
  if (p.testerName !== undefined) payload.tester_name = p.testerName;
  if (p.testerRole !== undefined) payload.tester_role = p.testerRole;
  if (p.organizationName !== undefined) payload.organization_name = p.organizationName;
  if (p.durationMinutes !== undefined) payload.duration_minutes = p.durationMinutes;
  if (p.scenariosCompleted !== undefined) payload.scenarios_completed = p.scenariosCompleted;
  if (p.feedbackNotes !== undefined) payload.feedback_notes = p.feedbackNotes;
  if (p.perceivedUtility !== undefined) payload.perceived_utility = p.perceivedUtility;
  if (p.signedByTester !== undefined) payload.signed_by_tester = p.signedByTester;
  return payload;
}

export function fromApiTestSheet(raw: any): UserTestSheet {
  return {
    id: raw.id,
    code: raw.code,
    userId: raw.user_id || undefined,
    testerName: raw.tester_name,
    testerEmail: raw.tester_email,
    testerRole: raw.tester_role,
    organizationName: raw.organization_name,
    sessionTitle: raw.session_title,
    date: raw.date ? String(raw.date).slice(0, 10) : new Date().toISOString().slice(0, 10),
    durationMinutes: raw.duration_minutes || 0,
    testEnvironment: raw.test_environment || '',
    tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
    globalScorePercent: raw.global_score_percent || 0,
    functionalitiesUnderstood: raw.functionalities_understood || '',
    difficultiesEncountered: raw.difficulties_encountered || '',
    suggestions: raw.suggestions || '',
    feedbackNotes: raw.feedback_notes || '',
    perceivedUtility: raw.perceived_utility as any,
    recommendationScore: raw.recommendation_score || 10,
    signedByTester: Boolean(raw.signed_by_tester),
    signatureDate: raw.signature_date || '',
    mentorOrEvaluatorName: raw.mentor_or_evaluator_name || undefined,
    mentorNotes: raw.mentor_notes || undefined,
    mentorValidated: Boolean(raw.mentor_validated),
    createdAt: raw.created_at || new Date().toISOString(),
    updatedAt: raw.updated_at || new Date().toISOString()
  };
}

export function toApiTestSheet(s: Partial<UserTestSheet>): any {
  const payload: any = {};
  if (s.id !== undefined) payload.id = s.id;
  if (s.code !== undefined) payload.code = s.code;
  if (s.userId !== undefined) payload.user_id = s.userId || null;
  if (s.testerName !== undefined) payload.tester_name = s.testerName;
  if (s.testerEmail !== undefined) payload.tester_email = s.testerEmail;
  if (s.testerRole !== undefined) payload.tester_role = s.testerRole;
  if (s.organizationName !== undefined) payload.organization_name = s.organizationName;
  if (s.sessionTitle !== undefined) payload.session_title = s.sessionTitle;
  if (s.date !== undefined) payload.date = s.date;
  if (s.durationMinutes !== undefined) payload.duration_minutes = s.durationMinutes;
  if (s.testEnvironment !== undefined) payload.test_environment = s.testEnvironment;
  if (s.tasks !== undefined) payload.tasks = s.tasks;
  if (s.globalScorePercent !== undefined) payload.global_score_percent = s.globalScorePercent;
  if (s.functionalitiesUnderstood !== undefined) payload.functionalities_understood = s.functionalitiesUnderstood;
  if (s.difficultiesEncountered !== undefined) payload.difficulties_encountered = s.difficultiesEncountered;
  if (s.suggestions !== undefined) payload.suggestions = s.suggestions;
  if (s.feedbackNotes !== undefined) payload.feedback_notes = s.feedbackNotes;
  if (s.perceivedUtility !== undefined) payload.perceived_utility = s.perceivedUtility;
  if (s.recommendationScore !== undefined) payload.recommendation_score = s.recommendationScore;
  if (s.signedByTester !== undefined) payload.signed_by_tester = s.signedByTester;
  if (s.signatureDate !== undefined) payload.signature_date = s.signatureDate;
  if (s.mentorOrEvaluatorName !== undefined) payload.mentor_or_evaluator_name = s.mentorOrEvaluatorName;
  if (s.mentorNotes !== undefined) payload.mentor_notes = s.mentorNotes;
  if (s.mentorValidated !== undefined) payload.mentor_validated = s.mentorValidated;
  return payload;
}

// ==================== AUDIT LOGS ====================
export function fromApiAuditLog(raw: any): SecurityAuditLog {
  return {
    id: raw.id,
    timestamp: raw.timestamp ? String(raw.timestamp).replace('T', ' ').slice(0, 19) : new Date().toISOString(),
    eventType: raw.event_type as any,
    severity: raw.severity || 'info',
    actorId: raw.actor_id || 'system',
    actorName: raw.actor_name || 'Système GRC-Goal',
    actorEmail: raw.actor_email || 'system@grc-goal.local',
    targetResource: raw.target_resource,
    targetId: raw.target_id || undefined,
    details: raw.details,
    ipAddress: raw.ip_address || '192.168.1.10'
  };
}

export function toApiAuditLog(l: Partial<SecurityAuditLog>): any {
  return {
    id: l.id,
    event_type: l.eventType,
    severity: l.severity,
    actor_id: l.actorId || 'system',
    actor_name: l.actorName || 'Système GRC-Goal',
    actor_email: l.actorEmail || 'system@grc-goal.local',
    target_resource: l.targetResource || 'system',
    target_id: l.targetId || null,
    details: l.details || '',
    ip_address: l.ipAddress || '192.168.1.10'
  };
}

// ==================== PARAMÈTRES DE SÉCURITÉ ====================
export function fromApiSecuritySettings(raw: any): SecuritySettings {
  return {
    passwordMinLength: raw.password_min_length || 8,
    passwordRequireUppercase: Boolean(raw.password_require_uppercase),
    passwordRequireNumbers: Boolean(raw.password_require_numbers),
    passwordRequireSymbols: Boolean(raw.password_require_symbols),
    maxFailedAttempts: raw.max_failed_attempts || 5,
    lockoutDurationMinutes: raw.lockout_duration_minutes || 15,
    sessionTimeoutMinutes: raw.session_timeout_minutes || 120,
    mfaMandatoryForAdmins: Boolean(raw.mfa_mandatory_for_admins)
  };
}

export function toApiSecuritySettings(s: Partial<SecuritySettings>): any {
  return {
    password_min_length: s.passwordMinLength,
    password_require_uppercase: s.passwordRequireUppercase,
    password_require_numbers: s.passwordRequireNumbers,
    password_require_symbols: s.passwordRequireSymbols,
    max_failed_attempts: s.maxFailedAttempts,
    lockout_duration_minutes: s.lockoutDurationMinutes,
    session_timeout_minutes: s.sessionTimeoutMinutes,
    mfa_mandatory_for_admins: s.mfaMandatoryForAdmins
  };
}

// ==================== FICHIERS DE PREUVES ====================
export function fromApiEvidenceFile(raw: any): EvidenceFile {
  return {
    id: raw.id,
    title: raw.title || '',
    filename: raw.filename || '',
    fileSize: raw.file_size || 0,
    formattedSize: raw.formatted_size || '0 B',
    mimeType: raw.mime_type || '',
    sha256Hash: raw.sha256_hash || '',
    linkedType: raw.linked_type || 'soa_control',
    linkedId: raw.linked_id || '',
    notes: raw.notes || '',
    uploadedByName: raw.uploaded_by_name || '',
    uploadedByEmail: raw.uploaded_by_email || '',
    organizationId: raw.organization || '',
    createdAt: raw.created_at ? String(raw.created_at) : new Date().toISOString(),
    updatedAt: raw.updated_at ? String(raw.updated_at) : new Date().toISOString(),
    fileUrl: raw.file_url || raw.file || ''
  };
}
