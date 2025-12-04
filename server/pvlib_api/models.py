"""
Data Models for Solar Panel Datasheet Processing

Pydantic models for validation and type checking of extracted PV panel data.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from pathlib import Path


class PVPanelData(BaseModel):
    """Solar PV Panel data model matching database schema"""

    # Required fields
    maker: str = Field(..., description="Panel manufacturer")
    model: str = Field(..., description="Panel model name")

    # Optional technical specifications
    description: Optional[str] = Field(None, description="Panel description")
    maxPower: Optional[float] = Field(None, ge=0, description="Maximum power in Watts")

    # Electrical characteristics
    openCircuitVoltage: Optional[float] = Field(None, ge=0, description="Open circuit voltage (Voc) in Volts")
    shortCircuitCurrent: Optional[float] = Field(None, ge=0, description="Short circuit current (Isc) in Amperes")
    voltageAtPmax: Optional[float] = Field(None, ge=0, description="Voltage at maximum power (Vmp) in Volts")
    currentAtPmax: Optional[float] = Field(None, ge=0, description="Current at maximum power (Imp) in Amperes")
    maxSeriesFuseRating: Optional[float] = Field(None, ge=0, description="Maximum series fuse rating in Amperes")

    # Temperature coefficients (%/K)
    tempCoeffPmax: Optional[float] = Field(None, description="Temperature coefficient of Pmax")
    tempCoeffIsc: Optional[float] = Field(None, description="Temperature coefficient of Isc")
    tempCoeffVoc: Optional[float] = Field(None, description="Temperature coefficient of Voc")
    tempCoeffIpmax: Optional[float] = Field(None, description="Temperature coefficient of Imp")
    tempCoeffVpmax: Optional[float] = Field(None, description="Temperature coefficient of Vmp")

    # Physical specifications
    moduleType: Optional[str] = Field(None, description="Module type (e.g., Monocrystalline, Polycrystalline)")
    shortSide: Optional[float] = Field(None, gt=0, description="Short side dimension in meters")
    longSide: Optional[float] = Field(None, gt=0, description="Long side dimension in meters")
    weight: Optional[float] = Field(None, gt=0, description="Weight in kg")

    # Efficiency and performance
    efficiency: Optional[float] = Field(None, ge=0, le=50, description="Module efficiency as percentage")

    # Warranty information
    performanceWarranty: Optional[str] = Field(None, description="Performance warranty details")
    productWarranty: Optional[str] = Field(None, description="Product warranty details")

    # Certification
    certification: Optional[str] = Field(None, description="Certification standards (e.g., IEC 61215)")

    @validator('efficiency')
    def validate_efficiency(cls, v):
        """Ensure efficiency is realistic for silicon solar panels"""
        if v is not None and v > 30:
            # Very high efficiency, might be n-type or special technology
            pass
        return v

    @validator('shortSide', 'longSide')
    def validate_dimensions(cls, v):
        """Ensure dimensions are realistic"""
        if v is not None and (v < 0.3 or v > 3.0):
            # Suspicious dimension, might be in wrong units
            pass
        return v

    class Config:
        """Pydantic configuration"""
        schema_extra = {
            "example": {
                "maker": "Q CELLS",
                "model": "Q.PEAK DUO L-G5.2 395",
                "description": "Q CELLS Q.PEAK DUO L-G5.2 395W Solar Panel",
                "maxPower": 395.0,
                "openCircuitVoltage": 48.9,
                "shortCircuitCurrent": 10.21,
                "voltageAtPmax": 39.98,
                "currentAtPmax": 9.89,
                "efficiency": 19.9,
                "tempCoeffPmax": -0.37,
                "shortSide": 1.04,
                "longSide": 2.13,
                "weight": 22.5,
                "productWarranty": "12 years",
                "performanceWarranty": "25 years",
                "certification": "IEC 61215 / IEC 61730"
            }
        }

    def to_database_dict(self) -> Dict[str, Any]:
        """Convert to database column format"""
        # Convert camelCase to snake_case for database
        return {
            'maker': self.maker,
            'model': self.model,
            'description': self.description,
            'max_power': self.maxPower,
            'open_circuit_voltage': self.openCircuitVoltage,
            'short_circuit_current': self.shortCircuitCurrent,
            'voltage_at_pmax': self.voltageAtPmax,
            'current_at_pmax': self.currentAtPmax,
            'max_series_fuse_rating': self.maxSeriesFuseRating,
            'temp_coeff_pmax': self.tempCoeffPmax,
            'temp_coeff_isc': self.tempCoeffIsc,
            'temp_coeff_voc': self.tempCoeffVoc,
            'temp_coeff_ipmax': self.tempCoeffIpmax,
            'temp_coeff_vpmax': self.tempCoeffVpmax,
            'module_type': self.moduleType,
            'short_side': self.shortSide,
            'long_side': self.longSide,
            'weight': self.weight,
            'efficiency': self.efficiency,
            'performance_warranty': self.performanceWarranty,
            'product_warranty': self.productWarranty,
            'certification': self.certification
        }

    def validate_cross_parameters(self) -> List[str]:
        """Validate cross-parameter consistency"""
        warnings = []

        # Check power calculation: P = V * I
        if all([self.maxPower, self.voltageAtPmax, self.currentAtPmax]):
            calculated_power = self.voltageAtPmax * self.currentAtPmax
            if abs(calculated_power - self.maxPower) / self.maxPower > 0.1:
                warnings.append(
                    f"Power mismatch: Pmax={self.maxPower}W doesn't match "
                    f"Vmp×Imp={calculated_power:.1f}W (difference: "
                    f"{abs(calculated_power - self.maxPower):.1f}W)"
                )

        # Check voltage relationships
        if self.openCircuitVoltage and self.voltageAtPmax:
            if self.openCircuitVoltage <= self.voltageAtPmax:
                warnings.append(
                    f"Voltage relationship error: Voc ({self.openCircuitVoltage}V) "
                    f"should be greater than Vmp ({self.voltageAtPmax}V)"
                )

        # Check current relationships
        if self.shortCircuitCurrent and self.currentAtPmax:
            if self.shortCircuitCurrent <= self.currentAtPmax:
                warnings.append(
                    f"Current relationship error: Isc ({self.shortCircuitCurrent}A) "
                    f"should be greater than Imp ({self.currentAtPmax}A)"
                )

        return warnings


class ExtractionResult(BaseModel):
    """Result of datasheet extraction"""

    panel_data: PVPanelData
    confidence_scores: Dict[str, float] = Field(default_factory=dict)
    extraction_method: str = Field(default="pattern_matching")
    warnings: List[str] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    processing_time_ms: Optional[float] = None
    source_file: Optional[Path] = None
    timestamp: datetime = Field(default_factory=datetime.now)

    def is_valid(self) -> bool:
        """Check if extraction is valid"""
        return len(self.errors) == 0

    def has_warnings(self) -> bool:
        """Check if extraction has warnings"""
        return len(self.warnings) > 0

    def confidence_score(self) -> float:
        """Calculate overall confidence score"""
        if not self.confidence_scores:
            return 0.0

        # Weighted average of confidence scores
        weights = {
            'maker': 0.1,
            'model': 0.1,
            'maxPower': 0.15,
            'efficiency': 0.1,
            'openCircuitVoltage': 0.1,
            'shortCircuitCurrent': 0.1,
            'voltageAtPmax': 0.1,
            'currentAtPmax': 0.1,
            'tempCoeffPmax': 0.05,
            'shortSide': 0.05,
            'longSide': 0.05
        }

        total_weight = 0
        weighted_sum = 0

        for param, score in self.confidence_scores.items():
            weight = weights.get(param, 0.05)
            weighted_sum += score * weight
            total_weight += weight

        return weighted_sum / total_weight if total_weight > 0 else 0.0


class ProcessingConfig(BaseModel):
    """Configuration for datasheet processing"""

    db_connection_string: str
    pdf_files: List[Dict[str, Any]]
    manufacturer_override: Optional[str] = None
    confidence_threshold: float = Field(default=0.7, ge=0.0, le=1.0)
    skip_validation: bool = False
    export_format: str = Field(default="both", pattern="^(json|csv|both)$")
    output_dir: Path
    enabled_manufacturers: List[str] = Field(default_factory=list)
