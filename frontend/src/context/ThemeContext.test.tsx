import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

// Helper component to test the useTheme hook
function TestConsumer() {
  const { darkMode, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="dark-mode">{darkMode.toString()}</span>
      <button data-testid="toggle" onClick={toggleTheme}>
        Toggle
      </button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'light');
  });

  describe('ThemeProvider', () => {
    it('should default to light mode when no saved theme', () => {
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('dark-mode')).toHaveTextContent('false');
    });

    it('should initialize to dark mode when saved theme is dark', () => {
      localStorage.setItem('theme', 'dark');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('dark-mode')).toHaveTextContent('true');
    });

    it('should initialize to light mode when saved theme is light', () => {
      localStorage.setItem('theme', 'light');

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('dark-mode')).toHaveTextContent('false');
    });

    it('should toggle theme from light to dark', async () => {
      const user = userEvent.setup();
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('dark-mode')).toHaveTextContent('false');

      await user.click(screen.getByTestId('toggle'));

      expect(screen.getByTestId('dark-mode')).toHaveTextContent('true');
      expect(localStorage.getItem('theme')).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should toggle theme from dark to light', async () => {
      localStorage.setItem('theme', 'dark');
      const user = userEvent.setup();

      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByTestId('dark-mode')).toHaveTextContent('true');

      await user.click(screen.getByTestId('toggle'));

      expect(screen.getByTestId('dark-mode')).toHaveTextContent('false');
      expect(localStorage.getItem('theme')).toBe('light');
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    it('should update document classes when darkMode changes', async () => {
      const user = userEvent.setup();
      render(
        <ThemeProvider>
          <TestConsumer />
        </ThemeProvider>,
      );

      // Initially light
      expect(document.documentElement.classList.contains('light')).toBe(true);
      expect(document.documentElement.classList.contains('dark')).toBe(false);

      // Toggle to dark
      await user.click(screen.getByTestId('toggle'));
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      expect(document.documentElement.classList.contains('light')).toBe(false);
    });
  });

  describe('useTheme', () => {
    it('should throw error when used outside ThemeProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestConsumer />)).toThrow(
        'useTheme must be used within a ThemeProvider',
      );

      consoleSpy.mockRestore();
    });
  });
});
