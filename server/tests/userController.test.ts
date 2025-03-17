import { describe, beforeAll, afterAll, beforeEach, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { createServerClient } from '@supabase/ssr';
import { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../src/controllers/userController';

// Mock Supabase Auth Helpers
jest.mock('@supabase/ssr', () => {
  return {
    createPagesServerClient: jest.fn().mockReturnValue({
      auth: {
        admin: {
          listUsers: jest.fn(),
          getUserById: jest.fn(),
          createUser: jest.fn(),
          updateUserById: jest.fn(),
          deleteUser: jest.fn()
        }
      }
    })
  };
});

describe('User Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockSupabase: any;

  beforeAll(() => {
    mockSupabase = createServerClient('https://example.supabase.co', 'test-key', {
      cookies: {
        get: jest.fn(),
        set: jest.fn(),
        getAll: jest.fn().mockResolvedValue(Promise.resolve([{ name: 'test', value: 'value' }])),
        delete: jest.fn()
      }
    });
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock request and response with proper typing
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn() as any,
      send: jest.fn() as any
    };
  });

  describe('getUsers', () => {
    it('should return a list of users', async () => {
      // Mock Supabase Auth response
      const mockUsers = [
        { uid: 'user1', email: 'user1@example.com', displayName: 'User One' },
        { uid: 'user2', email: 'user2@example.com', displayName: 'User Two' }
      ];
      mockSupabase.auth.admin.listUsers.mockResolvedValue({ data: mockUsers, error: null });

      // Call the controller function
      await getUsers(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockSupabase.auth.admin.listUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle errors', async () => {
      // Mock Supabase Auth error
      const mockError = new Error('Supabase Auth error');
      mockSupabase.auth.admin.listUsers.mockResolvedValue({ data: null, error: mockError });

      // Call the controller function
      await getUsers(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockSupabase.auth.admin.listUsers).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      // Setup mock request with params
      mockRequest = {
        params: { userId: 'user1' }
      };

      // Mock Supabase Auth response
      const mockUser = { uid: 'user1', email: 'user1@example.com', displayName: 'User One' };
      mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: mockUser, error: null });

      // Call the controller function
      await getUser(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockSupabase.auth.admin.getUserById).toHaveBeenCalledWith('user1');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle errors', async () => {
      // Setup mock request with params
      mockRequest = {
        params: { userId: 'nonexistent' }
      };

      // Mock Supabase Auth error
      const mockError = new Error('User not found');
      mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: null, error: mockError });

      // Call the controller function
      await getUser(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockSupabase.auth.admin.getUserById).toHaveBeenCalledWith('nonexistent');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      // Setup mock request with body
      mockRequest = {
        body: {
          email: 'newuser@example.com',
          password: 'password123',
          displayName: 'New User'
        }
      };

      // Mock Supabase Auth response
      const mockUser = { 
        uid: 'newuser', 
        email: 'newuser@example.com', 
        displayName: 'New User' 
      };
      mockSupabase.auth.admin.createUser.mockResolvedValue({ data: mockUser, error: null });

      // Call the controller function
      await createUser(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockSupabase.auth.admin.createUser).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'password123',
        displayName: 'New User'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle errors', async () => {
      // Setup mock request with body
      mockRequest = {
        body: {
          email: 'invalid-email',
          password: 'short',
          displayName: 'Invalid User'
        }
      };

      // Mock Supabase Auth error
      const mockError = new Error('Invalid email');
      mockSupabase.auth.admin.createUser.mockResolvedValue({ data: null, error: mockError });

      // Call the controller function
      await createUser(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockSupabase.auth.admin.createUser).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('updateUser', () => {
    it('should update an existing user', async () => {
      // Setup mock request with params and body
      mockRequest = {
        params: { userId: 'user1' },
        body: {
          email: 'updated@example.com',
          displayName: 'Updated User'
        }
      };

      // Mock Supabase Auth response
      const mockUser = { 
        uid: 'user1', 
        email: 'updated@example.com', 
        displayName: 'Updated User' 
      };
      mockSupabase.auth.admin.updateUserById.mockResolvedValue({ data: mockUser, error: null });

      // Call the controller function
      await updateUser(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockSupabase.auth.admin.updateUserById).toHaveBeenCalledWith('user1', {
        email: 'updated@example.com',
        displayName: 'Updated User'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle errors', async () => {
      // Setup mock request with params and body
      mockRequest = {
        params: { userId: 'nonexistent' },
        body: {
          email: 'updated@example.com',
          displayName: 'Updated User'
        }
      };

      // Mock Supabase Auth error
      const mockError = new Error('User not found');
      mockSupabase.auth.admin.updateUserById.mockResolvedValue({ data: null, error: mockError });

      // Call the controller function
      await updateUser(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockSupabase.auth.admin.updateUserById).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      // Setup mock request with params
      mockRequest = {
        params: { userId: 'user1' }
      };

      // Mock Supabase Auth response
      mockSupabase.auth.admin.deleteUser.mockResolvedValue({ data: null, error: null });

      // Call the controller function
      await deleteUser(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockSupabase.auth.admin.deleteUser).toHaveBeenCalledWith('user1');
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      // Setup mock request with params
      mockRequest = {
        params: { userId: 'nonexistent' }
      };

      // Mock Supabase Auth error
      const mockError = new Error('User not found');
      mockSupabase.auth.admin.deleteUser.mockResolvedValue({ data: null, error: mockError });

      // Call the controller function
      await deleteUser(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockSupabase.auth.admin.deleteUser).toHaveBeenCalledWith('nonexistent');
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
