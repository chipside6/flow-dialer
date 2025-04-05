
# CSS Style Guide

This document outlines our CSS organization strategy and naming conventions to maintain consistency as we continue to refactor and improve the codebase.

## Table of Contents

1. [File Structure](#file-structure)
2. [CSS Organization](#css-organization)
3. [Naming Conventions](#naming-conventions)
4. [Media Queries](#media-queries)
5. [Component Styling](#component-styling)
6. [Responsive Design](#responsive-design)
7. [Z-Index Management](#z-index-management)
8. [Best Practices](#best-practices)

## File Structure

Our CSS is organized into modular files that follow a logical structure:

```
src/styles/
├── base-styles.css         # Tailwind imports and CSS variables
├── base.css                # Base reset styles
├── index.css               # Main CSS entry point
├── dashboard.css           # Dashboard specific styles
├── mobile.css              # Mobile specific styles
├── responsive-layout.css   # Responsive layout styles
├── typography.css          # Typography styles
├── utilities.css           # Utility classes
├── desktop-layout.css      # Desktop-specific layout fixes
├── mobile-buttons/         # Mobile button styles
│   ├── mobile-button-base.css
│   ├── mobile-button-variants.css
│   └── ...
├── mobile-navigation/      # Mobile navigation styles
│   ├── mobile-nav-base.css
│   ├── mobile-nav-menu.css
│   └── ...
└── ...
```

### Module Approach

We use a modular approach to CSS organization, breaking down large files into smaller, focused modules:

- **Component-specific styles**: Styles for specific UI components
- **Feature-specific styles**: Styles for specific feature areas
- **Global styles**: Base styles, typography, and utilities
- **Responsive styles**: Media queries for different screen sizes

## CSS Organization

### Import Hierarchy

Our CSS follows a specific import hierarchy to ensure proper cascading:

1. Base styles and resets
2. Typography
3. Layout components
4. UI components
5. Feature-specific styles
6. Utilities
7. Media queries

Example in `index.css`:

```css
/* Import base styles and utilities */
@import './styles/base-styles.css';
@import './styles/base.css';
@import './styles/utilities.css';
@import './styles/typography.css';
/* More specific features */
@import './styles/dropdown-styles.css';
@import './styles/responsive.css';
/* Fixes and overrides */
@import './styles/radix-fixes.css';
```

### Modular Pattern

Large CSS files are split into smaller, focused modules following this pattern:

```css
/* Main file: mobile-buttons.css */
@import './mobile-button-base.css';
@import './mobile-button-variants.css';
@import './mobile-button-menu.css';
@import './mobile-button-containers.css';
@import './desktop-button-fixes.css';
```

## Naming Conventions

### Class Naming

We use a hybrid approach combining descriptive functional class names with contextual modifiers:

- **Component-based**: `.card`, `.button`, `.navbar`
- **Functional**: `.primary-button`, `.form-actions`
- **State-based**: `.active`, `.disabled`, `.expanded`
- **Layout-based**: `.container-fluid`, `.flex-center`

### Media Query Breakpoints

Standard breakpoints used consistently across the project:

- **Mobile**: `max-width: 480px`
- **Tablet/Mobile**: `max-width: 768px`
- **Desktop**: `min-width: 769px`
- **Large Desktop**: `min-width: 1200px`

### Z-Index Scale

Z-index values follow a predefined scale to avoid conflicts:

- **1-10**: Base elements
- **20-30**: Dropdown menus, tooltips
- **40-50**: Headers, fixed elements
- **60-70**: Modals, sidebars
- **80-90**: Notifications
- **100+**: Critical overlays, error messages

## Media Queries

We follow a mobile-first approach, with specific overrides for larger screens when needed:

```css
/* Mobile styling (default) */
.button {
  width: 100%;
  padding: 12px;
}

/* Tablet and desktop styling */
@media screen and (min-width: 769px) {
  .button {
    width: auto;
    padding: 8px 16px;
  }
}
```

### Organization

Media queries are organized in two ways:

1. **Component-specific**: Within component CSS files for simple cases
2. **Breakpoint-specific**: In screen-size specific files (e.g., `mobile-nav-base.css`)

## Component Styling

### Shadcn Components

For Shadcn UI components, we follow these guidelines:

1. **Use variants**: Extend components using the variant system
2. **Avoid direct overwrites**: Use composition over direct style overrides
3. **Consistent props**: Maintain consistent prop usage across similar components

Example approach:

```typescript
// Button variants
const buttonVariants = cva(
  "inline-flex items-center justify-center...",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground...",
        destructive: "bg-destructive text-destructive-foreground...",
        success: "bg-green-600 text-white hover:bg-green-700...",
        // Custom variants
        skyblue: "bg-sky-500 text-white hover:bg-sky-600", 
      },
      // More variants...
    }
  }
)
```

### Custom Components

For custom components, follow these guidelines:

1. Use Tailwind classes for styling
2. Group related styles logically
3. Use CSS modules for component-specific styles when needed
4. Follow established naming patterns

## Responsive Design

We ensure our application is fully responsive by following these principles:

1. **Mobile-first approach**: Design for mobile first, then enhance for larger screens
2. **Flexible layouts**: Use percentage-based widths and Flexbox/Grid
3. **Responsive typography**: Scale text sizes appropriately
4. **Touch-friendly targets**: Minimum 44px touch targets on mobile
5. **Consistent spacing**: Scale spacing units based on viewport size

### Implementation Pattern

```css
/* Default (mobile) styling */
.card {
  padding: 16px;
  margin-bottom: 16px;
}

/* Tablet/desktop enhancements */
@media screen and (min-width: 769px) {
  .card {
    padding: 24px;
    margin-bottom: 24px;
  }
}
```

## Z-Index Management

To maintain proper layering, we follow these guidelines:

1. **Named z-index variables**: Use descriptive class names like `.z-header`, `.z-content`
2. **Organized layers**: Group related elements at similar z-index ranges
3. **Documentation**: Comment on z-index usage for complex cases

Example:

```css
/* dashboard-z-index.css */
.z-header {
  z-index: 50;
}

.z-content {
  z-index: 10;
}

.z-overlay {
  z-index: 40;
}
```

## Best Practices

### CSS Performance

1. **Avoid deeply nested selectors**: Keep selectors simple and specific
2. **Minimize selector complexity**: Use class selectors over complex attribute selectors
3. **Reduce specificity conflicts**: Follow consistent naming patterns
4. **Optimize paint performance**: Be mindful of properties that trigger repaints

### Maintainability

1. **Comment complex code**: Add comments explaining the purpose of complex styles
2. **Keep files small**: Aim for files under 200 lines by splitting into modules
3. **Use consistent indentation**: 2-space indentation for all CSS files
4. **Order properties consistently**: Group related properties (positioning, display, dimensions, etc.)

### Browser Support

Our application supports:

- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- iOS 14+ and Android 10+
- IE11 is not supported

### Accessibility

1. **Sufficient color contrast**: WCAG AA compliance (4.5:1 for normal text)
2. **Focus styles**: Visible focus indicators for keyboard navigation
3. **Responsive text**: Minimum text size of 16px on mobile
4. **Reduced motion**: Support for users with motion sensitivity

## Refactoring Guidelines

When refactoring CSS files:

1. **Identify logical groups**: Look for styles that serve a common purpose
2. **Create focused modules**: Split files by functionality or component
3. **Maintain existing selectors**: Avoid changing class names unless necessary
4. **Test thoroughly**: Verify all styling is preserved after refactoring
5. **Update import paths**: Ensure all module imports are updated correctly

### Example Refactoring Flow

1. Identify a large CSS file that needs refactoring
2. Analyze the file to identify logical sections
3. Create new module files for each section
4. Move styles to appropriate modules
5. Update the original file to import the new modules
6. Test to ensure all styling is preserved
