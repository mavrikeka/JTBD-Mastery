import { CritiqueRequest, CritiqueResponse, SuggestionRequest, SuggestionResponse } from "@shared/schema";
import { getScenarioById } from "./scenarios";

const AGENT_AI_ENDPOINT = 'https://api-lr.agent.ai/v1/action/invoke_llm';
const API_KEY = process.env.AGENT_AI_API_KEY || '';

interface AgentAIRequest {
  instructions: string;
  llm_engine: 'claude-sonnet-4' | 'claude-3-5-sonnet' | 'gpt4o' | 'gpt-4o-mini';
}

interface AgentAIResponse {
  status: number;
  response: string | string[] | any;
}

async function callAgentAI(request: AgentAIRequest): Promise<any> {
  try {
    console.log('📤 Calling Agent.ai with:', {
      engine: request.llm_engine,
      instructions_length: request.instructions.length,
      api_key_length: API_KEY?.length,
      api_key_prefix: API_KEY?.substring(0, 10) + '...'
    });

    const response = await fetch(AGENT_AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    console.log('📥 HTTP Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Agent.ai API HTTP error:', response.status, errorText);
      throw new Error(`Agent.ai API error: ${response.status} - ${errorText}`);
    }

    const data: AgentAIResponse = await response.json();
    console.log('📥 Agent.ai response data:', JSON.stringify(data, null, 2));

    // Check for error responses with 200 status
    if (data.status === 401) {
      console.error('❌ Agent.ai unauthorized - full response:', data);
      throw new Error('Invalid Agent.ai API key. Please check your AGENT_AI_API_KEY in .env file');
    }

    if (typeof data.response === 'string' && data.response?.startsWith('Error:')) {
      console.error('❌ Agent.ai error response:', data.response);
      throw new Error(data.response);
    }

    return data.response || '';
  } catch (error) {
    console.error('❌ Agent.ai API call failed:', error);
    throw error; // Re-throw to preserve original error
  }
}

