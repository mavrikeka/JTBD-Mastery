import { JTBDExample } from "../shared/schema";

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
      statement: "Implement lean manufacturing and Six Sigma to improve quality and reduce defects by next year",
      whyBad: [
        "Missing metrics - no baseline or target numbers",
        "'Improve quality' - by how much?",
        "'Next year' is vague - which quarter? month?",
        "No financial impact quantified",
        "Has WHAT and WHEN, but missing HOW MUCH",
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
      statement: "Migrate legacy applications to cloud infrastructure, reducing IT costs from $45M to $31.5M",
      whyBad: [
        "Missing timeline - when will this be complete?",
        "No scale - how many applications?",
        "Missing quality constraints (downtime tolerance?)",
        "No availability/performance targets",
        "Has WHAT and HOW MUCH, but missing WHEN",
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
      statement: "Build enterprise sales team and grow ARR from $8M to $45M by establishing Fortune 500 playbook",
      whyBad: [
        "Missing timeline completely",
        "Doesn't specify team size (how many AEs?)",
        "No retention/quality metrics (NRR, churn)",
        "What is 'establishing a playbook'? Too vague",
        "Has good metrics but missing WHEN and specific WHAT",
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
      statement: "Redesign supply chain operations to improve EBITDA margin from 8.2% to 11.5% in the next couple years",
      whyBad: [
        "'Next couple years' is too vague - Q2 2027? 2028?",
        "Missing specific cost reduction amount ($180M)",
        "Doesn't specify HOW (renegotiate contracts? which vendors?)",
        "No quality safeguards mentioned",
        "Timeline is weak and unstrategic",
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
      statement: "Execute brand repositioning for millennials through new visual identity and influencer partnerships, recapturing market share from 12% to 16% by Q3 2026",
      whyBad: [
        "Missing brand health metrics (consideration, NPS, awareness)",
        "'Millennials' needs age range (25-40)",
        "No mention of DTC channel launch",
        "Lacks specific brand consideration targets",
        "Has most components but missing key HOW MUCH metrics",
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
      statement: "Implement competitive comp framework and engineering career ladder to reduce attrition from 28% to 12% and improve Glassdoor rating",
      whyBad: [
        "Missing timeline - when will this be done?",
        "No Glassdoor target (from 3.2 to what?)",
        "Missing cost-per-hire metrics",
        "Doesn't mention manager training program",
        "Has WHAT and partial HOW MUCH, but weak WHEN and incomplete metrics",
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
      statement: "Re-architect platform from monolith to microservices and rebuild UI, reducing churn from 18% to 8% soon",
      whyBad: [
        "'Soon' is not a strategic deadline",
        "Missing performance metrics (page load time)",
        "No NPS or satisfaction targets",
        "Doesn't mention API-first platform",
        "Has WHAT and partial HOW MUCH, but terrible WHEN",
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
      statement: "Transition supplier base to renewable energy and implement circular packaging, reducing carbon emissions by 40% by sometime in 2026",
      whyBad: [
        "'Sometime in 2026' is vague - which quarter?",
        "No baseline or target in absolute numbers (450K→270K tons)",
        "Missing scope: how many suppliers? which SKUs?",
        "No CDP rating target",
        "Weak timeline and incomplete metrics",
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
      statement: "Build customer success organization with health scoring and automated playbooks, increasing retention and growing customer LTV",
      whyBad: [
        "No timeline - when will this be complete?",
        "'Increasing retention' - from/to what %?",
        "'Growing LTV' - from/to what amount?",
        "Missing expansion revenue metrics",
        "Good WHAT, but completely missing specific HOW MUCH and WHEN",
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
      statement: "Restructure R&D portfolio focusing on oncology, establish research partnerships, and advance molecules into Phase 2 trials by end of 2027",
      whyBad: [
        "How many molecules? (should specify 12)",
        "Missing clinical success rate improvement (23%→38%)",
        "How many partnerships? (should specify 4)",
        "'End of 2027' less precise than 'Q4 2027'",
        "Missing AI-driven drug discovery platform",
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
