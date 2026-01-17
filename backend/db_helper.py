"""
Database Helper Module for BARAQA_BIN Smart Waste Management System
Uses raw SQL queries with mysql-connector-python
"""
import mysql.connector
from mysql.connector import Error
from contextlib import contextmanager
from typing import Optional, List, Dict, Any


class DatabaseHelper:
    """Handles all database operations using raw SQL queries."""
    
    def __init__(self, config: Dict[str, str]):
        """
        Initialize database configuration.
        
        Args:
            config: Dictionary with keys: user, password, host, database
        """
        self.config = config
    
    @contextmanager
    def get_connection(self):
        """
        Context manager for database connections.
        Ensures connections are properly closed.
        """
        connection = None
        try:
            connection = mysql.connector.connect(**self.config)
            yield connection
        except Error as e:
            print(f"Database connection error: {e}")
            raise
        finally:
            if connection and connection.is_connected():
                connection.close()
    
    def execute_query(self, query: str, params: tuple = None, fetch_one: bool = False, 
                     fetch_all: bool = False, commit: bool = False) -> Optional[Any]:
        """
        Execute a SQL query with parameters.
        
        Args:
            query: SQL query string with placeholders (%s)
            params: Tuple of parameters for the query
            fetch_one: If True, returns single row as dict
            fetch_all: If True, returns all rows as list of dicts
            commit: If True, commits the transaction
            
        Returns:
            Query results or None based on flags
        """
        try:
            with self.get_connection() as connection:
                cursor = connection.cursor(dictionary=True)
                cursor.execute(query, params or ())
                
                if commit:
                    connection.commit()
                    return cursor.lastrowid
                
                if fetch_one:
                    return cursor.fetchone()
                
                if fetch_all:
                    return cursor.fetchall()
                
                return None
                
        except Error as e:
            print(f"Query execution error: {e}")
            raise
        finally:
            if 'cursor' in locals():
                cursor.close()
    
    def execute_transaction(self, operations: List[Dict[str, Any]]) -> bool:
        """
        Execute multiple queries in a single transaction.
        
        Args:
            operations: List of dicts with 'query' and 'params' keys
            
        Returns:
            True if all operations succeed, False otherwise
        """
        try:
            with self.get_connection() as connection:
                cursor = connection.cursor(dictionary=True)
                
                for operation in operations:
                    query = operation.get('query')
                    params = operation.get('params', ())
                    cursor.execute(query, params)
                
                connection.commit()
                return True
                
        except Error as e:
            print(f"Transaction error: {e}")
            if connection:
                connection.rollback()
            return False
        finally:
            if 'cursor' in locals():
                cursor.close()


# ── User Operations ─────────────────────────────────────────────

def get_user_by_rfid(db: DatabaseHelper, rfid_uid: str) -> Optional[Dict]:
    """Fetch user by RFID UID."""
    query = "SELECT * FROM users WHERE rfid_uid = %s"
    return db.execute_query(query, (rfid_uid,), fetch_one=True)


def get_user_by_credentials(db: DatabaseHelper, username: str, password: str) -> Optional[Dict]:
    """Fetch user by username and password."""
    query = "SELECT * FROM users WHERE username = %s AND password = %s"
    return db.execute_query(query, (username, password), fetch_one=True)


def get_user_stats(db: DatabaseHelper, user_id: int) -> Optional[Dict]:
    """Get user statistics."""
    query = """
        SELECT user_id, full_name, username, rfid_uid, 
               current_points, total_recycled_items, carbon_saved_g, role
        FROM users 
        WHERE user_id = %s
    """
    return db.execute_query(query, (user_id,), fetch_one=True)


def create_user(db: DatabaseHelper, full_name: str, username: str, password: str, 
                rfid_uid: str, role: str = 'user') -> int:
    """Create a new user account."""
    query = """
        INSERT INTO users (full_name, username, password, rfid_uid, role, 
                          current_points, total_recycled_items, carbon_saved_g)
        VALUES (%s, %s, %s, %s, %s, 0, 0, 0)
    """
    return db.execute_query(query, (full_name, username, password, rfid_uid, role), commit=True)


def update_user_stats(db: DatabaseHelper, user_id: int, points: int, items: int, carbon: float) -> bool:
    """Update user points, items, and carbon savings."""
    query = """
        UPDATE users 
        SET current_points = current_points + %s,
            total_recycled_items = total_recycled_items + %s,
            carbon_saved_g = carbon_saved_g + %s
        WHERE user_id = %s
    """
    db.execute_query(query, (points, items, carbon, user_id), commit=True)
    return True


# ── Waste Log Operations ────────────────────────────────────────

def insert_waste_log(db: DatabaseHelper, user_id: int, bin_id: int, waste_type: str, 
                     waste_count: int, points_earned: int, image_url: str = None) -> int:
    """Insert a new waste disposal log with optional image URL."""
    query = """
        INSERT INTO waste_logs (user_id, bin_id, waste_type, waste_count, 
                               points_earned, image_url, detected_at)
        VALUES (%s, %s, %s, %s, %s, %s, NOW())
    """
    return db.execute_query(query, (user_id, bin_id, waste_type, waste_count, 
                                   points_earned, image_url), commit=True)


def get_user_history(db: DatabaseHelper, user_id: int, limit: int = 10) -> List[Dict]:
    """Get user's recent waste disposal history."""
    query = """
        SELECT log_id, waste_type, waste_count, points_earned, 
               image_url, detected_at as timestamp
        FROM waste_logs
        WHERE user_id = %s
        ORDER BY timestamp DESC
        LIMIT %s
    """
    return db.execute_query(query, (user_id, limit), fetch_all=True)


# ── Leaderboard Operations ──────────────────────────────────────

def get_leaderboard(db: DatabaseHelper, limit: int = 10) -> List[Dict]:
    """Get top users by points."""
    query = """
        SELECT user_id, full_name, username, current_points, 
               total_recycled_items, carbon_saved_g, role
        FROM users
        WHERE role = 'user'
        ORDER BY current_points DESC
        LIMIT %s
    """
    return db.execute_query(query, (limit,), fetch_all=True)


# ── Smart Bin Operations ────────────────────────────────────────

def get_all_bins(db: DatabaseHelper) -> List[Dict]:
    """Get all smart bins status."""
    query = "SELECT * FROM smart_bins ORDER BY bin_id"
    return db.execute_query(query, fetch_all=True)


def get_bin_by_id(db: DatabaseHelper, bin_id: int) -> Optional[Dict]:
    """Get specific bin details."""
    query = "SELECT * FROM smart_bins WHERE bin_id = %s"
    return db.execute_query(query, (bin_id,), fetch_one=True)


def update_bin_fill_level(db: DatabaseHelper, bin_id: int, increment: int) -> bool:
    """Increment bin fill level."""
    query = """
        UPDATE smart_bins 
        SET current_fill_level = current_fill_level + %s
        WHERE bin_id = %s
    """
    db.execute_query(query, (increment, bin_id), commit=True)
    return True


def reset_bin_fill_level(db: DatabaseHelper, bin_id: int) -> bool:
    """Reset bin fill level to 0 (after cleaning)."""
    query = """
        UPDATE smart_bins 
        SET current_fill_level = 0,
            status = 'active'
        WHERE bin_id = %s
    """
    db.execute_query(query, (bin_id,), commit=True)
    return True


def update_bin_status(db: DatabaseHelper, bin_id: int, status: str) -> bool:
    """Update bin status (active/full/maintenance)."""
    query = "UPDATE smart_bins SET status = %s WHERE bin_id = %s"
    db.execute_query(query, (status, bin_id), commit=True)
    return True
