import { create } from 'zustand';
import { Company, Review, PVPanel, Inverter, SolarProject, Project, Task,
         Survey, CreateSurveyParams, SurveyResponse, User, ProjectStatus, 
         SurveyStatus, TaskStatus, TaskPriority } from '@/types';
import { ProcessedMetrics, EnhancedSurveyResponse } from '@/types/metrics';
import { SurveyMetricService } from '@/services/surveyMetricService';
import { auth } from '@/lib/firebase';

export interface SearchResults {
  companies?: Company[];
}

// Helper function to get the current auth token
const getAuthToken = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return await user.getIdToken(true);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const INITIAL_SOLARPROJECT_DATA: SolarProject = {
  id: 0,
  address: '',
  coordinates: { lat: 0, lng: 0 },
  dcSystemSize: 0,
  arrayType: 'Fixed',
  systemLosses: 14,
  tilt: 20,
  azimuth: 180,
  bifacial: false,
  selectedPanelId: 1,
  pvPanelQuantity: 1,
  selectedInverterId: 1,
  inverterQuantity: 1,
  mountingType: 'Flat Roof',
  roofMaterial: '',
  roofSlope: 0,
  roofOrientation: '',
  roofArea: 0,
  roofLoadCapacity: 0,
  groundArea: 0,
  groundSlope: 0,
  groundOrientation: '',
  groundLoadCapacity: 0,
  trackingType: '',
  trackingSlope: 0,
  trackingOrientation: '',
  trackingLoadCapacity: 0,
  derivedEquipment: {
    fuses: 0,
    dcSurgeProtector: 0,
    dcDisconnectSwitches: 0,
    acSurgeProtector: 0,
    generalDisconnectSwitch: 0,
    residualCurrentBreaker: 0,
    generalCircuitBreaker: 0,
    dcCableLength: 0,
    acCableLength: 0,
    earthingCableLength: 0,
    mc4ConnectorPairs: 0,
    splitters: 0,
    cableTrayLength: 0
  }
};

const INITIAL_PROJECT_DATA: Project = {
  id: 0,
  name: '',
  description: '',
  status: ProjectStatus.NOT_STARTED,
  tasks: [],
  members: [],
  startDate: new Date(),
  endDate: new Date()
};

const INITIAL_SURVEY_DATA: Survey = {
  id: 0,
  title: '',
  description: '',
  surveyJson: '',
  status: SurveyStatus.DRAFT,
  targetResponses: 0,
  userId: 0
};

const INITIAL_TASK_DATA: Task = {
  id: 0,
  title: '',
  description: '',
  status: TaskStatus.NOT_STARTED,
  priority: TaskPriority.MEDIUM,
  dueDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  projectId: 0,
  project: INITIAL_PROJECT_DATA,
  assignedToId: 0,
};

interface ApiState {
  projects: Project[];
  tasks: Task[];
  solarProjects: SolarProject[];
  users: User[];
  companies: Company[];
  surveys: Survey[];
  survey: Survey;
  pvPanels: PVPanel[];
  inverters: Inverter[];
  solarProject: SolarProject;
  project: Project;
  searchResults: SearchResults;
  isLoading: boolean;

  fetchPVPanels: (page: number, limit: number) => Promise<PVPanel[]>;

  fetchInverters: (page: number, limit: number) => Promise<Inverter[]>;

  fetchTasks: (page: number, limit: number) => Promise<Task[]>;
  createTask: (task: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: number) => Promise<void>;
  updateTask: (taskId: number, task: Partial<Task>) => Promise<void>;

  fetchProject: () => Promise<Project>;
  createProject: (project: Partial<Project>) => Promise<Project>;
  deleteProject: (projectId: number) => Promise<void>;
  updateProject: (projectId: number, project: Partial<Project>) => Promise<void>;
  

  fetchSolarProject: () => Promise<SolarProject>;
  createSolarProject: (project: SolarProject) => Promise<SolarProject>;
  deleteSolarProject: (projectId: number) => Promise<void>;
  updateSolarProject: (projectId: number, project: Partial<SolarProject>) => Promise<void>;

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

  createSurveyResponse:   (surveyId: number, replyJson: string, userId: number) => Promise<SurveyResponse>;
  
  fetchReviews: (companyId: number) => Promise<Review[]>;
  fetchSurveyResponses: (surveyId: number) => Promise<SurveyResponse[]>;
  fetchSurveysByUserId: (userId: number) => Promise<Survey[]>;

  fetchUsers: () => Promise<User[]>;
  createUser: (user: Partial<User>) => Promise<User>;
  updateUser: (userId: number, company: Partial<User>) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
}

