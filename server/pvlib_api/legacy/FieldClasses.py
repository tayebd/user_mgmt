"""
Minimal FieldClasses module to support loading legacy pickle files.
This is a placeholder module that provides the basic class structure
needed to unpickle .spv files that reference FieldClasses.
"""

class FieldBase:
    """Base class for field objects"""
    def __init__(self, *args, **kwargs):
        pass

class DataDict(FieldBase):
    """Dictionary-like container for simulation data"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.data = {}

    def pop(self, key, default=None):
        return self.data.pop(key, default)

    def __getitem__(self, key):
        return self.data[key]

    def __setitem__(self, key, value):
        self.data[key] = value

    def keys(self):
        return self.data.keys()

    def values(self):
        return self.data.values()

    def items(self):
        return self.data.items()

class PVField(FieldBase):
    """Base class for PV system fields"""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

class SiteField(PVField):
    """Site-specific field data"""
    pass

class PanelField(PVField):
    """Panel-specific field data"""
    pass

class ArrayField(PVField):
    """Array-specific field data"""
    pass

class BatteryField(PVField):
    """Battery-specific field data"""
    pass

class InverterField(PVField):
    """Inverter-specific field data"""
    pass

class LoadField(PVField):
    """Load-specific field data"""
    pass

class ChargeControlField(PVField):
    """Charge control field data"""
    pass

# Export common classes
__all__ = [
    'FieldBase',
    'DataDict',
    'PVField',
    'SiteField',
    'PanelField',
    'ArrayField',
    'BatteryField',
    'InverterField',
    'LoadField',
    'ChargeControlField'
]