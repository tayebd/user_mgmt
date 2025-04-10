
class PVChgControl():
    """ Methods associated with battery definition, display, and operation """

    def __init__(self):
       # Charge controller parameters
        self.c_mfg = ''  # Manufacturer
        self.c_mdl = ''  # Model
        self.Name = ''  # Description
        self.c_type = ''  # Type
        self.c_pvmxv = 0.0  # Max PV Voltage (Vdc)
        self.c_pvmxi = 0.0  # Max PV Current (A)
        self.c_bvnom = 0.0  # Bat Volts (Vdc)
        self.c_mvchg = 0.0  # Max Chg Volts (Vdc)
        self.c_michg = 0.0  # Max Chg Current (A)
        self.c_midschg = 0.0  # Max Dischg Current (A)
        self.c_tmpc = 0.0  # Temp Compensation Coefficient (/C)
        self.c_tmpr = 25.0  # Temp Rating (C)
        self.c_cnsmpt = 0.0  # Self Consumption (W)
        self.c_eff = 90.0  # Efficiency (%)

    def __str__(self):
        """String representation of the charge controller"""
        return f"""PV Charge Controller
        Manufacturer: {self.c_mfg}
        Model: {self.c_mdl}
        Description: {self.Name}
        Type: {self.c_type}
        Max PV Voltage: {self.c_pvmxv} Vdc
        Max PV Current: {self.c_pvmxi} A
        Bat Volts: {self.c_bvnom} Vdc
        Max Chg Volts: {self.c_mvchg} Vdc
        Max Chg Current: {self.c_michg} A
        Max Dischg Current: {self.c_midschg} A
        Temp Compensation Coefficient: {self.c_tmpc} /C
        Temp Rating: {self.c_tmpr} C
        Self Consumption: {self.c_cnsmpt} W
        Efficiency: {self.c_eff}%"""
                

def main():
    print('PVChgControl.Py check complete')

if __name__ == '__main__':
    main()