export async function critiqueJTBD(request: CritiqueRequest): Promise<CritiqueResponse> {
  const instructions = `You are an expert consultant at CEOWorks specializing in Jobs-to-be-Done (JTBD) statements. A great JTBD has three mandatory components:

1. WHAT - The specific work to be done (action verbs, not vague goals)
2. HOW MUCH - Measurable outcomes with before/after metrics
3. WHEN - Clear deadline or timeframe (3-5 year strategic view)

The "Glass Slipper" Test: "If you can Google it, it's NOT a JTBD." JTBDs must be so bespoke and specific that they exclude 95% of candidates.

IMPORTANT: Apply the Glass Slipper Test to the COMPLETE JTBD, not just the WHAT in isolation.
- A WHAT like "Consolidate supplier contracts" may seem generic alone, BUT when combined with specific metrics (150→100 suppliers, COGS 72%→68.4%) and timeline, it becomes bespoke to the organization.
- The specificity comes from the COMBINATION of all three components, not just the WHAT alone.
- WHAT can be relatively straightforward as long as HOW MUCH provides the specific, measurable context that makes it unique.

Analyze the following JTBD statement and provide a detailed critique:

"${request.jtbdStatement}"

STATUS DEFINITIONS:
Component Status (whatStatus, howMuchStatus, whenStatus):
- "missing": Component not present or completely inadequate
- "weak": Component present but vague, generic, or needs significant improvement
- "strong": Component well-defined, specific, and actionable (consider the WHAT strong if it's clear and concrete, even if not hyper-detailed, as long as metrics provide specificity)
- "excellent": Component exceptional, passes Glass Slipper test on its own

Overall Status:
- "not-ready": Missing one or more components (cannot execute)
- "needs-work": All components present but at least one is weak
- "ready": All components strong (ready to execute) - remember to consider the COMPLETE statement
- "exemplary": All components excellent (best-in-class JTBD)

For each component, provide:
- Detailed feedback explaining the status
- 2-3 specific, actionable suggestions for improvement (even for excellent components)
- For WHAT: Acknowledge if the metrics make up for any generic language in the work description

Respond in this exact JSON format (no extra text, just the JSON):
{
  "overallStatus": "needs-work",
  "whatStatus": "strong",
  "howMuchStatus": "strong",
  "whenStatus": "missing",
  "whatFeedback": "detailed feedback on WHAT component",
  "howMuchFeedback": "detailed feedback on HOW MUCH component",
  "whenFeedback": "detailed feedback on WHEN component",
  "whatSuggestions": ["suggestion 1", "suggestion 2"],
  "howMuchSuggestions": ["suggestion 1", "suggestion 2"],
  "whenSuggestions": ["suggestion 1", "suggestion 2"],
  "improvedVersion": "improved JTBD if overallStatus is not-ready or needs-work, otherwise omit this field"
}`;

  const aiResponse = await callAgentAI({
    instructions,
    llm_engine: 'claude-sonnet-4',
  });

  // Parse JSON response
  try {
    let parsed;

    // Check if aiResponse is already an object (parsed JSON)
    if (typeof aiResponse === 'object' && aiResponse !== null) {
      parsed = aiResponse;
    } else if (typeof aiResponse === 'string') {
      // Extract JSON from response string (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Unexpected response type from AI');
    }

    return {
      overallStatus: parsed.overallStatus || 'needs-work',
      whatStatus: parsed.whatStatus || 'weak',
      howMuchStatus: parsed.howMuchStatus || 'weak',
      whenStatus: parsed.whenStatus || 'weak',
      whatFeedback: parsed.whatFeedback || 'No feedback available',
      howMuchFeedback: parsed.howMuchFeedback || 'No feedback available',
      whenFeedback: parsed.whenFeedback || 'No feedback available',
      whatSuggestions: parsed.whatSuggestions || [],
      howMuchSuggestions: parsed.howMuchSuggestions || [],
      whenSuggestions: parsed.whenSuggestions || [],
      improvedVersion: parsed.improvedVersion,
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('AI response was:', aiResponse);

    // Fallback: provide basic analysis
    return {
      overallStatus: 'needs-work' as const,
      whatStatus: 'weak' as const,
      howMuchStatus: 'weak' as const,
      whenStatus: 'weak' as const,
      whatFeedback: 'Unable to analyze WHAT component. Please ensure you describe specific work with action verbs.',
      howMuchFeedback: 'Unable to analyze HOW MUCH component. Please include measurable outcomes with before/after metrics.',
      whenFeedback: 'Unable to analyze WHEN component. Please include a clear strategic deadline.',
      whatSuggestions: ['Describe specific work to be done with concrete action verbs'],
      howMuchSuggestions: ['Add measurable metrics with before/after values'],
      whenSuggestions: ['Include a clear deadline (e.g., Q4 2026)'],
    };
  }
}

export async function getSuggestions(request: SuggestionRequest): Promise<SuggestionResponse> {
  let instructions = '';

  // Lookup full scenario details from backend data
  const scenario = getScenarioById(request.scenarioId);

  if (!scenario) {
    throw new Error(`Scenario not found: ${request.scenarioId}`);
  }

  if (request.step === 'what') {
    // Build rich context from full scenario
    const contextDetails = `
Role: ${scenario.role}
Company: ${scenario.context.company} (${scenario.context.size})
Industry: ${scenario.industry}
Challenge: ${scenario.challenge}

Current Situation:
${scenario.context.situation.map(s => `  - ${s}`).join('\n')}

Value Agenda: ${scenario.context.valueAgenda}
`;

    const hasUserInput = request.currentInput && request.currentInput.trim().length > 0;

    instructions = `You are helping someone write a JTBD (Jobs-to-be-Done) statement. The WHAT component describes the WORK to be done, NOT the desired outcomes or metrics.

Context:
${contextDetails}

${hasUserInput
  ? `User's current input: "${request.currentInput}"

Generate 3 work descriptions:
1. FIRST suggestion: Refine and improve their input (make it more concrete, specific, and well-structured)
2. SECOND & THIRD suggestions: Provide 2 alternative approaches to the same problem/challenge

All 3 suggestions should:`
  : `User has not provided any input yet.

Generate 3 alternative work descriptions based on the scenario context above.

All suggestions should:`}
- Use concrete action verbs: Build, Implement, Establish, Automate, Migrate, Deploy, Consolidate, Orchestrate, Re-platform
- Describe WORK/ACTIVITIES with tangible deliverables, not outcomes (avoid "reduce costs by 30%", "improve reliability")
- Are directly relevant to the specific scenario above
- Focus on WHAT needs to be done, not WHY or HOW MUCH
- Are concrete and concise (4-7 words ideal)
- Keep them brief - users will add details later
- Include what is being built/implemented (the noun/object)
- Focus on strategic/transformational work, not operational/supporting activities (e.g., "Migrate applications to cloud" not "Automate monitoring")

AVOID:
- Vague verbs: Improve, Enhance, Drive, Lead, Optimize, Transform, Redesign (without specifics)
- Including metrics or percentages (save those for the metrics step)
- Generic suggestions that could apply to any role
- Outcomes/results instead of work activities
- Long, verbose descriptions with too many clauses
- Abstract concepts without concrete deliverables

Examples of GOOD suggestions (concise and concrete):
- "Migrate legacy applications to AWS"
- "Build automated quality inspection system"
- "Establish enterprise sales team"
- "Deploy hybrid cloud infrastructure"
- "Implement Six Sigma quality control"
- "Build real-time inventory tracking system"
- "Consolidate vendor contracts"

Examples of BAD suggestions:
- "Reduce operational costs by 30%" (outcome, not work)
- "Improve system reliability" (too vague)
- "Transform the organization" (abstract, no deliverable)
- "Implement a new strategy" (missing concrete object)
- "Build sales team to increase revenue by 40%" (mixing work with metrics)
- "Enhance operational efficiency" (vague outcome)
- "Support the migration effort" (support is not concrete work)
- "Migrate 200+ legacy applications to AWS infrastructure with zero downtime requirements" (too long and detailed)

Respond with ONLY a JSON array of 3 suggestions (no extra text):
["Suggestion 1", "Suggestion 2", "Suggestion 3"]`;
  } else if (request.step === 'metrics') {
    // Build rich context from full scenario
    const contextDetails = `
Role: ${scenario.role}
Company: ${scenario.context.company} (${scenario.context.size})
Industry: ${scenario.industry}
Challenge: ${scenario.challenge}

Current Situation:
${scenario.context.situation.map(s => `  - ${s}`).join('\n')}

Value Agenda: ${scenario.context.valueAgenda}
`;

    instructions = `You are helping someone define measurable metrics for a JTBD statement. Generate 3 specific, quantifiable metric suggestions with realistic before/after values.

PRIMARY FOCUS - What they're building:
"${request.currentInput || 'none'}"

This is the specific work/goal that needs to be measured. Your metric suggestions MUST directly measure the success and impact of THIS specific work.

Supporting context (for domain understanding):
${contextDetails}

Format: "Metric name: from X to Y"
Examples:
- "Customer satisfaction score: from 6.2 to 8.5"
- "Time to market: from 180 days to 90 days"
- "Operating costs: from $2.4M to $1.8M annually"

Make metrics that:
- MOST IMPORTANTLY: Directly measure the success and impact of the specific work described above
- Have concrete numerical values (not vague improvements)
- Include units of measurement
- Are realistic and achievable for this specific initiative
- Align closely with what is being built/implemented

Respond with ONLY a JSON array of 3 suggestions (no extra text):
["Metric 1: from X to Y", "Metric 2: from X to Y", "Metric 3: from X to Y"]`;
  } else {
    // When step - build rich context from full scenario
    const contextDetails = `
Role: ${scenario.role}
Company: ${scenario.context.company} (${scenario.context.size})
Industry: ${scenario.industry}
Challenge: ${scenario.challenge}

Current Situation:
${scenario.context.situation.map(s => `  - ${s}`).join('\n')}

Value Agenda: ${scenario.context.valueAgenda}
`;

    instructions = `You are helping someone define a strategic deadline for a JTBD statement. Generate 3 realistic timeline suggestions as starting points (these are suggestions, not precise estimates).

PRIMARY FOCUS - Analyze the scope and complexity:
"${request.currentInput || 'none'}"

Extract timeline signals from:
1. WHAT (the work scope): Look for scale indicators like "enterprise-wide", "200 applications", "15 factories", "across 8 countries"
2. HOW MUCH (the metrics): Analyze the magnitude of change - larger deltas (e.g., 4.5% to 0.5%, $2M to $50M) suggest longer timelines than incremental improvements (e.g., 4.5% to 4.0%)

Supporting context (for industry norms):
${contextDetails}

Use the industry/company size to understand typical transformation speeds in this domain.

Format: Use quarters and years like "Q4 2026", "Q2 2027", or specific months like "December 2027"

Generate 3 timeline options:
1. CONSERVATIVE: Longer timeline accounting for complexity, risks, dependencies (e.g., 4-5 years for major transformations)
2. MODERATE: Balanced timeline (e.g., 2-3 years for typical strategic initiatives)
3. AGGRESSIVE: Faster timeline for well-resourced, focused initiatives (e.g., 12-18 months)

Guidelines:
- JTBDs are strategic initiatives, typically 3-5 years out (not 6-month tactical projects)
- Larger scope/metrics deltas = longer timelines
- Enterprise-wide/multi-location = add time for rollout
- Align with fiscal planning cycles (quarterly or annual milestones)
- Account for implementation, rollout, and stabilization phases

Current date reference: ${new Date().getFullYear()}

IMPORTANT: These are suggested starting points based on typical complexity patterns. The user knows their actual constraints (budget, resources, urgency) and will adjust accordingly.

Respond with ONLY a JSON array of 3 timeline suggestions (no extra text):
["Timeline 1", "Timeline 2", "Timeline 3"]`;
  }

  const aiResponse = await callAgentAI({
    instructions,
    llm_engine: 'gpt4o',
  });

  try {
    let suggestions;
    
    // Check if aiResponse is already an array (parsed JSON)
    if (Array.isArray(aiResponse)) {
      suggestions = aiResponse;
    } else if (typeof aiResponse === 'object' && aiResponse !== null) {
      // If it's an object with a suggestions property
      suggestions = Array.isArray(aiResponse.suggestions) ? aiResponse.suggestions : [];
    } else if (typeof aiResponse === 'string') {
      // Extract JSON array from response string
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from AI');
      }
      suggestions = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Unexpected response type from AI');
    }
    
    return {
      suggestions: Array.isArray(suggestions) ? suggestions : [],
    };
  } catch (error) {
    console.error('Failed to parse suggestions:', error);
    
    // Fallback suggestions
    return {
      suggestions: [
        'Unable to generate suggestions at this time',
        'Please try again or write your own',
        'Check the hints provided in the interface',
      ],
    };
  }
}

