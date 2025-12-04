"""
Solar Panel Parser with Pattern Matching

Translates TypeScript parser logic to Python with regex-based pattern matching
for extracting parameters from PDF datasheets.
"""

import re
from typing import Dict, List, Optional, Tuple
from abc import ABC, abstractmethod
from models import PVPanelData
import logging

logger = logging.getLogger(__name__)


class PanelParser(ABC):
    """Abstract base class for panel parsers"""

    def __init__(self, maker: str):
        self.maker = maker

    @abstractmethod
    def parse(self, text: str, tables: List[Dict]) -> PVPanelData:
        """Parse text and tables to extract panel data"""
        pass

    def parse_number(self, value: Optional[str]) -> Optional[float]:
        """Parse numeric value from string"""
        if not value:
            return None

        # Remove any non-numeric characters except decimal point, minus sign, and common units
        clean_value = re.sub(r'[^\d.-]', '', str(value))

        if not clean_value or clean_value == '-' or clean_value == '.':
            return None

        try:
            return float(clean_value)
        except ValueError:
            logger.warning(f"Could not parse number from value: {value}")
            return None

    def parse_percentage(self, value: Optional[str]) -> Optional[float]:
        """Parse percentage value from string (returns as decimal)"""
        if not value:
            return None

        # Remove % sign and convert to decimal
        clean_value = re.sub(r'%', '', str(value)).strip()

        try:
            parsed = float(clean_value)
            return parsed  # Keep as percentage value (not decimal)
        except ValueError:
            return None

    def extract_from_text(self, text: str, patterns: List[str]) -> Optional[str]:
        """Extract value using list of regex patterns"""
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                return match.group(1).strip()
        return None

    def extract_number_from_text(self, text: str, patterns: List[str]) -> Optional[float]:
        """Extract numeric value using regex patterns"""
        value_str = self.extract_from_text(text, patterns)
        return self.parse_number(value_str)


