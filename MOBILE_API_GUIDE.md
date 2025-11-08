# JTBD Mastery Mobile API Guide

This guide shows how to use the JTBD Mastery API from your mobile app or any external application.

## Base URLs

- **Development**: `http://localhost:5001`
- **Production (Replit)**: `https://jtbd-mastery-ceoworks.replit.app`

## CORS Configuration

The API is configured to accept requests from any origin, making it accessible from:
- Mobile apps (iOS, Android, React Native, Flutter)
- Web apps
- Desktop apps
- Command-line tools

## Available Endpoints

### 1. Critique JTBD Statement

Analyze a JTBD statement using Claude Sonnet 4 for deep strategic analysis.

**Endpoint**: `POST /api/critique`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "jtbdStatement": "Your JTBD statement to analyze"
}
```

**Response** (200 OK):
```json
{
  "overallStatus": "ready|needs-work",
  "whatStatus": "strong|needs-work",
  "howMuchStatus": "strong|needs-work",
  "whenStatus": "strong|needs-work",
  "whatFeedback": "Detailed feedback on the WHAT component",
  "howMuchFeedback": "Detailed feedback on the HOW MUCH component",
  "whenFeedback": "Detailed feedback on the WHEN component",
  "whatSuggestions": ["Suggestion 1", "Suggestion 2"],
  "howMuchSuggestions": ["Suggestion 1", "Suggestion 2"],
  "whenSuggestions": ["Suggestion 1", "Suggestion 2"]
}
```

**Example cURL**:
```bash
curl -X POST https://jtbd-mastery-ceoworks.replit.app/api/critique \
  -H "Content-Type: application/json" \
  -d '{
    "jtbdStatement": "Consolidate supplier contracts from 150 to 100 while reducing COGS from 72% to 68.4% by Q2 2027"
  }'
```

**Example JavaScript/TypeScript**:
```typescript
const response = await fetch('https://jtbd-mastery-ceoworks.replit.app/api/critique', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    jtbdStatement: 'Consolidate supplier contracts from 150 to 100 while reducing COGS from 72% to 68.4% by Q2 2027'
  })
});

const critique = await response.json();
console.log(critique);
```

**Example React Native**:
```typescript
const analyzeJTBD = async (statement: string) => {
  try {
    const response = await fetch('https://jtbd-mastery-ceoworks.replit.app/api/critique', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jtbdStatement: statement
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const critique = await response.json();
    return critique;
  } catch (error) {
    console.error('Error analyzing JTBD:', error);
    throw error;
  }
};
```

---

### 2. Get AI Suggestions

Get intelligent suggestions for improving specific components of your JTBD statement during the build process.

**Endpoint**: `POST /api/suggestions`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "scenarioId": "unique-scenario-identifier",
  "step": "what" | "metrics" | "when",
  "currentInput": "Optional: Current input for this step"
}
```

**Response** (200 OK):
```json
{
  "suggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"]
}
```

**Example cURL**:
```bash
curl -X POST https://jtbd-mastery-ceoworks.replit.app/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioId": "supply-chain-scenario-1",
    "step": "what",
    "currentInput": "Consolidate supplier contracts"
  }'
```

**Example JavaScript/TypeScript**:
```typescript
const getSuggestions = async (
  scenarioId: string,
  step: 'what' | 'metrics' | 'when',
  currentInput?: string
) => {
  const response = await fetch('https://jtbd-mastery-ceoworks.replit.app/api/suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ scenarioId, step, currentInput })
  });

  return await response.json();
};
```

**Note**: This endpoint requires a valid scenario ID from your build mode scenarios. If you need general suggestions without a scenario, use the critique endpoint instead.

---

### 3. Polish JTBD Statement

Refine and polish a raw JTBD statement into a cohesive, well-structured sentence.

**Endpoint**: `POST /api/polish-jtbd`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "rawStatement": "Your unpolished JTBD statement with components"
}
```

**Response** (200 OK):
```json
{
  "polishedStatement": "A refined, cohesive JTBD statement"
}
```

**Example cURL**:
```bash
curl -X POST https://jtbd-mastery-ceoworks.replit.app/api/polish-jtbd \
  -H "Content-Type: application/json" \
  -d '{
    "rawStatement": "Consolidate supplier contracts from 150 to 100 while reducing COGS from 72% to 68.4% by Q2 2027"
  }'
```

**Example JavaScript/TypeScript**:
```typescript
const polishJTBD = async (rawStatement: string) => {
  const response = await fetch('https://jtbd-mastery-ceoworks.replit.app/api/polish-jtbd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rawStatement })
  });

  return await response.json();
};
```

---

## Error Handling

All endpoints may return error responses:

**400 Bad Request** - Invalid request format:
```json
{
  "error": "Invalid request",
  "details": [
    {
      "path": ["jtbdStatement"],
      "message": "Required"
    }
  ]
}
```

**500 Internal Server Error** - Server or AI service error:
```json
{
  "error": "Failed to analyze JTBD"
}
```

## Rate Limiting

The API uses the Agent.ai service which has rate limits based on your API key tier. Monitor your usage at: https://agent.ai/user/settings#credits

## Best Practices

1. **Error Handling**: Always implement proper error handling for network failures and API errors
2. **Timeouts**: Set reasonable timeouts (30-60 seconds) as AI processing can take time
3. **User Feedback**: Show loading states while waiting for AI responses
4. **Validation**: Validate user input before sending to the API
5. **Retry Logic**: Implement exponential backoff for transient failures

## Testing Locally

To test against your local development server:

1. Start the server:
```bash
npm run dev
```

2. Update your mobile app to point to:
```
http://localhost:5001
```

Note: For iOS simulator, use `http://localhost:5001`
Note: For Android emulator, use `http://10.0.2.2:5001`

## Support

For issues or questions:
- Check the main README.md for setup instructions
- Review the source code in `/server/routes.ts`
- Verify your Agent.ai API key is configured correctly
