from setuptools import setup, find_packages

setup(
    name="gemini-structured-response-prompts-database",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.100.0",
        "pydantic>=2.0.0",
        "sqlalchemy>=2.0.0",
        "databases>=0.9.0",
        "sqlalchemy-utils>=0.41.1",
        "asyncpg",  # For PostgreSQL support
        "aiosqlite"  # For SQLite support
    ],
    python_requires=">=3.9",
)
