# Frontend Documentation

Welcome to the OctoCAT Supply Chain Management frontend documentation. This guide provides comprehensive information about the React-based frontend application.

## Table of Contents

1. [Architecture Overview](./architecture.md) - Component structure, state management, routing, and API integration patterns
2. [Setup and Development](./setup.md) - Prerequisites, environment configuration, and development workflow
3. [Component Documentation](./components.md) - Detailed documentation of key components, props, and usage examples
4. [Styling Guidelines](./styling.md) - Tailwind CSS conventions, theme system, and responsive design approach
5. [API Integration](./api-integration.md) - API client configuration, error handling, and authentication flow
6. [Testing](./testing.md) - Testing strategy, tools, and example patterns
7. [Code Organization](./code-organization.md) - Folder structure, naming conventions, and best practices

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Technology Stack

- **React 18+** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client

## Key Features

- 🎨 Dark/Light theme support with Context API
- 🔐 Authentication system with role-based access
- 📱 Fully responsive design
- 🚀 Fast development with Vite HMR
- 🎯 Type-safe with TypeScript
- ♿ Accessibility-focused components

## Project Overview

The frontend is a single-page application (SPA) that provides a modern user interface for the OctoCAT Supply Chain Management System. It communicates with the backend REST API to manage products, orders, suppliers, and other supply chain entities.

For overall system architecture, refer to the [main architecture documentation](../architecture.md).

## Getting Help

- Check the detailed documentation pages for specific topics
- Review component examples in the codebase
- See [troubleshooting section in setup.md](./setup.md#troubleshooting)

## Contributing

When adding new features or components:
1. Follow the established [code organization](./code-organization.md) patterns
2. Adhere to the [styling guidelines](./styling.md)
3. Update relevant documentation
4. Add appropriate tests (see [testing guide](./testing.md))
