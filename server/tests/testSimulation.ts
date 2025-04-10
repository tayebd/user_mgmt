// Using native fetch instead of axios
import {
    SimulationRequest,
    SiteParameters,
    BatteryParameters,
    PanelParameters,
    ArrayParameters,
    BankParameters,
    InverterParameters,
    ChargeControllerParameters,
    LoadProfile,
    SimulationResponse
} from '../pvlib_api/mapTsToPython';

const testRequestData: SimulationRequest = {
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

async function testSimulate() {
    try {
        const response = await fetch('http://localhost:8001/simulate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testRequestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SimulationResponse = await response.json();
        console.log("Simulation Results:");

        // Type guard to ensure proper response structure
        if (typeof data === 'object' && data !== null) {
            
            console.log("Success:", data.success);
            console.log("Message:", data.message);
            
            if (data.success) {
                console.log("\nMonthly Performance:");
                if (data.monthly_performance) {
                    console.log(JSON.stringify(data.monthly_performance, null, 2));
                } else {
                    console.log("No monthly performance data");
                }
                
                console.log("\nPower Flow Data (first 10 entries):");
                if (data.power_flow?.data) {
                    console.log(JSON.stringify(data.power_flow.data.slice(0, 10), null, 2));
                } else {
                    console.log("No power flow data");
                }
                
                console.log("\nService Percentage:", data.service_percentage ?? "N/A");
            }
        } else {
            console.error("Invalid response format:", data);
        }
    } catch (error) {
        console.error("Error during simulation:", error instanceof Error ? error.message : String(error));
    }
}

testSimulate();
