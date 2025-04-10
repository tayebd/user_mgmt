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
var testRequestData = {
    site: {
        cntry: "USA",
        lat: 37.7749,
        lon: -122.4194,
        elev: 10.0,
        tz: "UTC"
    },
    battery: {
        b_typ: "LITHIUM",
        b_nomv: 3.7,
        b_rcap: 100.0,
        b_rhrs: 1.0,
        b_ir: 0.01,
        b_stdTemp: 25.0,
        b_tmpc: 0.0,
        b_mxDschg: 1000.0,
        b_mxDoD: 80.0
    },
    panel: {
        Technology: "Mono-Si",
        T_NOCT: 45.0,
        V_mp_ref: 24.0,
        I_mp_ref: 15.0,
        V_oc_ref: 30.0,
        I_sc_ref: 5.5,
        PTC: 120.0,
        A_c: 1.6,
        N_s: 60,
        R_s: 0.5,
        R_sh_ref: 100.0,
        BIPV: 0,
        alpha_sc: 0.05,
        beta_oc: -0.3,
        a_ref: 1.0,
        I_L_ref: 5.5,
        I_o_ref: 0.0001,
        Adjust: 1.0,
        gamma_r: -0.4
    },
    array: {
        tilt: 30.0,
        azimuth: 180.0,
        mtg_cnfg: "open_rack_cell_polymerback",
        mtg_spc: 10.0,
        mtg_hgt: 1.5,
        gnd_cnd: "Concrete",
        albedo: 0.2,
        uis: 1,
        sip: 1,
        ary_Vmp: 24.0,
        ary_Imp: 15.0,
        ary_tpnl: 1
    },
    // secondary_array: None,
    bank: {
        doa: 3,
        doc: 80.0,
        bnk_uis: 1,
        bnk_sip: 1,
        bnk_tbats: 1,
        bnk_cap: 1000.0,
        bnk_vo: 48.0
    },
    inverter: {
        Vac: 240.0,
        Paco: 4000.0,
        Pdco: 4000.0,
        Vdco: 600.0,
        Pnt: 0.0,
        Vdcmax: 1000.0,
        Idcmax: 10.0,
        Mppt_low: 300.0,
        Mppt_high: 600.0
    },
    charge_controller: {
        c_type: "MPPT",
        c_pvmxv: 60.0,
        c_pvmxi: 10.0,
        c_bvnom: 48.0,
        c_mvchg: 56.0,
        c_michg: 10.0,
        c_midschg: 10.0,
        c_tmpc: 0.0,
        c_tmpr: 25.0,
        c_cnsmpt: 0.0,
        c_eff: 95.0
    },
    load_profile: {
        Type: "Residential",
        Qty: 1,
        Use_Factor: 1.0,
        Hours: 24.0,
        Start_Hour: 0,
        Watts: 500.0,
        Mode: "AC"
    }
};
function testSimulate() {
    return __awaiter(this, void 0, void 0, function () {
        var response, data, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch('http://localhost:8001/simulate', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(testRequestData)
                        })];
                case 1:
                    response = _c.sent();
                    if (!response.ok) {
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 2:
                    data = _c.sent();
                    console.log("Simulation Results:");
                    // Type guard to ensure proper response structure
                    if (typeof data === 'object' && data !== null) {
                        console.log("Success:", data.success);
                        console.log("Message:", data.message);
                        if (data.success) {
                            console.log("\nMonthly Performance:");
                            if (data.monthly_performance) {
                                console.log(JSON.stringify(data.monthly_performance, null, 2));
                            }
                            else {
                                console.log("No monthly performance data");
                            }
                            console.log("\nPower Flow Data (first 10 entries):");
                            if ((_a = data.power_flow) === null || _a === void 0 ? void 0 : _a.data) {
                                console.log(JSON.stringify(data.power_flow.data.slice(0, 10), null, 2));
                            }
                            else {
                                console.log("No power flow data");
                            }
                            console.log("\nService Percentage:", (_b = data.service_percentage) !== null && _b !== void 0 ? _b : "N/A");
                        }
                    }
                    else {
                        console.error("Invalid response format:", data);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _c.sent();
                    console.error("Error during simulation:", error_1 instanceof Error ? error_1.message : String(error_1));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
testSimulate();
