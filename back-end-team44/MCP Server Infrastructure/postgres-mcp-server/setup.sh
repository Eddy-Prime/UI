#!/bin/bash

# MCP Server Setup Script

echo "Setting up PostgreSQL MCP Server..."

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your database connection:"
echo "   cp .env.example .env"
echo ""
echo "2. Edit .env with your database credentials"
echo ""
echo "3. Set environment variables:"
echo "   export POSTGRES_HOST=\"localhost\""
echo "   export POSTGRES_PORT=\"5432\""
echo "   export POSTGRES_DB=\"your_database_name\""
echo "   export POSTGRES_USER=\"your_username\""
echo "   export POSTGRES_PASSWORD=\"your_password\""
echo ""
echo "4. Run the MCP server:"
echo "   python server.py"
echo ""
echo "5. Or test with MCP Inspector:"
echo "   npx @modelcontextprotocol/inspector python server.py"
