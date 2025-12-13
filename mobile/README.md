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
- **AI Chat**: Role-specific AI agents powered by Digital Ocean Gradient AI

## Tech Stack

- **Frontend**: React Native with Expo
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Backend**: Python FastAPI (see `/backend`)
- **AI**: Digital Ocean Gradient AI (5 specialized agents)

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

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Digital Ocean Gradient AI credentials
uvicorn main:app --reload
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
│   │   └── agentService.ts # API client for AI agents
│   ├── store/
│   │   └── useStore.ts     # Zustand state management
│   └── types/
│       └── index.ts        # TypeScript types

backend/
├── agents/
│   ├── __init__.py
│   └── agent_handler.py    # Digital Ocean Gradient AI integration
├── requirements.txt
└── .env.example
```

## AI Agents

The app uses 5 specialized AI agents:

1. **Patient DBT Coach**: Validating, dialectical support for patients
2. **Ally Conflict Resolution**: Message translation and de-escalation
3. **Therapist Clinical Summary**: Clinical documentation assistance
4. **Crisis Intervention**: Immediate safety-focused support
5. **Mentalization Mirror**: Understanding mental states behind communications

## Environment Variables

Create a `.env` file in the backend directory:

```env
GRADIENT_AI_API_KEY=your_api_key
GRADIENT_AI_WORKSPACE_ID=your_workspace_id
AGENT_ID_PATIENT_DBT=your_agent_id
AGENT_ID_ALLY=your_agent_id
AGENT_ID_THERAPIST=your_agent_id
AGENT_ID_CRISIS=your_agent_id
AGENT_ID_MENTALIZATION=your_agent_id
```

## Pairing Mechanism

1. Patient creates account and generates unique Anchor Code
2. Ally/Therapist scans code during onboarding to link accounts
3. Linked accounts can share data based on patient's share settings

## License

MIT