class QCellsParser(PanelParser):
    """Parser for Q CELLS datasheets"""

    def __init__(self):
        super().__init__("Q CELLS")

        # Pattern definitions for Q CELLS
        self.patterns = {
            'model': [
                r'Q\.PEAK\s+([A-Z0-9.-]+\s*\d+(?:\.\d+)?)',
                r'Model\s*[=:]\s*([A-Z0-9.-]+\s*\d+(?:\.\d+)?)',
                r'Product\s+Code\s*[=:]\s*([A-Z0-9.-]+\s*\d+(?:\.\d+)?)',
                r'(Q\.PEAK\s+DUO\s+L-G5\.2)'
            ],
            'max_power': [
                r'Q\.PEAK\s+.*?(\d{3,4})\s*W',
                r'POWER\s+CLASS.*?(\d{3})\s+(\d{3})\s+(\d{3})\s+(\d{3})\s+(\d{3})\s+(\d{3})',
                r'Power\s+at\s+MPP.*?(\d{3,4})\s*W',
                r'Rated\s+Power\s*[=:]\s*(\d{3,4})\s*W',
                r'Pmax\s*[=:]\s*(\d{3,4})\s*W',
                r'Maximum\s+Power\s*[=:]\s*(\d{3,4})\s*W',
                r'Power\s+Rating\s*[=:]\s*(\d{3,4})\s*W'
            ],
            'efficiency': [
                r'Module\s+Efficiency\s*[=:]\s*(\d{2}\.?\d*)\s*%',
                r'η\s*[=:]\s*(\d{2}\.?\d*)\s*%',
                r'Efficiency\s*[=:]\s*(\d{2}\.?\d*)\s*%',
                r'Efficiency1\s+η\s*\[\%\]\s*≥?\s*(\d{2}\.?\d*)',
                r'(\d{2}\.?\d*)\s*%\s*≥\s*\d{2}\.?\d*\s*%\s*≥\s*\d{2}\.?\d*\s*%'
            ],
            'voc': [
                r'Voc\s*[=:]\s*(\d+\.?\d*)\s*V',
                r'Open\s+Circuit\s+Voltage\s*[=:]\s*(\d+\.?\d*)\s*V',
                r'Uoc\s*[=:]\s*(\d+\.?\d*)\s*V',
                r'Open\s+Circuit\s+Voltage1?\s*V\s*\[V\]\s*(\d+\.?\d*)',
                r'OC.*?V\s*\[V\]\s*(\d+\.?\d*)'
            ],
            'isc': [
                r'Isc\s*[=:]\s*(\d+\.?\d*)\s*A',
                r'Short\s+Circuit\s+Current\s*[=:]\s*(\d+\.?\d*)\s*A',
                r'Short\s+Circuit\s+Current1?\s*.*?\[A\]\s*(\d+\.?\d*)',
                r'\[A\]\s*(\d+\.?\d*)'
            ],
            'vmp': [
                r'Vmp\s*[=:]\s*(\d+\.?\d*)\s*V',
                r'Maximum\s+Power\s+Voltage\s*[=:]\s*(\d+\.?\d*)\s*V',
                r'Voltage\s+at\s+MPP1?\s*.*?\[V\]\s*(\d+\.?\d*)',
                r'\[V\]\s*(\d+\.?\d*)'
            ],
            'imp': [
                r'Imp\s*[=:]\s*(\d{2}\.?\d*)\s*A',
                r'Maximum\s+Power\s+Current\s*[=:]\s*(\d{2}\.?\d*)\s*A',
                r'Current\s+at\s+MPP.*?\[A\]\s*(\d+\.\d+)'
            ],
            'temp_coeff_pmax': [
                r'γ\s*\(\s*Pmax\s*\)\s*[=:]\s*(-?\d+\.?\d*)\s*%/K',
                r'Temperature\s+Coefficient\s+of\s+Pmax\s*[=:]\s*(-?\d+\.?\d*)\s*%/K',
                r'γPmax\s*[=:]\s*(-?\d+\.?\d*)\s*%/K'
            ],
            'temp_coeff_voc': [
                r'γ\s*\(\s*Voc\s*\)\s*[=:]\s*(-?\d+\.?\d*)\s*%/K',
                r'Temperature\s+Coefficient\s+of\s+Voc\s*[=:]\s*(-?\d+\.?\d*)\s*%/K'
            ],
            'temp_coeff_isc': [
                r'γ\s*\(\s*Isc\s*\)\s*[=:]\s*(-?\d+\.?\d*)\s*%/K',
                r'Temperature\s+Coefficient\s+of\s+Isc\s*[=:]\s*(-?\d+\.?\d*)\s*%/K'
            ],
            'dimensions': [
                r'(\d{4})\s*[×x]\s*(\d{4})\s*mm',
                r'(\d{3,4})\s*[×x]\s*(\d{3,4})\s*mm',
                r'Dimensions\s*[=:]\s*(\d{4})\s*[×x]\s*(\d{4})\s*mm'
            ],
            'weight': [
                r'Weight\s*[=:]\s*(\d{2}\.?\d*)\s*kg',
                r'(\d{2}\.?\d*)\s*kg\s*\d{4}\s*[×x]\s*\d{4}'
            ],
            'warranty_product': [
                r'Product\s+Warranty\s*[=:]\s*(\d+)\s*years?',
                r'Limited\s+Product\s+Warranty\s*[=:]\s*(\d+)\s*years?'
            ],
            'warranty_performance': [
                r'Performance\s+Warranty\s*[=:]\s*(\d+)\s*years?',
                r'Limited\s+Performance\s+Warranty\s*[=:]\s*(\d+)\s*years?'
            ],
            'certification': [
                r'(IEC\s+\d+/\s*IEC\s+\d+)',
                r'(IEC\s+\d+)',
                r'(UL\s+\d+)'
            ]
        }

    def parse(self, text: str, tables: List[Dict]) -> PVPanelData:
        """Parse Q CELLS datasheet"""

        # Extract model
        model = self.extract_from_text(text, self.patterns['model'])
        if not model:
            model = "Unknown Model"

        # Extract max power - try multiple patterns including table format
        max_power = None
        # First try the POWER CLASS table format
        power_class_match = re.search(r'POWER\s+CLASS.*?(\d{3})\s+(\d{3})\s+(\d{3})\s+(\d{3})\s+(\d{3})\s+(\d{3})', text)
        if power_class_match:
            # Take the highest power value (last one in the series)
            powers = [int(power_class_match.group(i)) for i in range(1, 7)]
            max_power = max(powers)
        else:
            # Try other patterns
            max_power = self.extract_number_from_text(text, self.patterns['max_power'])

        # Extract efficiency - handle table format
        efficiency = None
        # Try to extract from efficiency table
        efficiency_match = re.search(r'Efficiency1\s+η\s*\[\%\]\s*(?:≥\s*)?(\d{2}\.?\d*)', text)
        if efficiency_match:
            efficiency = float(efficiency_match.group(1))
        else:
            # Try other patterns
            efficiency = self.extract_number_from_text(text, self.patterns['efficiency'])

        voc = self.extract_number_from_text(text, self.patterns['voc'])
        isc = self.extract_number_from_text(text, self.patterns['isc'])
        vmp = self.extract_number_from_text(text, self.patterns['vmp'])
        imp = self.extract_number_from_text(text, self.patterns['imp'])
        temp_coeff_pmax = self.extract_number_from_text(text, self.patterns['temp_coeff_pmax'])
        temp_coeff_voc = self.extract_number_from_text(text, self.patterns['temp_coeff_voc'])
        temp_coeff_isc = self.extract_number_from_text(text, self.patterns['temp_coeff_isc'])

        # Extract dimensions
        short_side = None
        long_side = None
        dim_match = self.extract_from_text(text, self.patterns['dimensions'])
        if dim_match:
            # Try to match the dimension pattern
            dim_pattern = self.patterns['dimensions'][0]
            match = re.search(dim_pattern, text)
            if match:
                long_side = self.parse_number(match.group(1))
                short_side = self.parse_number(match.group(2))
                # Convert mm to m
                if long_side:
                    long_side = long_side / 1000
                if short_side:
                    short_side = short_side / 1000

        # Extract weight
        weight = self.extract_number_from_text(text, self.patterns['weight'])

        # Extract warranties
        product_warranty = self.extract_from_text(text, self.patterns['warranty_product'])
        if product_warranty:
            product_warranty = f"{product_warranty} years"

        performance_warranty = self.extract_from_text(text, self.patterns['warranty_performance'])
        if performance_warranty:
            performance_warranty = f"{performance_warranty} years"

        # Extract certification
        certification = self.extract_from_text(text, self.patterns['certification'])

        # Build panel data
        panel_data = PVPanelData(
            maker=self.maker,
            model=model,
            description=f"{self.maker} {model} Solar Panel",
            maxPower=max_power,
            efficiency=efficiency,
            openCircuitVoltage=voc,
            shortCircuitCurrent=isc,
            voltageAtPmax=vmp,
            currentAtPmax=imp,
            tempCoeffPmax=temp_coeff_pmax,
            tempCoeffVoc=temp_coeff_voc,
            tempCoeffIsc=temp_coeff_isc,
            shortSide=short_side,
            longSide=long_side,
            weight=weight,
            moduleType="Monocrystalline",
            productWarranty=product_warranty,
            performanceWarranty=performance_warranty,
            certification=certification
        )

        return panel_data


