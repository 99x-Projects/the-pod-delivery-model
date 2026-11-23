export type Level = "low" | "medium" | "high";

export type RoleId =
  | "architect"
  | "developer"
  | "qa"
  | "devops"
  | "delivery-manager"
  | "ui-ux"
  | "product-manager";

export type Skill = {
  id: string;
  title: string;
  store: string;
  autonomy: Level;
  judgement: Level;
  fits: RoleId[];
};

export const SKILL_STORES: { id: string; label: string }[] = [
  { id: "pre-sales-agents-store", label: "Pre-sales" },
  { id: "analyst-agents-store", label: "Analysis" },
  { id: "ux-agents-store", label: "UX and design" },
  { id: "architect-agents-store", label: "Architecture" },
  { id: "coding-agents-store", label: "Coding" },
  { id: "qa-agents-store", label: "Quality assurance" },
  { id: "devops-agents-store", label: "DevOps" },
  { id: "compliance-agents-store", label: "Compliance and privacy" },
  { id: "data-platform-agents-store", label: "Data platforms" },
  { id: "delivery-agents-store", label: "Delivery management" },
  { id: "idf-agents-store", label: "Delivery process" },
  { id: "feature-agents-store", label: "Feature builders" },
];

export const SKILLS: Skill[] = [
  { id: "ai-readiness-assessment", title: "AI Readiness Assessment", store: "pre-sales-agents-store", autonomy: "medium", judgement: "high", fits: ["product-manager", "architect"] },
  { id: "casestudy-drafter", title: "Case Study Drafter", store: "pre-sales-agents-store", autonomy: "medium", judgement: "medium", fits: [] },
  { id: "discovery-interview", title: "Discovery Interview", store: "pre-sales-agents-store", autonomy: "low", judgement: "high", fits: ["product-manager", "delivery-manager"] },
  { id: "elaborate", title: "Elaborate", store: "pre-sales-agents-store", autonomy: "high", judgement: "medium", fits: ["product-manager"] },
  { id: "estimate", title: "Estimate", store: "pre-sales-agents-store", autonomy: "high", judgement: "high", fits: ["delivery-manager", "product-manager"] },
  { id: "explore-agentic-ai-usecases", title: "Explore Agentic AI Use Cases", store: "pre-sales-agents-store", autonomy: "high", judgement: "high", fits: ["product-manager"] },
  { id: "proposal", title: "Proposal", store: "pre-sales-agents-store", autonomy: "high", judgement: "high", fits: ["product-manager"] },
  { id: "requirement-analyzer", title: "Requirement Analyzer", store: "analyst-agents-store", autonomy: "high", judgement: "high", fits: ["product-manager", "architect"] },
  { id: "competitive-analysis", title: "Competitive Analysis", store: "ux-agents-store", autonomy: "high", judgement: "medium", fits: ["ui-ux", "product-manager"] },
  { id: "design-concept-lab", title: "Design Concept Lab", store: "ux-agents-store", autonomy: "medium", judgement: "high", fits: ["ui-ux"] },
  { id: "design-consistency-audit", title: "Design Consistency Audit", store: "ux-agents-store", autonomy: "high", judgement: "medium", fits: ["ui-ux"] },
  { id: "design-rationale", title: "Design Rationale", store: "ux-agents-store", autonomy: "high", judgement: "medium", fits: ["ui-ux"] },
  { id: "ixd-review", title: "IxD Review", store: "ux-agents-store", autonomy: "high", judgement: "medium", fits: ["ui-ux"] },
  { id: "journey-mapper", title: "Journey Mapper", store: "ux-agents-store", autonomy: "high", judgement: "medium", fits: ["ui-ux", "product-manager"] },
  { id: "persona-builder", title: "Persona Builder", store: "ux-agents-store", autonomy: "high", judgement: "medium", fits: ["ui-ux", "product-manager"] },
  { id: "prototype-builder", title: "Prototype Builder", store: "ux-agents-store", autonomy: "high", judgement: "low", fits: ["ui-ux"] },
  { id: "service-blueprint", title: "Service Blueprint", store: "ux-agents-store", autonomy: "high", judgement: "medium", fits: ["ui-ux"] },
  { id: "agentic-ai-reviewer", title: "Agentic AI Reviewer", store: "architect-agents-store", autonomy: "high", judgement: "medium", fits: ["architect"] },
  { id: "deployment-architect", title: "Deployment Architect", store: "architect-agents-store", autonomy: "high", judgement: "medium", fits: ["architect", "devops"] },
  { id: "product-backend-architect", title: "Product Backend Architect", store: "architect-agents-store", autonomy: "medium", judgement: "high", fits: ["architect"] },
  { id: "product-engineering-essentials", title: "Product Engineering Essentials", store: "architect-agents-store", autonomy: "high", judgement: "low", fits: ["architect", "developer"] },
  { id: "product-frontend-architect", title: "Product Frontend Architect", store: "architect-agents-store", autonomy: "medium", judgement: "high", fits: ["architect"] },
  { id: "release-readiness-checklist", title: "Release Readiness Checklist", store: "architect-agents-store", autonomy: "low", judgement: "high", fits: ["architect", "devops", "delivery-manager"] },
  { id: "auth-implementer", title: "Auth Implementer", store: "coding-agents-store", autonomy: "medium", judgement: "high", fits: ["developer", "architect"] },
  { id: "code-cleanup", title: "Code Cleanup", store: "coding-agents-store", autonomy: "medium", judgement: "medium", fits: ["developer"] },
  { id: "error-handling-audit", title: "Error Handling Audit", store: "coding-agents-store", autonomy: "medium", judgement: "medium", fits: ["developer"] },
  { id: "observability-implementer", title: "Observability Implementer", store: "coding-agents-store", autonomy: "medium", judgement: "medium", fits: ["developer", "devops"] },
  { id: "runtime-debugger", title: "Runtime Debugger", store: "coding-agents-store", autonomy: "medium", judgement: "medium", fits: ["developer"] },
  { id: "token-efficiency-coach", title: "Token Efficiency Coach", store: "coding-agents-store", autonomy: "medium", judgement: "medium", fits: ["developer"] },
  { id: "black-box-testing", title: "Black-Box Testing", store: "qa-agents-store", autonomy: "high", judgement: "low", fits: ["qa"] },
  { id: "bug-report", title: "Bug Report", store: "qa-agents-store", autonomy: "high", judgement: "low", fits: ["qa"] },
  { id: "exploratory-testing", title: "Exploratory Testing", store: "qa-agents-store", autonomy: "high", judgement: "medium", fits: ["qa"] },
  { id: "explore-and-build", title: "Explore & Build", store: "qa-agents-store", autonomy: "low", judgement: "low", fits: ["qa", "developer"] },
  { id: "owasp-security-scanner", title: "OWASP Security Scanner", store: "qa-agents-store", autonomy: "high", judgement: "medium", fits: ["qa", "architect"] },
  { id: "smoke-sanity-testing", title: "Smoke & Sanity Testing", store: "qa-agents-store", autonomy: "high", judgement: "low", fits: ["qa", "devops"] },
  { id: "test-case-generator", title: "Test Case Generator", store: "qa-agents-store", autonomy: "high", judgement: "low", fits: ["qa", "developer"] },
  { id: "test-cases-from-code", title: "Test Cases From Code", store: "qa-agents-store", autonomy: "high", judgement: "medium", fits: ["qa"] },
  { id: "ui-ux-accessibility-testing", title: "UI/UX & Accessibility Testing", store: "qa-agents-store", autonomy: "high", judgement: "medium", fits: ["qa", "ui-ux"] },
  { id: "white-box-testing", title: "White-Box Testing", store: "qa-agents-store", autonomy: "high", judgement: "low", fits: ["qa"] },
  { id: "iac-generator", title: "IPA — Infrastructure Provisioning Agent", store: "devops-agents-store", autonomy: "medium", judgement: "high", fits: ["devops", "architect"] },
  { id: "eu-ai-act-controls-reviewer", title: "EU AI Act Controls Reviewer", store: "compliance-agents-store", autonomy: "high", judgement: "high", fits: ["architect", "product-manager"] },
  { id: "gdpr-controls-reviewer", title: "GDPR Controls Reviewer", store: "compliance-agents-store", autonomy: "high", judgement: "high", fits: ["architect", "qa"] },
  { id: "architecture-advisor", title: "Architecture Advisor", store: "data-platform-agents-store", autonomy: "high", judgement: "high", fits: ["architect"] },
  { id: "context-keeper", title: "Context Keeper", store: "data-platform-agents-store", autonomy: "high", judgement: "low", fits: [] },
  { id: "data-platform-developer", title: "Data Platform Developer", store: "data-platform-agents-store", autonomy: "medium", judgement: "medium", fits: ["developer"] },
  { id: "data-platform-validator", title: "Data Platform Validator", store: "data-platform-agents-store", autonomy: "high", judgement: "medium", fits: ["qa", "developer"] },
  { id: "due-diligence", title: "Due Diligence", store: "data-platform-agents-store", autonomy: "high", judgement: "medium", fits: [] },
  { id: "opportunity-scout", title: "Opportunity Scout", store: "data-platform-agents-store", autonomy: "high", judgement: "medium", fits: [] },
  { id: "regression-monitor", title: "Regression Monitor", store: "data-platform-agents-store", autonomy: "high", judgement: "low", fits: [] },
  { id: "repo-analyst", title: "Repo Analyst", store: "data-platform-agents-store", autonomy: "high", judgement: "low", fits: [] },
  { id: "delivery-commitment-health-report", title: "Delivery Commitment Health Report", store: "delivery-agents-store", autonomy: "high", judgement: "medium", fits: ["delivery-manager"] },
  { id: "planning-helper-agent", title: "Planning Helper", store: "delivery-agents-store", autonomy: "high", judgement: "medium", fits: ["delivery-manager", "architect"] },
  { id: "bolt-risk-assessment", title: "Bolt Risk Assessment", store: "idf-agents-store", autonomy: "high", judgement: "medium", fits: ["delivery-manager"] },
  { id: "codebase-archaeology", title: "Codebase Archaeology", store: "idf-agents-store", autonomy: "high", judgement: "medium", fits: ["developer", "architect"] },
  { id: "dependency-audit", title: "Dependency Audit", store: "idf-agents-store", autonomy: "high", judgement: "medium", fits: ["devops", "developer"] },
  { id: "design-session", title: "Design Session", store: "idf-agents-store", autonomy: "low", judgement: "high", fits: ["architect", "developer"] },
  { id: "new-engineer-induction", title: "New Engineer Induction", store: "idf-agents-store", autonomy: "low", judgement: "low", fits: [] },
  { id: "process-health", title: "Process Health", store: "idf-agents-store", autonomy: "high", judgement: "medium", fits: ["delivery-manager"] },
  { id: "progress-digest", title: "Progress Digest", store: "idf-agents-store", autonomy: "high", judgement: "low", fits: ["delivery-manager"] },
  { id: "root-cause-analysis", title: "Root Cause Analysis", store: "idf-agents-store", autonomy: "high", judgement: "medium", fits: ["developer", "qa"] },
  { id: "uat", title: "UAT", store: "idf-agents-store", autonomy: "low", judgement: "high", fits: ["qa", "delivery-manager"] },
  { id: "user-intent-extractor", title: "User Intent Extractor", store: "feature-agents-store", autonomy: "medium", judgement: "high", fits: ["developer", "product-manager"] },
];

export function skillById(id: string) {
  return SKILLS.find((skill) => skill.id === id);
}

