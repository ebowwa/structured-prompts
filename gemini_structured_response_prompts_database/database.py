"""
Database interface and utilities
"""

from typing import Optional, Dict, Any, List
import os
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy_utils import JSONType, create_database, database_exists

from .models import Base, PromptSchemaDB, PromptResponseDB

metadata = MetaData()

def create_tables(engine):
    """Create database tables"""
    Base.metadata.create_all(engine)

class Database:
    """Database connection and operations wrapper"""
    
    def __init__(self, url: Optional[str] = None):
        """
        Initialize database connection
        
        Args:
            url: Database connection URL. If not provided, uses DATABASE_URL env var
        """
        self.url = url or os.getenv("DATABASE_URL", "sqlite:///./gemini_prompts.db")
        self.engine = create_engine(self.url)
        
        # Create database if it doesn't exist
        if not database_exists(self.url):
            create_database(self.url)
        
        Base.metadata.bind = self.engine
        self.SessionLocal = sessionmaker(bind=self.engine)
        
    def connect(self):
        """Connect to database and create tables"""
        create_tables(self.engine)
    
    def disconnect(self):
        """Disconnect from database"""
        pass
    
    def get_session(self) -> Session:
        """Get database session"""
        return self.SessionLocal()
    
    def get_schema(self, prompt_type: str) -> Optional[PromptSchemaDB]:
        """Get prompt schema by type"""
        session = self.get_session()
        result = session.query(PromptSchemaDB).filter_by(prompt_id=prompt_type).first()
        return result
    
    def create_schema(self, schema: PromptSchemaDB) -> bool:
        """Create new prompt schema"""
        session = self.get_session()
        session.add(schema)
        session.commit()
        return True
    
    def update_schema(self, schema: PromptSchemaDB) -> bool:
        """Update existing prompt schema"""
        session = self.get_session()
        session.merge(schema)
        session.commit()
        return True
    
    def delete_schema(self, prompt_type: str) -> bool:
        """Delete prompt schema"""
        session = self.get_session()
        result = session.query(PromptSchemaDB).filter_by(prompt_id=prompt_type).delete()
        session.commit()
        return result > 0
    
    def get_response(self, response_id: str) -> Optional[PromptResponseDB]:
        """Get prompt response by ID"""
        session = self.get_session()
        result = session.query(PromptResponseDB).filter_by(response_id=response_id).first()
        return result
            
    def create_response(self, response: PromptResponseDB) -> bool:
        """Create new prompt response"""
        session = self.get_session()
        session.add(response)
        session.commit()
        return True
