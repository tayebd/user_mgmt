import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Company, Review, Project, Task, 
  Survey, CreateSurveyParams, SurveyResponse, User} from '@/types';
import type { PVPanel, Inverter, PVProject } from '@/shared/types';
// import { ProcessedMetrics, EnhancedSurveyResponse } from '@/types/metrics';
import { SurveyMetricService } from '@/services/surveyMetricService';

import {
  INITIAL_PVPROJECT,
  INITIAL_PROJECT,
  INITIAL_SURVEY_DATA,
  INITIAL_TASK_DATA
} from '../types/initialData';
import { getAuthToken } from '@/utils/auth';

const REQUEST_TIMEOUT = 10000; // 10 seconds
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const isUser = (data: unknown): data is User => {
  if (!data || typeof data !== 'object') return false;
  const user = data as Record<string, unknown>;
  return typeof user.uid === 'string' && 
         typeof user.email === 'string' &&
         (!user.displayName || typeof user.displayName === 'string') &&
         (!user.photoURL || typeof user.photoURL === 'string') &&
         (!user.role || typeof user.role === 'string') &&
         typeof user.createdAt === 'string' &&
         typeof user.updatedAt === 'string';
};

export interface SearchResults {
  companies?: Company[];
}

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const FAILED_LOOKUP_TTL = 60 * 1000; // 1 minute

const userCache: { [uid: string]: { user: User; timestamp: number } } = {};
const userEmailCache: { [email: string]: string } = {};
const failedLookupCache: { [uid: string]: { timestamp: number } } = {};

export interface ApiState {
  projects: Project[];
  tasks: Task[];
  pvProjects: PVProject[];
  users: User[];
  companies: Company[];
  surveys: Survey[];
  survey: Survey;
  pvPanels: PVPanel[];
  inverters: Inverter[];
  pvProject: PVProject;
  project: Project;
  searchResults: SearchResults;
  isLoading: boolean;


  fetchPVPanels: (page: number, limit: number) => Promise<PVPanel[]>;
  fetchPVPanelById: (panelId: number) => Promise<PVPanel>;

  fetchInverters: (page: number, limit: number) => Promise<Inverter[]>;

  fetchTasks: (page: number, limit: number) => Promise<Task[]>;
  createTask: (task: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: number) => Promise<void>;
  updateTask: (taskId: number, task: Partial<Task>) => Promise<void>;

  fetchProject: () => Promise<Project>;
  createProject: (project: Partial<Project>) => Promise<Project>;
  deleteProject: (projectId: number) => Promise<void>;
  updateProject: (projectId: number, project: Partial<Project>) => Promise<void>;
  

  fetchPVProject: () => Promise<PVProject>;
  createPVProject: (project: PVProject) => Promise<PVProject>;
  deletePVProject: (projectId: number) => Promise<void>;
  updatePVProject: (projectId: number, project: Partial<PVProject>) => Promise<void>;

  fetchCompanies: () => Promise<Company[]>;
  fetchCompanyById: (companyId: number) => Promise<Company>;
  createCompany: (company: Partial<Company>) => Promise<Company>;
  updateCompany: (companyId: number, company: Partial<Company>) => Promise<void>;
  deleteCompany: (companyId: number) => Promise<void>;
  createReview: (companyId: number, review: Partial<Review>) => Promise<Review>;
  
  fetchSurveys: () => Promise<Survey[]>;
  createSurvey: (project: CreateSurveyParams) => Promise<Survey>;
  fetchSurveyById: (surveyId: number) => Promise<Survey>;
  updateSurvey: (surveyId: number, survey: Partial<Survey>) => Promise<void>;

  createSurveyResponse: (surveyId: number, replyJson: string, userId: number, authToken?: string) => Promise<SurveyResponse>;
  
  fetchReviews: (companyId: number) => Promise<Review[]>;
  fetchSurveyResponses: (surveyId: number) => Promise<SurveyResponse[]>;
  fetchSurveysByUserId: (userId: number) => Promise<Survey[]>;

  fetchUsers: () => Promise<User[]>;
  fetchUserByUid: (uid: string) => Promise<User>;
  findUserByEmail: (email: string) => Promise<User | null>;
  createUser: (user: Partial<User>) => Promise<User>;
  updateUser: (userId: number, user: Partial<User>) => Promise<User>;
  deleteUser: (userId: number) => Promise<boolean>;
}