const apiStore = create<ApiState>((set) => ({
  users:[],
  companies: [],
  surveys: [],
  pvPanels: [],
  inverters: [],
  projects: [],
  project: INITIAL_PROJECT_DATA,
  survey: INITIAL_SURVEY_DATA,
  searchResults: {},
  solarProjects: [],  
  solarProject: INITIAL_SOLARPROJECT_DATA,
  tasks: [],
  task: INITIAL_TASK_DATA,
  isLoading: false,

  fetchUsers: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ users: data });
    return data;
  },
  createUser: async (user: Partial<User>) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
      credentials: 'include',
    });
    const data = await response.json();
    set((state) => ({ users: [...state.users, data] }));
    return data;
  },
  updateUser: async (userId: number, user: Partial<User>) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
      credentials: 'include',
    });
    const data = await response.json();
    set((state) => ({
      users: state.users.map((c) => (c.id === userId ? data : c)),
    }));
  },
  deleteUser: async (userId: number) => {
    const token = await getAuthToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    set((state) => ({
      users: state.users.filter((c) => c.id !== userId),
    }));
  },

  fetchSurveys: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/surveys`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ surveys: data });
    return data;
  },
  fetchSurveysByUserId:  async (userId: number) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/surveys`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ surveys: data });
    return data;
  },
  fetchSurveyById:  async (surveyId: number) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/surveys/${surveyId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ surveys: data });
    return data;
  },
  createSurvey: async (survey: CreateSurveyParams) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/surveys`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/surveys/${surveyId}`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/pv-panels?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ pvPanels: data });
    return data;
  },

  fetchInverters: async (page = 1, limit = 50) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/inverters?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ inverters: data });
    return data;
  },

  fetchTasks: async (page = 1, limit = 50) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tasks?page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ tasks: data });
    return data;
  },
  createTask: async (task: Partial<Task>) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tasks`, {
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
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tasks/${taskId}`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/tasks/${taskId}`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/projects`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ project: data });
    return data;
  },
  createProject: async (project: Partial<Project>) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/projects`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/projects/${projectId}`, {
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
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/projects/${projectId}`, {
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

  fetchSolarProject: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/solarProjects`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ project: data });
    return data;
  },
  createSolarProject: async (project: SolarProject) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/solarProjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project),
      credentials: 'include',
    });
    const data = await response.json();
    set({ solarProject: data });
    return data;
  },
  updateSolarProject: async (projectId: number, project: Partial<SolarProject>) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/solarProjects/${projectId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(project),
      credentials: 'include',
    });
    const data = await response.json();
    set({ solarProject: data });
  },
  deleteSolarProject: async (projectId: number) => {
    const token = await getAuthToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/solarProjects/${projectId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    set((state) => ({
      solarProjects: state.solarProjects.filter((p) => p.id !== projectId),
    }));
  },

  fetchCompanies: async () => {
    try {
      console.log('Fetching companies from client...');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies`, {
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies/${companyId}`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies/${companyId}`, {
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
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies/${companyId}`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies/${companyId}/reviews`, {
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
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies/${companyId}/reviews`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    return data;
  },
  createSurveyResponse: async (surveyId: number, surveyResponse: string, userId: number): Promise<SurveyResponse> => {
    try {
      // Validate input parameters
      if (!surveyId || !surveyResponse || !userId) {
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

      // Process metrics from survey response
      const processedResponse = SurveyMetricService.processSurveyResponse({
        id: 0, // Temporary ID
        surveyId,
        responseJson: surveyResponse,
        userId,
        companyId: typeof companyId === 'number' ? companyId : parseInt(String(companyId), 263)
      });

      // Get auth token
      const token = await getAuthToken();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Make API request
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/surveys/${surveyId}/surveyResponses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            userId,
            companyId: typeof companyId === 'number' ? companyId : parseInt(String(companyId), 263),
            // Ensure responseJson is a valid JSON string
            responseJson: typeof surveyResponse === 'string' ? surveyResponse : JSON.stringify(surveyResponse),
            // Properly serialize processedMetrics to ensure it's stored correctly in the database
            processedMetrics: JSON.parse(JSON.stringify(processedResponse.processedMetrics))
          }),
          credentials: 'include'
        }
      );

      // Handle non-200 responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        throw new Error(errorData.message || `Failed to save survey response: ${response.status}`);
      }

      const data = await response.json();
      if (!data) {
        throw new Error('No response data received');
      }

      // Log successful metrics processing
      console.log('Survey response processed successfully:', {
        surveyId,
        userId,
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
        userId,
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

      // Make API request
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/surveys/${surveyId}/surveyResponses`,
        {
          method: 'GET',
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
}));

export const useApiStore = apiStore;

export const fetchPVPanels = apiStore.getState().fetchPVPanels;
export const fetchInverters = apiStore.getState().fetchInverters;
