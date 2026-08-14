import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/(auth)/login/page';
import { authService } from '@/services/auth.service';


jest.mock('@/services/auth.service');


jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return '/login';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText('Email address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('should handle successful login', async () => {
    const mockLogin = jest.spyOn(authService, 'login').mockResolvedValue({
      token: 'test-token',
      user: { id: 1, email: 'test@test.com', fullName: 'Test User', role: 'Student' }
    });

    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'test@test.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123'
      });
    });
  });

  it('should show error on failed login', async () => {
    const mockLogin = jest.spyOn(authService, 'login').mockRejectedValue({
      response: { data: 'Invalid credentials' }
    });

    render(<LoginPage />);
    
    fireEvent.change(screen.getByPlaceholderText('Email address'), {
      target: { value: 'wrong@test.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpass' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});