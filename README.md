# JTBD Mastery

An interactive educational platform for learning and mastering Jobs-to-be-Done (JTBD) statement writing, powered by AI.

## Overview

JTBD Mastery helps professionals learn to write effective Jobs-to-be-Done statements through three interactive modes:

- **Learn** - Study 10 real-world JTBD examples and test pattern recognition
- **Build** - Create your own JTBD statements with AI-powered suggestions
- **Critique** - Get detailed AI analysis and feedback on JTBD statements

Available on both **web** and **mobile** (React Native/Expo).

## Features

- **7-Component JTBD Framework** - Actor, Motivation, Job, Outcome, Contextual, Emotional, Social
- **AI-Powered Assistance** - Intelligent suggestions and critique using Claude Sonnet 4 / GPT-4o
- **6 Executive Scenarios** - Pre-loaded examples from CTO, VP Ops, Head Sales, CFO, CMO, CHRO perspectives
- **Progress Tracking** - Save drafts and track your learning journey
- **Cross-Platform** - Seamless experience on web and mobile

## Quick Start

### Production Deployment

**Live Application**: https://jtbd-mastery-production.up.railway.app

The backend API is deployed on Railway.app and accessible to both web and mobile clients.

### Local Development

#### Web Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5000
```

#### Mobile Application

```bash
# Install dependencies
cd jtbd-mobile
npm install

# Start Expo development server
npx expo start

# Scan QR code with Expo Go app (iOS/Android)
```

#### Backend Server (Local)

```bash
# Configure environment
cp .env.example .env
# Add your Agent.ai API key to .env

# Start server
npm run dev

# Server runs on http://localhost:5000
```

## Tech Stack

### Web
- React 18 + TypeScript
- Vite
- Tailwind CSS + Radix UI
- React Router
- Framer Motion

### Mobile
- React Native 0.81
- Expo 54
- React Navigation
- React Native Paper

### Backend
- Node.js + Express
- TypeScript
- Agent.ai (Claude Sonnet 4 / GPT-4o)
- Railway.app (Production Deployment)
- CORS enabled for mobile app access

## Project Structure

```
JTBD-Mastery/
├── client/              # Web application (React + Vite) [integrated with backend]
├── jtbd-mobile/         # Mobile application (React Native + Expo)
├── server/              # Backend API (Express + AI integration)
├── docs/                # Documentation
│   ├── architecture/    # Technical architecture docs
│   ├── development/     # Developer guides
│   └── proposals/       # Design proposals and notes
└── .claude/             # Claude Code navigation guide
```

## Documentation

- **[Architecture Overview](docs/architecture/codebase-overview.md)** - Comprehensive technical documentation
- **[Quick Reference](docs/development/quick-reference.md)** - Developer quick start guide
- **[Design Guidelines](docs/development/design-guidelines.md)** - UI/UX design principles
- **[Mobile API Guide](MOBILE_API_GUIDE.md)** - Mobile app API integration guide
- **[Railway Deployment](RAILWAY_ACCESS.md)** - Production deployment guide

## Environment Variables

### Production (Railway)
```
AGENT_AI_API_KEY=your_api_key_here
PORT=5000  # Automatically set by Railway
```

### Local Development (`.env`)
```
AGENT_AI_API_KEY=your_api_key_here
PORT=5001  # Local development port (5000 conflicts with macOS AirPlay)
```

### Mobile App (`jtbd-mobile/src/lib/queryClient.ts`)
```typescript
export const API_BASE_URL = 'https://jtbd-mastery-production.up.railway.app';
// Can be overridden via app.json for local development
```

## Development

```bash
# Run locally
npm run dev              # Starts backend + web frontend on :5000

# Or run mobile app
cd jtbd-mobile && npx expo start  # Mobile via Expo
```

## Deployment

### Railway (Current Production)

The app is currently deployed to Railway.app:
- **URL**: https://jtbd-mastery-production.up.railway.app
- **Platform**: Railway.app
- **Auto-deploy**: Push to main branch triggers deployment

To deploy:
1. Push changes to GitHub
2. Railway automatically detects changes
3. Builds and deploys (takes ~2-3 minutes)
4. Access at production URL

### Building Locally

```bash
# Build for production
npm run build

# Start production build
npm run start

# Outputs:
# - dist/ - Compiled backend
# - dist/public/ - Static web files
```

### Mobile App Build

```bash
cd jtbd-mobile

# Development build
npx expo start

# Production build (requires EAS)
eas build --platform ios
eas build --platform android
```

## Contributing

This is an educational project. For contributions or questions, please refer to the documentation in `docs/`.

## License

[Add your license here]

## Learn More

- [Jobs-to-be-Done Framework](https://jobs-to-be-done.com/)
- [JTBD Theory](https://hbr.org/2016/09/know-your-customers-jobs-to-be-done)
