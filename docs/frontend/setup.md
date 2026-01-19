# Setup and Development

This guide covers everything you need to get the frontend application up and running.

## Prerequisites

### Required Software

- **Node.js**: Version 18.x or higher
  ```bash
  node --version  # Should be >= 18.0.0
  ```
- **npm**: Version 9.x or higher (comes with Node.js)
  ```bash
  npm --version
  ```

### Optional Tools

- **Git**: For version control
- **VS Code**: Recommended editor with these extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)

## Installation

### Clone the Repository

```bash
git clone https://github.com/webmaxru/copilot_agent_mode.git
cd copilot_agent_mode
```

### Install Dependencies

From the project root:

```bash
# Install all workspace dependencies (recommended)
npm install

# Or install only frontend dependencies
cd frontend
npm install
```

This installs:
- React and React DOM
- React Router
- React Query
- Axios
- Tailwind CSS
- Vite
- TypeScript
- ESLint
- Testing libraries (Vitest, React Testing Library)

## Environment Configuration

### API URL Configuration

The frontend automatically detects the API URL based on the environment:

1. **Runtime Configuration** (Docker/Production):
   - Set `window.RUNTIME_CONFIG.API_URL` in `public/runtime-config.js`

2. **GitHub Codespaces**:
   - Automatically detected and configured
   - Maps to port 3000 on your codespace

3. **Local Development**:
   - Defaults to `http://localhost:3000`
   - Matches protocol of frontend (http/https)

### Custom API URL

To override the API URL for local development:

1. Create `public/runtime-config.js`:
   ```javascript
   window.RUNTIME_CONFIG = {
     API_URL: 'http://your-custom-api:3000'
   };
   ```

2. Include in `index.html`:
   ```html
   <script src="/runtime-config.js"></script>
   ```

### Environment Variables

Vite environment variables can be defined in `.env` files:

```bash
# .env.local (not committed to git)
VITE_API_URL=http://localhost:3000
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Development Server

### Start the Development Server

```bash
cd frontend
npm run dev
```

The server starts on `http://localhost:5137` by default.

**Output:**
```
  VITE v6.2.0  ready in 234 ms

  ➜  Local:   http://localhost:5137/
  ➜  Network: http://192.168.1.100:5137/
  ➜  press h + enter to show help
```

### Development Server Features

- **Hot Module Replacement (HMR)**: Changes reflected instantly
- **Fast Refresh**: Preserves component state during edits
- **Source Maps**: Original TypeScript code in browser devtools
- **Error Overlay**: Build errors displayed in browser

### Running with Backend

To run the full stack locally:

```bash
# Terminal 1: Start the API
cd api
npm run dev

# Terminal 2: Start the frontend
cd frontend
npm run dev
```

Or use the convenience script from project root:

```bash
npm run dev  # Starts both frontend and backend
```

## Build Process

### Development Build

For development with optimizations disabled:

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

This process:
1. **Type checks** with TypeScript compiler (`tsc -b`)
2. **Bundles** code with Vite
3. **Minifies** JavaScript and CSS
4. **Optimizes** assets
5. **Outputs** to `dist/` directory

**Build Output:**
```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [images]
├── index.html
└── vite.svg
```

### Preview Production Build

Test the production build locally:

```bash
npm run preview
```

Serves the `dist/` folder on `http://localhost:4173`

## Linting

### Run ESLint

```bash
npm run lint
```

Checks TypeScript and TSX files for:
- Code quality issues
- TypeScript errors
- React best practices
- Accessibility issues

### ESLint Configuration

Located in `eslint.config.js`:
- TypeScript ESLint rules
- React Hooks rules
- React Refresh rules

### Auto-fix Issues

```bash
npm run lint -- --fix
```

## Code Formatting

### Prettier (Recommended)

While not included by default, Prettier is recommended:

