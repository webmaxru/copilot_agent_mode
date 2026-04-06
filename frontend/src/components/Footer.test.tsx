import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider } from '../context/ThemeContext';
import Footer from './Footer';

// Wrap component with required providers
function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('Footer', () => {
  it('should render the copyright notice', () => {
    renderWithProviders(<Footer />);

    expect(
      screen.getByText(/Copyright © 2025 OctoCAT Supply\. All Rights Reserved/),
    ).toBeInTheDocument();
  });

  it('should render About section', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByText('About')).toBeInTheDocument();
    expect(
      screen.getByText(/OctoCAT Supply is the leading provider/),
    ).toBeInTheDocument();
  });

  it('should render Account section with links', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('My Cart')).toBeInTheDocument();
    expect(screen.getByText('Checkout')).toBeInTheDocument();
    expect(screen.getByText('Order')).toBeInTheDocument();
  });

  it('should render Helpful Links section', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByText('Helpful Links')).toBeInTheDocument();
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
  });

  it('should render Social Media section', () => {
    renderWithProviders(<Footer />);

    expect(screen.getByText('Social Media')).toBeInTheDocument();
    expect(screen.getByText('Twitter')).toBeInTheDocument();
    expect(screen.getByText('Facebook')).toBeInTheDocument();
    expect(screen.getByText('Instagram')).toBeInTheDocument();
  });

  it('should render footer element', () => {
    const { container } = renderWithProviders(<Footer />);

    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});
