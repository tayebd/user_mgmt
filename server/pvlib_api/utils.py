"""
Utility Functions for Datasheet Processing

Helper functions for common operations in datasheet processing.
"""

import re
from typing import Optional, List, Dict, Any
from pathlib import Path


def clean_numeric_string(value: str) -> str:
    """Clean numeric string by removing non-numeric characters except decimal and minus"""
    if not value:
        return ""
    return re.sub(r'[^\d.-]', '', str(value))


def parse_unit_value(value: str, unit: str) -> Optional[float]:
    """Parse value with unit (e.g., '395 W' -> 395.0)"""
    if not value:
        return None

    # Remove unit and extract number
    pattern = rf'(\d+\.?\d*)\s*{re.escape(unit)}'
    match = re.search(pattern, value, re.IGNORECASE)

    if match:
        try:
            return float(match.group(1))
        except ValueError:
            return None

    return None


def extract_model_from_filename(filename: str) -> Optional[str]:
    """Try to extract model name from filename"""
    # Remove extension
    name = Path(filename).stem

    # Common patterns in model names
    patterns = [
        r'([A-Z]+\.[A-Z]+\s+[A-Z]+-\d+\.\d+\s*\d+)',  # Q.PEAK DUO L-G5.2 395
        r'([A-Z]+-\d+[A-Z]*-\d+W)',  # JKM-72HL4-450W
        r'([A-Z]+\d+[A-Z]*-\d+/\d+-\d+W)',  # CS7N-MS-540-560
    ]

    for pattern in patterns:
        match = re.search(pattern, name, re.IGNORECASE)
        if match:
            return match.group(1)

    # If no pattern matches, return the whole name
    return name


def format_file_size(size_bytes: int) -> str:
    """Format file size in human-readable format"""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.2f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.2f} MB"


def validate_pv_panel_parameters(panel_data: Dict[str, Any]) -> List[str]:
    """Validate PV panel parameters and return list of warnings"""
    warnings = []

    # Check power vs voltage * current
    if all(k in panel_data for k in ['maxPower', 'voltageAtPmax', 'currentAtPmax']):
        max_power = panel_data['maxPower']
        voltage_at_pmax = panel_data['voltageAtPmax']
        current_at_pmax = panel_data['currentAtPmax']

        calculated_power = voltage_at_pmax * current_at_pmax

        if abs(calculated_power - max_power) / max_power > 0.1:
            warnings.append(
                f"Power mismatch: Pmax={max_power}W doesn't match "
                f"Vmp×Imp={calculated_power:.1f}W"
            )

    # Check voltage relationships
    if all(k in panel_data for k in ['openCircuitVoltage', 'voltageAtPmax']):
        voc = panel_data['openCircuitVoltage']
        vmp = panel_data['voltageAtPmax']

        if voc <= vmp:
            warnings.append(
                f"Voltage relationship error: Voc ({voc}V) should be greater than Vmp ({vmp}V)"
            )

    # Check current relationships
    if all(k in panel_data for k in ['shortCircuitCurrent', 'currentAtPmax']):
        isc = panel_data['shortCircuitCurrent']
        imp = panel_data['currentAtPmax']

        if isc <= imp:
            warnings.append(
                f"Current relationship error: Isc ({isc}A) should be greater than Imp ({imp}A)"
            )

    # Check efficiency range
    if 'efficiency' in panel_data and panel_data['efficiency']:
        efficiency = panel_data['efficiency']
        if efficiency > 25:
            warnings.append(
                f"High efficiency ({efficiency}%) - verify this is correct for the technology type"
            )
        elif efficiency < 10:
            warnings.append(
                f"Low efficiency ({efficiency}%) - verify this is correct"
            )

    # Check power range
    if 'maxPower' in panel_data and panel_data['maxPower']:
        power = panel_data['maxPower']
        if power > 700:
            warnings.append(f"Very high power ({power}W) - verify this is correct")
        elif power < 100:
            warnings.append(f"Very low power ({power}W) - verify this is correct")

    # Check temperature coefficient range
    if 'tempCoeffPmax' in panel_data and panel_data['tempCoeffPmax']:
        coeff = panel_data['tempCoeffPmax']
        if coeff > 0 or coeff < -1:
            warnings.append(
                f"Unusual temperature coefficient ({coeff} %/K) - verify this is correct"
            )

    return warnings


