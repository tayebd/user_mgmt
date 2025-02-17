export type Company = {
  id: string;
  name: string;
  location: string;
  website: string;
  iconUrl?: string;
  phone: string;
  logo: string;
  established: string;
  web_validity?: boolean;
  capabilities?: string;
  fb_handle?: string;
  residential?: boolean;
  commercial?: boolean;
  descriptions: Description[];
  badge: string;
  rating: number;
  reviews: number;
};

export type Description = {
  id: string;
  language: string;
  text: string;
};

export type Review = {
  id: string;
  userId: string;
  companyId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePictureUrl?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PVPanel = {
  id: string;
  manufacturer: string;
  modelNumber: string;
  description: string;
  nameplateMaxPower: number;
  nameplateShortCircuitCurrent: number;
  nameplateOpenCircuitVoltage: number;
  tempCoeffPmax: number;
  tempCoeffIsc: number;
  tempCoeffVoc: number;
  shortSide: number;
  longSide: number;
  weight: number;
  performanceWarranty: string;
  productWarranty: string;
};

export type Inverter = {
  id: string;
  manufacturerName: string;
  modelNumber: string;
  description: string;
  phaseType: string;
  outputVoltage: number;
  maxContinuousCurrent: number;
  maxContinuousPower: number;
};

export type ProjectData = {
  address: string;
  coordinates: { lat: number; lng: number };
  dcSystemSize: number;
  arrayType: string;
  systemLosses: number;
  tilt: number;
  azimuth: number;
  bifacial: boolean;
  selectedPanelId: string;
  pvPanelQuantity: number;
  selectedInverterId: string;
  inverterQuantity: number;
  mountingType: string;
  roofMaterial: string;
  derivedEquipment: {
    fuses: number;
    dcSurgeProtector: number;
    dcDisconnectSwitches: number;
    acSurgeProtector: number;
    generalDisconnectSwitch: number;
    residualCurrentBreaker: number;
    generalCircuitBreaker: number;
    dcCableLength: number;
    acCableLength: number;
    earthingCableLength: number;
    mc4ConnectorPairs: number;
    splitters: number;
    cableTrayLength: number;
  };
};
