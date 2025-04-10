

import { MountingHardware } from '@/shared/types';
import { PVProject, PVPanel, Inverter, ProtectionDevice, Wire, ChargeController } from '@/shared/types';

export const pvProject_mockData: PVProject = {

  id: 1001,
  name: "Sunnydale Residential Solar Installation",

    address: "123 Sunshine Ave, Sunnydale, CA 90210",
    latitude: 34.0522,
    longitude: -118.2437,
    timezone: "America/Los_Angeles",
    elevation: 86,
  
  panels: [
    {
      id: 201,
      maker: "SunPower",
      model: "SPR-X22-370",
      description: "Premium high-efficiency monocrystalline panels",
      power: 370,
      shortCircuitCurrent: 6.65,
      openCircuitVoltage: 69.5,
      maxSeriesFuseRating: 15,
      currentAtPmax: 6.02,
      voltageAtPmax: 61.8,
      tempCoeffPmax: -0.29,
      tempCoeffIsc: 0.05,
      tempCoeffVoc: -0.25,
      length: 1690,
      width: 1046,
      height: 40,
      weight: 18.6,
      efficiency: 22.7,
      performanceWarranty: "92% after 25 years",
      productWarranty: "25 years",
      price: 450
    }
  ],
  arrays: [
    {
      panelId: 201,
      quantity: 20,
      tilt: 25,
      azimuth: 180,
      losses: 14,
      racking: "Roof Mount",
      bifacial: false
    }
  ],
  inverters: [
    {
      maker: "SolarEdge",
      model: "SE7600H-US",
      description: "Single phase string inverter with HD-Wave technology",
      phaseType: "Single Phase",
      maxOutputPower: 7600,
      nominalOutputPower: 7600,
      efficiency: 99.2,
      minInputVoltage: 150,
      maxInputVoltage: 480,
      maxInputCurrent: 20,
      minInputCurrent: 1,
      maxOutputCurrent: 32,
      maxShortCircuitCurrent: 45,
      outputVoltage: 240,
      maxStringVoltage: 480,
      maxStringCurrent: 15,
      mpptChannels: 2,
      productWarranty: "12 years",
      price: 1800
    }
  ],
  numberInverters: 1,
  batteryBanks: [
    {
      maker: "Tesla",
      model: "Powerwall 2",
      description: "Integrated battery system for home energy storage",
      capacity: 13.5,
      voltage: 48,
      chemistry: "Lithium-ion",
      cycleLife: 5000,
      dod: 100,
      price: 7500
    }
  ],
  chargeControllers: [
    {
      maker: "Victron Energy",
      model: "SmartSolar MPPT 150/85",
      description: "Solar charge controller with built-in Bluetooth",
      maxInputVoltage: 150,
      maxOutputCurrent: 85,
      maxPvInputPower: 4800,
      price: 720
    }
  ],
  protectionDevices: [
    {
      maker: "ABB",
      refType: "S802PV-S16",
      circuitType: "DC",
      type: "Circuit Breaker",
      ratedCurrent: 16,
      ratedVoltage: 600,
      protectionLevel: "IP20",
      shortCircuitCurrent: 5000
    },
    {
      maker: "Littelfuse",
      refType: "SPXV",
      circuitType: "DC",
      type: "Surge Protector",
      ratedVoltage: 1000,
      protectionLevel: "Type 2",
      nominalDischarge: "20kA"
    }
  ],
  wires: [
    {
      maker: "Southwire",
      type: "PV Wire",
      description: "10 AWG PV Wire 1000V UL4703",
      Iz: 40,
      section: 5.26,
      acFlag: false,
      length: 120,
      price: 1.75
    },
    {
      maker: "General Cable",
      type: "THWN-2",
      description: "8 AWG THWN-2 Copper Wire",
      Iz: 55,
      section: 8.36,
      acFlag: true,
      length: 30,
      price: 1.25
    }
  ],
  mountingHardware: [
    {
      maker: "IronRidge",
      model: "XR100",
      description: "Rail-based roof mounting system",
      type: "Roof Mount",
      material: "Aluminum",
      maxLoad: 4170,
      maxWindSpeed: 180,
      maxSnowLoad: 113,
      warranty: "20 years",
      price: 450
    }
  ],
  status: "Planned"
};

  export const mockInverters: Inverter[] = [
    {
      id: 1,
      maker: "SMA",
      model: "Sunny Boy 5.0",
      phaseType: "Single phase",
      maxOutputPower: 5000,
      nominalOutputPower: 4600,
      efficiency: 97.6,
      minInputVoltage: 125,
      maxInputVoltage: 500,
      maxInputCurrent: 15,
      minInputCurrent: 0.5,
      maxOutputCurrent: 22,
      maxShortCircuitCurrent: 25,
      outputVoltage: 240,
      maxStringVoltage: 600,
      maxStringCurrent: 15,
      mpptChannels: 2,
      productWarranty: "10 years",
      price: 1800,
      description: "High efficiency single-phase inverter ideal for residential installations"
    },
    {
      id: 2,
      maker: "SolarEdge",
      model: "SE7600H-US",
      phaseType: "Single phase",
      maxOutputPower: 7600,
      nominalOutputPower: 7000,
      efficiency: 99.0,
      minInputVoltage: 200,
      maxInputVoltage: 480,
      maxInputCurrent: 20,
      minInputCurrent: 1.0,
      maxOutputCurrent: 32,
      maxShortCircuitCurrent: 45,
      outputVoltage: 240,
      maxStringVoltage: 500,
      maxStringCurrent: 20,
      mpptChannels: 1,
      productWarranty: "12 years",
      price: 2200,
      description: "High-performance single-phase inverter with integrated power optimizer support"
    },
    {
      id: 3,
      maker: "Fronius",
      model: "Primo 6.0-1",
      phaseType: "Single phase",
      maxOutputPower: 6000,
      nominalOutputPower: 5800,
      efficiency: 96.7,
      minInputVoltage: 80,
      maxInputVoltage: 600,
      maxInputCurrent: 18,
      minInputCurrent: 0.85,
      maxOutputCurrent: 26.1,
      maxShortCircuitCurrent: 27,
      outputVoltage: 240,
      maxStringVoltage: 600,
      maxStringCurrent: 18,
      mpptChannels: 2,
      productWarranty: "10 years",
      price: 1900,
      description: "Compact and reliable single-phase string inverter"
    },
    {
      id: 4,
      maker: "ABB",
      model: "UNO-DM-5.0-TL-PLUS",
      phaseType: "Single phase",
      maxOutputPower: 5000,
      nominalOutputPower: 4600,
      efficiency: 96.5,
      minInputVoltage: 90,
      maxInputVoltage: 580,
      maxInputCurrent: 18,
      minInputCurrent: 0.7,
      maxOutputCurrent: 22,
      maxShortCircuitCurrent: 24,
      outputVoltage: 240,
      maxStringVoltage: 600,
      maxStringCurrent: 18,
      mpptChannels: 2,
      productWarranty: "10 years",
      price: 1650,
      description: "Dual MPPT single-phase inverter with integrated Wi-Fi monitoring"
    },
    {
      id: 5,
      maker: "Enphase",
      model: "IQ7+",
      phaseType: "Single phase",
      maxOutputPower: 290,
      nominalOutputPower: 240,
      efficiency: 97.6,
      minInputVoltage: 25,
      maxInputVoltage: 60,
      maxInputCurrent: 12,
      minInputCurrent: 0.2,
      maxOutputCurrent: 1.21,
      maxShortCircuitCurrent: 15,
      outputVoltage: 240,
      maxStringVoltage: 60,
      maxStringCurrent: 12,
      mpptChannels: 1,
      productWarranty: "25 years",
      price: 180,
      description: "Microinverter designed for high-power PV modules"
    },
    {
      id: 6,
      maker: "SMA",
      model: "Sunny Tripower 15000TL",
      phaseType: "Three phase",
      maxOutputPower: 15000,
      nominalOutputPower: 14000,
      efficiency: 98.2,
      minInputVoltage: 150,
      maxInputVoltage: 1000,
      maxInputCurrent: 33,
      minInputCurrent: 0.8,
      maxOutputCurrent: 24,
      maxShortCircuitCurrent: 43,
      outputVoltage: 400,
      maxStringVoltage: 1000,
      maxStringCurrent: 33,
      mpptChannels: 2,
      productWarranty: "10 years",
      price: 3800,
      description: "High-performance three-phase inverter for commercial applications"
    }
  ];

  export const devices: ProtectionDevice[] = [
    {
      id: 1,
      maker: 'Schneider Electric',
      refType: 'MCB',
      circuitType: 'AC',
      type: 'Circuit Breaker',
      ratedCurrent: 32,
      ratedVoltage: 240,
      protectionLevel: 'Type B'
    },
    {
      id: 2,
      maker: 'ABB',
      refType: 'SPD',
      circuitType: 'DC',
      type: 'Surge Protector',
      ratedVoltage: 600,
      protectionLevel: 'Type 2',
      nominalDischarge: '20kA'
    }
  ];

  export const wireData: Wire[] = [
    {
      id: 1,
      maker: 'Southwire',
      type: 'PV Wire',
      description: 'USE-2/RHW-2 photovoltaic wire',
      Iz: 30,
      section: 4,
      acFlag: false,
      length: 100
    },
    {
      id: 2,
      maker: 'General Cable',
      type: 'THWN-2',
      description: 'AC feed wire',
      Iz: 65,
      section: 16,
      acFlag: true,
      length: 50
    }
  ];


  export const chargeControllers: ChargeController[] = [
    {
      id: 1,
      maker: 'Victron Energy',
      model: 'SmartSolar MPPT 100/50',
      maxInputVoltage: 100,
      maxOutputCurrent: 50,
      maxPvInputPower: 1400
    },
    {
      id: 2,
      maker: 'Morningstar',
      model: 'TriStar MPPT 60A',
      maxInputVoltage: 150,
      maxOutputCurrent: 60,
      maxPvInputPower: 3200
    }
  ];

  export const mountingHardware: MountingHardware[] = [
    {
      id: 1,
      maker: "IronRidge",
      model: "XR100",
      description: "Heavy-duty rail system for residential and commercial roofs",
      type: "Roof mounted",
      maxWindSpeed: 140,
      maxSnowLoad: 50,
      maxLoad: 50,
      material: "Aluminum",
      warranty: "20 years",
      price: 25 // price per panel
    },
    {
      id: 2,
      maker: "SnapNrack",
      model: "Series 100",
      description: "Sleek, low-profile racking system for residential installations",
      type: "Roof mounted",
      maxWindSpeed: 120,
      maxSnowLoad: 40,
      maxLoad: 40,
      material: "Aluminum",
      warranty: "20 years",
      price: 22 // price per panel
    },
    {
      id: 3,
      maker: "SnapNrack",
      type: "Ground mounted",
      model: "RBI Solar Ground Mount",
      description: "Heavy-duty ground mount system for commercial installations",
      maxWindSpeed: 160,
      maxSnowLoad: 60,
      maxLoad: 60,
      material: "Galvanized steel",
      warranty: "25 years",
      price: 35 // price per panel
    },
    {
      id: 4,
      maker: "Unirac",
      model: "Ground Mount",
      type: "Ground Mount",
      description: "Adjustable ground mount system for residential and small commercial",
      maxWindSpeed: 130,
      maxSnowLoad: 45,
      maxLoad: 45,
      material: "Aluminum and steel",
      warranty: "20 years",
      price: 30 // price per panel
    },
    {
      id: 5,
      type: "Flat roof",
      maker: "Unirac",
      model: "RM10",
      description: "Ballasted racking system for flat roofs, angle 10°",
      maxWindSpeed: 110,
      maxSnowLoad: 30,
      maxLoad: 30,
      material: "Aluminum",
      warranty: "20 years",
      price: 28 // price per panel
    },
    {
      id: 6,
      type: "Flat roof",
      maker: "SunModo",
      model: "EZ Ballasted",
      description: "Low-profile ballasted system with minimal roof penetration, adjustable",
      maxWindSpeed: 100,
      maxSnowLoad: 25,
      maxLoad: 25,
      material: "Aluminum",
      warranty: "20 years",
      price: 26 // price per panel
    }
  ];

  export const samplePanels: PVPanel[] = [
    {
      id: 1,
      maker: "SunPower",
      model: "Maxeon 5",
      power: 400,
      shortCircuitCurrent: 6.65,
      openCircuitVoltage: 75.6,
      maxSeriesFuseRating: 20,
      currentAtPmax: 6.09,
      voltageAtPmax: 65.7,
      tempCoeffPmax: -0.29,
      tempCoeffIsc: 0.05,
      tempCoeffVoc: -0.236,
      length: 1690,
      width: 1046,
      height: 40,
      weight: 19,
      efficiency: 22.6,
      performanceWarranty: "25 years",
      productWarranty: "25 years",
      price: 450
    },
    {
      id: 2,
      maker: "LG",
      model: "NeON R",
      power: 380,
      shortCircuitCurrent: 10.8,
      openCircuitVoltage: 42.8,
      maxSeriesFuseRating: 20,
      currentAtPmax: 10.1,
      voltageAtPmax: 37.6,
      tempCoeffPmax: -0.3,
      tempCoeffIsc: 0.04,
      tempCoeffVoc: -0.24,
      length: 1700,
      width: 1016,
      height: 40,
      weight: 17.5,
      efficiency: 22.0,
      performanceWarranty: "25 years",
      productWarranty: "25 years",
      price: 420
    },
    {
      id: 3,
      maker: "Canadian Solar",
      model: "HiKu6",
      power: 445,
      shortCircuitCurrent: 11.5,
      openCircuitVoltage: 49.5,
      maxSeriesFuseRating: 20,
      currentAtPmax: 10.97,
      voltageAtPmax: 40.6,
      tempCoeffPmax: -0.34,
      tempCoeffIsc: 0.05,
      tempCoeffVoc: -0.26,
      length: 2108,
      width: 1048,
      height: 40,
      weight: 24.9,
      efficiency: 20.1,
      performanceWarranty: "25 years",
      productWarranty: "12 years",
      price: 330
    },
    {
      id: 4,
      maker: "Jinko Solar",
      model: "Tiger Pro",
      power: 530,
      shortCircuitCurrent: 13.85,
      openCircuitVoltage: 49.5,
      maxSeriesFuseRating: 25,
      currentAtPmax: 13.11,
      voltageAtPmax: 40.45,
      tempCoeffPmax: -0.35,
      tempCoeffIsc: 0.048,
      tempCoeffVoc: -0.28,
      length: 2274,
      width: 1134,
      height: 35,
      weight: 27.5,
      efficiency: 20.7,
      performanceWarranty: "25 years",
      productWarranty: "15 years",
      price: 360
    }
  ];

 
