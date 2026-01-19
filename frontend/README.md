# OctoCAT Supply Chain Management - Frontend

Modern React-based frontend for the OctoCAT Supply Chain Management System.

## Overview

A single-page application (SPA) built with React, TypeScript, Vite, and Tailwind CSS that provides an intuitive interface for managing supply chain operations including products, orders, suppliers, and more.

## Key Features

- 🎨 **Dark/Light Theme** - User-switchable theme with localStorage persistence
- 🔐 **Authentication** - Role-based access control (admin/regular users)
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- ⚡ **Fast Development** - Vite HMR for instant feedback
- 🎯 **Type-Safe** - Full TypeScript coverage
- 🌐 **API Integration** - RESTful API communication with React Query
- ♿ **Accessible** - ARIA labels and keyboard navigation support

## Tech Stack

- **React 18+** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client

## Quick Start

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5137
```

### Build for Production

```bash
npm run build
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── api/              # API configuration and endpoints
├── components/       # React components
│   ├── admin/       # Admin-specific components
│   ├── entity/      # Domain entity components
│   └── ...          # Layout and page components
├── context/         # React Context providers (Auth, Theme)
├── assets/          # Images and static assets
├── App.tsx          # Root component with routing
└── main.tsx         # Application entry point
```

## Documentation

Comprehensive documentation is available in the `docs/frontend/` directory:

- **[Overview & Getting Started](../docs/frontend/README.md)** - Introduction and quick start
- **[Architecture](../docs/frontend/architecture.md)** - Component structure, state management, routing patterns
- **[Setup & Development](../docs/frontend/setup.md)** - Prerequisites, environment setup, development workflow
- **[Component Documentation](../docs/frontend/components.md)** - Detailed component API and usage examples
- **[Styling Guidelines](../docs/frontend/styling.md)** - Tailwind CSS conventions and theme system
- **[API Integration](../docs/frontend/api-integration.md)** - API client, error handling, authentication
- **[Testing](../docs/frontend/testing.md)** - Testing strategy, tools, and examples
- **[Code Organization](../docs/frontend/code-organization.md)** - Folder structure and best practices

## Available Routes

- `/` - Welcome/landing page
- `/about` - About page
- `/products` - Product catalog
- `/login` - User login
- `/admin/products` - Admin product management (requires admin access)

## Environment Configuration

The application automatically detects the API URL:

1. **Runtime Config** - `window.RUNTIME_CONFIG.API_URL` (Docker/production)
2. **GitHub Codespaces** - Auto-detected and configured
3. **Local Development** - Defaults to `http://localhost:3000`

See [Setup Documentation](../docs/frontend/setup.md#environment-configuration) for details.

## Development Scripts

```bash
npm run dev      # Start dev server (http://localhost:5137)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Contributing

When adding new features:

1. Follow [Code Organization](../docs/frontend/code-organization.md) patterns
2. Adhere to [Styling Guidelines](../docs/frontend/styling.md)
3. Add tests (see [Testing Guide](../docs/frontend/testing.md))
4. Update relevant documentation

## Architecture

This frontend communicates with a REST API backend. See the [main architecture documentation](../docs/architecture.md) for system-wide design and [frontend architecture](../docs/frontend/architecture.md) for detailed frontend patterns.

## Support

- Check the [documentation](../docs/frontend/README.md)
- Review [setup troubleshooting](../docs/frontend/setup.md#troubleshooting)
- See component examples in the codebase

## License

Part of the OctoCAT Supply Chain Management System.
