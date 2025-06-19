# Educational Platform - React Native Migration Guide

## Table of Contents
- [Introduction](#introduction)
- [UI/UX Design System](#uiux-design-system)
- [Features Overview](#features-overview)
- [Authentication Flow](#authentication-flow)
- [API Documentation](#api-documentation)
- [Component Migration Guide](#component-migration-guide)
- [State Management](#state-management)
- [Navigation Structure](#navigation-structure)

## Introduction

This document provides a comprehensive guide for migrating the web-based Educational Platform to React Native. The platform is built with Next.js, TypeScript, Tailwind CSS, and Shadcn UI components, following a modern, dark-themed design system with emphasis on accessibility and user experience.

## UI/UX Design System

### Theme Configuration

The platform uses a sophisticated dark theme with custom color variables, gradients, and visual effects:

#### Color Palette

**Dark Mode (Default)**
- Background: Deep navy to black gradients (`#0f0f18`, `#181830`)
- Card Backgrounds: Semi-transparent dark gradients (`rgba(30, 30, 50, 0.9)`, `rgba(20, 20, 35, 0.7)`)
- Accents: Purple (`#9333ea`), Blue (`#4f46e5`), Pink (`#ec4899`)
- Text: White/light gray for primary text, muted grays for secondary text
- Glows: Purple (`rgba(139, 92, 246, 0.15)`), Blue (`rgba(59, 130, 246, 0.15)`), Pink (`rgba(236, 72, 153, 0.15)`)

**Light Mode (Optional)**
- Standard light theme with white backgrounds and dark text
- Maintains accent colors for brand consistency

#### Visual Elements

1. **Glassmorphism**
   - Semi-transparent backgrounds with backdrop blur
   - Subtle borders (opacity 0.08-0.1)
   - Shadow effects for depth

2. **Gradients**
   - Background gradients for page containers
   - Button gradients (purple to blue)
   - Text gradients for headings and important elements

3. **Special Effects**
   - Subtle glow effects on important UI elements
   - Micro-interactions (scale, opacity changes)
   - Animated transitions between states

### Typography

- Primary Font: System font stack with Inter as preferred font
- Heading Sizes:
  - H1: 24px, 600 weight
  - H2: 20px, 500 weight
- Body Text: 16px, 400 weight
- Line Height: 1.6 for optimal readability

### Component Design

The platform uses Shadcn UI components, which are built on Radix UI primitives. For React Native, you'll need to recreate these components using React Native equivalents:

1. **Cards**
   - Rounded corners (border-radius: 0.75rem)
   - Semi-transparent backgrounds
   - Subtle borders
   - Shadow effects

2. **Buttons**
   - Multiple variants: primary (gradient), secondary, outline, destructive
   - Size variants: default, small, large, icon
   - Interactive states: hover, focus, active
   - Loading states with spinners

3. **Form Elements**
   - Inputs with consistent styling
   - Select dropdowns
   - Textareas
   - Checkboxes and radio buttons

4. **Feedback Components**
   - Toast notifications
   - Alerts
   - Progress indicators
   - Badges for status indicators

### Layout Patterns

- Responsive grid layouts
- Flex-based component arrangements
- Consistent spacing system
- Mobile-first approach with breakpoints

### Accessibility Considerations

- High contrast between text and backgrounds
- Proper focus indicators
- ARIA attributes for interactive elements
- Screen reader support

## Features Overview

### Core Features

1. **Authentication System**
   - Login/Register
   - Profile management
   - Session handling

2. **Quiz System**
   - Multiple quiz types
   - Quiz creation and management
   - Quiz attempts and scoring
   - Results and analytics

3. **Pronunciation Practice**
   - Audio recording and playback
   - Pronunciation accuracy analysis
   - Reference audio comparison
   - Progress tracking

4. **Content Library**
   - Educational content browsing
   - Content categorization
   - Favorites and bookmarking

5. **Leaderboard and Gamification**
   - User rankings
   - Points and achievements
   - Streaks and progress tracking

### Feature-Specific UI/UX

#### Pronunciation Test Feature

The pronunciation test feature is a key component with specific UI/UX considerations:

- Audio recording controls
- Visualization of pronunciation accuracy
- Reference audio playback at normal and slow speeds
- Color-coded feedback on pronunciation accuracy
- Mobile-optimized controls with fixed-position recording buttons
- Responsive layout for different screen sizes

## Authentication Flow

### Implementation

The authentication system uses a token-based approach with JWT:

1. **Login Process**
   ```
   User -> Login Form -> Auth Service -> API -> JWT Token -> Local Storage -> Authenticated State
   ```

2. **Registration Process**
   ```
   User -> Registration Form -> Validation -> Auth Service -> API -> Success/Error -> Login Flow
   ```

3. **Session Management**
   - Access tokens stored in secure storage
   - Refresh tokens for extending sessions
   - Automatic token refresh mechanism
   - Session timeout handling

### React Native Implementation

For React Native, you'll need to:

1. Replace `localStorage` with `AsyncStorage` or `SecureStore`
2. Implement biometric authentication where appropriate
3. Handle deep linking for authentication redirects
4. Manage app state for authentication status

### Code Structure

```typescript
// Auth Provider Pattern
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (username, password) => {
    // Implementation
  };

  const register = async ({ name, email, username, password }) => {
    // Implementation
  };

  const logout = async () => {
    // Implementation
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

## API Documentation

### Base Configuration

```typescript
// API Client Configuration
const API_BASE_URL = 'https://api.example.com';
const API_TIMEOUT = 30000; // 30 seconds

// Headers
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};
```

### Authentication Endpoints

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/pub/auth/login` | POST | User login | `{ username, password }` | `{ meta: { code, message }, data: { accessToken, refreshToken, user } }` |
| `/pub/auth/register` | POST | User registration | `{ name, email, username, password }` | `{ meta: { code, message }, data: { accessToken, refreshToken, user } }` |
| `/pub/auth/me` | GET | Get current user | - | `{ meta: { code, message }, data: { user } }` |
| `/pub/auth/logout` | POST | User logout | - | `{ meta: { code, message } }` |
| `/pub/auth/refresh` | POST | Refresh token | `{ refreshToken }` | `{ meta: { code, message }, data: { accessToken, refreshToken } }` |

### Quiz Endpoints

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|--------------|----------|
| `/quizzes` | GET | Get all quizzes | Query params: `{ page, limit, search, category }` | `{ meta: { code, message }, data: { items, total, page, limit } }` |
| `/quizzes/:id` | GET | Get quiz by ID | - | `{ meta: { code, message }, data: { quiz } }` |
| `/quizzes/:id/questions` | GET | Get quiz questions | - | `{ meta: { code, message }, data: [questions] }` |
| `/quizzes/:id/attempts` | POST | Start quiz attempt | - | `{ meta: { code, message }, data: { attemptId } }` |
| `/quizzes/:quizId/attempts/:attemptId` | GET | Get attempt details | - | `{ meta: { code, message }, data: { attempt } }` |
| `/quizzes/:quizId/attempts/:attemptId/submit` | POST | Submit answer | `{ questionId, answer }` | `{ meta: { code, message }, data: { isCorrect, score } }` |
| `/quizzes/:quizId/attempts/:attemptId/complete` | POST | Complete attempt | - | `{ meta: { code, message }, data: { result } }` |
| `/quizzes/:quizId/stats` | GET | Get quiz statistics | - | `{ meta: { code, message }, data: { stats } }` |

### Pronunciation Endpoints

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|--------------|----------|
| `/pub/pronunciations/samples` | GET | Get pronunciation sample | Query params: `{ level, customText }` | `{ meta: { code, message }, data: { realTranscript, ipaTranscript, transcriptTranslation } }` |
| `/pub/pronunciations/accuracy` | POST | Analyze pronunciation | `{ text, base64Audio }` | `{ meta: { code, message }, data: { pronunciationAccuracy, isLetterCorrectAllWords, ... } }` |

### Questions Endpoints

| Endpoint | Method | Description | Request Body/Params | Response |
|----------|--------|-------------|--------------|----------|
| `/questions` | GET | Get all questions | Query params: `{ search, category, difficulty, type, page, limit }` | `{ meta: { code, message }, data: { items, total, page, limit } }` |
| `/questions/:id` | GET | Get question by ID | - | `{ meta: { code, message }, data: { question } }` |
| `/questions` | POST | Create question | Question object | `{ meta: { code, message }, data: { question } }` |
| `/questions/:id` | PUT | Update question | Question object | `{ meta: { code, message }, data: { question } }` |
| `/questions/:id` | DELETE | Delete question | - | `{ meta: { code, message } }` |

### API Client Implementation

For React Native, you'll need to implement an API client that:

1. Handles authentication tokens
2. Manages request timeouts
3. Processes API responses consistently
4. Handles network errors and offline states
5. Supports file uploads (especially for audio recordings)

```typescript
// Example API Client for React Native
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = DEFAULT_HEADERS;
  }

  // Get auth headers from secure storage
  private async getAuthHeaders() {
    const token = await SecureStore.getItemAsync('auth_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Generic request method
  async request<T>(endpoint: string, options: RequestInit = {}, requireAuth = false): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      ...this.defaultHeaders,
      ...(requireAuth ? await this.getAuthHeaders() : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Handle network errors
      return {
        meta: {
          code: 500,
          message: error instanceof Error ? error.message : 'Network error',
        },
        data: null,
      };
    }
  }

  // Convenience methods
  async get<T>(endpoint: string, requireAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, requireAuth);
  }

  async post<T>(endpoint: string, data?: any, requireAuth = false): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      requireAuth
    );
  }

  // Methods for handling file uploads (important for audio recordings)
  async uploadAudio<T>(endpoint: string, audioUri: string): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    formData.append('audio', {
      uri: audioUri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any);

    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
      true
    );
  }
}
```

## Component Migration Guide

### Core Components to Migrate

1. **Layout Components**
   - Container
   - Card
   - Grid/Flex layouts
   - Navigation components

2. **Interactive Components**
   - Buttons
   - Form inputs
   - Selectors
   - Modals/Sheets

3. **Feature-Specific Components**
   - Audio recording interface
   - Quiz question renderers
   - Progress indicators
   - Results displays

### Pronunciation Test Component

The pronunciation test is a complex component that requires special attention:

1. **Audio Recording**
   - Replace Web Audio API with React Native's Audio API
   - Implement permissions handling for microphone access
   - Create recording indicators and controls

2. **Audio Playback**
   - Implement audio playback for reference and recorded audio
   - Add speed control for reference audio (normal/slow)
   - Handle loading states during playback

3. **UI Adaptations**
   - Convert glassmorphism effects to React Native equivalents
   - Implement responsive layouts with React Native Flexbox
   - Create custom animations for feedback and transitions

4. **Pronunciation Feedback**
   - Visualize pronunciation accuracy with color-coded text
   - Display IPA transcriptions with proper formatting
   - Show accuracy scores with appropriate visual feedback

### Example Component Migration

```jsx
// Web Component (simplified)
function PronunciationRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  
  return (
    <div className="rounded-lg bg-gray-800/50 p-4 backdrop-blur-sm">
      <Button 
        onClick={startRecording}
        className="bg-gradient-to-r from-red-600 to-red-700"
      >
        <Mic className="h-5 w-5 mr-2" />
        Start Recording
      </Button>
    </div>
  );
}

// React Native Equivalent
function PronunciationRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={startRecording}
        style={styles.button}
      >
        <Icon name="microphone" size={20} color="#fff" style={styles.icon} />
        <Text style={styles.buttonText}>Start Recording</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(31, 41, 55, 0.5)',
    borderRadius: 12,
    padding: 16,
    // For glassmorphism, use a library like react-native-blur
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});
```

## State Management

The web application uses React's Context API for global state management. For React Native:

1. **Authentication State**
   - Use Context API or Redux for global auth state
   - Persist auth tokens in SecureStore
   - Handle app background/foreground transitions

2. **Quiz State**
   - Manage active quiz state
   - Handle offline quiz attempts
   - Sync completed quizzes when online

3. **User Preferences**
   - Store theme preferences
   - Cache user settings
   - Manage notification preferences

## Navigation Structure

For React Native, implement a navigation structure using React Navigation:

```
App
├── Auth Stack
│   ├── Login Screen
│   └── Register Screen
└── Main Tab Navigator
    ├── Home Tab
    │   └── Home Stack
    │       ├── Dashboard
    │       └── Content Detail
    ├── Quiz Tab
    │   └── Quiz Stack
    │       ├── Quiz List
    │       ├── Quiz Detail
    │       ├── Quiz Attempt
    │       └── Quiz Results
    ├── Practice Tab
    │   └── Practice Stack
    │       ├── Practice Options
    │       └── Pronunciation Test
    └── Profile Tab
        └── Profile Stack
            ├── User Profile
            ├── Settings
            └── Progress Stats
```

## Conclusion

This guide provides a comprehensive overview of the educational platform's structure, design system, and API endpoints to facilitate migration to React Native. When implementing the React Native version:

1. Focus on maintaining the core user experience while adapting to mobile patterns
2. Prioritize performance optimizations for mobile devices
3. Implement proper error handling for network conditions
4. Ensure accessibility features are preserved in the mobile version
5. Consider platform-specific capabilities (notifications, deep linking, etc.)

By following this guide, you should be able to create a React Native application that maintains the functionality and aesthetic of the web platform while providing a native mobile experience.