class GenericParser(PanelParser):
    """Generic parser for unknown manufacturers"""

    def __init__(self):
        super().__init__("Unknown Manufacturer")

        # Generic patterns that might work for multiple manufacturers
        self.patterns = {
            'max_power': [
                r'(\d{3,4})\s*W\s*Pmax',
                r'Power\s*[=:]\s*(\d{3,4})\s*W',
                r'Pmax\s*[=:]\s*(\d{3,4})\s*W'
            ],
            'efficiency': [
                r'Efficiency\s*[=:]\s*(\d{2}\.?\d*)\s*%',
                r'η\s*[=:]\s*(\d{2}\.?\d*)\s*%'
            ],
            'voc': [
                r'Voc\s*[=:]\s*(\d{2}\.?\d*)\s*V',
                r'Open\s+Circuit\s+Voltage\s*[=:]\s*(\d{2}\.?\d*)\s*V'
            ],
            'isc': [
                r'Isc\s*[=:]\s*(\d{2}\.?\d*)\s*A',
                r'Short\s+Circuit\s+Current\s*[=:]\s*(\d{2}\.?\d*)\s*A'
            ]
        }

    def parse(self, text: str, tables: List[Dict]) -> PVPanelData:
        """Parse using generic patterns"""
        max_power = self.extract_number_from_text(text, self.patterns['max_power'])
        efficiency = self.extract_number_from_text(text, self.patterns['efficiency'])
        voc = self.extract_number_from_text(text, self.patterns['voc'])
        isc = self.extract_number_from_text(text, self.patterns['isc'])

        return PVPanelData(
            maker=self.maker,
            model="Unknown Model",
            maxPower=max_power,
            efficiency=efficiency,
            openCircuitVoltage=voc,
            shortCircuitCurrent=isc
        )


class ParserFactory:
    """Factory for creating appropriate parser based on manufacturer"""

    @staticmethod
    def create_parser(manufacturer: Optional[str] = None, pdf_text: str = "") -> PanelParser:
        """Create appropriate parser instance"""

        # If manufacturer is specified, use it
        if manufacturer:
            manufacturer_upper = manufacturer.upper()

            if 'Q' in manufacturer_upper or 'QCELLS' in manufacturer_upper:
                return QCellsParser()
            elif 'JINKO' in manufacturer_upper:
                return JinkoSolarParser()
            elif 'CANADIAN' in manufacturer_upper:
                return CanadianSolarParser()
            elif 'JA' in manufacturer_upper:
                return JASolarParser()

        # Try to detect from PDF text
        pdf_text_upper = pdf_text.upper()

        if 'Q CELLS' in pdf_text_upper or 'Q.PEAK' in pdf_text_upper:
            return QCellsParser()
        elif 'JINKO' in pdf_text_upper:
            return JinkoSolarParser()
        elif 'CANADIAN SOLAR' in pdf_text_upper:
            return CanadianSolarParser()
        elif 'JA SOLAR' in pdf_text_upper or 'JASOLAR' in pdf_text_upper:
            return JASolarParser()

        # Default to generic parser
        return GenericParser()


# Placeholder parsers for other manufacturers (can be expanded)
class JinkoSolarParser(PanelParser):
    def __init__(self):
        super().__init__("JinkoSolar")

    def parse(self, text: str, tables: List[Dict]) -> PVPanelData:
        # Implementation similar to QCellsParser
        # Would extract Jinko-specific patterns
        return PVPanelData(maker=self.maker, model="Model TBD")


class CanadianSolarParser(PanelParser):
    def __init__(self):
        super().__init__("Canadian Solar")

    def parse(self, text: str, tables: List[Dict]) -> PVPanelData:
        return PVPanelData(maker=self.maker, model="Model TBD")


class JASolarParser(PanelParser):
    def __init__(self):
        super().__init__("JA Solar")

    def parse(self, text: str, tables: List[Dict]) -> PVPanelData:
        return PVPanelData(maker=self.maker, model="Model TBD")
