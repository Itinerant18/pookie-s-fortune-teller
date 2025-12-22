import logging
import logging.handlers
from pathlib import Path
import os

def setup_logger(name: str) -> logging.Logger:
    """Setup logger with file and console handlers"""
    
    # Create logs directory
    log_dir = Path('logs')
    log_dir.mkdir(exist_ok=True)
    
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    # Check if handlers are already added to avoid duplicates
    if logger.handlers:
        return logger
    
    # File handler
    file_handler = logging.handlers.RotatingFileHandler(
        log_dir / f'{name}.log',
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    
    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger
