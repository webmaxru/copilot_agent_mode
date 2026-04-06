import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

// Helper component to test the useAuth hook
function TestConsumer() {
  const { isLoggedIn, isAdmin, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="logged-in">{isLoggedIn.toString()}</span>
      <span data-testid="is-admin">{isAdmin.toString()}</span>
      <button data-testid="login-regular" onClick={() => login('user@example.com', 'password')}>
        Login Regular
      </button>
      <button data-testid="login-admin" onClick={() => login('admin@github.com', 'password')}>
        Login Admin
      </button>
      <button data-testid="logout" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  describe('AuthProvider', () => {
    it('should provide default values (not logged in, not admin)', () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
    });

    it('should log in a regular user', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await user.click(screen.getByTestId('login-regular'));

      expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
    });

    it('should log in an admin user (github.com email)', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await user.click(screen.getByTestId('login-admin'));

      expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('true');
    });

    it('should log out a user', async () => {
      const user = userEvent.setup();
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>,
      );

      await user.click(screen.getByTestId('login-regular'));
      expect(screen.getByTestId('logged-in')).toHaveTextContent('true');

      await user.click(screen.getByTestId('logout'));
      expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
      expect(screen.getByTestId('is-admin')).toHaveTextContent('false');
    });
  });

  describe('useAuth', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for expected error
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestConsumer />)).toThrow(
        'useAuth must be used within an AuthProvider',
      );

      consoleSpy.mockRestore();
    });
  });
});
