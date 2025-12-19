# Agent Guidelines: React Application with Material UI

## Critical First Step: Check for Existing Code

**BEFORE implementing any new functionality, you MUST:**
1. Search the codebase for existing components that handle similar functionality
2. Check `src/components/` for reusable component patterns
3. Review `src/contexts/` for existing context providers
4. Look for existing service files in `src/services/`
5. Check `src/App.jsx` for existing routing patterns
6. Review existing Material UI component usage and theming
7. Look for existing utility functions, hooks, or helpers
8. **DO NOT reinvent the wheel** - reuse existing components, contexts, and patterns

## Architecture Patterns

### Project Structure
- **src/components/**: React components (one file per component)
- **src/contexts/**: React Context providers for state management
- **src/services/**: API service functions
- **src/App.jsx**: Main application component with routing
- **src/main.jsx**: Application entry point
- **src/index.css**: Global styles

### Component Organization
- One component per file
- Use PascalCase for component file names
- Export default for main component
- Keep components focused and single-purpose

## Coding Standards

### Component Structure

```jsx
import { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useInventory } from '../contexts/InventoryContext';

const ComponentName = () => {
  const navigate = useNavigate();
  const { inventory, setInventory } = useInventory();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Side effects
  }, []);

  const handleAction = async () => {
    // Event handlers
  };

  return (
    <Box sx={{ /* styles */ }}>
      {/* Component JSX */}
    </Box>
  );
};

export default ComponentName;
```

### Material UI Usage

#### Theme Configuration
- Use `ThemeProvider` and `createTheme` from `@mui/material/styles`
- Define theme in `App.jsx` or separate theme file
- Use theme colors consistently: `primary`, `secondary`, `success`, `error`, `warning`, `info`
- Customize typography, spacing, and other theme properties

#### Component Imports
- Import Material UI components from `@mui/material`
- Import icons from `@mui/icons-material`
- Use named imports, not default imports
- Group imports: Material UI → Icons → React Router → Local imports

#### Styling with sx Prop
- Use `sx` prop for component-specific styles
- Use theme values: `theme.palette.primary.main`, `theme.spacing(2)`
- Use responsive breakpoints: `xs`, `sm`, `md`, `lg`, `xl`
- Prefer `sx` over `styled` components for consistency

#### Common Material UI Components
- **Layout**: `Box`, `Container`, `Grid`, `Stack`, `Paper`
- **Navigation**: `AppBar`, `Toolbar`, `Drawer`, `Tabs`
- **Forms**: `TextField`, `Button`, `Select`, `Checkbox`, `Radio`, `Switch`
- **Feedback**: `Alert`, `Snackbar`, `Dialog`, `CircularProgress`, `LinearProgress`
- **Data Display**: `Card`, `Table`, `List`, `Chip`, `Avatar`, `Typography`
- **Icons**: Use Material Icons from `@mui/icons-material`

### Routing

#### React Router
- Use `BrowserRouter` in `App.jsx`
- Define routes with `Routes` and `Route` components
- Use `useNavigate` hook for programmatic navigation
- Use `useParams` for route parameters
- Use `useLocation` if needed for location data

#### Route Structure
- Use nested routes for related pages (e.g., `/dashboard/inventory`, `/dashboard/inventory/:id`)
- Keep route paths consistent and RESTful
- Use route parameters for dynamic segments (e.g., `:id`)

### State Management

#### Context API
- Use React Context for shared state (e.g., inventory, user)
- Create context providers in `src/contexts/`
- Use custom hooks (e.g., `useInventory`) for context consumption
- Keep context focused and avoid over-using contexts

#### Local State
- Use `useState` for component-specific state
- Use `useReducer` for complex state logic
- Initialize state with appropriate default values

#### Server State
- Use `useEffect` for data fetching
- Manage loading and error states
- Use service functions from `src/services/` for API calls

### API Integration

#### Service Functions
- Create service functions in `src/services/` directory
- Use async/await for asynchronous operations
- Handle errors appropriately
- Return consistent data structures

#### Error Handling
- Use try-catch blocks for error handling
- Display user-friendly error messages
- Use Material UI `Alert` or `Snackbar` for error notifications
- Log errors for debugging

#### Loading States
- Show loading indicators during async operations
- Use `CircularProgress` or `LinearProgress` from Material UI
- Disable buttons/forms during loading to prevent duplicate submissions

### Forms

#### Form Handling
- Use controlled components for form inputs
- Validate inputs before submission
- Show validation errors clearly
- Use Material UI `TextField` with `error` and `helperText` props

#### Form Submission
- Prevent default form submission behavior
- Show loading state during submission
- Handle success and error cases
- Navigate or update UI on success

### Component Patterns

#### Page Components
- Use `Container` for page-level layout
- Include `AppBar` for navigation when needed
- Use `Grid` or `Stack` for layout
- Keep page components focused on layout and orchestration

#### Card Components
- Use `Card` with `CardContent` for content sections
- Use `CardActionArea` for clickable cards
- Add hover effects with `sx` prop transitions
- Use elevation for visual hierarchy

#### List Components
- Use Material UI `List`, `ListItem`, `ListItemText` for lists
- Add icons with `ListItemIcon`
- Use `ListItemButton` for clickable items
- Consider virtualization for long lists

### Responsive Design

#### Breakpoints
- Use Material UI breakpoints: `xs`, `sm`, `md`, `lg`, `xl`
- Design mobile-first, then enhance for larger screens
- Use `Grid` component with responsive props
- Hide/show content with `display` property

#### Responsive Patterns
```jsx
<Grid container spacing={3}>
  <Grid item xs={12} sm={6} md={4}>
    {/* Responsive grid item */}
  </Grid>
