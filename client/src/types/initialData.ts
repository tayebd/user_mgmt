/**
 * Initial Data and Constants
 * Simplified version - imports from modularized data modules
 */

import { Project, Survey, Task } from '.';
import { PVProject } from './solar';
import { ProjectStatus, SurveyStatus, TaskStatus, TaskPriority } from './enums';

// Re-export mock data from modularized files
export {
  MOCK_PV_PANELS,
  MOCK_INVERTERS,
  MOCK_MOUNTING_HARDWARE,
  MOCK_PROTECTION_DEVICES,
  MOCK_WIRES,
  MOCK_CHARGE_CONTROLLERS
} from '@/lib/mock-data/equipment-mocks';

// Re-export API functions from modularized files
export {
  getPVPanels,
  getInverters,
  getMountingHardware,
  getProtectionDevices,
  getWires,
  getChargeControllers,
  getPVPanelById,
  getInverterById,
  searchPVPanels,
  searchInverters
} from '@/lib/mock-data/equipment-api';

// Initial project data
export const INITIAL_PVPROJECT: PVProject = {
  id: 0,
  name: 'New Solar Project',
  address: 'Paris, France',
  latitude: 48.8566,
  longitude: 2.3522,
  timezone: 'Europe/Paris',
  elevation: 35,
  panels: [],
  arrays: [],
  inverters: [],
  batteryBanks: [],
  chargeControllers: [],
  loads: [],
  protectionDevices: [],
  wires: [],
  mountingHardware: [],
  status: ProjectStatus.NOT_STARTED
};

// Initial project data
export const INITIAL_PROJECT: Project = {
  id: 0,
  name: 'New Project',
  description: 'A new project',
  status: ProjectStatus.NOT_STARTED,
  startDate: new Date(),
  endDate: new Date(),
  tasks: [],
  members: []
};

// Initial survey data
export const INITIAL_SURVEY_DATA: Survey = {
  id: 0,
  title: 'New Survey',
  description: 'A new survey',
  surveyJson: '{}',
  status: SurveyStatus.DRAFT,
  targetResponses: 100,
  userId: 0,
  responses: []
};

// Initial task data
export const INITIAL_TASK_DATA: Task = {
  id: 0,
  title: 'New Task',
  description: 'A new task',
  status: TaskStatus.NOT_STARTED,
  priority: TaskPriority.MEDIUM,
  dueDate: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  projectId: 0,
  project: {
    id: 0,
    name: 'New Project',
    description: 'A new project',
    status: ProjectStatus.NOT_STARTED,
    startDate: new Date(),
    endDate: new Date(),
    tasks: [],
    members: []
  },
  assignedToId: 0
};