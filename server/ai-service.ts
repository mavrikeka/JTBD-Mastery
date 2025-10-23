import { CritiqueRequest, CritiqueResponse, SuggestionRequest, SuggestionResponse } from "@shared/schema";

const AGENT_AI_ENDPOINT = 'https://api-lr.agent.ai/v1/action/invoke_llm';
const API_KEY = process.env.AGENT_AI_API_KEY || '';

interface AgentAIRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

interface AgentAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
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
    return data.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Agent.ai API call failed:', error);
    throw new Error('AI service unavailable. Please try again later.');
  }
}

export async function critiqueJTBD(request: CritiqueRequest): Promise<CritiqueResponse> {
  const systemPrompt = `You are an expert consultant at CEOWorks specializing in Jobs-to-be-Done (JTBD) statements. A great JTBD has three mandatory components:

1. WHAT - The specific work to be done (action verbs, not vague goals)
2. HOW MUCH - Measurable outcomes with before/after metrics
3. WHEN - Clear deadline or timeframe (3-5 year strategic view)

The "Glass Slipper" Test: "If you can Google it, it's NOT a JTBD." JTBDs must be so bespoke and specific that they exclude 95% of candidates.

Analyze the JTBD statement and provide:
1. Overall score (0-100)
2. WHAT component score (0-100) and specific feedback
3. HOW MUCH component score (0-100) and specific feedback
4. WHEN component score (0-100) and specific feedback
5. 3-5 concrete suggestions for improvement
6. An improved version if score < 80

Respond in this exact JSON format:
{
  "overallScore": 85,
  "whatScore": 90,
  "howMuchScore": 85,
  "whenScore": 80,
  "whatFeedback": "...",
  "howMuchFeedback": "...",
  "whenFeedback": "...",
  "suggestions": ["...", "...", "..."],
  "improvedVersion": "..."
}`;

  const userPrompt = `Analyze this JTBD statement:\n\n"${request.jtbdStatement}"`;

  const aiResponse = await callAgentAI({
    model: 'claude-sonnet-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  // Parse JSON response
  try {
    // Extract JSON from response (in case there's extra text)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
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
  let systemPrompt = '';
  let userPrompt = '';

  if (request.step === 'what') {
    systemPrompt = `You are helping someone write a JTBD statement. Generate 3 specific, actionable work descriptions using strong action verbs (Implement, Redesign, Build, Transform, Establish).

Avoid vague verbs like: Improve, Enhance, Drive, Lead.

Respond with a JSON array of 3 suggestions:
["Suggestion 1", "Suggestion 2", "Suggestion 3"]`;

    userPrompt = `Scenario ID: ${request.scenarioId}\nCurrent input: ${request.currentInput || 'none'}\n\nGenerate 3 specific work descriptions for the WHAT component of a JTBD.`;
  } else if (request.step === 'metrics') {
    systemPrompt = `You are helping someone define metrics for a JTBD statement. Generate 3 specific metric suggestions with before/after format.

Format: "Metric name from X to Y"

Respond with a JSON array of 3 suggestions:
["Metric 1: from X to Y", "Metric 2: from X to Y", "Metric 3: from X to Y"]`;

    userPrompt = `Scenario ID: ${request.scenarioId}\nWork description: ${request.currentInput || 'none'}\n\nGenerate 3 measurable outcomes for the HOW MUCH component.`;
  } else {
    systemPrompt = `You are helping someone define a deadline for a JTBD statement. Generate 3 strategic timeline suggestions (3-5 year view).

Format: "Q4 2026", "December 2027", etc.

Respond with a JSON array of 3 suggestions:
["Timeline 1", "Timeline 2", "Timeline 3"]`;

    userPrompt = `Scenario ID: ${request.scenarioId}\n\nGenerate 3 strategic deadline options for the WHEN component.`;
  }

  const aiResponse = await callAgentAI({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  try {
    // Extract JSON array from response
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }
    
    const suggestions = JSON.parse(jsonMatch[0]);
    
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
