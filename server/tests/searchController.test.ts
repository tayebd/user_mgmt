import { describe, beforeAll, afterAll, beforeEach, expect, it, jest } from '@jest/globals';
import { Request, Response } from 'express';
import { prisma } from '../src/config/db';
import { search } from '../src/controllers/searchController';
import { UserRole } from '@prisma/client';

// Mock Prisma client with proper typing
jest.mock('../src/config/db', () => ({
  prisma: {
    user: {
      findMany: jest.fn().mockImplementation(() => [])
    }
  }
}));

describe('Search Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let testUserId: number;

  beforeAll(async () => {
    testUserId = 1; // Mock user ID for tests
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock request and response
    mockRequest = {
      query: {},
      user: { id: testUserId, uid: 'test-uid', email: 'test@example.com', role: 'USER' }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn() as any
    };
  });

  afterAll(async () => {
    // No actual database operations to clean up since we're mocking Prisma
  });

  describe('search', () => {
    it('should return users matching the search query', async () => {
      // Setup mock request
      mockRequest.query = { query: 'john' };

      // Mock Prisma response
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: UserRole.USER },
        { id: 2, name: 'Johnny Smith', email: 'johnny@example.com', role: UserRole.USER }
      ];
      (prisma.user.findMany as jest.Mock<any>).mockResolvedValue(mockUsers);

      // Call the controller function
      await search(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: 'john', mode: 'insensitive' } },
            { email: { contains: 'john', mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true
        }
      });
      expect(mockResponse.json).toHaveBeenCalledWith({ users: mockUsers });
    });

    it('should return 401 if user is not authenticated', async () => {
      // Setup mock request without user
      mockRequest.user = undefined;
      mockRequest.query = { query: 'john' };

      // Call the controller function
      await search(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not authenticated' });
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should return 400 if query is missing', async () => {
      // Setup mock request without query
      mockRequest.query = {};

      // Call the controller function
      await search(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Search query is required' });
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should return 400 if query is not a string', async () => {
      // Setup mock request with non-string query
      mockRequest.query = { query: ['john'] as unknown as string };

      // Call the controller function
      await search(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Search query is required' });
      expect(prisma.user.findMany).not.toHaveBeenCalled();
    });

    it('should handle errors during search', async () => {
      // Setup mock request
      mockRequest.query = { query: 'john' };

      // Mock Prisma error
      const mockError = new Error('Database error');
      (prisma.user.findMany as jest.Mock<any>).mockRejectedValue(mockError);

      // Call the controller function
      await search(mockRequest as Request, mockResponse as Response);

      // Verify the response
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Error performing search' });
    });
  });
});
