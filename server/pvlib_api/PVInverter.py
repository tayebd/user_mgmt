class PVInverter():
    """ Methods associated with the definition, display, and operation of an
        Inverter """
    def __init__(self):
        # Inverter parameters
        self.i_mfg = ''  # Manufacturer
        self.i_mdl = ''  # Model
        self.Name = ''  # Description
        self.Vac = 0.0  # AC Voltage (Vac)
        self.Paco = 0.0  # AC Power (Watts)
        self.Pdco = 0.0  # DC Power Panel (Watts)
        self.Vdco = 0.0  # DC Voltage (Vdc)
        self.Pnt = 0.0  # Night Time Power (Watts)
        self.Vdcmax = 0.0  # Max DC Voltage (Vdcmax)
        self.Idcmax = 0.0  # Max DC Current (Idcmax)
        self.Mppt_low = 0.0  # Mppt_low (Vdc)
        self.Mppt_high = 0.0  # Mppt_high (Vdc)

    def __str__(self):
        """String representation of the inverter"""
        return f"""PV Inverter
        Manufacturer: {self.i_mfg}
        Model: {self.i_mdl}
        Description: {self.Name}
        AC Voltage: {self.Vac} Vac
        AC Power: {self.Paco} Watts
        DC Power Panel: {self.Pdco} Watts
        DC Voltage: {self.Vdco} Vdc
        Night Time Power: {self.Pnt} Watts
        Max DC Voltage: {self.Vdcmax} Vdcmax
        Max DC Current: {self.Idcmax} Idcmax
        Mppt_low: {self.Mppt_low} Vdc
        Mppt_high: {self.Mppt_high} Vdc"""
                

    def compute_dc_power(self, ac_load):
        """ Given an required AC_Load, return required input DC
             Power required by Inverter"""
        ie_ref = 0.9637
        if ac_load > 0:
            return (1+ ac_load*((self.Pdco - self.Paco)/self.Paco))/ie_ref
        return 0.0

def main():
    print ('Inverter Definition Check')

if __name__ == '__main__':
    main()
