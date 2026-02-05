# OctoCAT Supply Chain - Frontend

A modern React application for supply chain management, built with TypeScript, Vite, and Tailwind CSS.

## 🚀 Quick Start

### Development

```bash
# Install dependencies (from root)
npm install

# Start development server
npm run dev --workspace=frontend

# Or from frontend directory
cd frontend
npm run dev
```

The application will be available at `http://localhost:5137`

### Building

```bash
# Build for production
npm run build --workspace=frontend

# Preview production build
npm run preview --workspace=frontend
```

### Linting

```bash
# Run ESLint
npm run lint --workspace=frontend
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/              # API configuration and endpoints
│   ├── components/       # React components
│   │   ├── admin/       # Admin-specific components
│   │   ├── entity/      # Entity components (products, etc.)
│   │   └── ...          # Shared components
│   ├── context/         # React context providers (Auth, Theme)
│   ├── assets/          # Static assets
│   └── main.tsx         # Application entry point
├── public/              # Static public assets
├── index.html           # HTML entry point
└── vite.config.ts       # Vite configuration
```

## 🛠️ Technology Stack

- **React 18+** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool with HMR
- **Tailwind CSS** - Utility-first styling
- **React Router v7** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client

## ✨ Key Features

- 🎨 **Dark Mode** - System-wide theme toggle with persistence
- 📱 **Responsive Design** - Mobile-first approach with Tailwind
- 🔐 **Authentication** - Simple auth flow with role-based access
- 🛒 **Product Catalog** - Searchable product listings
- 🚀 **Fast Development** - Vite HMR for instant feedback
- 🐳 **Docker Ready** - Containerized deployment support

## 🏗️ Architecture

### State Management
- **React Query** for server state and data fetching
- **Context API** for global UI state (auth, theme)
- Local component state for UI interactions

### Routing
```
/                    → Home page (Welcome)
/about               → About page
/products            → Product catalog
/login               → Login page
/admin/products      → Admin product management
```

### API Integration
Smart API URL detection with support for:
- Runtime configuration
- GitHub Codespaces auto-detection
- Local development

## 📚 Documentation

For comprehensive documentation, see:

**[Complete Frontend Documentation](../docs/frontend.md)** - Detailed architecture, patterns, and guidelines

Topics covered:
- Detailed component documentation
- State management patterns
- API integration strategies
- Styling guidelines
- Performance optimization
- Testing strategies
- Security considerations
- Troubleshooting guide

## 🧪 Testing

The project uses:
- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing
- **jsdom** - DOM environment for tests

```bash
# Run tests (when implemented)
npm test --workspace=frontend
```

## 🐳 Docker

Build and run with Docker:

```bash
# Build image
docker build -t octocat-frontend ./frontend

# Run container
docker run -p 8080:80 octocat-frontend
```

## 🤝 Contributing

When contributing to the frontend:

1. Follow TypeScript best practices (avoid `any`)
2. Use Tailwind utilities for styling
3. Write tests for new features
4. Maintain responsive design
5. Test dark mode compatibility
6. Run linter before committing

See [Frontend Instructions](../.github/instructions/frontend.instructions.md) for code review guidelines.

## 🔧 Common Tasks

### Adding a New Page

1. Create component in `src/components/`
2. Add route in `App.tsx`
3. Update navigation in `Navigation.tsx`
4. Add TypeScript types as needed

### Adding API Endpoint

1. Add endpoint to `src/api/config.ts`
2. Create fetch function with types
3. Use with React Query in component

### Styling Components

- Use Tailwind utilities first
- Check theme context for dark mode
- Maintain responsive breakpoints
- Follow existing component patterns

## 📖 Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query v3](https://tanstack.com/query/v3/) (Project uses v3.39.3)
- [React Router](https://reactrouter.com/)

---

*For the API, see the API source code in the [api directory](../api/) and the [API Swagger documentation](../api/api-swagger.json)*