const apiStore = create<ApiState>((set, get) => ({
  users:[],
  companies: [],
  surveys: [],
  pvPanels: [],
  inverters: [],
  projects: [],
  project: INITIAL_PROJECT,
  survey: INITIAL_SURVEY_DATA,
  searchResults: {},
  pvProjects: [],  
  pvProject: INITIAL_PVPROJECT,
  tasks: [],
  task: INITIAL_TASK_DATA,
  isLoading: false,

  fetchSurveys: async () => {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ surveys: data });
    return data;
  },
  fetchSurveysByUserId:  async (userId: number) => {
    const response = await fetch(`${API_BASE_URL}/surveys`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ surveys: data });
    return data;
  },
  fetchSurveyById:  async (surveyId: number) => {
    const response = await fetch(`${API_BASE_URL}/surveys/${surveyId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ surveys: data });
    return data;
  },
  createSurvey: async (survey: CreateSurveyParams) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(survey),
      credentials: 'include',
    });
    const data = await response.json();
    set({ survey: data });
    return data;
  },
  updateSurvey: async (surveyId: number, survey: Partial<Survey>) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/surveys/${surveyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(survey),
      credentials: 'include',
    });
    const data = await response.json();
    set({ survey: data });
  },

  fetchPVPanels: async (page = 1, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/pv-panels?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ pvPanels: data });
    return data;
  },
  fetchPVPanelById:  async (panelId: number) => {
    const response = await fetch(`${API_BASE_URL}/pv-panels/${panelId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ surveys: data });
    return data;
  },
  fetchInverters: async (page = 1, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/inverters?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ inverters: data });
    return data;
  },

  fetchTasks: async (page = 1, limit = 50) => {
    const response = await fetch(`${API_BASE_URL}/tasks?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ tasks: data });
    return data;
  },
  createTask: async (task: Partial<Task>) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(task),
      credentials: 'include',
    });
    const data = await response.json();
    set((state) => ({ tasks: [...state.tasks, data] }));
    return data;
  },
  deleteTask: async (taskId: number) => {
    const token = await getAuthToken();
    await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== taskId) }));
  },
  updateTask: async (taskId: number, task: Partial<Task>) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(task),
      credentials: 'include',
    });
    const data = await response.json();
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === taskId ? data : task)),
    }));
  },
  fetchProject: async () => {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ project: data });
    return data;
  },
  createProject: async (project: Partial<Project>) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project),
      credentials: 'include',
    });
    const data = await response.json();
    set({ project: data });
    return data;
  },
  updateProject: async (projectId: number, project: Partial<Project>) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project),
      credentials: 'include',
    });
    const data = await response.json();
    set({ project: data });
  },
  deleteProject: async (projectId: number) => {
    const token = await getAuthToken();
    await fetch(`${API_BASE_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
    }));
  },

  fetchPVProject: async () => {
    const response = await fetch(`${API_BASE_URL}/pv-projects`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ project: data });
    return data;
  },
  createPVProject: async (project: PVProject) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/pv-projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project),
      credentials: 'include',
    });
    const data = await response.json();
    set({ pvProject: data });
    return data;
  },
  updatePVProject: async (projectId: number, project: Partial<PVProject>) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/pv-projects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project),
      credentials: 'include',
    });
    const data = await response.json();
    set({ pvProject: data });
  },
  deletePVProject: async (projectId: number) => {
    const token = await getAuthToken();
    await fetch(`${API_BASE_URL}/pv-projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    set((state) => ({
      pvProjects: state.pvProjects.filter((p) => p.id !== projectId),
    }));
  },

  fetchCompanies: async () => {
    try {
      console.log('Fetching companies from client...');
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log(`Received ${data.length} companies from API`);
      set({ companies: data });
      return data;
    } catch (error) {
      console.error('Error fetching companies:', error);
      set({ companies: [] });
      return [];
    }
  },
  fetchCompanyById: async (companyId: number) => {
    try {
      console.log(`Fetching company with ID ${companyId}...`);
      const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching company with ID ${companyId}:`, error);
      throw error;
    }
  },
  createCompany: async (company: Partial<Company>) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...company,
        descriptions: company.descriptions?.map((desc) => ({
          ...desc,
          id: desc.id || crypto.randomUUID(),
        })),
      }),
      credentials: 'include',
    });
    const data = await response.json();
    set((state) => ({ companies: [...state.companies, data] }));
    return data;
  },
  updateCompany: async (companyId: number, company: Partial<Company>) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...company,
        descriptions: company.descriptions?.map((desc) => ({
          ...desc,
          id: desc.id || crypto.randomUUID(),
        })),
      }),
      credentials: 'include',
    });
    const data = await response.json();
    set((state) => ({
      companies: state.companies.map((c) => (c.id === companyId ? data : c)),
    }));
  },
  deleteCompany: async (companyId: number) => {
    const token = await getAuthToken();
    await fetch(`${API_BASE_URL}/companies/${companyId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    set((state) => ({
      companies: state.companies.filter((c) => c.id !== companyId),
    }));
  },
  createReview: async (companyId: number, review: Partial<Review>) => {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(review),
      credentials: 'include',
    });
    const data = await response.json();
    return data;
  },
  fetchReviews: async (companyId: number) => {
    const response = await fetch(`${API_BASE_URL}/companies/${companyId}/reviews`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    return data;
  },
  createSurveyResponse: async (surveyId: number, surveyResponse: string, userId: number, authToken?: string): Promise<SurveyResponse> => {
    try {
      console.log(`Creating survey response for surveyId: ${surveyId}, userId: ${userId}`);
      
      // Validate input parameters
      if (!surveyId || !surveyResponse) {
        throw new Error('Missing required parameters for survey response');
      }

      // Validate JSON format
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(surveyResponse);
        if (!parsedResponse || typeof parsedResponse !== 'object') {
          throw new Error('Invalid response data format');
        }
      } catch (jsonError) {
        console.error('JSON validation error:', jsonError);
        throw new Error('Invalid survey response format');
      }

      // Ensure companyId exists in the parsed response
      const companyId = parsedResponse.companyId || 1; // Default to 1 if not provided
      console.log(`Using companyId: ${companyId} for survey response`);

      // Process metrics from survey response
      const processedResponse = SurveyMetricService.processSurveyResponse({
        id: 0, // Temporary ID
        surveyId,
        responseJson: surveyResponse,
        companyId: typeof companyId === 'number' ? companyId : parseInt(String(companyId), 10),
        userId,
      });

      // Use provided token or get a fresh one
      let token = authToken;
      if (!token) {
        if (!supabase) {
          throw new Error('Supabase client not configured');
        }
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found when attempting to create survey response');
          throw new Error('Authentication required');
        }
        
        // Force token refresh to ensure we have the latest token
        console.log('No token provided, refreshing authentication token...');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Failed to retrieve authentication token');
        }
        token = session.access_token;
        if (!token) {
          throw new Error('Failed to retrieve authentication token');
        }
        console.log('Successfully refreshed authentication token');
      } else {
        console.log('Using provided authentication token');
      }

      // Make API request
      console.log('Making API request with token:', token.substring(0, 10) + '...');
      
      const requestBody = {
        userId: userId,
        companyId: typeof companyId === 'number' ? companyId : parseInt(String(companyId), 10),
        responseJson: typeof surveyResponse === 'string' ? surveyResponse : JSON.stringify(surveyResponse),
        processedMetrics: processedResponse.processedMetrics
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(
        `${API_BASE_URL}/surveys/${surveyId}/surveyResponses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(requestBody)
        }
      );

      // Handle non-200 responses
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData.message || `Failed to save survey response: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      if (!data) {
        throw new Error('No response data received');
      }

      // Log successful metrics processing
      console.log('Survey response processed successfully:', {
        surveyId,
        companyId,
        hasMetrics: !!data.processedMetrics,
        timestamp: new Date().toISOString()
      });

      // Ensure the returned data has a companyId (required by SurveyResponse interface)
      if (!data.companyId && data.companyId !== 0) {
        data.companyId = parsedResponse.companyId || 263;
      }
      
      return data as SurveyResponse;
    } catch (error) {
      // Log error details for debugging
      console.error('Survey response creation error:', {
        error,
        surveyId,
        timestamp: new Date().toISOString(),
      });
      throw error; // Re-throw to let components handle the error
    }
  },
  fetchSurveyResponses: async (surveyId: number) => {
    try {
      // Validate survey ID
      if (!surveyId || isNaN(surveyId) || surveyId <= 0) {
        throw new Error('Invalid survey ID');
      }

      // Get auth token
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Make API request
      const response = await fetch(
        `${API_BASE_URL}/surveys/${surveyId}/surveyResponses`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
        }
      );

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch survey responses: ${response.status}`);
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array of survey responses');
      }

      // Validate response data structure
      data.forEach((response, index) => {
        if (!response.id || !response.responseJson) {
          console.warn(`Invalid response data at index ${index}:`, response);
        }
      });

      return data;
    } catch (error) {
      // Log error details for debugging
      console.error('Survey responses fetch error:', {
        error,
        surveyId,
        timestamp: new Date().toISOString(),
      });
      throw error; // Re-throw to let components handle the error
    }
  },
  fetchUsers: async () => {
    const requestId = Math.random().toString(36).substring(2, 8);
    console.log(`[API:${requestId}] Fetching all users`);

    try {
      const token = await getAuthToken();
      if (!token) {
        console.error(`[API:${requestId}] Authentication required to fetch users`);
        throw new Error('Not authenticated');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(
          `${API_BASE_URL}/users`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );

        if (!response.ok) {
          const errorMessage = `Failed to fetch users: ${response.status} ${response.statusText}`;
          console.error(`[API:${requestId}] ${errorMessage}`);
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          console.error(`[API:${requestId}] Invalid response format: expected array of users`);
          throw new Error('Invalid response format: expected array of users');
        }

        console.log(`[API:${requestId}] Successfully fetched ${data.length} users`);
        set({ users: data });
        return data;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[API:${requestId}] Error fetching users: ${errorMessage}`);
      
      if (errorMessage.includes('timed out')) {
        throw new Error('TIMEOUT: Request timed out while fetching users');
      }
      if (errorMessage.includes('NetworkError') || errorMessage.includes('network')) {
        throw new Error('NETWORK_ERROR: Network error while fetching users');
      }
      throw error;
    }
  },
  fetchUserByUid: async (uid: string): Promise<User> => {
    if (!uid) {
      throw new Error('User UID is required');
    }

    const requestId = Math.random().toString(36).substring(2, 8);
    console.log(`[API:${requestId}] Fetching user by UID: ${uid}`);

    // Check if we have a failed lookup cached
    const failedLookup = failedLookupCache[uid];
    if (failedLookup && Date.now() - failedLookup.timestamp < FAILED_LOOKUP_TTL) {
      const errorMessage = `User with UID ${uid} not found (cached)`;
      console.log(`[API:${requestId}] ${errorMessage}`);
      throw new Error(`USER_NOT_FOUND: ${errorMessage}`);
    }

    try {
      // Check cache first
      const cachedUser = userCache[uid];
      if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
        console.log(`[API:${requestId}] Returning cached user data for UID: ${uid}`);
        return cachedUser.user;
      }

      const token = await getAuthToken();
      if (!token) {
        console.error('[API] Authentication required to fetch user');
        throw new Error('Not authenticated');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      try {
        const response = await fetch(
          `${API_BASE_URL}/users/uid/${uid}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            const errorMessage = `User with UID ${uid} not found`;
            console.error('[API]', errorMessage);
            // Add to failed lookup cache
            failedLookupCache[uid] = { timestamp: Date.now() };
            throw new Error(`USER_NOT_FOUND: ${errorMessage}`);
          }
          const errorText = await response.text();
          const errorMessage = `Failed to fetch user: ${response.status} ${response.statusText}\n${errorText}`;
          console.error('[API]', errorMessage);
          throw new Error(errorMessage);
        }

        const responseData = await response.json();
        if (!isUser(responseData)) {
          console.error('[API] Invalid user data structure:', responseData);
          throw new Error('Invalid user data structure');
        }

        // Update store and cache
        const users = get().users;
        set({ users: [...users.filter(u => u.uid !== uid), responseData] });
        userCache[uid] = { user: responseData, timestamp: Date.now() };
        
        console.log('[API] Successfully fetched user data for UID:', uid);
        return responseData;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[API] Error fetching user by UID:', errorMessage);
      
      if (errorMessage.includes('timed out')) {
        throw new Error(`TIMEOUT: Request timed out while fetching user with UID ${uid}`);
      }
      if (errorMessage.includes('NetworkError') || errorMessage.includes('network')) {
        throw new Error(`NETWORK_ERROR: Network error while fetching user with UID ${uid}`);
      }
      throw error;
    }
  },
  // Helper function to find a user by email in the cache or API
  findUserByEmail: async (email: string): Promise<User | null> => {
    if (!email?.includes('@')) {
      throw new Error('Invalid email format');
    }

    // Check store first
    const { users } = get();
    const storeUser = users.find(user => user.email === email);
    if (storeUser) {
      console.log('[API] Found user in store for email:', email);
      return storeUser;
    }

    // Check email cache
    const cachedUid = userEmailCache[email];
    if (cachedUid) {
      const cachedUser = userCache[cachedUid];
      if (cachedUser && Date.now() - cachedUser.timestamp < CACHE_TTL) {
        console.log('[API] Found user in cache for email:', email);
        return cachedUser.user;
      }
    }

    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required to find user');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/email/${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log('[API] No user found with email:', email);
          return null;
        }
        const errorText = await response.text();
        throw new Error(`Failed to find user: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();
      if (!data?.id || !data?.email || !data?.uid) {
        throw new Error('Invalid user data received from server');
      }

      // Update store and cache
      set({ users: [...users.filter(u => u.uid !== data.uid), data] });
      userCache[data.uid] = { user: data, timestamp: Date.now() };
      userEmailCache[email] = data.uid;

      console.log('[API] Successfully found user with email:', email);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[API] Error finding user by email:', errorMessage);
      
      if (errorMessage.includes('timed out')) {
        throw new Error(`TIMEOUT: Request timed out while finding user with email ${email}`);
      }
      if (errorMessage.includes('NetworkError') || errorMessage.includes('network')) {
        throw new Error(`NETWORK_ERROR: Network error while finding user with email ${email}`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },
  
  createUser: async (user: Partial<User>): Promise<User> => {
    // Validate required fields
    if (!user?.uid || !user?.email) {
      throw new Error('Cannot create user without UID and email');
    }
    if (!user.email.includes('@')) {
      throw new Error('Invalid email format');
    }

    // Check if user already exists in store
    const { users } = get();
    const existingUser = users.find(u => u.uid === user.uid || u.email === user.email);
    if (existingUser) {
      throw new Error(`User already exists with ${existingUser.uid === user.uid ? 'UID' : 'email'}`);
    }
    
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required to create user');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    
    try {
      console.log('[API] Creating user with UID:', user.uid);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...user,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }),
        signal: controller.signal
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create user: ${response.status} ${response.statusText}\n${errorText}`);
      }
      
      const data = await response.json();
      if (!isUser(data)) {
        throw new Error('Invalid user data received from server');
      }
      
      // Update store and cache
      set({ users: [...users, data] });
      userCache[data.uid] = { user: data, timestamp: Date.now() };
      userEmailCache[data.email] = data.uid;
      
      // Remove from failed lookup cache if present
      delete failedLookupCache[data.uid];
      
      console.log('[API] Successfully created user:', data.id);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[API] Error creating user:', errorMessage);
      
      if (errorMessage.includes('timed out')) {
        throw new Error(`TIMEOUT: Request timed out while creating user with UID ${user.uid}`);
      }
      if (errorMessage.includes('NetworkError') || errorMessage.includes('network')) {
        throw new Error(`NETWORK_ERROR: Network error while creating user with UID ${user.uid}`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  },
  updateUser: async (userId: number, user: Partial<User>): Promise<User> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required to update user');
    }

    try {
      console.log('[API] Updating user:', userId);
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(user)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update user: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const data = await response.json();
      if (!data?.id) {
        throw new Error('Invalid user data received from server');
      }

      // Update store
      const { users } = get();
      set({
        users: users.map(u => u.id === userId ? { ...u, ...data } : u)
      });

      console.log('[API] Successfully updated user:', data.id);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[API] Error updating user:', errorMessage);
      throw error;
    }
  },
  deleteUser: async (userId: number): Promise<boolean> => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const token = await getAuthToken();
    if (!token) {
      throw new Error('Authentication required to delete user');
    }

    try {
      console.log('[API] Deleting user:', userId);
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete user: ${response.status} ${response.statusText}\n${errorText}`);
      }

      // Update store
      const { users } = get();
      set({
        users: users.filter(u => u.id !== userId)
      });

      console.log('[API] Successfully deleted user:', userId);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[API] Error deleting user:', errorMessage);
      throw error;
    }
  },
}));

export const useApiStore = apiStore;
