import { JTBDExample } from "@shared/schema";

export const jtbdExamples: JTBDExample[] = [
  {
    id: 1,
    role: "VP Operations",
    context: {
      title: "Manufacturing Excellence",
      company: "$2B automotive parts manufacturer",
      challenge: "High defect rates costing $2.1M annually",
      priority: "Operational excellence",
    },
    badJtbd: {
      statement: "Improve manufacturing quality and reduce defects",
      whyBad: [
        "Too vague - 'improve' is not specific work",
        "No metrics - no baseline, no target",
        "No deadline",
        "Googleable - applies to any manufacturing role",
        "Doesn't specify HOW the work will be done",
      ],
    },
    goodJtbd: {
      statement: "Implement lean manufacturing principles and Six Sigma quality control systems across all production lines, reducing defect rate from 4.5% to 1.2% (industry benchmark) and eliminating $2.1M in annual losses by December 2026",
      whyGood: [
        "Specific work: Implement lean + Six Sigma",
        "Clear metrics: 4.5% → 1.2% defects",
        "Financial impact: $2.1M savings",
        "Deadline: December 2026",
        "Bespoke: Tied to their specific situation",
      ],
    },
  },
  {
    id: 2,
    role: "Chief Technology Officer",
    context: {
      title: "Cloud Migration",
      company: "Fortune 500 company (50,000 employees)",
      challenge: "200+ legacy applications on-premise, $45M annual IT cost",
      priority: "Modernize and reduce costs",
    },
    badJtbd: {
      statement: "Lead digital transformation and cloud adoption strategy",
      whyBad: [
        "'Lead' is not specific work",
        "'Digital transformation' is buzzword, not bespoke",
        "No scale specified (how many apps?)",
        "No metrics (cost reduction? uptime?)",
        "No constraints mentioned (zero downtime?)",
      ],
    },
    goodJtbd: {
      statement: "Orchestrate cloud migration of 200+ legacy applications while maintaining zero downtime, reducing annual IT infrastructure costs from $45M to $31.5M (30% reduction) and improving system availability from 99.5% to 99.95% by December 2026",
      whyGood: [
        "Specific work: Orchestrate migration of 200+ apps",
        "Quality constraint: Zero downtime",
        "Cost metrics: $45M → $31.5M (30%)",
        "Performance metrics: 99.5% → 99.95% availability",
        "Strategic timeframe: Dec 2026",
      ],
    },
  },
  {
    id: 3,
    role: "Head of Sales",
    context: {
      title: "Revenue Growth",
      company: "B2B SaaS company, $120M ARR",
      challenge: "Enterprise segment underserved",
      priority: "Accelerate growth",
    },
    badJtbd: {
      statement: "Drive revenue growth and expand market share",
      whyBad: [
        "'Drive' is vague - what's the actual work?",
        "No specific revenue targets",
        "'Expand market share' - by how much?",
        "Doesn't specify WHICH markets or segments",
        "Generic - applies to any sales leader",
      ],
    },
    goodJtbd: {
      statement: "Build enterprise sales capability from zero by recruiting 15 enterprise AEs, establishing Fortune 500 sales playbook, and implementing ABM strategy to grow enterprise segment ARR from $8M to $45M while maintaining 85%+ net revenue retention by Q4 2026",
      whyGood: [
        "Specific work: Build team (15 AEs), create playbook, implement ABM",
        "Clear starting point: $8M enterprise ARR",
        "Clear target: $45M enterprise ARR",
        "Quality metric: 85%+ NRR",
        "Segment focus: Enterprise/Fortune 500",
      ],
    },
  },
  {
    id: 4,
    role: "Chief Financial Officer",
    context: {
      title: "Cost Optimization",
      company: "$5B retail company",
      challenge: "Margin compression, EBITDA margin at 8.2%",
      priority: "Private equity owner demanding improvement",
    },
    badJtbd: {
      statement: "Optimize costs and improve profitability across the organization",
      whyBad: [
        "'Optimize' is consultant-speak, not real work",
        "'Across organization' is too broad",
        "No baseline or target metrics",
        "Doesn't specify WHERE costs will be cut",
        "Could apply to any CFO role",
      ],
    },
    goodJtbd: {
      statement: "Redesign supply chain operations and renegotiate supplier contracts for top 50 vendors, reducing COGS by $180M (from 72% to 68% of revenue) and improving EBITDA margin from 8.2% to 11.5% while maintaining product quality standards by Q2 2027",
      whyGood: [
        "Specific work: Redesign supply chain, renegotiate contracts",
        "Scope: Top 50 vendors",
        "Clear metrics: COGS 72%→68%, EBITDA 8.2%→11.5%",
        "Financial impact: $180M reduction",
        "Quality constraint: Maintain standards",
      ],
    },
  },
  {
    id: 5,
    role: "Chief Marketing Officer",
    context: {
      title: "Brand Repositioning",
      company: "Legacy consumer brand",
      challenge: "Market share decline from 18% to 12%",
      priority: "Bold reinvention",
    },
    badJtbd: {
      statement: "Revitalize brand and increase market share among younger demographics",
      whyBad: [
        "'Revitalize' is vague aspirational language",
        "'Younger demographics' - how young? What segment?",
        "No brand metrics (awareness, consideration, NPS)",
        "No specific market share target",
        "Doesn't describe the actual work",
      ],
    },
    goodJtbd: {
      statement: "Execute complete brand repositioning targeting millennials (25-40) through new visual identity, influencer partnerships, and DTC channel launch, increasing brand consideration among target demo from 23% to 58% and recapturing market share from 12% to 16% by Q3 2026",
      whyGood: [
        "Specific work: Rebrand, partnerships, DTC launch",
        "Target segment: Millennials 25-40",
        "Brand metrics: 23%→58% consideration",
        "Market impact: 12%→16% share",
        "Multi-dimensional success criteria",
      ],
    },
  },
  {
    id: 6,
    role: "Head of HR",
    context: {
      title: "Talent Strategy",
      company: "Fast-growing tech company (2,000 → 5,000 employees)",
      challenge: "28% attrition in engineering, Glassdoor 3.2/5.0",
      priority: "Reduce costs, improve retention",
    },
    badJtbd: {
      statement: "Build world-class talent organization and improve employee experience",
      whyBad: [
        "'World-class' is meaningless without metrics",
        "'Build organization' - what specifically?",
        "'Improve experience' - measured how?",
        "No retention or cost targets",
        "Generic HR platitudes",
      ],
    },
    goodJtbd: {
      statement: "Redesign talent acquisition and retention programs including competitive comp framework, engineering career ladder, and manager training, reducing engineering attrition from 28% to 12%, improving Glassdoor rating from 3.2 to 4.3, and decreasing cost-per-hire from $15K to $9K by Q4 2026",
      whyGood: [
        "Specific programs: Comp framework, career ladder, training",
        "Retention metric: 28%→12% attrition",
        "Brand metric: 3.2→4.3 Glassdoor",
        "Cost metric: $15K→$9K per hire",
        "Focus area: Engineering talent",
      ],
    },
  },
  {
    id: 7,
    role: "VP Product",
    context: {
      title: "Platform Modernization",
      company: "Aging SaaS company",
      challenge: "10-year-old monolith, 18% annual churn",
      priority: "Technical debt and UX improvements",
    },
    badJtbd: {
      statement: "Modernize product platform and enhance user experience",
      whyBad: [
        "'Modernize' and 'enhance' are vague",
        "No technical specifics (architecture? API?)",
        "No user metrics (NPS, satisfaction, speed)",
        "No business impact (churn, retention)",
        "Timeline missing",
      ],
    },
    goodJtbd: {
      statement: "Re-architect product from monolith to microservices, rebuild UI using modern framework, and launch API-first platform, improving page load speed from 4.2s to 0.8s, increasing NPS from 32 to 68, and reducing annual churn from 18% to 8% by Q1 2027",
      whyGood: [
        "Specific technical work: Microservices, UI rebuild, API",
        "Performance metric: 4.2s→0.8s load time",
        "Satisfaction metric: NPS 32→68",
        "Business metric: 18%→8% churn",
        "Clear architectural direction",
      ],
    },
  },
  {
    id: 8,
    role: "VP Supply Chain",
    context: {
      title: "Sustainability",
      company: "Global consumer goods company",
      challenge: "450K tons CO2e carbon footprint",
      priority: "ESG compliance and investor demands",
    },
    badJtbd: {
      statement: "Develop and implement sustainability initiatives to reduce environmental impact",
      whyBad: [
        "'Develop initiatives' is process, not outcome",
        "'Reduce impact' - by how much?",
        "No specific programs or investments",
        "No compliance deadlines",
        "Doesn't specify WHAT will change",
      ],
    },
    goodJtbd: {
      statement: "Transition 60% of supplier base to renewable energy, implement circular packaging for top 20 SKUs, and optimize logistics routes, reducing Scope 3 carbon emissions from 450K to 270K tons CO2e (40% reduction) and achieving CDP 'A' rating by December 2026",
      whyGood: [
        "Specific work: Supplier transition, circular packaging, route optimization",
        "Scope: 60% suppliers, top 20 SKUs",
        "Emission metrics: 450K→270K tons (40%)",
        "External validation: CDP 'A' rating",
        "Clear deadline",
      ],
    },
  },
  {
    id: 9,
    role: "Chief Customer Officer",
    context: {
      title: "Retention & Expansion",
      company: "Subscription business",
      challenge: "68% retention at 12 months, only 15% expansion revenue",
      priority: "Increase customer lifetime value",
    },
    badJtbd: {
      statement: "Improve customer success and drive retention",
      whyBad: [
        "'Improve' and 'drive' are not work",
        "No retention target specified",
        "Doesn't address expansion opportunity",
        "No programs or capabilities mentioned",
        "Generic customer success language",
      ],
    },
    goodJtbd: {
      statement: "Build proactive customer success organization with health scoring, automated playbooks, and executive sponsorship program, increasing 12-month retention from 68% to 89%, growing expansion revenue from 15% to 35% of base, and improving customer LTV from $8.2K to $14.5K by Q3 2026",
      whyGood: [
        "Specific programs: Health scoring, playbooks, exec sponsorship",
        "Retention metric: 68%→89%",
        "Expansion metric: 15%→35%",
        "Economic metric: $8.2K→$14.5K LTV",
        "Builds capability, not just outcomes",
      ],
    },
  },
  {
    id: 10,
    role: "Head of R&D",
    context: {
      title: "Innovation Pipeline",
      company: "Pharmaceutical company",
      challenge: "3 drugs in clinical trials, patent cliff in 2 years",
      priority: "Strengthen product pipeline",
    },
    badJtbd: {
      statement: "Accelerate innovation and strengthen product pipeline",
      whyBad: [
        "'Accelerate' and 'strengthen' are vague",
        "No specific number of drugs/trials",
        "No success rate targets",
        "No investment or process changes specified",
        "Timeline unclear",
      ],
    },
    goodJtbd: {
      statement: "Restructure R&D portfolio prioritizing oncology and rare diseases, establish 4 external partnerships with research institutions, and implement AI-driven drug discovery platform, advancing 12 new molecules into Phase 2 trials and improving clinical success rate from 23% to 38% by Q4 2027",
      whyGood: [
        "Specific work: Portfolio restructure, partnerships, AI platform",
        "Therapeutic focus: Oncology and rare diseases",
        "Pipeline metric: 12 new molecules in Phase 2",
        "Success metric: 23%→38% clinical success",
        "Strategic timeframe",
      ],
    },
  },
];
