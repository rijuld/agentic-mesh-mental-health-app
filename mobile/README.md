# Anchor - BPD Recovery App

A React Native mobile application for supporting individuals navigating BPD recovery, their allies, and therapists.

## Features

### Role-Based Experience
The app provides three distinct experiences based on user role:

#### Patient Mode ("I am Navigating Recovery")
- **Home (The Helm)**: Mood slider, daily DBT skill, quick actions
- **Tools (The Toolbox)**: DBT skills library, FP Buffer, Mentalization Mirror, Journal
- **My Team**: Anchor Code sharing, ally/therapist connections, share settings
- **Crisis Button**: Long-press (3 seconds) to activate crisis protocol

#### Ally Mode ("I am a Supporter")
- **Dashboard**: Patient status light, burnout meter, quick actions
- **Translator**: AI-powered message translation and de-escalation suggestions
- **Learn**: Micro-lessons on BPD

#### Therapist Mode ("I am a Clinician")
- **Caseload**: Patient list sorted by risk level
- **Data Stream**: AI-generated clinical summaries, mood logs, crisis events
- **Interventions**: Push notification tools

### Shared Features
- **Safety Contract**: Digital agreement signed by all parties
- **AI Chat**: Role-specific AI agents powered by DigitalOcean Gradient AI

## Tech Stack

- **Frontend**: React Native with Expo
- **State Management**: Zustand
- **Navigation**: React Navigation
- **AI**: DigitalOcean Gradient AI (5 specialized agents - direct API calls)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

```bash
cd mobile
npm install
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
mobile/
├── App.tsx                 # Main app entry with navigation
├── src/
│   ├── components/         # Reusable components
│   │   └── CrisisButton.tsx
│   ├── constants/
│   │   └── theme.ts        # Colors, spacing, typography
│   ├── screens/
│   │   ├── RoleGateScreen.tsx
│   │   ├── patient/
│   │   │   ├── PatientHomeScreen.tsx
│   │   │   ├── PatientToolsScreen.tsx
│   │   │   └── PatientTeamScreen.tsx
│   │   ├── ally/
│   │   │   ├── AllyDashboardScreen.tsx
│   │   │   └── AllyTranslatorScreen.tsx
│   │   ├── therapist/
│   │   │   ├── TherapistCaseloadScreen.tsx
│   │   │   └── TherapistDataStreamScreen.tsx
│   │   └── shared/
│   │       ├── SafetyContractScreen.tsx
│   │       └── ChatScreen.tsx
│   ├── services/
│   │   └── agentService.ts # Direct calls to DO Gradient AI agents
│   ├── store/
│   │   └── useStore.ts     # Zustand state management
│   └── types/
│       └── index.ts        # TypeScript types
```

## AI Agents (DigitalOcean Gradient AI)

The app calls 5 specialized AI agents directly via their public endpoints:

| Agent | Endpoint | Purpose |
|-------|----------|---------|
| **Translator** | `https://tw5vdfz2eujvx64lazljnghx.agents.do-ai.run` | Message translation & de-escalation for allies |
| **Mentalization Mirror** | `https://ttyh5sguidqqq3ttoeuhlall.agents.do-ai.run` | Understanding mental states behind communications |
| **FP Buffer** | `https://gc3n4w4xfrh6o7obid2vannh.agents.do-ai.run` | Favorite Person boundary support |
| **Validation Agent** | `https://zt6nnlzy76kb4zjosupviqom.agents.do-ai.run` | Validating, dialectical support for patients |
| **Router** | `https://jcjq4yrw6y2ywsllgap457rd.agents.do-ai.run` | Routes requests to appropriate agent/function |

### API Format

All agents use the DigitalOcean Gradient AI chat completions API:

```typescript
POST {endpoint}/api/v1/chat/completions
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Your message here" }
  ],
  "stream": false
}
```

## Pairing Mechanism

1. Patient creates account and generates unique Anchor Code
2. Ally/Therapist scans code during onboarding to link accounts
3. Linked accounts can share data based on patient's share settings

## License

MIT
