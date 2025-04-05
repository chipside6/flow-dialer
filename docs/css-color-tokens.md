
# CSS Color Tokens

This document outlines our color system and token usage to maintain consistency throughout the application.

## Primary Color System

Our application uses a blue-based color palette with these primary values:

```css
:root {
  --primary: 199 89% 48%; /* Sky blue primary color */
  --primary-foreground: 0 0% 98%;
  
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  
  --accent: 199 89% 96%; /* Light sky blue accent */
  --accent-foreground: 199 89% 28%;
  
  --destructive: 0 84.2% 60.2%; /* Red for errors/delete actions */
  --destructive-foreground: 0 0% 98%;
  
  --ring: 199 89% 48%; /* Matches primary for focus rings */
}
```

## Semantic Color Tokens

### Feedback Colors

```css
/* Success states */
.success-bg { background-color: hsl(142 76% 36%); } /* Green */
.success-text { color: hsl(142 76% 36%); }

/* Warning states */
.warning-bg { background-color: hsl(38 92% 50%); } /* Amber */
.warning-text { color: hsl(38 92% 50%); }

/* Error states */
.error-bg { background-color: hsl(0 84% 60%); } /* Red */
.error-text { color: hsl(0 84% 60%); }

/* Info states */
.info-bg { background-color: hsl(199 89% 48%); } /* Blue */
.info-text { color: hsl(199 89% 48%); }
```

## Background and Foreground Colors

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
}

/* Dark mode versions */
.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  
  /* Additional dark mode variables */
}
```

## Button Variants

Our buttons follow these color patterns:

```css
/* Primary button */
.bg-primary { background-color: hsl(var(--primary)); }
.text-primary-foreground { color: hsl(var(--primary-foreground)); }
.hover\:bg-primary\/90:hover { background-color: hsl(var(--primary) / 0.9); }

/* Secondary button */
.bg-secondary { background-color: hsl(var(--secondary)); }
.text-secondary-foreground { color: hsl(var(--secondary-foreground)); }
.hover\:bg-secondary\/80:hover { background-color: hsl(var(--secondary) / 0.8); }

/* Success button (custom) */
.bg-green-600 { background-color: hsl(142 76% 36%); }
.hover\:bg-green-700:hover { background-color: hsl(142 76% 30%); }

/* Orange button (custom) */
.bg-\[\#ff6c2c\] { background-color: #ff6c2c; }
.hover\:bg-\[\#e95d1e\]:hover { background-color: #e95d1e; }

/* Sky blue button (custom) */
.bg-sky-500 { background-color: hsl(199 89% 48%); }
.hover\:bg-sky-600:hover { background-color: hsl(199 89% 42%); }
```

## Color Usage Guidelines

### When to Use Each Color

- **Primary**: Main actions, prominent UI elements, primary CTAs
- **Secondary**: Alternative actions, secondary buttons, less prominent UI elements
- **Accent**: Highlights, selected states, focused elements
- **Destructive**: Delete actions, errors, warnings that require attention
- **Success**: Confirmation messages, completed actions
- **Warning**: Alerts that need attention but aren't critical

### Accessibility Considerations

All color combinations should maintain a minimum contrast ratio of:
- 4.5:1 for normal text (WCAG AA)
- 3:1 for large text (WCAG AA)
- 7:1 for normal text (WCAG AAA)

### Dark Mode Adjustments

Colors are adjusted in dark mode to maintain proper contrast and reduce eye strain:

```css
.dark {
  --primary: 199 89% 48%; /* Same hue but adjusted for dark mode */
  --primary-foreground: 0 0% 98%;
  
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  
  --accent: 199 89% 28%; /* Darker accent for dark mode */
  --accent-foreground: 0 0% 98%;
  
  /* Additional dark mode adjustments */
}
```

## Implementation Examples

### Component Examples

```jsx
// Primary button
<Button variant="default">Primary Action</Button>

// Secondary button
<Button variant="secondary">Secondary Action</Button>

// Destructive button
<Button variant="destructive">Delete</Button>

// Success button
<Button variant="success">Confirm</Button>

// Custom skyblue button
<Button variant="skyblue">Connect</Button>
```

### CSS Custom Property Usage

```css
/* Using the color tokens in custom CSS */
.custom-element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border: 1px solid hsl(var(--border));
}

.custom-element:hover {
  background-color: hsl(var(--primary) / 0.9);
}
```

## Color Management

All colors should be defined using the HSL format in the root CSS variables. 
This allows for easy modification of lightness and saturation without changing the hue.

When adding new colors, prefer to extend existing tokens rather than creating new arbitrary colors.
