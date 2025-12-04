# Python Classes to Prisma Schema Mapping

## PVPanel

| Python Field | Python Type | Prisma Model | Prisma Field | Notes |
|-------------|-------------|--------------|--------------|-------|
| m_mfg | option_field | PVPanel | maker | |
| m_mdl | option_field | PVPanel | model | |
| Name | data_field | PVPanel | description | |
| Technology | data_field | PVPanel | moduleType | |
| T_NOCT | data_field | PVPanel | - | Missing in Prisma (Nominal Operating Cell Temp) |
| V_mp_ref | data_field | PVPanel | voltageAtPmax | |
| I_mp_ref | data_field | PVPanel | currentAtPmax | |
| V_oc_ref | data_field | PVPanel | openCircuitVoltage | |
| I_sc_ref | data_field | PVPanel | shortCircuitCurrent | |
| PTC | data_field | PVPanel | maxPower | |
| A_c | data_field | PVPanel | - | Missing in Prisma (Cell Size) |
| N_s | data_field | PVPanel | - | Missing in Prisma (Number of cells) |
| R_s | data_field | PVPanel | - | Missing in Prisma (Series Resistance) |
| R_sh_ref | data_field | PVPanel | - | Missing in Prisma (Shunt Resistance) |
| BIPV | data_field | PVPanel | - | Missing in Prisma (Building Integrated PV) |
| alpha_sc | data_field | PVPanel | tempCoeffIsc | |
| beta_oc | data_field | PVPanel | tempCoeffVoc | |
| a_ref | data_field | PVPanel | - | Missing in Prisma |
| I_L_ref | data_field | PVPanel | - | Missing in Prisma |
| I_o_ref | data_field | PVPanel | - | Missing in Prisma |
| Adjust | data_field | PVPanel | - | Missing in Prisma |
| gamma_r | data_field | PVPanel | tempCoeffPmax | |

## PVInverter

| Python Field | Python Type | Prisma Model | Prisma Field | Notes |
|-------------|-------------|--------------|--------------|-------|
| i_mfg | option_field | Inverter | maker | |
| i_mdl | option_field | Inverter | model | |
| Name | data_field | Inverter | description | |
| Vac | data_field | Inverter | outputVoltage | |
| Paco | data_field | Inverter | nominalOutputPower | |
| Pdco | data_field | Inverter | maxRecommendedPvPower | |
| Vdco | data_field | Inverter | nominalDcVoltage | |
| Pnt | data_field | Inverter | - | Missing in Prisma (Night Time Power) |
| Vdcmax | data_field | Inverter | maxDcVoltage | |
| Idcmax | data_field | Inverter | maxInputCurrentPerMppt | |
| Mppt_low | data_field | Inverter | mpptVoltageRangeMin | |
| Mppt_high | data_field | Inverter | mpptVoltageRangeMax | |

## PVArray (No Matching Prisma Model)

| Python Field | Python Type | Suggested Prisma Model | Suggested Prisma Field | Notes |
|-------------|-------------|------------------------|------------------------|-------|
| tilt | data_field | PVArray | tiltAngle | Angle in degrees |
| azimuth | data_field | PVArray | azimuthAngle | Angle in degrees |
| mtg_cnfg | option_field | PVArray | mountingConfiguration | |
| mtg_spc | data_field | PVArray | spaceUnderPanel | In centimeters |
| mtg_hgt | data_field | PVArray | mountingHeight | In meters |
| gnd_cnd | option_field | PVArray | groundSurfaceCondition | |
| albedo | data_field | PVArray | albedo | Reflectivity value |
| uis | data_field | PVArray | unitsInSeries | |
| sip | data_field | PVArray | stringsInParallel | |
| ary_Vmp | data_field | PVArray | arrayVmp | |
| ary_Imp | data_field | PVArray | arrayImp | |
| ary_tpnl | data_field | PVArray | totalPanels | |

## PVBattery (No Matching Prisma Model)

