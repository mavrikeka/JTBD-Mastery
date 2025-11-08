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

Analyze the following JTBD statement and provide a detailed critique:

"${request.jtbdStatement}"

STATUS DEFINITIONS:
Component Status (whatStatus, howMuchStatus, whenStatus):
- "missing": Component not present or completely inadequate
- "weak": Component present but vague, generic, or needs significant improvement
- "strong": Component well-defined, specific, and actionable
- "excellent": Component exceptional, passes Glass Slipper test

Overall Status:
- "not-ready": Missing one or more components (cannot execute)
- "needs-work": All components present but at least one is weak
- "ready": All components strong (ready to execute)
- "exemplary": All components excellent (best-in-class JTBD)

For each component, provide:
- Detailed feedback explaining the status
- 2-3 specific, actionable suggestions for improvement (even for excellent components)

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

Context:
${contextDetails}

What they're building: ${request.currentInput || 'none'}

Format: "Metric name: from X to Y"
Examples:
- "Customer satisfaction score: from 6.2 to 8.5"
- "Time to market: from 180 days to 90 days"
- "Operating costs: from $2.4M to $1.8M annually"

Make metrics that:
- Have concrete numerical values (not vague improvements)
- Include units of measurement
- Are realistic and achievable
- Align with the work being described
- Are directly relevant to the specific scenario and situation above

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

    instructions = `You are helping someone define a strategic deadline for a JTBD statement. Generate 3 realistic timeline suggestions for completing major business transformation work.

Context:
${contextDetails}

The work and metrics: ${request.currentInput || 'none'}

Format: Use quarters and years like "Q4 2026", "Q2 2027", or specific months like "December 2027"

Guidelines:
- JTBDs are strategic initiatives, typically 3-5 years out
- Consider realistic timeframes for business transformation
- Align with fiscal planning cycles (quarterly or annual)
- Account for implementation, rollout, and stabilization
- Consider the complexity and scale shown in the scenario context

Current date reference: ${new Date().getFullYear()}

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
- Maintain all specific details, metrics, and deadlines
- Use professional business language
- Ensure it reads naturally and professionally
- Keep it concise but complete
- Do NOT lose any important information from the original

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
