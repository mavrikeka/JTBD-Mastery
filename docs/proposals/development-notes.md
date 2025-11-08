# JTBD Mastery - Development Notes & Learnings

## Project Overview

JTBD Mastery is a mobile application (React Native/Expo) with an Express backend that helps users learn and build Jobs-to-be-Done (JTBD) statements. The app integrates with Agent.ai's LLM API to provide AI-powered suggestions and critiques.

## Architecture

### Mobile App
- **Framework**: React Native with Expo
- **State Management**: React Query (@tanstack/react-query)
- **Storage**: AsyncStorage for persistence
- **Navigation**: Custom SimpleNavigator (React Context-based)
- **Styling**: Dark theme (black background #0f1419, orange-red primary #ff6b35)

### Backend
- **Framework**: Express.js
- **Runtime**: Node.js with tsx (TypeScript execution)
- **Port**: 5001 (5000 is used by macOS Control Center)
- **Environment**: .env file with dotenv package

### AI Integration
- **Service**: Agent.ai (https://api-lr.agent.ai/v1/action/invoke_llm)
- **Models Used**:
  - `gpt4o` - For suggestions (faster, ~3-4 seconds)
  - `claude-sonnet-4` - For critiques (more detailed, ~12 seconds)
- **Architecture**: Mobile → Backend → Agent.ai
  - Keeps API key secure on backend
  - Enables cost control and rate limiting
  - Allows validation and error handling

## Critical Learnings

### 1. Environment Variables Not Loading

**Problem**: Server code was reading `process.env.AGENT_AI_API_KEY` but getting `undefined`, even though the `.env` file existed with the correct key.

**Root Cause**: The `dotenv` package was not installed and not configured in the server entry point.

**Solution**:
```bash
npm install dotenv
```

Then add to the very first line of `/server/index.ts`:
```typescript
import 'dotenv/config';
```

**Key Insight**: Node.js does NOT automatically load `.env` files. You must explicitly use a package like `dotenv` or pass environment variables via command line.

### 2. Local Network Configuration for Mobile Development

**Problem**: Mobile app using `localhost:5000` fails with "Network request failed" when running on a physical device or simulator.

**Root Cause**: `localhost` refers to the mobile device itself, not the development machine.

**Solution**: Use the local network IP address of the development machine:
```typescript
// In /jtbd-mobile/src/lib/queryClient.ts
export const API_BASE_URL = 'http://192.168.68.101:5001';
```

**How to Find Your Local IP**:
```bash
# macOS/Linux
ifconfig | grep "inet "
# Look for the 192.168.x.x address (not 127.0.0.1)
```

**Important Notes**:
- Both devices must be on the same WiFi network
- IP address may change when switching networks
- For production, deploy backend to cloud (Render, Railway, AWS, etc.)

### 3. Port Conflicts on macOS

**Problem**: Server fails to start with `EADDRINUSE` error on port 5000.

**Root Cause**: macOS Control Center uses port 5000 by default.

**Solution**: Changed to port 5001 in `.env` file:
```
PORT=5001
```

And updated mobile app's `API_BASE_URL` to use 5001.

### 4. Agent.ai Model Names

**Problem**: Using `claude-3-5-sonnet` returned 404 error: `model: claude-3-5-sonnet not found`

**Root Cause**: Agent.ai uses specific model identifiers that may differ from provider's native names.

**Valid Model Names**:
- `claude-sonnet-4` ✓
- `gpt4o` ✓
- `gpt-4o-mini` ✓
- `claude-3-5-sonnet` ✗ (invalid)

**Solution**: Use `claude-sonnet-4` instead of `claude-3-5-sonnet`.

### 5. Agent.ai Response Format Handling

**Problem**: Code expected Agent.ai to always return a string, but sometimes returns arrays or objects.

**Original Code**:
```typescript
async function callAgentAI(request: AgentAIRequest): Promise<string> {
  // ...
  if (data.response?.startsWith('Error:')) { // Fails if response is array!
    throw new Error(data.response);
  }
  return data.response || '';
}
```

**Solution**: Handle multiple response types:
```typescript
async function callAgentAI(request: AgentAIRequest): Promise<any> {
  // ...
  if (typeof data.response === 'string' && data.response?.startsWith('Error:')) {
    throw new Error(data.response);
  }
  return data.response || '';
}
```

**Response Type Examples**:
- Suggestions endpoint: Returns array directly: `["suggestion 1", "suggestion 2", "suggestion 3"]`
- Critique endpoint: Returns object/string with JSON

### 6. Agent.ai API Structure

**Request Format**:
```typescript
interface AgentAIRequest {
  instructions: string;  // The prompt
  llm_engine: 'claude-sonnet-4' | 'gpt4o' | 'gpt-4o-mini';
}
```

**Response Format**:
```typescript
interface AgentAIResponse {
  status: number;  // 200 for success, 401 for auth errors
  response: string | string[] | any;  // Varies by request
  metadata?: {
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    }
  }
}
```

**Authentication**:
```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`
}
```

**Error Handling**:
- HTTP 200 with `status: 401` in body = Invalid API key
- Check `data.status` field, not just HTTP status code

## File Structure & Key Files

### Backend Configuration
```
/server/index.ts              # Entry point - MUST import 'dotenv/config' first
/server/ai-service.ts         # Agent.ai integration
/server/routes.ts             # API routes
/.env                         # Environment variables (gitignored)
```

### Mobile App
```
/jtbd-mobile/src/lib/queryClient.ts    # API configuration, API_BASE_URL
/jtbd-mobile/src/lib/theme.ts          # Dark theme colors
/jtbd-mobile/src/pages/BuildPage.tsx   # Main JTBD building interface
/jtbd-mobile/src/pages/LearnPage.tsx   # Examples and learning content
```

### Environment Variables (.env)
```bash
# Agent.ai API Configuration
AGENT_AI_API_KEY=your_key_here

# Server Configuration
PORT=5001
```

## Development Workflow

### Starting the Backend
```bash
# Make sure you're in the root directory
npm run dev

# Server will start on http://0.0.0.0:5001
# Accessible at http://192.168.68.101:5001 from mobile devices
```

### Starting the Mobile App
```bash
cd jtbd-mobile
npm start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code for physical device
```

### Testing API Endpoints

**Test Suggestions**:
```bash
curl -X POST 'http://localhost:5001/api/suggestions' \
  -H 'Content-Type: application/json' \
  -d '{"scenarioId":"s1","step":"what","currentInput":"test"}'
```

**Test Critique**:
```bash
curl -X POST 'http://localhost:5001/api/critique' \
  -H 'Content-Type: application/json' \
  -d '{"jtbdStatement":"Improve customer satisfaction by Q4 2026"}'
```

## Debugging Tips

### Check if Environment Variables are Loaded
Add logging in `ai-service.ts`:
```typescript
console.log('API Key loaded:', {
  api_key_length: API_KEY?.length,
  api_key_prefix: API_KEY?.substring(0, 10) + '...'
});
```

### Check Server Logs
```bash
tail -f /tmp/jtbd-server.log
```

### Common Issues & Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| API key not loaded | `api_key_length: 0` | Install dotenv, add `import 'dotenv/config'` |
| Network request failed | Mobile app can't reach backend | Use local IP instead of localhost |
| Port already in use | `EADDRINUSE` error | Change to port 5001 |
| Model not found | 404 from Agent.ai | Use correct model name (e.g., `claude-sonnet-4`) |
| Response parsing error | `startsWith is not a function` | Handle array/object responses |

## Performance Notes

### Agent.ai Response Times
- **Suggestions (gpt4o)**: ~3-4 seconds
- **Critique (claude-sonnet-4)**: ~10-12 seconds

### Token Usage
Example from suggestions endpoint:
```json
{
  "usage": {
    "prompt_tokens": 187,
    "completion_tokens": 42,
    "total_tokens": 229
  }
}
```

## Security Best Practices

1. **Never commit .env file**: Already in `.gitignore`
2. **Keep API keys on backend**: Mobile app never sees the Agent.ai API key
3. **Use HTTPS in production**: Local dev uses HTTP, but production should use HTTPS
4. **Validate inputs**: Backend validates requests before sending to Agent.ai

## Future Improvements

1. **Deploy Backend**: Use Render, Railway, or AWS for production
2. **Error Handling**: Add retry logic for failed Agent.ai calls
3. **Caching**: Cache suggestions to reduce API calls and costs
4. **Rate Limiting**: Implement rate limiting per user
5. **Offline Mode**: Store previous suggestions for offline use
6. **Analytics**: Track which suggestions users select

## Deployment Considerations

### For Production Deployment

1. **Backend Deployment**:
   - Deploy to Render, Railway, Vercel, or AWS
   - Set environment variables in hosting platform
   - Update `API_BASE_URL` in mobile app to production URL
   - Enable HTTPS

2. **Mobile App Deployment**:
   - Update `API_BASE_URL` to production backend URL
   - Build production version: `expo build:ios` / `expo build:android`
   - Submit to App Store / Google Play

3. **Environment Variables**:
   - Set `AGENT_AI_API_KEY` in production environment
   - Set `NODE_ENV=production`
   - Consider using different API keys for dev/staging/prod

## References

- [Agent.ai Documentation](https://docs.agent.ai/api-reference/use-ai/use-genai-llm)
- [Agent.ai API Key](https://agent.ai/user/settings#credits)
- [Expo Documentation](https://docs.expo.dev/)
- [React Query Documentation](https://tanstack.com/query/latest)

## Version History

### Current Version
- Dark theme implementation
- Multi-stage Build Mode (7 stages)
- Agent.ai integration for suggestions and critiques
- Local network development setup
- Environment variables properly configured

### Known Issues
- None currently

### Last Updated
2025-10-25

## AI Suggestions - Full Context Implementation

### Architecture: Backend Scenario Lookup Pattern

**User Requirement:** "The prompt needs to have the full scenario and in other build pages, the full context. This is a fixed constraint. I want to make sure this happens in a performant way. So we don't pass a lot of information in the payload, if we already have that. Ideally mobile app passes the ID and in the backend we do a lookup and get all the details and pass to the prompt."

**Implementation:**

1. **Mobile App** (`/jtbd-mobile/src/pages/BuildPage.tsx`):
   - Sends minimal payload: `{ scenarioId: "cto", step: "what", currentInput: "" }`
   - Payload size: ~52 bytes
   - No need to include full scenario object

2. **Backend** (`/server/ai-service.ts`):
   - Receives scenario ID from mobile
   - Calls `getScenarioById(request.scenarioId)` to fetch full scenario
   - Builds rich context string with:
     - Role, Company, Industry, Challenge
     - All situation bullet points (array)
     - Value agenda
   - Includes full context in AI prompt

3. **Scenario Data** (`/server/scenarios.ts`):
   - Single source of truth for all scenario data
   - 6 scenarios: vp-ops, cto, head-sales, cfo, cmo, chro
   - Each has full context object with company, size, situation[], valueAgenda
   - `getScenarioById()` helper function for quick lookup

**Benefits:**
- Small network payloads (mobile → backend)
- Rich AI prompts with full context
- Single source of truth for scenario data
- Easy to update scenario content
- Performant for mobile devices

**Context Flow by Step:**

1. **What Step**:
   - Mobile sends: `{ scenarioId, step: "what", currentInput: "" }`
   - Backend provides: Full scenario context
   - AI gets: Role, company, industry, challenge, situation bullets, value agenda

2. **Metrics Step**:
   - Mobile sends: `{ scenarioId, step: "metrics", currentInput: "what work was chosen" }`
   - Backend provides: Full scenario context + what work
   - AI gets: All scenario details + the work description to suggest metrics for

3. **When Step**:
   - Mobile sends: `{ scenarioId, step: "when", currentInput: "what work + metrics combined" }`
   - Backend provides: Full scenario context + what + metrics
   - AI gets: All scenario details + work + metrics to suggest realistic deadlines

**Example API Request:**
```bash
curl -X POST 'http://192.168.68.101:5001/api/suggestions' \
  -H 'Content-Type: application/json' \
  -d '{
    "scenarioId": "cto",
    "step": "what",
    "currentInput": ""
  }'
```

**Example AI Prompt Built (CTO Scenario):**
```
You are helping someone write a JTBD (Jobs-to-be-Done) statement...

Context:
Role: Chief Technology Officer
Company: GlobalCorp Industries (50,000 employees, Fortune 500)
Industry: Enterprise Tech
Challenge: Legacy infrastructure

Current Situation:
  - 200+ legacy applications on-premise
  - Annual IT infrastructure cost: $45M
  - System availability: 99.5% (target: 99.95%)
  - CEO mandate: Modernize and reduce costs
  - Zero downtime requirement for migration

Value Agenda: Reduce IT costs by 30% while improving system reliability and enabling innovation.

User's current input: none

Generate 3 specific work descriptions that:
[... rest of prompt with AVOID list and examples ...]
```

**Result:**
AI now generates contextually relevant suggestions that reference specific scenario details (e.g., "zero downtime requirement", "200+ applications", "Fortune 500").

### Last Updated
2025-10-25 - Added full context implementation with backend scenario lookup