| Python Field | Python Type | Suggested Prisma Model | Suggested Prisma Field | Notes |
|-------------|-------------|------------------------|------------------------|-------|
| b_mfg | data_field | Battery | maker | |
| b_mdl | data_field | Battery | model | |
| b_desc | data_field | Battery | description | |
| b_typ | option_field | Battery | batteryType | |
| b_nomv | data_field | Battery | nominalVoltage | In VDC |
| b_rcap | data_field | Battery | ratedCapacity | In Amp-hours |
| b_rhrs | data_field | Battery | hourBasisForRating | |
| b_ir | data_field | Battery | internalResistance | In Ohms |
| b_stdTemp | data_field | Battery | ratedTemperature | In Celsius |
| b_tmpc | data_field | Battery | temperatureCoefficient | In Celsius |
| b_mxDschg | data_field | Battery | maxDischargeCycles | |
| b_mxDoD | data_field | Battery | maxDepthOfDischarge | In percentage |

## PVBatBank (No Matching Prisma Model)

| Python Field | Python Type | Suggested Prisma Model | Suggested Prisma Field | Notes |
|-------------|-------------|------------------------|------------------------|-------|
| doa | data_field | BatteryBank | daysOfAutonomy | |
| doc | data_field | BatteryBank | depthOfDischarge | In percentage |
| bnk_uis | data_field | BatteryBank | unitsInSeries | |
| bnk_sip | data_field | BatteryBank | stringsInParallel | |
| bnk_tbats | data_field | BatteryBank | totalBankBatteries | |
| bnk_cap | data_field | BatteryBank | bankCapacity | In Amp-hours |
| bnk_vo | data_field | BatteryBank | bankVoltage | |

## PVChgControl (No Matching Prisma Model)

| Python Field | Python Type | Suggested Prisma Model | Suggested Prisma Field | Notes |
|-------------|-------------|------------------------|------------------------|-------|
| c_mfg | data_field | ChargeController | maker | |
| c_mdl | data_field | ChargeController | model | |
| Name | data_field | ChargeController | description | |
| c_type | option_field | ChargeController | controllerType | |
| c_pvmxv | data_field | ChargeController | maxPVVoltage | In VDC |
| c_pvmxi | data_field | ChargeController | maxPVCurrent | In Amps |
| c_bvnom | data_field | ChargeController | batteryVoltage | In VDC |
| c_mvchg | data_field | ChargeController | maxChargeVoltage | In VDC |
| c_michg | data_field | ChargeController | maxChargeCurrent | In Amps |
| c_midschg | data_field | ChargeController | maxDischargeCurrent | In Amps |
| c_tmpc | data_field | ChargeController | tempCompensationCoefficient | Per Celsius |
| c_tmpr | data_field | ChargeController | temperatureRating | In Celsius |
| c_cnsmpt | data_field | ChargeController | selfConsumption | In Watts |
| c_eff | data_field | ChargeController | efficiency | In percentage |

## PVSite (No Matching Prisma Model)

| Python Field | Python Type | Suggested Prisma Model | Suggested Prisma Field | Notes |
|-------------|-------------|------------------------|------------------------|-------|
| cntry | option_field | Site | country | |
| proj | data_field | Site | projectName | |
| p_desc | data_field | Site | description | |
| lat | data_field | Site | latitude | |
| lon | data_field | Site | longitude | |
| city | data_field | Site | city | |
| client | data_field | Site | client | |
| elev | data_field | Site | elevation | In meters |
| tz | data_field | Site | timezone | |
| gv | data_field | Site | gridVoltage | In VAC |
| gf | data_field | Site | gridFrequency | In Hz |

## SiteLoad (No Matching Prisma Model)

| Python Field | Python Type | Suggested Prisma Model | Suggested Prisma Field | Notes |
|-------------|-------------|------------------------|------------------------|-------|
| Type | str | Load | loadType | |
| Qty | int | Load | quantity | |
| Use Factor | float | Load | usageFactor | |
| Hours | float | Load | hoursPerDay | |
| Start Hour | int | Load | startHour | |
| Watts | float | Load | wattage | |
| Mode | str | Load | operationMode | |
