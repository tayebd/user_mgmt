"""
Database Integration Module

PostgreSQL database connection and operations for PV panel data.
"""

import psycopg2
from psycopg2.extras import execute_values, RealDictCursor
from typing import List, Optional, Dict, Any
from models import PVPanelData, ExtractionResult
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manage PostgreSQL database operations"""

    def __init__(self, connection_string: str):
        """Initialize with database connection string"""
        self.connection_string = connection_string
        self.connection = None

    def connect(self):
        """Establish database connection"""
        try:
            self.connection = psycopg2.connect(self.connection_string)
            self.connection.autocommit = False
            logger.info("Database connection established")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            return False

    def disconnect(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            self.connection = None
            logger.info("Database connection closed")

    def __enter__(self):
        """Context manager entry"""
        self.connect()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        if exc_type:
            self.connection.rollback()
            logger.error(f"Database operation failed: {exc_val}")
        else:
            self.connection.commit()
        self.disconnect()

    def check_connection(self) -> bool:
        """Verify database connection"""
        try:
            if not self.connection:
                return False

            cursor = self.connection.cursor()
            cursor.execute("SELECT 1")
            cursor.fetchone()
            cursor.close()
            return True
        except Exception as e:
            logger.error(f"Database connection check failed: {e}")
            return False

    def upsert_pv_panels(self, panels: List[PVPanelData]) -> Dict[str, Any]:
        """Insert or update PV panel records"""

        if not panels:
            return {"success": False, "message": "No panels to insert"}

        # Prepare data for insertion
        insert_data = []
        for panel in panels:
            db_dict = panel.to_database_dict()

            # Build tuple in correct order
            tuple_data = (
                db_dict['maker'],
                db_dict['model'],
                db_dict.get('description'),
                db_dict.get('max_power'),
                db_dict.get('open_circuit_voltage'),
                db_dict.get('short_circuit_current'),
                db_dict.get('voltage_at_pmax'),
                db_dict.get('current_at_pmax'),
                db_dict.get('max_series_fuse_rating'),
                db_dict.get('temp_coeff_pmax'),
                db_dict.get('temp_coeff_isc'),
                db_dict.get('temp_coeff_voc'),
                db_dict.get('temp_coeff_ipmax'),
                db_dict.get('temp_coeff_vpmax'),
                db_dict.get('module_type'),
                db_dict.get('short_side'),
                db_dict.get('long_side'),
                db_dict.get('weight'),
                db_dict.get('efficiency'),
                db_dict.get('performance_warranty'),
                db_dict.get('product_warranty'),
                db_dict.get('certification')
            )
            insert_data.append(tuple_data)

        try:
            cursor = self.connection.cursor()

            # UPSERT query using ON CONFLICT
            query = """
                INSERT INTO p_v_panel (
                    maker, model, description, max_power,
                    open_circuit_voltage, short_circuit_current,
                    voltage_at_pmax, current_at_pmax, max_series_fuse_rating,
                    temp_coeff_pmax, temp_coeff_isc, temp_coeff_voc,
                    temp_coeff_ipmax, temp_coeff_vpmax, module_type,
                    short_side, long_side, weight, efficiency,
                    performance_warranty, product_warranty, certification
                ) VALUES %s
                ON CONFLICT (model) DO UPDATE SET
                    maker = EXCLUDED.maker,
                    description = EXCLUDED.description,
                    max_power = EXCLUDED.max_power,
                    open_circuit_voltage = EXCLUDED.open_circuit_voltage,
                    short_circuit_current = EXCLUDED.short_circuit_current,
                    voltage_at_pmax = EXCLUDED.voltage_at_pmax,
                    current_at_pmax = EXCLUDED.current_at_pmax,
                    max_series_fuse_rating = EXCLUDED.max_series_fuse_rating,
                    temp_coeff_pmax = EXCLUDED.temp_coeff_pmax,
                    temp_coeff_isc = EXCLUDED.temp_coeff_isc,
                    temp_coeff_voc = EXCLUDED.temp_coeff_voc,
                    temp_coeff_ipmax = EXCLUDED.temp_coeff_ipmax,
                    temp_coeff_vpmax = EXCLUDED.temp_coeff_vpmax,
                    module_type = EXCLUDED.module_type,
                    short_side = EXCLUDED.short_side,
                    long_side = EXCLUDED.long_side,
                    weight = EXCLUDED.weight,
                    efficiency = EXCLUDED.efficiency,
                    performance_warranty = EXCLUDED.performance_warranty,
                    product_warranty = EXCLUDED.product_warranty,
                    certification = EXCLUDED.certification
                RETURNING id, model
            """

            # Execute bulk insert
            execute_values(cursor, query, insert_data, template=None, page_size=100)

            # Get results
            results = cursor.fetchall()

            self.connection.commit()
            cursor.close()

            logger.info(f"Successfully upserted {len(results)} PV panels")

            return {
                "success": True,
                "inserted_count": len(results),
                "results": [{"id": r[0], "model": r[1]} for r in results]
            }

        except Exception as e:
            self.connection.rollback()
            logger.error(f"Database upsert failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "inserted_count": 0
            }

    def check_panel_exists(self, model: str) -> Optional[Dict[str, Any]]:
        """Check if a panel with given model exists"""

        try:
            cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            query = """
                SELECT id, maker, model, max_power, efficiency
                FROM p_v_panel
                WHERE model = %s
            """
            cursor.execute(query, (model,))
            result = cursor.fetchone()
            cursor.close()

            return dict(result) if result else None

        except Exception as e:
            logger.error(f"Failed to check panel existence: {e}")
            return None

    def get_panel_by_model(self, model: str) -> Optional[Dict[str, Any]]:
        """Retrieve panel data by model"""

        try:
            cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            query = """
                SELECT *
                FROM p_v_panel
                WHERE model = %s
            """
            cursor.execute(query, (model,))
            result = cursor.fetchone()
            cursor.close()

            return dict(result) if result else None

        except Exception as e:
            logger.error(f"Failed to retrieve panel: {e}")
            return None

    def get_panels_by_maker(self, maker: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Retrieve panels by manufacturer"""

        try:
            cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            query = """
                SELECT id, maker, model, max_power, efficiency, certification
                FROM p_v_panel
                WHERE maker ILIKE %s
                ORDER BY model
                LIMIT %s
            """
            cursor.execute(query, (f"%{maker}%", limit))
            results = cursor.fetchall()
            cursor.close()

            return [dict(row) for row in results]

        except Exception as e:
            logger.error(f"Failed to retrieve panels: {e}")
            return []

    def export_to_csv(self, output_file: Path) -> bool:
        """Export all panels to CSV file"""

        import csv

        try:
            cursor = self.connection.cursor(cursor_factory=RealDictCursor)
            query = """
                SELECT *
                FROM p_v_panel
                ORDER BY maker, model
            """
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()

            with open(output_file, 'w', newline='') as csvfile:
                if results:
                    fieldnames = results[0].keys()
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    writer.writeheader()
                    for row in results:
                        writer.writerow(row)

            logger.info(f"Exported {len(results)} panels to {output_file}")
            return True

        except Exception as e:
            logger.error(f"CSV export failed: {e}")
            return False

    def get_statistics(self) -> Dict[str, Any]:
        """Get database statistics"""

        try:
            cursor = self.connection.cursor()

            # Get total count
            cursor.execute("SELECT COUNT(*) FROM p_v_panel")
            total_count = cursor.fetchone()[0]

            # Get maker counts
            cursor.execute("""
                SELECT maker, COUNT(*) as count
                FROM p_v_panel
                GROUP BY maker
                ORDER BY count DESC
                LIMIT 10
            """)
            maker_counts = cursor.fetchall()

            # Get average power
            cursor.execute("""
                SELECT AVG(max_power) as avg_power
                FROM p_v_panel
                WHERE max_power IS NOT NULL
            """)
            avg_power_result = cursor.fetchone()
            avg_power = avg_power_result[0] if avg_power_result and avg_power_result[0] else 0

            cursor.close()

            return {
                "total_panels": total_count,
                "unique_makers": len(maker_counts),
                "top_makers": [{"maker": m[0], "count": m[1]} for m in maker_counts],
                "average_power": round(avg_power, 2) if avg_power else 0
            }

        except Exception as e:
            logger.error(f"Failed to get statistics: {e}")
            return {}


def get_db_connection_string_from_env() -> str:
    """Get database connection string from environment or default"""
    import os

    # Try environment variable first
    db_url = os.getenv('DATABASE_URL')

    if db_url:
        return db_url

    # Build from components
    host = os.getenv('DB_HOST', 'localhost')
    port = os.getenv('DB_PORT', '5432')
    database = os.getenv('DB_NAME', 'solar_db')
    user = os.getenv('DB_USER', 'postgres')
    password = os.getenv('DB_PASSWORD', 'password')

    return f"postgresql://{user}:{password}@{host}:{port}/{database}"
