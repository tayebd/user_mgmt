from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class ReportRequest(BaseModel):
    """Request model for report generation"""
    project_name: str = Field(..., description="Name of the project")
    project_specs: Dict[str, Any] = Field(..., description="Project specifications from project_specs.yaml")
    components: Dict[str, Any] = Field(..., description="Component data from components.yaml")
    calculation_results: Optional[Dict[str, Any]] = Field(None, description="Optional pre-calculated results")
    templates: List[str] = Field(default=[
        "equipment",
        "cable_sizing",
        "grounding",
        "calculations",
        "protection"
    ], description="List of template sections to include")

class ReportResponse(BaseModel):
    """Response model for report generation"""
    success: bool = Field(..., description="Whether the report generation was successful")
    message: str = Field(..., description="Status message")
    report_content: Optional[str] = Field(None, description="Generated report content in markdown format")
    error: Optional[str] = Field(None, description="Error message if generation failed")
