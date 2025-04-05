
# CSS Refactoring Guide

This document provides a step-by-step approach for refactoring CSS files to improve maintainability, performance, and organization.

## When to Refactor

Consider refactoring CSS files when:

1. Files exceed 200 lines of code
2. Multiple concerns are mixed in a single file
3. Similar styles are duplicated across files
4. Media queries are inconsistently applied
5. Specificity conflicts are frequent

## Refactoring Workflow

### 1. Analysis Phase

Before refactoring, analyze the current structure:

1. **Identify logical groups** within large files:
   - UI component styles
   - Layout styles
   - State-specific styles
   - Media query blocks

2. **Identify patterns and duplications**:
   - Similar selectors across multiple files
   - Repeated media query patterns
   - Overspecific selectors

3. **Map dependencies**:
   - Which components rely on these styles
   - Potential cascade effects of changes

### 2. Planning Phase

Plan your refactoring approach:

1. **Define new file structure**:
   ```
   /styles
   ├── component-name/
   │   ├── component-base.css
   │   ├── component-variants.css
   │   └── component-responsive.css
   └── component-name.css (imports the above)
   ```

2. **Determine modularization strategy**:
   - By functionality (buttons, forms, cards)
   - By screen size (mobile, tablet, desktop)
   - By feature area (dashboard, profile, auth)

3. **Create a refactoring checklist**:
   - Files to create
   - Styles to move
   - Import statements to update
   - Tests to run

### 3. Implementation Phase

Follow these steps for implementation:

1. **Create new module files** first:
   ```css
   /* mobile-button-base.css */
   @media screen and (max-width: 768px) {
     /* Base button styles */
     button, .button {
       /* Styles here */
     }
   }
   ```

2. **Move related styles** to appropriate modules:
   - Keep media queries intact when moving
   - Maintain selector specificity
   - Preserve important comments

3. **Update the main file** to import new modules:
   ```css
   /* mobile-buttons.css */
   @import './mobile-button-base.css';
   @import './mobile-button-variants.css';
   @import './mobile-button-menu.css';
   /* etc */
   ```

4. **Clean up unused styles** and duplications

### 4. Testing Phase

Thoroughly test after refactoring:

1. **Visual regression testing**:
   - Compare before/after screenshots
   - Check all viewport sizes
   - Test with different themes/modes

2. **Browser compatibility testing**:
   - Test across supported browsers
   - Verify mobile functionality

3. **Performance testing**:
   - Check CSS load time
   - Verify no new render-blocking issues

## Example Refactoring: Large File to Modules

### Before: Large Single File

```css
/* mobile-buttons.css - 200+ lines */
@media screen and (max-width: 768px) {
  /* Base button styles */
  button, .button {
    /* styles */
  }
  
  /* Menu button styles */
  .mobile-menu-button {
    /* styles */
  }
  
  /* Button variants */
  button[variant="success"] {
    /* styles */
  }
  
  /* Button containers */
  .button-container {
    /* styles */
  }
}

/* Desktop fixes */
@media screen and (min-width: 769px) {
  /* Desktop-specific fixes */
}
```

### After: Modular Files

```css
/* mobile-button-base.css */
@media screen and (max-width: 768px) {
  /* Base button styles */
  button, .button {
    /* styles */
  }
}

/* mobile-button-menu.css */
@media screen and (max-width: 768px) {
  /* Menu button styles */
  .mobile-menu-button {
    /* styles */
  }
}

/* mobile-button-variants.css */
@media screen and (max-width: 768px) {
  /* Button variants */
  button[variant="success"] {
    /* styles */
  }
}

/* mobile-button-containers.css */
@media screen and (max-width: 768px) {
  /* Button containers */
  .button-container {
    /* styles */
  }
}

/* desktop-button-fixes.css */
@media screen and (min-width: 769px) {
  /* Desktop-specific fixes */
}

/* mobile-buttons.css - Main file now just imports */
@import './mobile-button-base.css';
@import './mobile-button-variants.css';
@import './mobile-button-menu.css';
@import './mobile-button-containers.css';
@import './desktop-button-fixes.css';
```

## Best Practices for CSS Refactoring

1. **One change at a time**:
   - Refactor structure first, then optimize selectors
   - Don't combine refactoring with functionality changes

2. **Preserve selector specificity**:
   - Keep the same selectors when moving to modules
   - Address specificity issues in a separate pass

3. **Document as you go**:
   - Add comments explaining the purpose of each module
   - Note any complex interactions between files

4. **Version control strategy**:
   - Make frequent, atomic commits
   - Use descriptive commit messages
   - Create a separate branch for large refactorings

5. **Follow file size guidelines**:
   - Aim for files under 100-200 lines
   - Split larger files into logical modules

## Common Refactoring Patterns

### Converting Global Styles to Component Modules

```css
/* Before: global.css */
.card { /* styles */ }
.card-header { /* styles */ }
.card-content { /* styles */ }

/* After: components/card.css */
.card { /* styles */ }
.card-header { /* styles */ }
.card-content { /* styles */ }
```

### Separating Media Queries

```css
/* Before: mixed media queries */
.element { /* base styles */ }
@media (max-width: 768px) {
  .element { /* mobile styles */ }
}

/* After: separate base and responsive files */
/* element-base.css */
.element { /* base styles */ }

/* element-responsive.css */
@media (max-width: 768px) {
  .element { /* mobile styles */ }
}
```

### Consolidating Duplicate Patterns

```css
/* Before: duplicated patterns */
.button-1 { 
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
}
.button-2 { 
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
  background: blue;
}

/* After: shared base with variants */
.button {
  padding: 10px;
  border-radius: 4px;
  font-weight: bold;
}
.button-primary {
  background: blue;
}
```

## Measuring Success

After refactoring, evaluate success based on:

1. **Reduced file sizes**: Each file should be smaller and more focused
2. **Improved organization**: Clear separation of concerns
3. **Reduced duplication**: Less repeated code across files
4. **Maintainability**: Easier to find and modify specific styles
5. **Performance**: No regression in loading or rendering times
6. **Visual consistency**: No changes to the actual UI appearance
