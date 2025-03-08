import { create } from 'zustand';
import { Company, Review, PVPanel, Inverter, ProjectData, 
         Survey, CreateSurveyParams, SurveyResponse, User} from '@/types';
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

const INITIAL_PROJECT_DATA: ProjectData = {
  address: '',
  coordinates: { lat: 0, lng: 0 },
  dcSystemSize: 0,
  arrayType: 'Roof Mount',
  systemLosses: 14,
  tilt: 0,
  azimuth: 180,
  bifacial: false,
  // PV Panel Selection
  selectedPanelId: '',
  pvPanelQuantity: 1,
  // Inverter Selection
  selectedInverterId: '',
  inverterQuantity: 1,
  // Mounting
  mountingType: 'Flat Roof',
  roofMaterial: '',
  // Derived Equipment
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

const INITIAL_SURVEY_DATA: Survey = {
  id: '',
  title: '',
  description: '',
  surveyJson: '',
  targetResponses: 0,
  userId: ''
};

interface ApiState {
  users: User[];
  companies: Company[];
  surveys: Survey[];
  survey: Survey;
  pvPanels: PVPanel[];
  inverters: Inverter[];
  project: ProjectData;
  searchResults: SearchResults;


  fetchPVPanels: (page: number, limit: number) => Promise<PVPanel[]>;

  fetchInverters: (page: number, limit: number) => Promise<Inverter[]>;
  fetchProject: () => Promise<ProjectData>;

  createProject: (project: ProjectData) => Promise<ProjectData>;
  updateProject: (projectId: string, project: Partial<ProjectData>) => Promise<void>;
  
  fetchCompanies: () => Promise<Company[]>;
  createCompany: (company: Partial<Company>) => Promise<Company>;
  updateCompany: (companyId: string, company: Partial<Company>) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;
  createReview: (companyId: string, review: Partial<Review>) => Promise<Review>;
  
  fetchSurveys: () => Promise<Survey[]>;
  createSurvey: (project: CreateSurveyParams) => Promise<Survey>;
  createSurveyResponse: (surveyId: string, replyJson: string, userId: string) => Promise<SurveyResponse>;
  fetchReviews: (companyId: string) => Promise<Review[]>;
  fetchSurveyResponses: (surveyId: string) => Promise<SurveyResponse[]>;
  fetchSurveysByUserId: (userId: string) => Promise<Survey[]>;
  fetchSurveyById: (userId: string) => Promise<Survey>;

  fetchUsers: () => Promise<User[]>;
  createUser: (user: Partial<User>) => Promise<User>;
  updateUser: (userId: string, company: Partial<User>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

const apiStore = create<ApiState>((set) => ({
  users:[],
  companies: [],
  surveys: [],
  pvPanels: [],
  inverters: [],
  project: INITIAL_PROJECT_DATA,
  survey: INITIAL_SURVEY_DATA,
  searchResults: {},
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
      body: JSON.stringify({
        ...user,
        descriptions: user.descriptions?.map((desc) => ({
          ...desc,
          id: desc.id || crypto.randomUUID(),
        })),
      }),
      credentials: 'include',
    });
    const data = await response.json();
    set((state) => ({ users: [...state.users, data] }));
    return data;
  },
  updateUser: async (userId: string, user: Partial<User>) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...user,
        descriptions: user.descriptions?.map((desc) => ({
          ...desc,
          id: desc.id || crypto.randomUUID(),
        })),
      }),
      credentials: 'include',
    });
    const data = await response.json();
    set((state) => ({
      users: state.users.map((c) => (c.id === userId ? data : c)),
    }));
  },
  deleteUser: async (userId: string) => {
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
  fetchSurveysByUserId:  async (userId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/surveys`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ surveys: data });
    return data;
  },
  fetchSurveyById:  async (surveyId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/surveys/${surveyId}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ surveys: data });
    return data;
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
  fetchProject: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/projects`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ project: data });
    return data;
  },
  createProject: async (project: ProjectData) => {
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
  updateProject: async (projectId: string, project: Partial<ProjectData>) => {
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
  fetchCompanies: async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    set({ companies: data });
    return data;
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
  updateCompany: async (companyId: string, company: Partial<Company>) => {
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
  deleteCompany: async (companyId: string) => {
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
  createReview: async (companyId: string, review: Partial<Review>) => {
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
  fetchReviews: async (companyId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/companies/${companyId}/reviews`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    return data;
  },
  createSurveyResponse: async (surveyId: string, surveyResponse: string, userId: string) => {
    const token = await getAuthToken();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/surveys/${surveyId}/surveyResponses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: userId,
        responseJson: surveyResponse, 
      }),
      credentials: 'include',
    });
    const data = await response.json();
    return data;
  },
  fetchSurveyResponses: async (surveyId: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/surveys/${surveyId}/surveyResponses`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await response.json();
    return data;
  },
}));

export const useApiStore = apiStore;

export const fetchPVPanels = apiStore.getState().fetchPVPanels;
export const fetchInverters = apiStore.getState().fetchInverters;
