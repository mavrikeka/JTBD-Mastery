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

### Web Application

```bash
# Install dependencies
cd client
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### Mobile Application

```bash
# Install dependencies
cd jtbd-mobile
npm install

# Start Expo development server
npx expo start

# Scan QR code with Expo Go app (iOS/Android)
```

### Backend Server

```bash
# Install dependencies
cd server
npm install

# Configure environment
cp .env.example .env
# Add your Agent.ai API key to .env

# Start server
npm run dev

# Server runs on http://localhost:3001
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

## Project Structure

```
JTBD-Mastery/
├── client/              # Web application (React + Vite)
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
- **[Mobile Quick Start](jtbd-mobile/docs/quick-start.md)** - Mobile-specific setup guide

## Environment Variables

### Web (`client/.env`)
```
VITE_API_URL=http://localhost:3001
```

### Mobile (`jtbd-mobile/.env`)
```
API_URL=http://localhost:3001
```

### Server (`server/.env`)
```
AGENT_AI_API_KEY=your_api_key_here
PORT=3001
```

## Development

```bash
# Run all services concurrently
npm run dev              # From root (if configured)

# Or run individually
cd client && npm run dev       # Web on :5173
cd server && npm run dev       # API on :3001
cd jtbd-mobile && npx expo start  # Mobile via Expo
```

## Building for Production

### Web
```bash
cd client
npm run build
# Output: client/dist/
```

### Mobile
```bash
cd jtbd-mobile
eas build
# Requires Expo Application Services (EAS) setup
```

### Server
```bash
cd server
npm run build
# Output: server/dist/
```

## Contributing

This is an educational project. For contributions or questions, please refer to the documentation in `docs/`.

## License

[Add your license here]

## Learn More

- [Jobs-to-be-Done Framework](https://jobs-to-be-done.com/)
- [JTBD Theory](https://hbr.org/2016/09/know-your-customers-jobs-to-be-done)