export async function polishJTBD(rawStatement: string): Promise<string> {
  const instructions = `You are a professional business writing expert. Take this assembled JTBD (Jobs-to-be-Done) statement and transform it into a single, polished, cohesive sentence that flows naturally.

Raw statement components:
${rawStatement}

Requirements:
- Combine all parts (WHAT, HOW MUCH, WHEN) into ONE flowing sentence
- Add appropriate verbs for metrics: "reducing", "increasing", "improving", "expanding", "achieving", etc.
- Use proper conjunctions: "and", "while", "by" to connect clauses smoothly
- Avoid repetition - if the WHAT and a metric refer to the same thing, integrate them elegantly
- Maintain all specific details, metrics, and deadlines
- Use professional business language
- Ensure it reads naturally with proper grammar
- Keep it concise but complete

Grammar patterns to follow:
- For single metric: "[WHAT], [verb]ing [metric] from X to Y by [WHEN]"
- For multiple metrics: "[WHAT], [verb]ing [metric 1] from X to Y and [verb]ing [metric 2] from A to B, by [WHEN]"
- Alternative structure: "[WHAT] to achieve [metric 1] from X to Y and [metric 2] from A to B by [WHEN]"

Examples of GOOD polish:

Input: "Build strategic sourcing partnerships | COGS: 72% → 68.4% | Partnerships: 5 → 15 | Q2 2027"
Output: "Expand strategic sourcing partnerships from 5 to 15 suppliers, reducing COGS from 72% to 68.4% of revenue by Q2 2027"

Input: "Implement lean manufacturing | Defect rate: 4.5% → 1.2% | Annual losses: $2.1M → $0 | Dec 2026"
Output: "Implement lean manufacturing and Six Sigma quality control systems, reducing defect rate from 4.5% to 1.2% and eliminating $2.1M in annual losses by December 2026"

Input: "Migrate applications to AWS | IT costs: $45M → $31.5M | Availability: 99.5% → 99.95% | Dec 2026"
Output: "Migrate 200+ legacy applications to AWS cloud infrastructure, reducing IT costs from $45M to $31.5M annually while improving system availability from 99.5% to 99.95% by December 2026"

Examples of BAD polish to AVOID:

❌ "Build strategic sourcing partnerships, COGS as a percentage of revenue from 72% to 68.4%, Number of strategic sourcing partnerships from 5 to 15, by Q2 2027"
(Missing verbs, awkward list structure, repetitive)

❌ "Do the work, metric goes from X to Y, by deadline"
(Too informal, vague)

❌ "Achieve goals through implementation"
(Lost all specific details)

Respond with ONLY the polished statement (no extra text, explanations, or quotes).`;

  const aiResponse = await callAgentAI({
    instructions,
    llm_engine: 'claude-sonnet-4',
  });

  // Return the response, handling both string and object responses
  if (typeof aiResponse === 'string') {
    return aiResponse.trim();
  } else if (typeof aiResponse === 'object' && aiResponse !== null) {
    // If it's wrapped in an object, try to extract
    return String(aiResponse).trim();
  }

  return String(aiResponse).trim();
}
