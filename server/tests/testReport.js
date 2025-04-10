"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var testReportData = {
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
function testReportGeneration() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, fs, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('http://localhost:8001/generate-report', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(testReportData)
                        })];
                case 1:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _a.sent();
                    console.log("Report Generation Results:");
                    if (typeof data === 'object' && data !== null) {
                        console.log("Success:", data.success);
                        console.log("Message:", data.message);
                        if (data.success && data.report_content) {
                            console.log("\nReport Content Preview (first 500 chars):");
                            console.log(data.report_content.substring(0, 500) + "...");
                            fs = require('fs');
                            fs.writeFileSync('generated_report.md', data.report_content);
                            console.log("\nFull report saved to: generated_report.md");
                        }
                    }
                    else {
                        console.error("Invalid response format:", data);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error during report generation:", error_1 instanceof Error ? error_1.message : String(error_1));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
testReportGeneration();
