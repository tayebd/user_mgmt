"""
Simplified Solar Panel Parser using Camelot Table Extraction

Much simpler than regex-based parsing - relies on structured table data.
"""

import re
import logging
from typing import Dict, List, Optional, Any
from pandas import DataFrame

from models import PVPanelData

logger = logging.getLogger(__name__)


class SimplifiedParser:
    """Parse PV panel data from Camelot-extracted tables"""

    def __init__(self, manufacturer: str):
        self.manufacturer = manufacturer

    def parse(self, tables: List[Dict[str, Any]], text: str) -> PVPanelData:
        """
        Parse panel data from extracted tables

        Args:
            tables: List of table dictionaries with 'data' (DataFrame) field
            text: Fallback text content

        Returns:
            PVPanelData instance
        """

        logger.info(f"Parsing {len(tables)} tables for {self.manufacturer}")

        # Initialize data
        model = self._extract_model(text)
        max_power = None
        efficiency = None
        voc = None
        isc = None
        vmp = None
        imp = None

        # Parse electrical specs table
        for table_info in tables:
            df = table_info['data']

            # Try to extract from this table
            specs = self._parse_electrical_table(df)

            if specs['max_power']:
                max_power = specs['max_power']
            if specs['efficiency']:
                efficiency = specs['efficiency']
            if specs['voc']:
                voc = specs['voc']
            if specs['isc']:
                isc = specs['isc']
            if specs['vmp']:
                vmp = specs['vmp']
            if specs['imp']:
                imp = specs['imp']

        # Fallback: try to extract from text if table parsing didn't work
        if not max_power:
            max_power = self._extract_from_text(text, [r'POWER CLASS.*?(\d{3})\s+(\d{3})\s+(\d{3})\s+(\d{3})\s+(\d{3})\s+(\d{3})'])
            if max_power:
                # Take the highest power from the series
                max_power = max(max_power) if isinstance(max_power, list) else max_power

        if not efficiency:
            efficiency = self._extract_from_text(text, [r'Efficiency.*?(\d{2}\.?\d*)'])

        # Extract dimensions and weight from text
        dimensions = self._extract_dimensions(text)
        weight = self._extract_weight(text)

        # Extract warranties
        warranties = self._extract_warranties(text)

        # Build panel data
        panel_data = PVPanelData(
            maker=self.manufacturer,
            model=model,
            description=f"{self.manufacturer} {model} Solar Panel",
            maxPower=max_power,
            efficiency=efficiency,
            openCircuitVoltage=voc,
            shortCircuitCurrent=isc,
            voltageAtPmax=vmp,
            currentAtPmax=imp,
            shortSide=dimensions.get('short_side'),
            longSide=dimensions.get('long_side'),
            weight=weight,
            moduleType="Monocrystalline",
            productWarranty=warranties.get('product'),
            performanceWarranty=warranties.get('performance'),
            certification=self._extract_certification(text)
        )

        logger.info(
            f"Parsed: {model}, Power: {max_power}W, "
            f"Efficiency: {efficiency}%, Voc: {voc}V"
        )

        return panel_data

    def _parse_electrical_table(self, df: DataFrame) -> Dict[str, Any]:
        """
        Parse electrical specifications from a DataFrame

        Args:
            df: DataFrame containing electrical specs

        Returns:
            Dictionary with extracted values
        """

        specs = {
            'max_power': None,
            'efficiency': None,
            'voc': None,
            'isc': None,
            'vmp': None,
            'imp': None
        }

        # First try to parse transposed table (common in datasheets)
        transposed_specs = self._parse_transposed_electrical_table(df)
        if transposed_specs['max_power']:
            logger.info(f"Found transposed table - Power: {transposed_specs['max_power']}W")
            return transposed_specs

        # Convert all cells to string for searching
        df_str = df.astype(str)

        # Find POWER CLASS row
        power_values = self._find_column_values(df, ['POWER CLASS', 'Power at MPP'])
        if power_values:
            # Extract numeric values and take the maximum
            numeric_powers = [self._extract_number(v) for v in power_values]
            numeric_powers = [p for p in numeric_powers if p and 300 <= p <= 500]
            if numeric_powers:
                specs['max_power'] = max(numeric_powers)
                logger.info(f"Found power values: {numeric_powers}")

        # Find efficiency
        efficiency_values = self._find_column_values(df, ['Efficiency', 'η [%]'])
        if efficiency_values:
            numeric_eff = [self._extract_number(v) for v in efficiency_values]
            numeric_eff = [e for e in numeric_eff if e and 15 <= e <= 25]
            if numeric_eff:
                specs['efficiency'] = numeric_eff[0]
                logger.info(f"Found efficiency: {specs['efficiency']}")

        # Find Voc (Open Circuit Voltage)
        voc_values = self._find_column_values(df, ['Voc', 'Open Circuit Voltage', 'V [V]'])
        if voc_values:
            numeric_voc = [self._extract_number(v) for v in voc_values]
            numeric_voc = [v for v in numeric_voc if v and 30 <= v <= 60]
            if numeric_voc:
                specs['voc'] = numeric_voc[0]
                logger.info(f"Found Voc: {specs['voc']}")

        # Find Isc (Short Circuit Current)
        isc_values = self._find_column_values(df, ['Isc', 'Short Circuit Current', 'A [A]'])
        if isc_values:
            numeric_isc = [self._extract_number(v) for v in isc_values]
            numeric_isc = [i for i in numeric_isc if i and 5 <= i <= 15]
            if numeric_isc:
                specs['isc'] = numeric_isc[0]
                logger.info(f"Found Isc: {specs['isc']}")

        # Find Vmp (Voltage at MPP)
        vmp_values = self._find_column_values(df, ['Vmp', 'Voltage at MPP', 'MPP'])
        if vmp_values:
            numeric_vmp = [self._extract_number(v) for v in vmp_values]
            numeric_vmp = [v for v in numeric_vmp if v and 20 <= v <= 50]
            if numeric_vmp:
                specs['vmp'] = numeric_vmp[0]
                logger.info(f"Found Vmp: {specs['vmp']}")

        # Find Imp (Current at MPP)
        imp_values = self._find_column_values(df, ['Imp', 'Current at MPP'])
        if imp_values:
            numeric_imp = [self._extract_number(v) for v in imp_values]
            numeric_imp = [i for i in numeric_imp if i and 5 <= i <= 15]
            if numeric_imp:
                specs['imp'] = numeric_imp[0]
                logger.info(f"Found Imp: {specs['imp']}")

        return specs

    def _parse_transposed_electrical_table(self, df: DataFrame) -> Dict[str, Any]:
        """
        Parse transposed electrical specifications table where:
        - Column headers contain power class values (380W, 385W, etc.)
        - Leftmost column contains parameter names
        - Data cells contain the values

        Args:
            df: DataFrame containing electrical specs in transposed format

        Returns:
            Dictionary with extracted values for highest power class
        """

        specs = {
            'max_power': None,
            'efficiency': None,
            'voc': None,
            'isc': None,
            'vmp': None,
            'imp': None
        }

        # Check if this is a transposed table
        table_text = ' '.join(df.astype(str).values.flatten()).upper()

        if 'ELECTRICAL CHARACTERISTICS' not in table_text:
            return specs

        logger.info("Detected transposed electrical characteristics table")

        # Get column headers (these should contain power class values)
        # In transposed tables, power classes are typically in row 1 or row 2
        power_classes = []
        power_class_row = None

        # Check first few rows for power class values
        for row_idx in range(min(3, len(df))):
            row_values = df.iloc[row_idx].astype(str).tolist()
            row_powers = []
            for val in row_values:
                power = self._extract_number(str(val))
                if power and 300 <= power <= 500:
                    row_powers.append(power)

            # If we found multiple power values in this row, it's likely the power class row
            if len(row_powers) >= 3:
                power_classes.extend(row_powers)
                power_class_row = row_idx
                logger.info(f"Found power class row at index {row_idx}: {row_powers}")
                break

        if not power_classes:
            logger.info("No power class values found in table")
            return specs

        # Get the highest power class
        max_power = max(power_classes)
        specs['max_power'] = max_power
        logger.info(f"Found power classes: {power_classes}, using max: {max_power}W")

        # Find which column corresponds to this power class
        max_power_col_idx = None
        if power_class_row is not None:
            # Look in the power class row
            row_values = df.iloc[power_class_row].astype(str).tolist()
            for col_idx, val in enumerate(row_values):
                power = self._extract_number(str(val))
                if power == max_power:
                    max_power_col_idx = col_idx
                    logger.info(f"Found {max_power}W in row {power_class_row}, column {col_idx}")
                    break

        if max_power_col_idx is None:
            logger.warning(f"Could not find column for {max_power}W power class")
            return specs

        # Now search for specific parameters in alternating row format
        # Labels are in even rows (0, 2, 4, ...), values are in odd rows (1, 3, 5, ...)
        for row_idx in range(len(df)):
            # Get current row and next row for label-value pairs
            if row_idx + 1 >= len(df):
                break

            current_row = df.iloc[row_idx].astype(str).tolist()
            next_row = df.iloc[row_idx + 1].astype(str).tolist()

            # Combine both rows to check for parameter names
            combined_text = ' '.join(current_row + next_row).upper()

            # Check for specific parameters
            value_at_max_power = None
            if max_power_col_idx < len(next_row):
                value_at_max_power = self._extract_number(str(next_row[max_power_col_idx]))

            # Skip if no valid value found
            if not value_at_max_power:
                continue

            # Check for POWER
            if any(keyword in combined_text for keyword in ['MAXIMUM POWER', 'POWER AT MPP', 'PMPP', 'PMAX']):
                if 300 <= value_at_max_power <= 500:
                    # Use the power class value, not the extracted value (they should match)
                    logger.info(f"Found Power: {max_power}W from power class row")

            # Check for ISC (Short Circuit Current)
            elif any(keyword in combined_text for keyword in ['SHORT CIRCUIT CURRENT', 'ISC']):
                if 5 <= value_at_max_power <= 15:
                    specs['isc'] = value_at_max_power
                    logger.info(f"Found Isc: {value_at_max_power}A from transposed table")

            # Check for VOC (Open Circuit Voltage)
            elif any(keyword in combined_text for keyword in ['OPEN CIRCUIT VOLTAGE', 'VOC']):
                if 30 <= value_at_max_power <= 60:
                    specs['voc'] = value_at_max_power
                    logger.info(f"Found Voc: {value_at_max_power}V from transposed table")

            # Check for IMP (Current at MPP)
            elif any(keyword in combined_text for keyword in ['CURRENT AT MPP', 'IMPP', 'OPTIMUM OPERATING CURRENT']):
                if 5 <= value_at_max_power <= 15:
                    specs['imp'] = value_at_max_power
                    logger.info(f"Found Imp: {value_at_max_power}A from transposed table")

            # Check for VMP (Voltage at MPP)
            elif any(keyword in combined_text for keyword in ['VOLTAGE AT MPP', 'VMPP', 'OPTIMUM OPERATING VOLTAGE']):
                if 20 <= value_at_max_power <= 50:
                    specs['vmp'] = value_at_max_power
                    logger.info(f"Found Vmp: {value_at_max_power}V from transposed table")

            # Check for Efficiency
            elif any(keyword in combined_text for keyword in ['EFFICIENCY', 'Η', 'η']) and '%' in combined_text:
                if 15 <= value_at_max_power <= 25:
                    specs['efficiency'] = value_at_max_power
                    logger.info(f"Found Efficiency: {value_at_max_power}% from transposed table")

        if max_power_col_idx is None:
            logger.warning(f"Could not find column for {max_power}W power class")
            return specs

        logger.info(f"Using column {max_power_col_idx} for {max_power}W specifications")

        # Now search for specific parameters in the leftmost column
        for row_idx in range(len(df)):
            row_text = ' '.join(df.iloc[row_idx].astype(str)).upper()

            # Check for ISC (Short Circuit Current)
            if any(keyword in row_text for keyword in ['SHORT CIRCUIT CURRENT', 'ISC']):
                # Get value from the max power column
                if max_power_col_idx < len(df.columns):
                    cell_value = df.iloc[row_idx, max_power_col_idx]
                    value = self._extract_number(str(cell_value))
                    if value and 5 <= value <= 15:
                        specs['isc'] = value
                        logger.info(f"Found Isc: {value}A from transposed table")

            # Check for VOC (Open Circuit Voltage)
            elif any(keyword in row_text for keyword in ['OPEN CIRCUIT VOLTAGE', 'VOC']):
                if max_power_col_idx < len(df.columns):
                    cell_value = df.iloc[row_idx, max_power_col_idx]
                    value = self._extract_number(str(cell_value))
                    if value and 30 <= value <= 60:
                        specs['voc'] = value
                        logger.info(f"Found Voc: {value}V from transposed table")

            # Check for IMPP (Current at MPP)
            elif any(keyword in row_text for keyword in ['CURRENT AT MPP', 'IMPP']):
                if max_power_col_idx < len(df.columns):
                    cell_value = df.iloc[row_idx, max_power_col_idx]
                    value = self._extract_number(str(cell_value))
                    if value and 5 <= value <= 15:
                        specs['imp'] = value
                        logger.info(f"Found Imp: {value}A from transposed table")

            # Check for VMPP (Voltage at MPP)
            elif any(keyword in row_text for keyword in ['VOLTAGE AT MPP', 'VMPP']):
                if max_power_col_idx < len(df.columns):
                    cell_value = df.iloc[row_idx, max_power_col_idx]
                    value = self._extract_number(str(cell_value))
                    if value and 20 <= value <= 50:
                        specs['vmp'] = value
                        logger.info(f"Found Vmp: {value}V from transposed table")

            # Check for Efficiency
            elif any(keyword in row_text for keyword in ['EFFICIENCY', 'Η', 'η']):
                if max_power_col_idx < len(df.columns):
                    cell_value = df.iloc[row_idx, max_power_col_idx]
                    value = self._extract_number(str(cell_value))
                    if value and 15 <= value <= 25:
                        specs['efficiency'] = value
                        logger.info(f"Found Efficiency: {value}% from transposed table")

        return specs

    def _find_column_values(self, df: DataFrame, keywords: List[str]) -> List[str]:
        """
        Find values in columns that match keywords

        Args:
            df: DataFrame to search
            keywords: List of keywords to look for

        Returns:
            List of values from matching columns
        """

        values = []

        # Search in column headers
        for col_idx in range(len(df.columns)):
            col_header = str(df.columns[col_idx]).upper()

            if any(keyword.upper() in col_header for keyword in keywords):
                # This column has the keyword, get all values
                col_values = df.iloc[:, col_idx].dropna().astype(str).tolist()
                values.extend(col_values)

        return values

    def _extract_number(self, value_str: str) -> Optional[float]:
        """Extract numeric value from string"""

        if not value_str or value_str == 'nan':
            return None

        # Find first number (integer or float)
        match = re.search(r'(\d+\.?\d*)', str(value_str))
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return None

        return None

    def _extract_model(self, text: str) -> str:
        """Extract model name from text"""

        # Try Q CELLS patterns first
        if 'Q CELLS' in text.upper():
            match = re.search(r'(Q\.PEAK\s+[A-Z0-9\s.-]+)', text, re.IGNORECASE)
            if match:
                return match.group(1).strip()

        # Try Hyperion patterns
        if 'HYPERION' in text.upper():
            # Look for model starting with HY-
            match = re.search(r'(HY-[A-Z0-9]+-[A-Z0-9/]+)', text)
            if match:
                return match.group(1).strip()
            # Or just HY-DH... pattern
            match = re.search(r'(HY-DH[A-Z0-9]+)', text)
            if match:
                return match.group(1).strip()

        # Generic model extraction - look for alphanumeric codes
        lines = text.split('\n')
        for line in lines[:15]:  # Check first 15 lines
            # Look for model numbers or codes
            # Patterns like: XYZ-123, ABC123, MOD123, etc.
            match = re.search(r'([A-Z]{2,}-?[A-Z0-9]{3,}[A-Z0-9/-]*)', line)
            if match:
                model = match.group(1).strip()
                # Filter out common non-model strings
                if not any(word in model.upper() for word in ['WARRANTY', 'EFFICIENCY', 'TEMPERATURE', 'MODULE']):
                    return model

        return "Unknown Model"

    def _extract_from_text(self, text: str, patterns: List[str]) -> Optional[Any]:
        """Extract value from text using regex patterns"""

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                # If multiple groups, return list
                if match.groups() and len(match.groups()) > 1:
                    return [self._extract_number(g) for g in match.groups()]
                else:
                    return self._extract_number(match.group(1))

        return None

    def _extract_dimensions(self, text: str) -> Dict[str, Optional[float]]:
        """Extract panel dimensions"""

        # Try to find dimensions in format: 2015 mm × 1000 mm
        match = re.search(r'(\d{4})\s*[×x]\s*(\d{4})\s*mm', text)
        if match:
            long_side = float(match.group(1)) / 1000  # Convert to meters
            short_side = float(match.group(2)) / 1000
            return {'long_side': long_side, 'short_side': short_side}

        return {'long_side': None, 'short_side': None}

    def _extract_weight(self, text: str) -> Optional[float]:
        """Extract panel weight"""

        match = re.search(r'(\d{2}\.?\d*)\s*kg', text)
        if match:
            return float(match.group(1))

        return None

    def _extract_warranties(self, text: str) -> Dict[str, Optional[str]]:
        """Extract warranty information"""

        product_match = re.search(r'Product\s+Warranty.*?(\d+)\s*years?', text, re.IGNORECASE)
        performance_match = re.search(r'Performance\s+Warranty.*?(\d+)\s*years?', text, re.IGNORECASE)

        return {
            'product': f"{product_match.group(1)} years" if product_match else None,
            'performance': f"{performance_match.group(1)} years" if performance_match else None
        }

    def _extract_certification(self, text: str) -> Optional[str]:
        """Extract certification information"""

        match = re.search(r'(IEC\s+\d+)', text, re.IGNORECASE)
        if match:
            return match.group(1)

        return None
