# Frontend Architecture and Documentation

## Overview

The OctoCAT Supply Chain frontend is a modern React application built with TypeScript, featuring a responsive UI powered by Tailwind CSS and built with Vite for optimal development experience and performance.

## Technology Stack

- **React 18+** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with full type coverage
- **Vite** - Fast build tool with Hot Module Replacement (HMR)
- **Tailwind CSS** - Utility-first CSS framework for responsive design
- **React Router v7** - Client-side routing with data router patterns
- **React Query v3** - Server state management and data fetching
- **Axios** - HTTP client for API communication
- **React Slick** - Carousel component for product displays

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API configuration and endpoints
│   │   └── config.ts          # Base URL detection and API endpoints
│   ├── components/            # React components
│   │   ├── admin/            # Admin-specific components
│   │   │   └── AdminProducts.tsx
│   │   ├── entity/           # Entity-specific components
│   │   │   └── product/      # Product-related components
│   │   │       ├── Products.tsx
│   │   │       └── ProductForm.tsx
│   │   ├── About.tsx         # About page component
│   │   ├── Footer.tsx        # Site footer
│   │   ├── Login.tsx         # Login page component
│   │   ├── Navigation.tsx    # Main navigation bar
│   │   └── Welcome.tsx       # Home/landing page
│   ├── context/              # React context providers
│   │   ├── AuthContext.tsx   # Authentication state management
│   │   ├── ThemeContext.tsx  # Theme (dark/light mode) management
│   │   ├── themeContextUtils.tsx # Theme context utilities
│   │   └── useTheme.tsx      # Theme custom hook
│   ├── assets/               # Static assets (images, icons)
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   ├── index.css             # Global styles and Tailwind imports
│   └── vite-env.d.ts         # Vite environment type definitions
├── public/                    # Static public assets
├── index.html                 # HTML entry point
├── vite.config.ts            # Vite configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts

