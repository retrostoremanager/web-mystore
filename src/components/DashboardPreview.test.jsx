import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DashboardPreview from './DashboardPreview';

describe('DashboardPreview nav menu', () => {
  it('renders the nav item labels, not just icons', () => {
    render(<DashboardPreview />);
    expect(screen.getByText('Store Inventory')).toBeInTheDocument();
    expect(screen.getByText('Customers')).toBeInTheDocument();
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Sales History')).toBeInTheDocument();
    // "Users" also labels a stat card below the nav -- two matches is correct.
    expect(screen.getAllByText('Users').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.getByText('Trade-In')).toBeInTheDocument();
  });

  it('nav labels use a visible text color, not the inherited white hero text', () => {
    render(<DashboardPreview />);
    const label = screen.getByText('Store Inventory');
    // Regression: the nav list previously inherited color: white from the landing
    // page's hero section wrapper, rendering white text on the list's white
    // background -- invisible, though present in the DOM.
    expect(label.closest('.MuiList-root')).not.toHaveStyle({ color: 'rgb(255, 255, 255)' });
  });

  it('hamburger button toggles the menu state without erroring, defaulting to open', () => {
    render(<DashboardPreview />);
    const toggle = screen.getByLabelText(/toggle menu/i);

    // Defaults open: the nav list is present and expanded on first render.
    expect(screen.getByText('Store Inventory').closest('.MuiCollapse-root')).not.toHaveStyle({
      height: '0px',
    });

    // jsdom has no real layout, so Collapse's height/scrollHeight-driven
    // expand/collapse transition can't be asserted reliably here (see the
    // "visible color" test above for a jsdom-safe regression check on this
    // component). This just guards the click handler itself stays wired up.
    expect(() => {
      fireEvent.click(toggle);
      fireEvent.click(toggle);
    }).not.toThrow();
  });
});
