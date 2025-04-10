
class PVBattery():
    """ Methods associated with battery definition, display, and operation """

    def __init__(self):
        # Battery parameters
        self.b_mfg = ''  # Manufacturer
        self.b_mdl = ''  # Model
        self.b_desc = ''  # Description
        self.b_typ = ''  # Type
        self.b_nomv = 0.0  # Nominal Voltage (VDC)
        self.b_rcap = 0.0  # Rated Capacity (AH)
        self.b_rhrs = 100  # Hour Basis for Rating
        self.b_ir = 0.0  # Internal Resistance (Ohms)
        self.b_stdTemp = 25.0  # Rated temperature (C)
        self.b_tmpc = 0.0  # Temp Coefficient (C)
        self.b_mxDschg = 1000  # Max No. of Discharge Cycles
        self.b_mxDoD = 50.0  # Depth of Discharge % for Max Lifecycle

    def __str__(self):
        """String representation of the battery"""
        return f"""PV Battery
        Manufacturer: {self.b_mfg}
        Model: {self.b_mdl}
        Description: {self.b_desc}
        Type: {self.b_typ}
        Nominal Voltage: {self.b_nomv} VDC
        Rated Capacity: {self.b_rcap} AH
        Hour Basis for Rating: {self.b_rhrs}
        Internal Resistance: {self.b_ir} Ohms
        Rated Temperature: {self.b_stdTemp} C
        Temp Coefficient: {self.b_tmpc} C
        Max No. of Discharge Cycles: {self.b_mxDschg}
        Depth of Discharge % for Max Lifecycle: {self.b_mxDoD}%"""
                
                 
def main():
    print('PVBattery.py Load Check')    
    
if __name__ == '__main__':
    main()            