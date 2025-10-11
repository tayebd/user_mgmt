import { AuthService, TokenService, supabase } from '../supabase-client';

// Mock the @supabase/supabase-js module
jest.mock('@supabase/supabase-js', () => {
  const mockAuth = {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
    refreshSession: jest.fn(),
    onAuthStateChange: jest.fn(),
  };

  const mockClient = {
    auth: mockAuth,
  };

  return {
    createClient: jest.fn(() => mockClient),
  };
});

// Mock environment variables
const originalEnv = process.env;

// Since we're mocking supabase in tests, we can safely use non-null assertions
// This is acceptable for test files where we control the environment

describe('Supabase Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key-that-is-long-enough',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('AuthService', () => {
    describe('signIn', () => {
      it('should sign in with email and password', async () => {
        const mockResponse = {
          user: { id: '123', email: 'test@example.com' },
          session: { access_token: 'token' },
        };

        (supabase!.auth.signInWithPassword as jest.Mock).mockResolvedValue({
          data: mockResponse,
          error: null,
        });

        const result = await AuthService.signIn('test@example.com', 'password');

        expect(supabase!.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
        });
        expect(result).toEqual(mockResponse);
      });

      it('should throw error when sign in fails', async () => {
        (supabase!.auth.signInWithPassword as jest.Mock).mockResolvedValue({
          data: null,
          error: { message: 'Invalid credentials' },
        });

        await expect(AuthService.signIn('test@example.com', 'wrong')).rejects.toThrow(
          'Invalid credentials'
        );
      });

      it('should throw error when client is not configured', async () => {
        // Temporarily set supabase to null
        const originalSupabase = supabase;
        (supabase as unknown as { [key: string]: unknown }) = null;

        await expect(AuthService.signIn('test@example.com', 'password')).rejects.toThrow(
          'Supabase client not configured'
        );

        // Restore
        (supabase as unknown as { [key: string]: unknown }) = originalSupabase;
      });
    });

    describe('signUp', () => {
      it('should sign up with email and password', async () => {
        const mockResponse = {
          user: { id: '123', email: 'test@example.com' },
        };

        (supabase!.auth.signUp as jest.Mock).mockResolvedValue({
          data: mockResponse,
          error: null,
        });

        const result = await AuthService.signUp('test@example.com', 'password');

        expect(supabase!.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
          options: {
            data: undefined,
          },
        });
        expect(result).toEqual(mockResponse);
      });

      it('should sign up with user metadata', async () => {
        const userMetadata = { name: 'Test User' };

        (supabase!.auth.signUp as jest.Mock).mockResolvedValue({
          data: { user: { id: '123' } },
          error: null,
        });

        await AuthService.signUp('test@example.com', 'password', userMetadata);

        expect(supabase!.auth.signUp).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password',
          options: {
            data: userMetadata,
          },
        });
      });
    });

    describe('signOut', () => {
      it('should sign out successfully', async () => {
        (supabase!.auth.signOut as jest.Mock).mockResolvedValue({
          error: null,
        });

        await AuthService.signOut();

        expect(supabase!.auth.signOut).toHaveBeenCalled();
      });

      it('should throw error when sign out fails', async () => {
        (supabase!.auth.signOut as jest.Mock).mockResolvedValue({
          error: { message: 'Sign out failed' },
        });

        await expect(AuthService.signOut()).rejects.toThrow('Sign out failed');
      });
    });

    describe('getSession', () => {
      it('should return current session', async () => {
        const mockSession = { access_token: 'token', user: { id: '123' } };

        (supabase!.auth.getSession as jest.Mock).mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const result = await AuthService.getSession();

        expect(result).toEqual(mockSession);
      });

      it('should return null when no session exists', async () => {
        (supabase!.auth.getSession as jest.Mock).mockResolvedValue({
          data: { session: null },
          error: null,
        });

        const result = await AuthService.getSession();

        expect(result).toBeNull();
      });
    });

    describe('getUser', () => {
      it('should return current user', async () => {
        const mockUser = { id: '123', email: 'test@example.com' };

        (supabase!.auth.getUser as jest.Mock).mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        const result = await AuthService.getUser();

        expect(result).toEqual(mockUser);
      });
    });

    describe('refreshSession', () => {
      it('should refresh the session', async () => {
        const mockSession = { access_token: 'new-token' };

        (supabase!.auth.refreshSession as jest.Mock).mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const result = await AuthService.refreshSession();

        expect(result).toEqual(mockSession);
      });
    });

    describe('onAuthStateChange', () => {
      it('should register auth state change listener', () => {
        const callback = jest.fn();
        const mockSubscription = { unsubscribe: jest.fn() };

        (supabase!.auth.onAuthStateChange as jest.Mock).mockReturnValue({
          data: { subscription: mockSubscription },
        });

        const result = AuthService.onAuthStateChange(callback);

        expect(supabase!.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
        expect(result).toEqual({
          data: { subscription: mockSubscription },
        });
      });

      it('should handle unconfigured client gracefully', () => {
        const originalSupabase = supabase;
        (supabase as unknown as { [key: string]: unknown }) = null;

        const callback = jest.fn();
        const result = AuthService.onAuthStateChange(callback);

        expect(result).toEqual({
          data: { subscription: { unsubscribe: () => {} } },
        });

        // Restore
        (supabase as unknown as { [key: string]: unknown }) = originalSupabase;
      });
    });
  });

  describe('TokenService', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe('getAccessToken', () => {
      it('should return access token from session', async () => {
        const mockSession = { access_token: 'test-token' };

        (supabase!.auth.getSession as jest.Mock).mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const token = await TokenService.getAccessToken();

        expect(token).toBe('test-token');
      });

      it('should return null when no session exists', async () => {
        (supabase!.auth.getSession as jest.Mock).mockResolvedValue({
          data: { session: null },
          error: null,
        });

        const token = await TokenService.getAccessToken();

        expect(token).toBeNull();
      });
    });

    describe('getAuthorizationHeader', () => {
      it('should return Bearer token header', async () => {
        const mockSession = { access_token: 'test-token' };

        (supabase!.auth.getSession as jest.Mock).mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const header = await TokenService.getAuthorizationHeader();

        expect(header).toBe('Bearer test-token');
      });

      it('should return null when no token exists', async () => {
        (supabase!.auth.getSession as jest.Mock).mockResolvedValue({
          data: { session: null },
          error: null,
        });

        const header = await TokenService.getAuthorizationHeader();

        expect(header).toBeNull();
      });
    });

    describe('isTokenExpired', () => {
      it('should return true for expired token', () => {
        // Create a token that expired 1 hour ago
        const payload = {
          exp: Math.floor(Date.now() / 1000) - 3600,
        };
        const token = `header.${btoa(JSON.stringify(payload))}.signature`;

        expect(TokenService.isTokenExpired(token)).toBe(true);
      });

      it('should return false for valid token', () => {
        // Create a token that expires in 1 hour
        const payload = {
          exp: Math.floor(Date.now() / 1000) + 3600,
        };
        const token = `header.${btoa(JSON.stringify(payload))}.signature`;

        expect(TokenService.isTokenExpired(token)).toBe(false);
      });

      it('should return true for invalid token', () => {
        expect(TokenService.isTokenExpired('invalid-token')).toBe(true);
      });
    });
  });

  describe('environment configuration', () => {
    it('should create client with valid environment variables', () => {
      expect(supabase).toBeDefined();
      expect(supabase!.auth).toBeDefined();
    });

    it('should fallback to mock when environment variables are missing', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = '';
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = '';

      // Reload the module to test fallback behavior
      jest.resetModules();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { supabase: fallbackSupabase } = require('../supabase');

      expect(fallbackSupabase.auth).toBeDefined();
      expect(fallbackSupabase.auth.getSession).toBeDefined();
    });
  });
});