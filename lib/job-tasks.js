// Pre-loaded task suggestions by job category
// Based on O*NET task data and common role responsibilities
export const jobTaskSuggestions = {
  "accountant": [
    "Prepare financial statements and reports",
    "Process invoices and payments",
    "Reconcile bank statements",
    "Prepare tax returns",
    "Conduct financial audits",
    "Manage budgets and forecasts",
    "Advise clients on financial decisions",
    "Ensure regulatory compliance"
  ],
  "hr manager": [
    "Conduct job interviews",
    "Write HR policies and procedures",
    "Handle employee grievances",
    "Process payroll",
    "Design training programmes",
    "Manage employee onboarding",
    "Lead performance reviews",
    "Develop compensation strategies"
  ],
  "software engineer": [
    "Write and review code",
    "Debug and fix software issues",
    "Design system architecture",
    "Write technical documentation",
    "Conduct code reviews",
    "Collaborate with product teams",
    "Deploy and monitor applications",
    "Mentor junior developers"
  ],
  "teacher": [
    "Plan and deliver lessons",
    "Grade student assignments",
    "Create learning materials",
    "Manage classroom behaviour",
    "Meet with parents and guardians",
    "Adapt teaching to individual needs",
    "Assess student progress",
    "Organise school activities"
  ],
  "nurse": [
    "Assess patient conditions",
    "Administer medications",
    "Monitor vital signs",
    "Document patient care",
    "Educate patients on health management",
    "Coordinate with medical teams",
    "Respond to medical emergencies",
    "Provide emotional support to patients"
  ],
  "lawyer": [
    "Research case law and statutes",
    "Draft legal documents",
    "Represent clients in court",
    "Negotiate settlements",
    "Advise clients on legal matters",
    "Review contracts",
    "Conduct depositions",
    "Manage case files"
  ],
  "graphic designer": [
    "Create visual designs and layouts",
    "Develop brand identities",
    "Edit and retouch images",
    "Create social media graphics",
    "Design website mockups",
    "Present concepts to clients",
    "Manage multiple design projects",
    "Stay current with design trends"
  ],
  "marketing manager": [
    "Develop marketing strategies",
    "Manage advertising campaigns",
    "Analyse market research data",
    "Write marketing copy",
    "Manage social media accounts",
    "Track campaign performance metrics",
    "Coordinate with sales teams",
    "Manage marketing budgets"
  ],
  "customer service representative": [
    "Answer customer enquiries",
    "Resolve customer complaints",
    "Process orders and returns",
    "Update customer records",
    "Provide product information",
    "Escalate complex issues",
    "Follow up on customer satisfaction",
    "Meet response time targets"
  ],
  "data analyst": [
    "Clean and prepare datasets",
    "Write SQL queries",
    "Create dashboards and reports",
    "Conduct statistical analysis",
    "Present findings to stakeholders",
    "Identify trends and patterns",
    "Automate reporting processes",
    "Validate data quality"
  ],
  "project manager": [
    "Plan project timelines and milestones",
    "Manage project budgets",
    "Coordinate cross-functional teams",
    "Conduct risk assessments",
    "Run status meetings",
    "Report to stakeholders",
    "Resolve team conflicts",
    "Ensure deliverable quality"
  ],
  "writer": [
    "Research topics thoroughly",
    "Write articles and content",
    "Edit and proofread copy",
    "Conduct interviews",
    "Develop content strategies",
    "Meet publication deadlines",
    "Adapt tone for different audiences",
    "Pitch story ideas"
  ],
  "doctor": [
    "Diagnose patient conditions",
    "Prescribe treatment plans",
    "Conduct physical examinations",
    "Review medical test results",
    "Consult with specialists",
    "Document patient records",
    "Communicate with patients about health",
    "Stay current with medical research"
  ],
  "financial analyst": [
    "Build financial models",
    "Analyse company financial statements",
    "Create investment reports",
    "Forecast revenue and expenses",
    "Conduct industry research",
    "Present to senior management",
    "Monitor market trends",
    "Assess risk and return"
  ],
  "sales representative": [
    "Prospect for new clients",
    "Conduct product demonstrations",
    "Negotiate deals and pricing",
    "Manage client relationships",
    "Meet sales targets",
    "Update CRM systems",
    "Attend industry events",
    "Prepare sales proposals"
  ]
};

// Fuzzy match job title to our suggestions
export function findMatchingTasks(jobTitle) {
  const normalised = jobTitle.toLowerCase().trim();

  // Direct match
  if (jobTaskSuggestions[normalised]) {
    return jobTaskSuggestions[normalised];
  }

  // Partial match
  for (const [key, tasks] of Object.entries(jobTaskSuggestions)) {
    if (normalised.includes(key) || key.includes(normalised)) {
      return tasks;
    }
  }

  // Word-level match
  const words = normalised.split(/\s+/);
  for (const [key, tasks] of Object.entries(jobTaskSuggestions)) {
    const keyWords = key.split(/\s+/);
    if (words.some(w => keyWords.includes(w))) {
      return tasks;
    }
  }

  return null;
}

export const industries = [
  "Technology",
  "Healthcare",
  "Finance & Banking",
  "Education",
  "Legal",
  "Marketing & Advertising",
  "Manufacturing",
  "Retail",
  "Hospitality & Tourism",
  "Government",
  "Construction",
  "Energy",
  "Media & Entertainment",
  "Real Estate",
  "Transportation & Logistics",
  "Agriculture",
  "Consulting",
  "Non-profit",
  "Telecommunications",
  "Other"
];

export const experienceLevels = [
  { value: "0-2", label: "Entry Level (0-2 years)" },
  { value: "3-5", label: "Mid Level (3-5 years)" },
  { value: "6-10", label: "Senior (6-10 years)" },
  { value: "11-15", label: "Lead/Manager (11-15 years)" },
  { value: "16+", label: "Director/Executive (16+ years)" }
];

export const workEnvironments = [
  "Office-based",
  "Remote",
  "Hybrid",
  "Field work",
  "Healthcare facility",
  "Educational institution",
  "Factory/Warehouse",
  "Retail/Customer-facing"
];
