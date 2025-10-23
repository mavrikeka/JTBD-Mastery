import { CritiqueRequest, CritiqueResponse, SuggestionRequest, SuggestionResponse } from "@shared/schema";

const AGENT_AI_ENDPOINT = 'https://api-lr.agent.ai/v1/action/invoke_llm';
const API_KEY = process.env.AGENT_AI_API_KEY || '';

interface AgentAIRequest {
  instructions: string;
  llm_engine: 'claude_sonnet_4' | 'claude_sonnet_35' | 'gpt4o' | 'claude_sonnet_4.1' | 'gpt-4o-mini';
}

interface AgentAIResponse {
  status: number;
  response: string;
}

async function callAgentAI(request: AgentAIRequest): Promise<string> {
  try {
    const response = await fetch(AGENT_AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Agent.ai API error: ${response.status} - ${errorText}`);
    }

    const data: AgentAIResponse = await response.json();
    return data.response || '';
  } catch (error) {
    console.error('Agent.ai API call failed:', error);
    throw new Error('AI service unavailable. Please try again later.');
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

Respond in this exact JSON format (no extra text, just the JSON):
{
  "overallScore": 85,
  "whatScore": 90,
  "howMuchScore": 85,
  "whenScore": 80,
  "whatFeedback": "detailed feedback on WHAT component",
  "howMuchFeedback": "detailed feedback on HOW MUCH component",
  "whenFeedback": "detailed feedback on WHEN component",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "improvedVersion": "improved JTBD if score < 80, otherwise omit this field"
}`;

  const aiResponse = await callAgentAI({
    instructions,
    llm_engine: 'claude_sonnet_35',
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
      overallScore: parsed.overallScore || 0,
      whatScore: parsed.whatScore || 0,
      howMuchScore: parsed.howMuchScore || 0,
      whenScore: parsed.whenScore || 0,
      whatFeedback: parsed.whatFeedback || 'No feedback available',
      howMuchFeedback: parsed.howMuchFeedback || 'No feedback available',
      whenFeedback: parsed.whenFeedback || 'No feedback available',
      suggestions: parsed.suggestions || [],
      improvedVersion: parsed.improvedVersion,
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    console.error('AI response was:', aiResponse);
    
    // Fallback: provide basic analysis
    return {
      overallScore: 50,
      whatScore: 50,
      howMuchScore: 50,
      whenScore: 50,
      whatFeedback: 'Unable to analyze WHAT component. Please ensure you describe specific work with action verbs.',
      howMuchFeedback: 'Unable to analyze HOW MUCH component. Please include measurable outcomes with before/after metrics.',
      whenFeedback: 'Unable to analyze WHEN component. Please include a clear strategic deadline.',
      suggestions: ['Ensure the JTBD includes specific work to be done', 'Add measurable metrics with before/after values', 'Include a clear deadline (e.g., Q4 2026)'],
    };
  }
}

export async function getSuggestions(request: SuggestionRequest): Promise<SuggestionResponse> {
  let instructions = '';

  if (request.step === 'what') {
    instructions = `You are helping someone write a JTBD statement. Generate 3 specific, actionable work descriptions using strong action verbs (Implement, Redesign, Build, Transform, Establish).

Avoid vague verbs like: Improve, Enhance, Drive, Lead.

Context: Scenario ID is ${request.scenarioId}
Current input: ${request.currentInput || 'none'}

Respond with ONLY a JSON array of 3 suggestions (no extra text):
["Suggestion 1", "Suggestion 2", "Suggestion 3"]`;
  } else if (request.step === 'metrics') {
    instructions = `You are helping someone define metrics for a JTBD statement. Generate 3 specific metric suggestions with before/after format.

Format: "Metric name from X to Y"

Context: Scenario ID is ${request.scenarioId}
Work description: ${request.currentInput || 'none'}

Respond with ONLY a JSON array of 3 suggestions (no extra text):
["Metric 1: from X to Y", "Metric 2: from X to Y", "Metric 3: from X to Y"]`;
  } else {
    instructions = `You are helping someone define a deadline for a JTBD statement. Generate 3 strategic timeline suggestions (3-5 year view).

Format: "Q4 2026", "December 2027", etc.

Context: Scenario ID is ${request.scenarioId}

Respond with ONLY a JSON array of 3 suggestions (no extra text):
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
