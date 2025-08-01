from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="structured-prompts",
    version="0.1.1",
    author="ebowwa",
    author_email="your.email@example.com",
    description="A modular package for managing structured prompts with any LLM API",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/ebowwa/structured-prompts",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.9",
    install_requires=[
        "fastapi>=0.104.0",
        "sqlalchemy>=1.4.42,<1.5",
        "sqlalchemy-utils>=0.41.0",
        "pydantic>=2.5.0",
        "databases>=0.8.0",
        "asyncpg>=0.29.0",
        "mcp>=1.0.0",
    ],
    entry_points={
        'console_scripts': [
            'structured-prompts-mcp=structured_prompts.interfaces.mcp:main',
        ],
    },
)