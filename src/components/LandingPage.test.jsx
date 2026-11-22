import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

// jsdom doesn't implement matchMedia; MUI's useMediaQuery needs it.
beforeEach(() => {
  window.matchMedia = window.matchMedia || function (query) {
    return {
      matches: false,
      media: query,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  };
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );

describe('LandingPage mobile nav', () => {
  it('shows a hamburger menu button instead of leaving Features/Pricing inaccessible on mobile', () => {
    renderPage();
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument();
  });

  it('opens a drawer with Features, Pricing, and Get Started when the hamburger is clicked', () => {
    const { container } = renderPage();
    fireEvent.click(screen.getByLabelText(/open menu/i));
    const drawer = container.ownerDocument.querySelector('.MuiDrawer-paper');
    expect(drawer).not.toBeNull();
    expect(within(drawer).getByText('Features')).toBeInTheDocument();
    expect(within(drawer).getByText('Pricing')).toBeInTheDocument();
    expect(within(drawer).getByText('Get Started')).toBeInTheDocument();
  });
});
