#!/bin/bash

# InfluxDB MCP Server Setup Script

echo "Setting up InfluxDB MCP Server..."

echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating virtual environment..."
source venv/bin/activate

#  dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your InfluxDB connection:"
echo "   cp .env.example .env"
echo ""
echo "2. Edit .env with your InfluxDB credentials:"
echo "   - INFLUXDB_URL (http://influxdb-wpp-team-44.apps.okd.ucll.cloud:32570)"
echo "   - INFLUXDB_TOKEN (get from InfluxDB UI)"
echo "   - INFLUXDB_ORG (group44)"
echo "   - INFLUXDB_BUCKET (44)"
echo ""
echo "3. Set environment variables (or use .env file):"
echo "   export INFLUXDB_URL=\"http://influxdb-wpp-team-44.apps.okd.ucll.cloud:32570\""
echo "   export INFLUXDB_TOKEN=\"ObxR4QKWDDmO0cME4SsOqQ9J-hY2kHw22GFil4a2mo9lMAnRczcJFxKpDbkBXxL1CwyERWRtXcduyihRXi4D4w==\""
echo "   export INFLUXDB_ORG=\"group44\""
echo "   export INFLUXDB_BUCKET=\"pythonScript44\""
echo "   export MCP_PORT=\"8082\""
echo ""
echo "4. Run the MCP server:"
echo "   python server.py"
echo ""
echo "5. Or test with MCP Inspector:"
echo "   npx @modelcontextprotocol/inspector python server.py"
