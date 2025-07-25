from setuptools import setup, find_packages

setup(
    name="structured-prompts",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi>=0.100.0",
        "pydantic>=2.0.0",
        "sqlalchemy>=2.0.25",
        "sqlalchemy[asyncio]>=2.0.25",
        "databases>=0.9.0",
        "sqlalchemy-utils>=0.41.1",
        "asyncpg>=0.29.0",
        "aiosqlite>=0.19.0",
        "greenlet>=3.0.3"
    ],
    python_requires=">=3.9",
)