</Grid>
```

### Accessibility

- Use semantic HTML elements
- Provide proper ARIA labels when needed
- Ensure keyboard navigation works
- Maintain proper color contrast
- Use Material UI components which have built-in accessibility

### Performance

#### Optimization
- Use `React.memo` for expensive components
- Use `useMemo` for expensive calculations
- Use `useCallback` for event handlers passed to children
- Lazy load routes with `React.lazy` and `Suspense`

#### Code Splitting
- Use route-based code splitting
- Lazy load heavy components
- Show loading states during code splitting

## Best Practices

### Component Design
1. **Single Responsibility**: Each component should have one clear purpose
2. **Reusability**: Extract reusable components and patterns
3. **Composition**: Compose components from smaller pieces
4. **Props**: Use clear, descriptive prop names
5. **Default Props**: Provide sensible defaults when appropriate

### Code Organization
1. **File Structure**: Keep related files together
2. **Imports**: Organize imports logically (external → internal)
3. **Naming**: Use clear, descriptive names
4. **Comments**: Comment complex logic, not obvious code

### Material UI Best Practices
1. **Theme Consistency**: Use theme values instead of hardcoded colors
2. **Component Selection**: Choose appropriate Material UI components
3. **Customization**: Customize theme rather than overriding component styles
4. **Icons**: Use Material Icons consistently
5. **Spacing**: Use theme spacing units

### State Management
1. **Context for Shared State**: Use Context for truly shared state
2. **Local State for UI**: Use local state for UI-specific state
3. **Avoid Prop Drilling**: Use Context or state management for deep props
4. **State Updates**: Use functional updates when state depends on previous state

### Error Handling
1. **User-Friendly Messages**: Show clear, actionable error messages
2. **Error Boundaries**: Use ErrorBoundary component for error catching
3. **Loading States**: Always show loading states for async operations
4. **Validation**: Validate inputs before API calls

## Common Patterns to Reuse

Before implementing new functionality, check for:
- Existing page components with similar layouts
- Existing form components with similar patterns
- Existing API service functions
- Existing context providers
- Existing routing patterns
- Existing Material UI component usage
- Existing error handling patterns
- Existing loading state patterns

## Example: Adding a New Page Component

1. **Check existing pages**: Review similar page components
2. **Create Component**: Create new component file in `src/components/`
3. **Add Route**: Add route to `App.jsx`
4. **Use Material UI**: Use appropriate Material UI components
5. **Add Navigation**: Add navigation links if needed
6. **Handle State**: Use Context or local state as appropriate
7. **API Integration**: Use service functions for data fetching
8. **Error Handling**: Add error handling and loading states
9. **Test**: Verify component works correctly

## Example: Adding a New Context

1. **Check existing contexts**: Review similar context patterns
2. **Create Context File**: Create context file in `src/contexts/`
3. **Create Provider**: Create context provider component
4. **Create Hook**: Create custom hook for consuming context
5. **Add to App**: Wrap app with provider in `App.jsx`
6. **Use in Components**: Use custom hook in components

## Example: Adding a New Service Function

1. **Check existing services**: Review similar service functions
2. **Add Function**: Add function to appropriate service file
3. **Error Handling**: Include proper error handling
4. **Return Type**: Return consistent data structure
5. **Use in Components**: Call from components with proper error handling

## Material UI Component Cheat Sheet

### Layout
- `Box`: Generic container, use for styling and layout
- `Container`: Page-level container with max-width
- `Grid`: Responsive grid layout
- `Stack`: Flexbox container for vertical/horizontal stacking
- `Paper`: Elevated container with shadow

### Navigation
- `AppBar`: Top navigation bar
- `Toolbar`: Container for AppBar content
- `Button`: Clickable button
- `IconButton`: Button with icon only

### Forms
- `TextField`: Text input with label and validation
- `Select`: Dropdown selection
- `Checkbox`: Checkbox input
- `Radio`: Radio button
- `Switch`: Toggle switch

### Feedback
- `Alert`: Alert message
- `Snackbar`: Toast notification
- `Dialog`: Modal dialog
- `CircularProgress`: Loading spinner
- `LinearProgress`: Loading bar

### Data Display
- `Card`: Content card
- `CardContent`: Card content area
- `CardActionArea`: Clickable card area
- `Typography`: Text with theme typography
- `Chip`: Small labeled element
- `Avatar`: User avatar

