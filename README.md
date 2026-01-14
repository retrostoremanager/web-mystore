# MyStore - Complete Store Management Solution

A modern React web application built with Material UI for video game and TCG store owners to efficiently manage all aspects of their store in one place.

## Features

- **Modern Landing Page**: Beautiful, responsive design with hero section, features showcase, and call-to-action
- **Account Registration**: Comprehensive sign-up form with email verification, password validation, and subscription tier selection
- **Material UI**: Built with Material-UI v5 for a polished, professional look
- **Responsive Design**: Fully responsive layout that works on all devices
- **React 18**: Built with the latest React features
- **Form Validation**: Client-side validation with real-time feedback and error messages

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
web-mystore/
├── src/
│   ├── components/
│   │   ├── LandingPage.jsx    # Main landing page component
│   │   └── SignUpForm.jsx     # Account registration form component
│   ├── test/
│   │   └── setup.js           # Test configuration and setup
│   ├── App.jsx                 # Root app component with theme and routing
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
└── vite.config.js              # Vite configuration with Vitest setup
```

## Technologies Used

- **React 18**: UI library
- **Material UI v5**: Component library and theming
- **Vite**: Build tool and dev server
- **Vitest**: Testing framework
- **React Testing Library**: Component testing utilities
- **Emotion**: CSS-in-JS styling (required by Material UI)
- **React Router**: Client-side routing

## Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test -- --watch
```

Run tests with UI:

```bash
npm run test:ui
```

## Components

### SignUpForm

A comprehensive account registration form component located at `src/components/SignUpForm.jsx`.

**Features:**
- Email and password fields with validation
- Password visibility toggles
- Company name collection
- Subscription tier selection (Basic, Pro, Enterprise)
- Real-time form validation with field-level error messages
- Loading states during submission
- Responsive design for mobile and desktop
- WCAG 2.1 AA accessibility compliance

**Validation Rules:**
- Email: Required, must be valid email format (RFC 5322 compliant)
- Password: Required, minimum 8 characters, must contain uppercase, lowercase, and number
- Confirm Password: Required, must match password
- Company Name: Required, minimum 2 characters
- Subscription Tier: Required selection

**Usage:**
The component is automatically routed at `/signup` in the application. It handles form submission and will integrate with the backend API once available.

## Next Steps

Completed features:
- ✅ Landing page with hero section and features
- ✅ Account registration form with validation
- ✅ Responsive design and Material UI integration
- ✅ Comprehensive test suite

Future development can include:
- Backend API integration for account registration
- Email verification flow
- User authentication and login
- Dashboard components
- Inventory management features
- Point of sale system
- Analytics and reporting
- Customer management