```bash
# Install Prettier
npm install -D prettier

# Create .prettierrc
echo '{ "semi": true, "singleQuote": true }' > .prettierrc

# Format code
npx prettier --write "src/**/*.{ts,tsx,css}"
```

## Testing

### Test Configuration

Testing setup uses:
- **Vitest**: Fast unit test runner (Vite-native)
- **React Testing Library**: Component testing utilities
- **jsdom**: DOM implementation for Node.js
- **@testing-library/jest-dom**: Additional matchers

### Run Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test File Location

Place tests next to the components they test:

```
components/
├── ProductCard.tsx
└── ProductCard.test.tsx
```

Or in a `__tests__` directory:

```
components/
├── ProductCard.tsx
└── __tests__/
    └── ProductCard.test.tsx
```

### Example Test

```typescript
import { render, screen } from '@testing-library/react';
import ProductCard from './ProductCard';

test('renders product name', () => {
  const product = { id: 1, name: 'Test Product', price: 10 };
  render(<ProductCard product={product} />);
  expect(screen.getByText('Test Product')).toBeInTheDocument();
});
```

## Docker Development

### Build Docker Image

```bash
cd frontend
docker build -t octocat-frontend .
```

### Run in Container

```bash
docker run -p 5137:80 octocat-frontend
```

Access at `http://localhost:5137`

### Docker Compose

From project root:

```bash
docker-compose up
```

Starts both frontend and backend services.

## IDE Setup

### VS Code Configuration

Recommended `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

### Recommended Extensions

- **ESLint** (dbaeumer.vscode-eslint)
- **Prettier** (esbenp.prettier-vscode)
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss)
- **TypeScript Vue Plugin** (Vue.volar)
- **Path Intellisense** (christian-kohler.path-intellisense)

## Troubleshooting

### Port Already in Use

If port 5137 is in use:

```bash
# Change port in vite.config.ts
server: {
  port: 3001,  // Use different port
}
```

### API Connection Issues

1. Verify backend is running on port 3000
2. Check browser console for CORS errors
3. Verify API URL in `src/api/config.ts`

```typescript
console.log('API Base URL:', API_BASE_URL);
```

### Module Not Found Errors

Clear node_modules and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

Restart TypeScript server in VS Code:
- Press `Cmd/Ctrl + Shift + P`
- Type "TypeScript: Restart TS Server"
- Press Enter

### Vite Cache Issues

Clear Vite cache:

```bash
rm -rf node_modules/.vite
npm run dev
```

### Build Failures

Check TypeScript errors:

```bash
npx tsc --noEmit
```

### Hot Reload Not Working

1. Check file watchers limit (Linux):
   ```bash
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. Ensure files are in `src/` directory
3. Restart dev server

## Development Workflow

### Typical Development Flow

1. **Start dev server**: `npm run dev`
2. **Make changes**: Edit files in `src/`
3. **View changes**: Browser updates automatically
4. **Check console**: Look for errors/warnings
5. **Run linter**: `npm run lint` before committing
6. **Test changes**: `npm run test`
7. **Commit code**: Git commit with meaningful message

### Before Committing

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Run tests
npm run test

# Build to verify production works
npm run build
```

### Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes

## Performance Tips

### Development Performance

- Use Vite's fast HMR instead of full page reload
- Keep dev tools open for better debugging
- Use React DevTools for component inspection

### Build Performance

- Vite automatically code-splits routes
- Images are optimized during build
- CSS is minified and tree-shaken

## Deployment

See [deployment.md](../../deployment.md) for production deployment instructions.

### Quick Deploy to Vercel

```bash
npm install -g vercel
cd frontend
vercel
```

### Quick Deploy to Netlify

```bash
npm install -g netlify-cli
cd frontend
netlify deploy --prod --dir=dist
```

## Next Steps

- Review [Architecture](./architecture.md) to understand app structure
- Check [Component Documentation](./components.md) for component details
- Read [Styling Guidelines](./styling.md) for Tailwind conventions
- Learn about [API Integration](./api-integration.md) patterns
