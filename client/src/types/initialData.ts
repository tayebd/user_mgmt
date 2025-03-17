import { SolarProject, Project, Survey, Task } from '.';
import { ProjectStatus, SurveyStatus, TaskStatus, TaskPriority } from './enums';

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

export const INITIAL_PROJECT_DATA: Project = {
  id: 0,
  name: '',
  description: '',
  status: ProjectStatus.NOT_STARTED,
  tasks: [],
  members: [],
  startDate: new Date(),
  endDate: new Date()
};

export const INITIAL_SURVEY_DATA: Survey = {
  id: 0,
  title: '',
  description: '',
  surveyJson: '',
  status: SurveyStatus.DRAFT,
  targetResponses: 0,
  userId: 0
};

export const INITIAL_TASK_DATA: Task = {
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