```

## Key Features

### 1. Responsive Design
- Mobile-first approach with Tailwind CSS
- Breakpoints for mobile (≤640px), tablet (~768px), and desktop (≥1024px)
- Adaptive layouts and components

### 2. Dark Mode Support
- System-wide theme toggle
- Persistent theme preference via localStorage
- Smooth transitions between light and dark modes

### 3. State Management
- **React Query** for server state (product data, API calls)
- **Context API** for global UI state (authentication, theme)
- Local component state for UI interactions

### 4. Routing Structure

```
/                    → Welcome page (home)
/about               → About page
/products            → Product catalog
/login               → Login page
/admin/products      → Admin product management (protected)
```

## Core Components

### Navigation (`Navigation.tsx`)
- Responsive navigation bar with mobile hamburger menu
- Dynamic links based on authentication state
- Theme toggle button
- Highlights active route

### Welcome (`Welcome.tsx`)
- Hero section with AI-generated banner
- Product carousel using React Slick
- Call-to-action buttons
- Responsive image display

### Products (`Products.tsx`)
- Product catalog with search functionality
- Real-time filtering by name and description
- Product detail modal
- Quantity selection and add-to-cart (placeholder)
- React Query for data fetching with loading and error states

### Login (`Login.tsx`)
- Email and password form
- Simple authentication flow (demo implementation)
- Admin access based on email domain (@github.com)

### AdminProducts (`AdminProducts.tsx`)
- Administrative interface for product management
- Create, edit, and delete products
- Protected route requiring admin authentication

## State Management

### Authentication Context (`AuthContext.tsx`)

Provides authentication state and methods throughout the application:

```typescript
interface AuthContextType {
  isLoggedIn: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

**Usage:**
```typescript
const { isLoggedIn, isAdmin, login, logout } = useAuth();
```

**Features:**
- Session state management
- Role-based access control (admin detection)
- Simple email/password authentication (demo)
- Admin access for @github.com domain emails

### Theme Context (`ThemeContext.tsx`)

Manages application-wide theme preferences:

```typescript
interface ThemeContextType {
  darkMode: boolean;
  toggleTheme: () => void;
}
```

**Usage:**
```typescript
const { darkMode, toggleTheme } = useTheme();
```

**Features:**
- Dark/light mode toggle
- Persistent preferences via localStorage
- CSS class management on document root
- Smooth color transitions

## API Integration

### Configuration (`api/config.ts`)

Smart API URL detection with multiple strategies:

1. **Runtime Configuration** - Checks `window.RUNTIME_CONFIG.API_URL`
2. **GitHub Codespaces Detection** - Auto-detects Codespace URLs and maps to API port
3. **Localhost Fallback** - Defaults to `http://localhost:3000`

**Endpoints:**
```typescript
{
  products: '/api/products',
  suppliers: '/api/suppliers',
  orders: '/api/orders',
  branches: '/api/branches',
  headquarters: '/api/headquarters',
  deliveries: '/api/deliveries',
  orderDetails: '/api/order-details',
  orderDetailDeliveries: '/api/order-detail-deliveries'
}
```

### Data Fetching Pattern

Using React Query for optimal data management:

```typescript
const { data, isLoading, error } = useQuery('queryKey', fetchFunction);
```

**Benefits:**
- Automatic caching and refetching
- Loading and error state management
- Background updates
- Request deduplication

## Styling Approach

### Tailwind CSS
- Utility-first CSS framework
- Responsive design with mobile-first breakpoints
- Custom color palette for brand consistency
- Dark mode support via class strategy

### Style Guidelines
- Prefer Tailwind utilities over custom CSS
- Extract repeated patterns into reusable components
- Use semantic color names from Tailwind palette
- Maintain consistent spacing scale

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start development server (port 5137)
npm run dev --workspace=frontend

# From root directory
npm run dev
```

### Building for Production

```bash
# Build TypeScript and bundle
npm run build --workspace=frontend

# Preview production build
npm run preview --workspace=frontend
```

### Linting

```bash
# Run ESLint
npm run lint --workspace=frontend
```

## Configuration Files

### Vite (`vite.config.ts`)
- React plugin for JSX transformation
- Development server on port 5137
- Host binding for containerization
- Environment variable injection for Codespaces

### TypeScript (`tsconfig.json`)
- Strict type checking enabled
- Modern ES2020 target
- Path aliases for clean imports
- Separate configs for app and build tools

### Tailwind (`tailwind.config.js`)
- Content paths for JIT compilation
- Custom theme extensions
- Dark mode class strategy
- Plugin configurations

## Performance Considerations

### Code Splitting
- Route-based lazy loading (where applicable)
- Dynamic imports for large dependencies
- Optimized bundle sizes

### Optimization Tips
- Use `memo` for expensive re-renders on large lists
- Implement virtualization for lists > 200 items
- Minimize bundle size - avoid unnecessary dependencies
- Leverage React Query's caching to reduce API calls

## Accessibility

### Current Implementation
- Semantic HTML elements
- Keyboard navigation support
- Focus management for modals
- ARIA labels where needed

### Recommendations
- Regular accessibility audits
- Test with screen readers
- Maintain proper heading hierarchy
- Ensure sufficient color contrast

## Testing Strategy

### Current Setup
- **Testing Library**: React Testing Library installed
- **Test Runner**: Vitest configured
- **DOM Environment**: jsdom for component testing

### Testing Guidelines
- Unit tests for complex component logic
- Integration tests for user flows (form submission, navigation)
- Query hooks for data fetching logic
- Snapshot tests for stable presentational components (use sparingly)

## Security Considerations

### Current Implementation
- No direct HTML interpolation (prevents XSS)
- Type-safe API communication
- Environment-based configuration

### Best Practices
- Never interpolate untrusted user input into HTML
- Validate and sanitize all user inputs
- Use HTTPS in production
- Implement proper CORS policies
- Keep dependencies updated

## Docker Support

The frontend includes Docker configuration for containerized deployment:

### Dockerfile
- Multi-stage build for optimized image size
- Nginx for serving static files
- Environment-based runtime configuration

### nginx.conf
- SPA routing fallback to index.html
- Proper MIME types
- Compression enabled

## Environment Variables

### Development
- `CODESPACE_NAME` - Auto-detected for GitHub Codespaces

### Runtime
- `RUNTIME_CONFIG.API_URL` - Injected at runtime for Docker deployments

## Common Patterns

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

// 2. Type definitions
interface ComponentProps {
  // props
}

// 3. Component function
export default function Component({ props }: ComponentProps) {
  // 4. Hooks
  const { darkMode } = useTheme();
  const [state, setState] = useState();

  // 5. Event handlers
  const handleClick = () => {
    // handler logic
  };

  // 6. Render
  return (
    <div className={darkMode ? 'dark-class' : 'light-class'}>
      {/* JSX */}
    </div>
  );
}
```

### API Call Pattern
```typescript
// Define interface
interface EntityType {
  id: number;
  name: string;
}

// Create fetch function
const fetchEntities = async (): Promise<EntityType[]> => {
  const { data } = await axios.get(`${api.baseURL}${api.endpoints.entities}`);
  return data;
};

// Use in component
const { data, isLoading, error } = useQuery('entities', fetchEntities);
```

## Future Enhancements

### Planned Features
- Shopping cart implementation
- Order history and tracking
- User profile management
- Product reviews and ratings
- Advanced search and filtering

### Technical Improvements
- Implement E2E tests with Playwright
- Add comprehensive unit test coverage
- Optimize bundle size further
- Implement service worker for offline support
- Add performance monitoring

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 5137
lsof -ti:5137 | xargs kill -9
```

**API Connection Issues**
- Check API is running on port 3000
- Verify API_BASE_URL in browser console
- Check CORS configuration in API

**Build Failures**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf frontend/node_modules/.vite`

**Type Errors**
- Ensure TypeScript version matches across monorepo
- Run type check: `npm run build --workspace=frontend` (runs `tsc -b`)

## Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Query](https://tanstack.com/query/v3/docs/react/overview)
- [React Router](https://reactrouter.com/en/main)

### Internal Documentation
- [Architecture Overview](./architecture.md)
- [SQLite Integration](./sqlite-integration.md)
- [Demo Script](./demo-script.md)

## Contributing

When making frontend changes:
1. Follow existing code patterns and conventions
2. Maintain type safety (avoid `any`)
3. Write tests for new features
4. Update documentation for significant changes
5. Test responsive design at all breakpoints
6. Verify dark mode compatibility
7. Run linter before committing: `npm run lint --workspace=frontend`

---

*This documentation reflects the current state of the frontend application. For code review guidelines specific to frontend changes, see `.github/instructions/frontend.instructions.md`.*
