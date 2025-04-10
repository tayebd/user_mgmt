// TypeScript interfaces for report generation

export interface ReportRequest {
    project_name: string;
    project_specs: {
        project: {
                customer: string;
                arrayPower: number;
                arrayPowerkW: string;
                numberPanels: number;
                dcCableLength: number;
                acCableLength_1: number;
                acCableLength_2: number;
                latitude: number;
                longitude: number;
            };
            temperature: {
                Tmin: number;
                Tmax: number;
                tempDiffCold: number;
                tempDiffHot: number;
            };
            certifications: {
                panel: {
                    standards: string[];
                    warranty: {
                        product: number;
                        performance: number;
                    };
                };
            };
        };
    components: {
        ground_cable: {
            maker: string;
            section: number;
        };
        connector: {
            mc4: {
                maker: string;
                model: string;
            };
        };
        distributor: {
            maker: string;
            model: string;
        };
        cable_tray: {
            maker: string;
            model: string;
        };
        inverter: {
            maker: string;
            model: string;
            nominalOutputPower: number;
            maxDcVoltage: number;
            mpptVoltageRangeMin: number;
            mpptVoltageRangeMax: number;
            startVoltage: number;
            maxApparentPower: number;
            maxOutputCurrent: number;
            numberOfMpptTrackers: number;
            maxInputCurrentPerMppt: number;
            maxShortCircuitCurrent: number;
            MPPT_range: string;
            voltage: number;
        };
        panel: {
            maker: string;
            model: string;
            maxPower: number;
            voltageAtPmax: number;
            currentAtPmax: number;
            openCircuitVoltage: number;
            shortCircuitCurrent: number;
            tempCoeffIsc: number;
            tempCoeffVoc: number;
            tempCoeffPowerPmax: number;
            maxSeriesFuseRating: number;
        };
        dc_protection: {
            fuse: {
                maker: string;
                ref_type: string;
                In: number;
                Vn: number;
            };
            lightning: {
                maker: string;
                ref_type: string;
                Ucpv: number;
                Up: string;
                In: number;
                InUnit: string;
                Iscpv: number;
                IscpvUnit: string;
            };
            switch: {
                maker: string;
                ref_type: string;
                Isec: number;
                Usec: number;
            };
        };
        ac_protection: {
            fuse: {
                maker: string;
                ref_type: string;
                In: number;
                Vn: number;
            };
            lightning: {
                maker: string;
                ref_type: string;
                Uc: number;
                Up: string;
                In: number;
                InUnit: string;
                Isc: number;
                IscUnit: string;
            };
            switch: {
                maker: string;
                ref_type: string;
                Isec: number;
                Usec: number;
            };
        };
        circuit_breaker: {
            maker: string;
            model: string;
        };
        dc_cable: {
            maker: string;
            section: number;
            Iz: number;
            length: number;
            installationMethod: string;
            referenceMethod: string;
            circuitGrouping: string;
            layerFactors: string;
            temperatureFactors: string;
            numberLayers: string;
        };
    };
    templates?: string[];
    calculation_results?: Record<string, any>;
}

export interface ReportResponse {
    success: boolean;
    message: string;
    report_content?: string;
    error?: string;
}
