# Sinuzoid Frontend 🎵

The frontend application for Sinuzoid, built with React, TypeScript, and Vite. This modern web application provides an intuitive interface for music library management, playlist creation, and audio streaming.

## Features

- 🎵 **Music Library Management**: Browse, upload, and organize your music collection
- 📋 **Playlist Management**: Create, edit, and manage custom playlists
- 🎧 **Audio Player**: Built-in audio player with playback controls
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface built with Tailwind CSS

## Technology Stack

- **React 19** - Modern React with the latest features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **React Icons** - Icon library

## Getting Started

### Prerequisites

- Node.js (18+ recommended)
- npm or yarn

### Development Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Configure your API URLs in .env
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Development: http://localhost:5173
   - Production (Docker): http://localhost:3000

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (buttons, modals, etc.)
│   ├── audio/          # Audio player components
│   ├── playlist/       # Playlist-related components
│   └── ...
├── pages/              # Page components
│   ├── Dashboard/      # Main dashboard
│   ├── Library/        # Music library
│   ├── Playlists/      # Playlist management
│   └── ...
├── services/           # API service functions
├── store/              # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
└── contexts/           # React contexts
```

## Key Components

### Audio Player
- Supports multiple audio formats (MP3, FLAC, WAV, M4A)
- Play/pause, seeking, volume control
- Queue management
- Shuffle and repeat modes

### Library Management
- File upload with drag & drop
- Metadata viewing
- Search and filtering

### Playlist System
- Create and edit playlists

## Environment Configuration

The frontend requires the following environment variables:

```env
VITE_API_URL=http://localhost:8000
VITE_AUTH_URL=http://localhost:9000
```

## API Integration

The frontend communicates with:
- **FastAPI Backend** (`VITE_API_URL`) - Music and playlist management
- **Symfony Auth Service** (`VITE_AUTH_URL`) - User authentication

## Styling

The project uses **Tailwind CSS** for styling:
- Utility-first approach
- Responsive design patterns
- Custom color palette for music themes
- Dark/light mode support (if implemented)

## State Management

**Zustand** is used for state management:
- User authentication state
- Music player state
- Library and playlist data
- UI state (modals, loading states)

## Contributing

### Code Style
- Use TypeScript for all new files
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries
- Write descriptive component and function names

### Adding New Features
1. Create components in appropriate directories
2. Update TypeScript types
3. Add necessary API service functions
4. Update state management if needed
5. Test thoroughly

## Docker Deployment

The frontend is containerized and can be built using:

```bash
# Build image
docker build -t sinuzoid-frontend .

# Or use docker-compose
docker compose up frontend
```

## Performance Considerations

- Lazy loading for large music libraries
- Optimized image loading for cover art
- Virtual scrolling for large lists
- Efficient state updates
- Code splitting by routes

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ features
- WebAudio API for advanced audio features

## Troubleshooting

### Common Issues

1. **CORS errors**: Ensure API URLs are correctly configured
2. **Audio playback issues**: Check browser audio permissions
3. **File upload failures**: Verify backend storage configuration
4. **Build errors**: Clear node_modules and reinstall dependencies

### Debug Mode

Set `NODE_ENV=development` for additional console logging and debugging features.
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
