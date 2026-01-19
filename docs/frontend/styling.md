# Styling Guidelines

This guide covers the styling conventions, Tailwind CSS usage, theme system, and responsive design approach in the OctoCAT Supply frontend.

## Table of Contents

- [Tailwind CSS Overview](#tailwind-css-overview)
- [Theme System](#theme-system)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing and Layout](#spacing-and-layout)
- [Responsive Design](#responsive-design)
- [Component Styling Patterns](#component-styling-patterns)
- [Transitions and Animations](#transitions-and-animations)
- [Best Practices](#best-practices)

---

## Tailwind CSS Overview

The application uses Tailwind CSS, a utility-first CSS framework. Styles are applied using utility classes directly in JSX/TSX.

### Configuration

**Location:** `tailwind.config.js`

**Content Sources:**
```javascript
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
]
```

### Key Benefits

- **No CSS file bloat** - Only used utilities are included in production
- **Consistent design** - Predefined scale for spacing, colors, etc.
- **Responsive by default** - Easy breakpoint-based styling
- **Dark mode support** - Built-in with class strategy

---

## Theme System

### Dark Mode Implementation

The app uses Tailwind's class-based dark mode strategy:

**Configuration:**
```javascript
// tailwind.config.js
darkMode: 'class'
```

**How It Works:**

1. ThemeContext manages `darkMode` state (boolean)
2. Theme preference saved to `localStorage`
3. `'dark'` or `'light'` class applied to `<html>` element
4. Components use conditional classes based on theme

**Example:**

```typescript
const { darkMode } = useTheme();

<div className={darkMode ? 'bg-dark text-light' : 'bg-white text-gray-800'}>
  Content
</div>
```

**Alternative Syntax:**

Use Tailwind's `dark:` variant for inline conditional styling:

```typescript
<div className="bg-white dark:bg-dark text-gray-800 dark:text-light">
  Content
</div>
```

### When to Use Each Approach

**Conditional Classes** (Recommended for this project):
```typescript
className={darkMode ? 'bg-dark' : 'bg-white'}
```
- More explicit control
- Easier to read complex conditions
- Consistent with existing codebase

**Dark Variant** (Alternative):
```typescript
className="bg-white dark:bg-dark"
```
- More concise
- Leverages Tailwind's built-in dark mode
- Good for simple color swaps

---

## Color Palette

### Custom Colors

**Location:** `tailwind.config.js` → `theme.extend.colors`

```javascript
colors: {
  'primary': '#76B852',     // Green - Primary brand color
  'dark': '#0A0A0A',        // Very dark gray - Dark mode background
  'light': '#F5F5F5',       // Off-white - Light mode background/text
  'accent': '#8BC34A',      // Light green - Accent/hover states
  'gray': {                 // Extended gray scale
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
}
```

### Color Usage Guidelines

**Primary (`primary`):**
- Buttons, CTAs
- Links hover states
- Brand elements
- Active navigation items

**Accent (`accent`):**
- Hover states for primary buttons
- Secondary CTAs
- Highlights

**Dark (`dark`):**
- Dark mode backgrounds
- Dark mode containers

**Light (`light`):**
- Dark mode text
- Light mode backgrounds (as alternative to white)

**Gray Scale:**
- Borders: `gray-200` (light), `gray-700` (dark)
- Text: `gray-600` to `gray-800` (light mode), `gray-300` to `gray-400` (dark mode)
- Backgrounds: `gray-100` (light mode), `gray-800` (dark mode)

### Color Accessibility

- Ensure sufficient contrast ratios (WCAG AA: 4.5:1 for text)
- Primary green on white: ✅ Passes
- Light text on dark: ✅ Passes
- Test combinations with tools like [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Typography

### Font Family

Uses system font stack (default Tailwind):
- San Francisco (macOS)
- Segoe UI (Windows)
- Roboto (Android)
- Fallback to sans-serif

### Font Sizes

Use Tailwind's text size utilities:

```typescript
<h1 className="text-3xl">       {/* 30px */}
<h2 className="text-2xl">       {/* 24px */}
<h3 className="text-xl">        {/* 20px */}
<p className="text-base">       {/* 16px - default */}
<small className="text-sm">     {/* 14px */}
<span className="text-xs">      {/* 12px */}
```

### Font Weights

```typescript
<span className="font-normal">    {/* 400 */}
<span className="font-medium">    {/* 500 */}
<span className="font-semibold">  {/* 600 */}
<span className="font-bold">      {/* 700 */}
```

### Typography Patterns

**Page Headings:**
```typescript
<h1 className={`text-3xl font-bold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
  Page Title
</h1>
```

**Section Headings:**
```typescript
<h2 className={`text-2xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'}`}>
  Section Title
</h2>
```

**Body Text:**
```typescript
<p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
  Body content goes here.
</p>
```

**Labels:**
```typescript
<label className={`block ${darkMode ? 'text-light' : 'text-gray-700'} mb-1`}>
  Field Label
</label>
```

---

## Spacing and Layout

### Spacing Scale

Tailwind uses a consistent spacing scale (0.25rem = 4px increments):

```typescript
p-1   // padding: 0.25rem (4px)
p-2   // padding: 0.5rem (8px)
p-4   // padding: 1rem (16px)
p-6   // padding: 1.5rem (24px)
p-8   // padding: 2rem (32px)
p-12  // padding: 3rem (48px)
```

### Common Layout Patterns

**Page Container:**
```typescript
<div className="max-w-7xl mx-auto px-4">
  {/* Content */}
</div>
```

**Card/Container:**
```typescript
<div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
  {/* Card content */}
</div>
```

**Full Height Page:**
```typescript
<div className="min-h-screen pt-20 pb-16">
  {/* Account for fixed nav (pt-20) and footer */}
</div>
```

**Flex Container:**
```typescript
<div className="flex items-center justify-between">
  <div>Left content</div>
  <div>Right content</div>
</div>
```

**Grid Layout:**
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Grid items */}
</div>
```

---

## Responsive Design

### Breakpoints

Tailwind default breakpoints used in this project:

| Prefix | Min Width | Description |
|--------|-----------|-------------|
| `sm:` | 640px | Small devices (landscape phones) |
| `md:` | 768px | Medium devices (tablets) |
| `lg:` | 1024px | Large devices (laptops) |
| `xl:` | 1280px | Extra large devices (desktops) |
| `2xl:` | 1536px | 2X large devices (large desktops) |

### Mobile-First Approach

Base styles apply to mobile, then override for larger screens:

```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
  {/* 1 col on mobile, 2 on sm, 3 on md, 4 on lg+ */}
</div>
```

### Responsive Patterns

**Show/Hide Elements:**
```typescript
<div className="hidden md:block">
  Desktop only
</div>

<div className="block md:hidden">
  Mobile only
</div>
```

**Responsive Text Size:**
```typescript
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

**Responsive Spacing:**
```typescript
<div className="p-4 md:p-6 lg:p-8">
  Content with responsive padding
</div>
```

**Responsive Flex Direction:**
```typescript
<div className="flex flex-col md:flex-row">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Product Grid Example

```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</div>
```

Results in:
- Mobile: 1 column
- Small (≥640px): 2 columns
- Medium (≥768px): 3 columns
- Large (≥1024px): 4 columns

---

## Component Styling Patterns

### Button Styles

**Primary Button:**
```typescript
<button className="px-4 py-2 bg-primary text-white rounded hover:bg-accent transition-colors duration-300">
  Primary Action
</button>
```

**Secondary Button:**
```typescript
<button className={`px-4 py-2 ${darkMode ? 'bg-gray-600' : 'bg-gray-300'} ${darkMode ? 'text-white' : 'text-gray-800'} rounded hover:${darkMode ? 'bg-gray-500' : 'bg-gray-400'} transition-colors duration-300`}>
  Secondary Action
</button>
```

**Danger Button:**
```typescript
<button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
  Delete
</button>
```

**Disabled Button:**
```typescript
<button 
  className={`px-4 py-2 rounded ${
    disabled 
      ? `${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'} cursor-not-allowed`
      : 'bg-primary hover:bg-accent text-white'
  }`}
  disabled={disabled}
>
  Action
</button>
```

### Input Styles

**Text Input:**
```typescript
<input
  type="text"
  className={`w-full px-4 py-2 ${darkMode ? 'bg-gray-700 text-light border-gray-600' : 'bg-white text-gray-800 border-gray-300'} rounded-lg border focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-colors duration-300`}
  placeholder="Enter text..."
/>
```

**Textarea:**
```typescript
<textarea
  className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 text-light' : 'bg-gray-100 text-gray-800'} rounded transition-colors duration-300`}
  rows={4}
/>
```

**Select:**
```typescript
<select
  className={`w-full px-3 py-2 ${darkMode ? 'bg-gray-700 text-light' : 'bg-gray-100 text-gray-800'} rounded transition-colors duration-300`}
>
  <option value="">Select...</option>
</select>
```

### Card Styles

**Basic Card:**
```typescript
<div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
  <h3 className={`text-xl font-semibold ${darkMode ? 'text-light' : 'text-gray-800'} mb-4`}>
    Card Title
  </h3>
  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
    Card content
  </p>
</div>
```

**Hover Card:**
```typescript
<div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(118,184,82,0.3)]`}>
  {/* Card content */}
</div>
```

### Modal Styles

```typescript
{/* Overlay */}
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
  {/* Modal */}
  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl`}>
    {/* Modal content */}
  </div>
</div>
```

### Table Styles

```typescript
<table className={`min-w-full ${darkMode ? 'bg-dark' : 'bg-white'} rounded-lg overflow-hidden`}>
  <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
    <tr>
      <th className={`px-6 py-3 text-left text-xs font-medium ${darkMode ? 'text-light' : 'text-gray-700'} uppercase tracking-wider`}>
        Column
      </th>
    </tr>
  </thead>
  <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
    <tr className={`hover:${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <td className={`px-6 py-4 ${darkMode ? 'text-light' : 'text-gray-800'}`}>
        Data
      </td>
    </tr>
  </tbody>
</table>
```

---

## Transitions and Animations

### Transition Duration

Standard transition: **300ms**

```typescript
className="transition-colors duration-300"
```

### Common Transitions

**Color Transitions:**
```typescript
className="transition-colors duration-300"
```

**All Properties:**
```typescript
className="transition-all duration-300"
```

**Transform + Shadow:**
```typescript
className="transform transition-all duration-300 hover:scale-105"
```

### Loading Spinner

```typescript
<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
```

### Hover Effects

**Scale:**
```typescript
className="transform hover:scale-105 transition-transform duration-300"
```

**Glow:**
```typescript
className="hover:shadow-[0_0_25px_rgba(118,184,82,0.3)] transition-shadow duration-300"
```

**Color Change:**
```typescript
className="text-gray-700 hover:text-primary transition-colors duration-300"
```

---

## Best Practices

### 1. Consistency

- Use the defined color palette consistently
- Stick to standard spacing scale (4, 8, 12, 16, 24, 32, 48px)
- Maintain consistent border radius (usually `rounded` or `rounded-lg`)
- Use consistent shadow levels

### 2. Theme Awareness

Always make components theme-aware:

```typescript
const { darkMode } = useTheme();

<div className={darkMode ? 'bg-dark text-light' : 'bg-white text-gray-800'}>
```

### 3. Transitions

Add smooth transitions for better UX:

```typescript
className="transition-colors duration-300"
```

### 4. Responsive Design

Test at common breakpoints:
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

### 5. Accessibility

- Maintain color contrast ratios
- Don't rely solely on color to convey information
- Use semantic HTML with Tailwind classes
- Test keyboard navigation

### 6. Performance

- Tailwind purges unused CSS in production
- Avoid inline styles; use Tailwind utilities
- Use `@apply` directive sparingly (prefer utilities in JSX)

### 7. Avoid Magic Numbers

Use Tailwind's scale, not arbitrary values:

❌ Bad:
```typescript
className="p-[23px] text-[17px]"
```

✅ Good:
```typescript
className="p-6 text-lg"
```

### 8. Group Related Classes

Order classes logically:

```typescript
className="
  flex items-center justify-between   // Layout
  px-4 py-2 mb-4                      // Spacing
  bg-primary text-white               // Colors
  rounded-lg shadow-md                // Appearance
  hover:bg-accent                     // Interactions
  transition-colors duration-300      // Animations
"
```

### 9. Component Class Reusability

For frequently repeated class combinations, consider extracting:

```typescript
const cardClasses = `
  ${darkMode ? 'bg-gray-800' : 'bg-white'}
  rounded-lg shadow-lg p-6
  transition-colors duration-300
`;

<div className={cardClasses}>
  {/* Content */}
</div>
```

### 10. Custom Tailwind Extensions

Only add to `tailwind.config.js` when truly needed:
- New colors that are project-wide
- Custom spacing values (e.g., `width: 7/8` for specific layout needs)
- Custom breakpoints (avoid; use defaults)

---

## Common Pitfalls

### ❌ Hardcoded Colors

Don't use arbitrary color values:
```typescript
className="bg-[#76B852]"  // Bad
```

Use named colors:
```typescript
className="bg-primary"     // Good
```

### ❌ Forgetting Dark Mode

```typescript
<div className="bg-white text-gray-800">  // Missing dark mode
```

Always consider theme:
```typescript
<div className={darkMode ? 'bg-dark text-light' : 'bg-white text-gray-800'}>
```

### ❌ Inconsistent Spacing

```typescript
<div className="mt-5 mb-7 ml-3">  // Inconsistent
```

Use standard scale:
```typescript
<div className="m-4">              // Consistent
```

### ❌ Responsive Class Order

```typescript
className="lg:flex-row md:flex-col flex-col-reverse"  // Wrong order
```

Correct order (mobile-first):
```typescript
className="flex-col-reverse md:flex-col lg:flex-row"
```

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [Tailwind Play (Interactive)](https://play.tailwindcss.com/)
- [Tailwind UI Components](https://tailwindui.com/)

---

## Quick Reference

### Most Common Classes

```typescript
// Layout
flex flex-col items-center justify-between
grid grid-cols-4 gap-6

// Spacing
p-4 px-6 py-2 m-4 space-y-4

// Typography
text-xl font-bold text-gray-800 dark:text-light

// Colors
bg-primary text-white border-gray-300

// Effects
rounded-lg shadow-lg hover:shadow-xl
transition-colors duration-300

// Responsive
hidden md:block
grid-cols-1 md:grid-cols-2 lg:grid-cols-4
```
