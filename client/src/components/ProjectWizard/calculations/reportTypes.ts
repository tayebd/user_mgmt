import type { PVPanel, Inverter, Wire } from '@/shared/types';

export interface ProjectSpecs {
    arrayPowerkW: number;
    customer: string;
    latitude: number;
    longitude: number;
    numberPanels: number;
    numberInverters?: number;
    reference: string;
    dcCableLength?: number;
    acCableLength_1?: number;
    acCableLength_2?: number;
    certifications?: {
        panel: {
            standards: string[];
            warranty: {
                product: string;
                performance: string;
                type: string;
            };
        };
    };
}

export interface ArrayConfig {
    Voc_10: number;
    Vmp_10: number;
    Vmp_85: number;
    Isc_85: number;
    Imp_85: number;
    Nsmax: number;
    Nsoptimal: number;
    Npoptimal: number;
    Nsmin: number;
    Npmax: number;
    power_ratio: number;
    array_power: number;
    is_compatible: boolean;
    Nsmax_calc?: number;
    Nsoptimal_calc?: number;
    Nsmin_calc?: number;
    Npmax_calc?: number;
    Npoptimal_calc?: number;
}

export interface ProtectionCalc {
    fuse_Vocmax_val: number;
    fuse_IscSTC: number;
    switch_IscSTC: number;
    Vocmax: number;
    Iscmax: number;
    Ncmax_lmt: number;
    Npmax_lmt: number;
}

export interface CableSizing {
    Iz: number;
    section: number;
    length: number;
    Iz_prime_80C: number;
    Iz_prime_50C: number;
    Iz_prime_25C: number;
    delta_u: number;
    delta_u_perc: number;
}

export interface ReportContext {
    project: ProjectSpecs;
    panel: PVPanel;
    inverter: Inverter;
    dc_protection: ProtectionCalc;
    ac_protection: ProtectionCalc;
    dc_cable: Wire;
    ac_cable: Wire;
    array: ArrayConfig;
    protection: ProtectionCalc;
    dc_cable_sizing: CableSizing;
    ac1_cable_sizing: CableSizing;
    ac2_cable_sizing: CableSizing;
  }