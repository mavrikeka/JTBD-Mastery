import { BuildScenario } from "@shared/schema";

export const buildScenarios: BuildScenario[] = [
  {
    id: 'vp-ops',
    role: 'VP Operations',
    industry: 'Manufacturing',
    challenge: 'Quality & efficiency issues',
    difficulty: 2,
    context: {
      company: 'TechParts Manufacturing Inc.',
      size: '$2B revenue, 500 employees',
      situation: [
        'Current defect rate: 4.5% (industry benchmark: 1.2%)',
        'Annual loss from defects: $2.1M',
        'Customer complaints increasing 30% YoY',
        'Quality issues damaging reputation',
        'Outdated processes and equipment',
      ],
      valueAgenda: 'Deliver $2.5M in savings and restore brand reputation through operational excellence transformation.',
    },
    hints: {
      what: [
        'Implement lean manufacturing and Six Sigma quality control',
        'Redesign production processes and establish automated quality inspection',
        'Transform operations through statistical process control and predictive maintenance',
      ],
      howMuch: [
        'Defect rate: 4.5% → 1.2%',
        'Annual losses: $2.1M → $0 (eliminated)',
        'Customer complaints: -30% reduction',
      ],
      when: 'December 2026 (3-year strategic view)',
    },
  },
  {
    id: 'cto',
    role: 'Chief Technology Officer',
    industry: 'Enterprise Tech',
    challenge: 'Legacy infrastructure',
    difficulty: 3,
    context: {
      company: 'GlobalCorp Industries',
      size: '50,000 employees, Fortune 500',
      situation: [
        '200+ legacy applications on-premise',
        'Annual IT infrastructure cost: $45M',
        'System availability: 99.5% (target: 99.95%)',
        'CEO mandate: Modernize and reduce costs',
        'Zero downtime requirement for migration',
      ],
      valueAgenda: 'Reduce IT costs by 30% while improving system reliability and enabling innovation.',
    },
    hints: {
      what: [
        'Orchestrate cloud migration of 200+ legacy applications',
        'Re-platform critical systems to cloud-native architecture',
        'Implement hybrid cloud infrastructure with automated failover',
      ],
      howMuch: [
        'IT costs: $45M → $31.5M (30% reduction)',
        'System availability: 99.5% → 99.95%',
        'Application count: 200+ migrated with zero downtime',
      ],
      when: 'December 2026',
    },
  },
  {
    id: 'head-sales',
    role: 'Head of Sales',
    industry: 'B2B SaaS',
    challenge: 'Enterprise expansion',
    difficulty: 2,
    context: {
      company: 'CloudSync Solutions',
      size: '$120M ARR, Series C funded',
      situation: [
        'Current enterprise segment ARR: $8M',
        'Enterprise opportunity: Largely untapped',
        'No enterprise sales team currently',
        'Board mandate: Accelerate growth',
        'Target: 85%+ net revenue retention',
      ],
      valueAgenda: 'Build enterprise capability to unlock $45M ARR opportunity.',
    },
    hints: {
      what: [
        'Build enterprise sales capability by recruiting 15 enterprise AEs and establishing Fortune 500 playbook',
        'Create enterprise sales organization with ABM strategy and executive sponsorship program',
        'Establish Fortune 500 sales engine with specialized AE team and account-based methodology',
      ],
      howMuch: [
        'Enterprise ARR: $8M → $45M',
        'Enterprise AEs: 0 → 15 hired',
        'Net revenue retention: ≥85%',
      ],
      when: 'Q4 2026',
    },
  },
  {
    id: 'cfo',
    role: 'Chief Financial Officer',
    industry: 'Retail',
    challenge: 'Margin pressure',
    difficulty: 3,
    context: {
      company: 'RetailMax Corporation',
      size: '$5B revenue',
      situation: [
        'Current EBITDA margin: 8.2%',
        'COGS at 72% of revenue',
        'Private equity owner demanding improvement',
        'Rising supplier costs',
        'Target: 11.5% EBITDA margin',
      ],
      valueAgenda: 'Reduce COGS by $180M while maintaining product quality standards.',
    },
    hints: {
      what: [
        'Redesign supply chain operations and renegotiate supplier contracts for top 50 vendors',
        'Transform procurement through strategic sourcing and supplier consolidation',
        'Optimize supply chain network and establish vendor management program',
      ],
      howMuch: [
        'COGS: 72% → 68% of revenue ($180M reduction)',
        'EBITDA margin: 8.2% → 11.5%',
        'Supplier contracts: Top 50 vendors renegotiated',
      ],
      when: 'Q2 2027',
    },
  },
  {
    id: 'cmo',
    role: 'Chief Marketing Officer',
    industry: 'Consumer Goods',
    challenge: 'Market share decline',
    difficulty: 2,
    context: {
      company: 'Heritage Brands Co.',
      size: 'Legacy consumer brand',
      situation: [
        'Market share: Declined from 18% to 12%',
        'Brand perception: Outdated among millennials',
        'Brand consideration (25-40 demo): 23%',
        'New CEO wants bold reinvention',
        'Losing to modern DTC competitors',
      ],
      valueAgenda: 'Recapture market share through brand repositioning targeting millennials.',
    },
    hints: {
      what: [
        'Execute complete brand repositioning targeting millennials through new visual identity, influencer partnerships, and DTC channel launch',
        'Transform brand through modern identity, digital-first marketing, and direct-to-consumer strategy',
        'Reinvent brand positioning with millennial focus via partnerships, DTC, and social-first strategy',
      ],
      howMuch: [
        'Brand consideration (25-40): 23% → 58%',
        'Market share: 12% → 16%',
        'DTC channel: Launch and scale',
      ],
      when: 'Q3 2026',
    },
  },
  {
    id: 'chro',
    role: 'Chief People Officer',
    industry: 'Tech',
    challenge: 'High attrition',
    difficulty: 2,
    context: {
      company: 'TechGrowth Inc.',
      size: '2,000 → 5,000 employees (growth phase)',
      situation: [
        'Engineering attrition: 28%',
        'Glassdoor rating: 3.2/5.0',
        'Cost-per-hire: $15K',
        'Rapid growth straining culture',
        'Competitive talent market',
      ],
      valueAgenda: 'Reduce attrition and recruiting costs while scaling engineering organization.',
    },
    hints: {
      what: [
        'Redesign talent acquisition and retention programs including competitive comp framework, engineering career ladder, and manager training',
        'Transform talent strategy through compensation redesign, career development, and leadership training',
        'Build retention-focused talent organization with comp framework, growth paths, and manager enablement',
      ],
      howMuch: [
        'Engineering attrition: 28% → 12%',
        'Glassdoor rating: 3.2 → 4.3',
        'Cost-per-hire: $15K → $9K',
      ],
      when: 'Q4 2026',
    },
  },
];
