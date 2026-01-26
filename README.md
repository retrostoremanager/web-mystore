# MyStore - Complete Store Management Solution

A modern React web application built with Material UI for video game and TCG store owners to efficiently manage all aspects of their store in one place.

## Deployment Status

✅ **Deployed to Azure** - This application is currently deployed and running on Azure App Service.

## Features

- **Modern Landing Page**: Beautiful, responsive design with hero section, features showcase, and call-to-action
- **Account Registration**: Comprehensive sign-up form with email verification, password validation, and subscription tier selection
- **Inventory Management**: Full CRUD operations for game inventory
- **Customer Management**: Track and manage customer information
- **Employee Management**: Manage store employees and access
- **Sales Tracking**: Record and view sales history
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

2. Set up environment variables:
Create a `.env` file in the root directory with the following:
```
VITE_API_URL=https://your-function-app.azurewebsites.net
```

For local development, you can point to your local Function App or the dev environment.

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

Before building, ensure the `VITE_API_URL` environment variable is set:

```bash
# Windows PowerShell
$env:VITE_API_URL="https://your-function-app.azurewebsites.net"
npm run build

# Linux/Mac
VITE_API_URL=https://your-function-app.azurewebsites.net npm run build
```

The built files will be in the `dist` directory.

**Note**: The `VITE_API_URL` environment variable is required at build time. If not set, the build will fail with an error.

### Preview Production Build

```bash
npm run preview
```

## Deployment

The application is currently deployed to Azure App Service. To deploy updates:

1. Build the production bundle (see above)
2. Deploy the `dist` folder contents to Azure App Service using:
   - Azure CLI: `az webapp up`
   - Visual Studio Code Azure extension
   - FTP/FTPS upload
   - Azure DevOps (if configured later)

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

## Completed Features

- ✅ Landing page with hero section and features
- ✅ Account registration with validation
- ✅ Inventory management (CRUD operations, search, bulk import)
- ✅ Customer management
- ✅ Employee management
- ✅ Sales tracking and history
- ✅ Point of sale / checkout system
- ✅ Trade-in processing
- ✅ Responsive design and Material UI integration
- ✅ Backend API integration

## Future Enhancements

- [ ] Email verification flow
- [ ] User authentication and login
- [ ] Analytics and reporting dashboard
- [ ] Advanced search and filtering
- [ ] Inventory alerts and notifications
- [ ] Multi-location support
- [ ] Receipt printing
- [ ] Barcode scanning integration