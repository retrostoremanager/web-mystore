# MyStore - Complete Store Management Solution

A modern React web application built with Material UI for video game and TCG store owners to efficiently manage all aspects of their store in one place.

## Features

- **Modern Landing Page**: Beautiful, responsive design with hero section, features showcase, and call-to-action
- **Material UI**: Built with Material-UI v5 for a polished, professional look
- **Responsive Design**: Fully responsive layout that works on all devices
- **React 18**: Built with the latest React features

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
│   │   └── LandingPage.jsx    # Main landing page component
│   ├── App.jsx                 # Root app component with theme
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html                  # HTML template
├── package.json                # Dependencies and scripts
└── vite.config.js              # Vite configuration
```

## Technologies Used

- **React 18**: UI library
- **Material UI v5**: Component library and theming
- **Vite**: Build tool and dev server
- **Emotion**: CSS-in-JS styling (required by Material UI)

## Next Steps

The landing page is complete. Future development can include:
- User authentication
- Dashboard components
- Inventory management features
- Point of sale system
- Analytics and reporting
- Customer management