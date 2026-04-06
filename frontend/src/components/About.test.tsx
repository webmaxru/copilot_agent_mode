import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeProvider } from '../context/ThemeContext';
import About from './About';

function renderWithProviders(ui: React.ReactElement) {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
}

describe('About', () => {
  it('should render the page title', () => {
    renderWithProviders(<About />);

    expect(screen.getByText('About OctoCAT Supply')).toBeInTheDocument();
  });

  it('should render the mission section', () => {
    renderWithProviders(<About />);

    expect(screen.getByText('Our Meow-ssion')).toBeInTheDocument();
  });

  it('should render the purpose section', () => {
    renderWithProviders(<About />);

    expect(screen.getByText('Our Purr-pose')).toBeInTheDocument();
  });

  it('should render key features section', () => {
    renderWithProviders(<About />);

    expect(screen.getByText('Key Features of Our Products')).toBeInTheDocument();
    expect(
      screen.getByText('AI-powered behavior analysis and personalization'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Real-time health monitoring and wellness alerts'),
    ).toBeInTheDocument();
  });

  it('should render the founder quote', () => {
    renderWithProviders(<About />);

    expect(screen.getByText(/Felix Whiskerton, Founder/)).toBeInTheDocument();
  });

  it('should render a feature list with 6 items', () => {
    renderWithProviders(<About />);

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(6);
  });
});