def estimate_confidence_score(extracted_data: Dict[str, Any]) -> float:
    """Estimate confidence score based on extracted data completeness"""
    required_fields = ['maker', 'model']
    important_fields = ['maxPower', 'efficiency', 'openCircuitVoltage', 'shortCircuitCurrent']
    optional_fields = ['voltageAtPmax', 'currentAtPmax', 'tempCoeffPmax', 'dimensions']

    score = 0.0

    # Required fields (40% of score)
    for field in required_fields:
        if extracted_data.get(field) and extracted_data[field] not in ['Unknown', '']:
            score += 0.2

    # Important fields (50% of score)
    for field in important_fields:
        if extracted_data.get(field) is not None:
            score += 0.125

    # Optional fields (10% of score)
    for field in optional_fields:
        if extracted_data.get(field) is not None:
            score += 0.025

    return min(score, 1.0)


def mask_sensitive_data(data: Dict[str, Any], fields_to_mask: List[str]) -> Dict[str, Any]:
    """Mask sensitive data in dictionary"""
    masked_data = data.copy()

    for field in fields_to_mask:
        if field in masked_data:
            value = str(masked_data[field])
            if len(value) > 4:
                masked_data[field] = value[:2] + '*' * (len(value) - 4) + value[-2:]
            else:
                masked_data[field] = '*' * len(value)

    return masked_data


def print_separator(char: str = '=', length: int = 80) -> str:
    """Print separator line"""
    return char * length


def format_extraction_result(result: Dict[str, Any]) -> str:
    """Format extraction result for display"""
    lines = []
    lines.append(print_separator())
    lines.append("EXTRACTION RESULT")
    lines.append(print_separator())

    panel_data = result.get('panel_data', {})

    lines.append(f"Manufacturer: {panel_data.get('maker', 'Unknown')}")
    lines.append(f"Model: {panel_data.get('model', 'Unknown')}")
    lines.append(f"Max Power: {panel_data.get('maxPower', 'N/A')} W")
    lines.append(f"Efficiency: {panel_data.get('efficiency', 'N/A')} %")
    lines.append(f"Open Circuit Voltage: {panel_data.get('openCircuitVoltage', 'N/A')} V")
    lines.append(f"Short Circuit Current: {panel_data.get('shortCircuitCurrent', 'N/A')} A")
    lines.append(f"Voltage at Pmax: {panel_data.get('voltageAtPmax', 'N/A')} V")
    lines.append(f"Current at Pmax: {panel_data.get('currentAtPmax', 'N/A')} A")
    lines.append(f"Temperature Coefficient (Pmax): {panel_data.get('tempCoeffPmax', 'N/A')} %/K")
    lines.append(f"Dimensions: {panel_data.get('shortSide', 'N/A')} m x {panel_data.get('longSide', 'N/A')} m")
    lines.append(f"Weight: {panel_data.get('weight', 'N/A')} kg")
    lines.append(f"Product Warranty: {panel_data.get('productWarranty', 'N/A')}")
    lines.append(f"Performance Warranty: {panel_data.get('performanceWarranty', 'N/A')}")
    lines.append(f"Certification: {panel_data.get('certification', 'N/A')}")

    if result.get('warnings'):
        lines.append(f"\nWarnings ({len(result['warnings'])}):")
        for warning in result['warnings']:
            lines.append(f"  - {warning}")

    if result.get('errors'):
        lines.append(f"\nErrors ({len(result['errors'])}):")
        for error in result['errors']:
            lines.append(f"  - {error}")

    lines.append(print_separator())

    return '\n'.join(lines)
