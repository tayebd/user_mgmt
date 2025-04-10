// Test script for technical report generation
import { ReportRequest, ReportResponse } from './models';

const testReportData: ReportRequest = {
    project_name: "Solar PV Technical Analysis",
    project_specs: {
            project: {
                customer: "Leonardo Borji",
                arrayPower: 3045,
                arrayPowerkW: "3,045",
                numberPanels: 7,
                dcCableLength: 10,
                acCableLength_1: 3,
                acCableLength_2: 0.5,
                latitude: 36.8065,
                longitude: 10.1815
            },
            temperature: {
                Tmin: -10,
                Tmax: 85,
                tempDiffCold: -35,
                tempDiffHot: 60
            },
            certifications: {
                panel: {
                    standards: [
                        "IEC61215",
                        "IEC61730",
                        "UL 61730",
                        "ISO9001:2015",
                        "ISO14001:2015",
                        "ISO45001:2018",
                        "TS62941"
                    ],
                    warranty: {
                        product: 12,
                        performance: 30
                    }
                }
            }
        },
    components: {
        ground_cable: {
            maker: "Tunisie câble",
            section: 6
        },
        connector: {
            mc4: {
                maker: "Multi contact",
                model: "MC4"
            }
        },
        distributor: {
            maker: "Multi contact",
            model: "MC4"
        },
        cable_tray: {
            maker: "Multi contact",
            model: "MC4"
        },
        inverter: {
            maker: "Growatt",
            model: "MIN 6000TL-X",
            nominalOutputPower: 5000,
            maxDcVoltage: 500,
            mpptVoltageRangeMin: 80,
            mpptVoltageRangeMax: 500,
            startVoltage: 100,
            maxApparentPower: 5000,
            maxOutputCurrent: 22.7,
            numberOfMpptTrackers: 2,
            maxInputCurrentPerMppt: 13.5,
            maxShortCircuitCurrent: 16.9,
            MPPT_range: "80-500V",
            voltage: 230
        },
        panel: {
            maker: "LONGI SOLAR",
            model: "LR4-72HBD-435M",
            maxPower: 500,
            voltageAtPmax: 38.5,
            currentAtPmax: 17.43,
            openCircuitVoltage: 46.30,
            shortCircuitCurrent: 18.55,
            tempCoeffIsc: 0.048,
            tempCoeffVoc: -0.27,
            tempCoeffPowerPmax: -0.35,
            maxSeriesFuseRating: 35
        },
        dc_protection: {
            fuse: {
                maker: "TOMZN Electric",
                ref_type: "TOM1C-125",
                In: 25,
                Vn: 500
            },
            lightning: {
                maker: "TOMZN Electric",
                ref_type: "TZG40-PV",
                Ucpv: 500,
                Up: "2,5 kV",
                In: 30,
                InUnit: "kVA",
                Iscpv: 20,
                IscpvUnit: "kA"
            },
            switch: {
                maker: "TOMZN Electric",
                ref_type: "TOM7Z-125",
                Isec: 125,
                Usec: 1000
            }
        },
        ac_protection: {
            fuse: {
                maker: "TOMZN Electric",
                ref_type: "TOM2A-125",
                In: 25,
                Vn: 230
            },
            lightning: {
                maker: "TOMZN Electric",
                ref_type: "TZG40-AC",
                Uc: 230,
                Up: "2.5 kV",
                In: 30,
                InUnit: "kVA",
                Isc: 20,
                IscUnit: "kA"
            },
            switch: {
                maker: "TOMZN Electric",
                ref_type: "TOM7C-230",
                Isec: 50,
                Usec: 230
            }
        },
        circuit_breaker: {
            maker: "SIAME",
            model: "SIAME 2x16 30mA"
        },
        dc_cable: {
            maker: "EXTRA CABLE",
            section: 4,
            Iz: 43,
            length: 10,
            installationMethod: "Dans un chemin de câble 30*35",
            referenceMethod: "Tous les autre cas ( lettre E numéro 13 )",
            circuitGrouping: "Un seul circuit dans un chemin de câble",
            layerFactors: "Un seul conducteur de deux couches = 0.8",
            temperatureFactors: "A 25°C = 1,04",
            numberLayers: "Deux couches"
        }
    },
    templates: [
        "equipment",
        "cable_sizing",
        "grounding",
        "calculations",
        "protection"
    ]
};

async function testReportGeneration() {
    try {
        const response = await fetch('http://localhost:8001/generate-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testReportData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: ReportResponse = await response.json();
        console.log("Report Generation Results:");

        if (typeof data === 'object' && data !== null) {
            console.log("Success:", data.success);
            console.log("Message:", data.message);
            
            if (data.success && data.report_content) {
                console.log("\nReport Content Preview (first 500 chars):");
                console.log(data.report_content.substring(0, 500) + "...");
                
                // Save report content to file
                const fs = require('fs');
                fs.writeFileSync('generated_report.md', data.report_content);
                console.log("\nFull report saved to: generated_report.md");
            }
        } else {
            console.error("Invalid response format:", data);
        }
    } catch (error) {
        console.error("Error during report generation:", error instanceof Error ? error.message : String(error));
    }
}

testReportGeneration();
