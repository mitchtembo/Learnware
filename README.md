# Learnware Grove

A modern learning and research platform built with React, TypeScript, and Vite, featuring AI-powered research assistance and comprehensive study tools.

## Features

- **Course Management**: Organize and track your courses
- **Note Taking**: Create and manage study notes
- **Research Assistant**: AI-powered research help using Google's Gemini API
- **Study Tools**: Comprehensive study and learning features
- **Smart Search**: Advanced search functionality across your learning materials
- **Modern UI**: Beautiful and responsive interface using Shadcn UI components

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI (Radix UI)
- **State Management**: React Query
- **Routing**: React Router DOM
- **AI Integration**: Google Generative AI (Gemini)
- **Form Handling**: React Hook Form with Zod validation

## Prerequisites

- Node.js (Latest LTS version recommended)
- npm or Bun package manager
- Google Gemini API key (for research features)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/learnware-grove.git
   cd learnware-grove
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```

3. Create a `.env` file in the root directory and add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
├── layouts/       # Page layout components
├── lib/          # Utility libraries and configurations
├── pages/        # Main application pages
├── utils/        # Helper functions and services
└── App.tsx       # Main application component
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Features in Detail

### Research Assistant
- AI-powered research help using Google's Gemini API
- Deep research capabilities
- Literature review tools
- Interactive research sessions

### Course Management
- Course organization and tracking
- Progress monitoring
- Resource management

### Note Taking
- Rich text editing
- Organization tools
- Search functionality

### Study Tools
- Study planning
- Progress tracking
- Learning analytics

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful component library
- [Google Generative AI](https://ai.google.dev/) for the Gemini API
- All other open-source libraries and their contributors
