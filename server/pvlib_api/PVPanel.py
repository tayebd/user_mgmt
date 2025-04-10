
class PVPanel():
    def __init__(self):
        self.pnlparms = None
        self.m_mfg = ''  # Manufacturer
        self.m_mdl = ''  # Model
        self.Name = ''  # Description
        self.Technology = ''  # Cell Type
        self.T_NOCT = 0.0  # Nominal Operating Cell Temp
        self.V_mp_ref = 0.0  # Voltage at Max Power (Vmp)
        self.I_mp_ref = 0.0  # Current at Max Power (Imp)
        self.V_oc_ref = 0.0  # Open Circuit Voltage (Voc)
        self.I_sc_ref = 0.0  # Short Circuit Current (Isc)
        self.PTC = 0.0  # Power Rating Pmpp (W)
        self.A_c = 0.0  # Cell Size (cm)
        self.N_s = 0  # Number of cells
        self.R_s = 0.0  # Series Resistance (ohms)
        self.R_sh_ref = 0.0  # Shunt Resistance (ohms)
        self.BIPV = 0.0  # BIPV
        self.alpha_sc = 0.0  # alpha_sc
        self.beta_oc = 0.0  # beta_oc
        self.a_ref = 0.0  # a_ref
        self.I_L_ref = 0.0  # I_L_ref
        self.I_o_ref = 0.0  # I_o_ref
        self.Adjust = 0.0  # Adjust
        self.gamma_r = 0.0  # gamma_r

    def __str__(self):
        """String representation of the solar panel"""
        return f"""PV Panel
        Manufacturer: {self.m_mfg}
        Model: {self.m_mdl}
        Description: {self.Name}
        Cell Type: {self.Technology}
        Nominal Operating Cell Temp: {self.T_NOCT} C
        Voltage at Max Power (Vmp): {self.V_mp_ref} V
        Current at Max Power (Imp): {self.I_mp_ref} A
        Open Circuit Voltage (Voc): {self.V_oc_ref} V
        Short Circuit Current (Isc): {self.I_sc_ref} A
        Power Rating Pmpp: {self.PTC} W
        Cell Size: {self.A_c} cm
        Number of cells: {self.N_s}
        Series Resistance: {self.R_s} ohms
        Shunt Resistance: {self.R_sh_ref} ohms
        BIPV: {self.BIPV}
        alpha_sc: {self.alpha_sc}
        beta_oc: {self.beta_oc}
        a_ref: {self.a_ref}
        I_L_ref: {self.I_L_ref}
        I_o_ref: {self.I_o_ref}
        Adjust: {self.Adjust}
        gamma_r: {self.gamma_r}"""
                 
def main():
    print ('PVPanel Definition Check')

if __name__ == '__main__':
    main()
