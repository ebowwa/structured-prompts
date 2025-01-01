#!/bin/bash

# Exit on error
set -e

echo "→ Installing dependencies..."

# Check if we're in a virtual environment
if [ -z "$VIRTUAL_ENV" ]; then
    echo "Error: Please activate your virtual environment first"
    exit 1
fi

# Install sqlalchemy-utils
pip install sqlalchemy-utils

# Install the package in editable mode
pip install -e .
