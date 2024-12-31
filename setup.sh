#!/bin/bash

# Setup script for gemini-prompt-schema package

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up gemini-prompt-schema package...${NC}"

# Check if poetry is installed
if ! command -v poetry &> /dev/null; then
    echo -e "${RED}Poetry is not installed. Installing poetry...${NC}"
    curl -sSL https://install.python-poetry.org | python3 -
fi

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo -e "${GREEN}Initializing git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit: Basic package structure"
fi

# Create virtual environment and install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
poetry install

# Setup pre-commit hooks
echo -e "${GREEN}Setting up pre-commit hooks...${NC}"
poetry run pre-commit install

# Run tests
echo -e "${GREEN}Running tests...${NC}"
poetry run pytest

echo -e "${GREEN}Setup complete!${NC}"
echo "You can now start developing with:"
echo "  poetry shell    # Activate virtual environment"
echo "  poetry install  # Install dependencies"
echo "  poetry run pytest  # Run tests"
