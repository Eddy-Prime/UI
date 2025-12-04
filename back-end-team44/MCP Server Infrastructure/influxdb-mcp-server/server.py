import asyncio
import json
import os
import logging
from typing import Any, Optional
from datetime import datetime, timedelta

from influxdb_client import InfluxDBClient
from influxdb_client.client.query_api import QueryApi
from dotenv import load_dotenv

from mcp.server.models import InitializationOptions
import mcp.types as types
from mcp.server import NotificationOptions, Server
import mcp.server.stdio

# Load environment variables from .env file
load_dotenv()


#loggin'
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


INFLUXDB_CONFIG = {
    "url": os.getenv("INFLUXDB_URL", "http://influxdb-wpp-team-44.apps.okd.ucll.cloud:32570"),
    "token": os.getenv("INFLUXDB_TOKEN", "ObxR4QKWDDmO0cME4SsOqQ9J-hY2kHw22GFil4a2mo9lMAnRczcJFxKpDbkBXxL1CwyERWRtXcduyihRXi4D4w=="),
    "org": os.getenv("INFLUXDB_ORG", "team44"),
    "bucket": os.getenv("INFLUXDB_BUCKET", "44")
}


# MCP Server configuration
MCP_PORT = int(os.getenv("MCP_PORT", "32570"))

# Create MCP server instance
server = Server("influxdb-mcp-server")


def get_influxdb_client():
    """Create InfluxDB client connection"""
    try:
        client = InfluxDBClient(
            url=INFLUXDB_CONFIG["url"],
            token=INFLUXDB_CONFIG["token"],
            org=INFLUXDB_CONFIG["org"]
        )
        logger.info("InfluxDB client created successfully")
        return client
    except Exception as e:
        logger.error(f"Failed to create InfluxDB client: {str(e)}")
        raise


def format_time_range(start_time: Optional[str] = None, stop_time: Optional[str] = None) -> tuple:
    """Format time range for Flux queries"""
    if start_time is None:
        start_time = "-24h"
    if stop_time is None:
        stop_time = "now()"
    return start_time, stop_time


@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """List available tools for InfluxDB queries"""
    return [
        types.Tool(
            name="query_sensor_readings",
            description="""Query sensor readings from production equipment.
            
            Available filters:
            - equipment_name: e.g., "Neutralization Outlet", "Polymerization Reactor"
            - equipment_type: e.g., "Pipeline", "Reactor", "Tank"
            - metric: e.g., "Conductivity", "Temperature", "Pressure", "Flow"
            - type: e.g., "Conductivity Sensor", "Temperature Sensor"
            
            Returns sensor readings with timestamps and values.""",
            inputSchema={
                "type": "object",
                "properties": {
                    "equipment_name": {
                        "type": "string",
                        "description": "Equipment name (e.g., 'Neutralization Outlet')"
                    },
                    "equipment_type": {
                        "type": "string",
                        "description": "Equipment type (e.g., 'Pipeline', 'Reactor')"
                    },
                    "metric": {
                        "type": "string",
                        "description": "Metric type (e.g., 'Conductivity', 'Temperature', 'Pressure')"
                    },
                    "sensor_type": {
                        "type": "string",
                        "description": "Sensor type (e.g., 'Conductivity Sensor')"
                    },
                    "start_time": {
                        "type": "string",
                        "description": "Start time: relative (e.g., '-1h', '-24h') or ISO format. Default: -24h"
                    },
                    "stop_time": {
                        "type": "string",
                        "description": "Stop time: relative or ISO format. Default: now()"
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum records to return. Default: 100",
                        "default": 100
                    }
                }
            }
        ),
        types.Tool(
            name="get_sensor_statistics",
            description="""Get statistical aggregations (mean, min, max, count) for sensor readings.
            
            Useful for understanding sensor behavior and detecting anomalies.""",
            inputSchema={
                "type": "object",
                "properties": {
                    "equipment_name": {
                        "type": "string",
                        "description": "Equipment name to filter"
                    },
                    "metric": {
                        "type": "string",
                        "description": "Metric to aggregate (e.g., 'Conductivity')"
                    },
                    "start_time": {
                        "type": "string",
                        "description": "Start time for aggregation. Default: -24h"
                    },
                    "stop_time": {
                        "type": "string",
                        "description": "Stop time for aggregation. Default: now()"
                    },
                    "window": {
                        "type": "string",
                        "description": "Time window for grouping (e.g., '1h', '5m'). Optional."
                    }
                }
            }
        ),
        types.Tool(
            name="list_equipment",
            description="""List all equipment that has reported sensor data.
            
            Returns unique equipment names and types.""",
            inputSchema={
                "type": "object",
                "properties": {
                    "start_time": {
                        "type": "string",
                        "description": "Look for equipment active since this time. Default: -7d"
                    }
                }
            }
        ),
        types.Tool(
            name="list_metrics",
            description="""List all available metrics/sensor types.
            
            Returns unique metric names and sensor types.""",
            inputSchema={
                "type": "object",
                "properties": {
                    "equipment_name": {
                        "type": "string",
                        "description": "Filter by equipment name (optional)"
                    },
                    "start_time": {
                        "type": "string",
                        "description": "Look for metrics since this time. Default: -7d"
                    }
                }
            }
        ),
        types.Tool(
            name="get_latest_readings",
            description="""Get the most recent sensor readings.
            
            Useful for real-time monitoring and current status checks.""",
            inputSchema={
                "type": "object",
                "properties": {
                    "equipment_name": {
                        "type": "string",
                        "description": "Equipment name (optional)"
                    },
                    "metric": {
                        "type": "string",
                        "description": "Specific metric (optional)"
                    }
                }
            }
        )
    ]


@server.call_tool()
async def handle_call_tool(
    name: str, arguments: dict[str, Any] | None
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    
    if arguments is None:
        arguments = {}
    
    logger.info(f"Tool called: {name} with arguments: {arguments}")
    
    try:
        client = get_influxdb_client()
        query_api = client.query_api()
        
        if name == "query_sensor_readings":
            equipment_name = arguments.get("equipment_name")
            equipment_type = arguments.get("equipment_type")
            metric = arguments.get("metric")
            sensor_type = arguments.get("sensor_type")
            limit = arguments.get("limit", 100)
            
            start_time, stop_time = format_time_range(
                arguments.get("start_time"),
                arguments.get("stop_time")
            )
            
            # Build Flux query
            flux_query = f'''
                from(bucket: "{INFLUXDB_CONFIG["bucket"]}")
                  |> range(start: {start_time}, stop: {stop_time})
                  |> filter(fn: (r) => r["_measurement"] == "sensor_data")
                  |> filter(fn: (r) => r["_field"] == "measurement")
            '''
            
            if equipment_name:
                flux_query += f'''
                  |> filter(fn: (r) => r["equipment_name"] == "{equipment_name}")
                '''
            
            if equipment_type:
                flux_query += f'''
                  |> filter(fn: (r) => r["equipment_type"] == "{equipment_type}")
                '''
            
            if metric:
                flux_query += f'''
                  |> filter(fn: (r) => r["metric"] == "{metric}")
                '''
            
            if sensor_type:
                flux_query += f'''
                  |> filter(fn: (r) => r["type"] == "{sensor_type}")
                '''
            
            flux_query += f'''
                  |> sort(columns: ["_time"], desc: true)
                  |> limit(n: {limit})
            '''
            
            logger.info(f"Executing Flux query: {flux_query}")
            tables = query_api.query(flux_query, org=INFLUXDB_CONFIG["org"])
            
            results = []
            for table in tables:
                for record in table.records:
                    results.append({
                        "timestamp": record.get_time().isoformat(),
                        "equipment_name": record.values.get("equipment_name"),
                        "equipment_type": record.values.get("equipment_type"),
                        "metric": record.values.get("metric"),
                        "sensor_type": record.values.get("type"),
                        "value": record.get_value()
                    })
            
            logger.info(f"Query returned {len(results)} sensor readings")
            
            return [
                types.TextContent(
                    type="text",
                    text=json.dumps({
                        "count": len(results),
                        "query_params": {
                            "equipment_name": equipment_name,
                            "equipment_type": equipment_type,
                            "metric": metric,
                            "sensor_type": sensor_type,
                            "time_range": {"start": start_time, "stop": stop_time}
                        },
                        "data": results
                    }, indent=2)
                )
            ]
        
        elif name == "get_sensor_statistics":
            equipment_name = arguments.get("equipment_name")
            metric = arguments.get("metric")
            window = arguments.get("window")
            
            start_time, stop_time = format_time_range(
                arguments.get("start_time"),
                arguments.get("stop_time")
            )
            
            flux_query = f'''
                from(bucket: "{INFLUXDB_CONFIG["bucket"]}")
                  |> range(start: {start_time}, stop: {stop_time})
                  |> filter(fn: (r) => r["_measurement"] == "sensor_data")
                  |> filter(fn: (r) => r["_field"] == "measurement")
            '''
            
            if equipment_name:
                flux_query += f'''
                  |> filter(fn: (r) => r["equipment_name"] == "{equipment_name}")
                '''
            
            if metric:
                flux_query += f'''
                  |> filter(fn: (r) => r["metric"] == "{metric}")
                '''
            
            # Calculate statistics
            stats_query = flux_query + '''
                  |> group(columns: ["equipment_name", "equipment_type", "metric", "type"])
                  |> reduce(fn: (r, accumulator) => ({
                    count: accumulator.count + 1.0,
                    sum: accumulator.sum + r._value,
                    min: if r._value < accumulator.min then r._value else accumulator.min,
                    max: if r._value > accumulator.max then r._value else accumulator.max
                  }),
                  identity: {count: 0.0, sum: 0.0, min: 999999.0, max: -999999.0})
                  |> map(fn: (r) => ({
                    equipment_name: r.equipment_name,
                    equipment_type: r.equipment_type,
                    metric: r.metric,
                    sensor_type: r.type,
                    count: r.count,
                    mean: r.sum / r.count,
                    min: r.min,
                    max: r.max
                  }))
            '''
            
            logger.info(f"Executing statistics query")
            tables = query_api.query(stats_query, org=INFLUXDB_CONFIG["org"])
            
            results = []
            for table in tables:
                for record in table.records:
                    results.append({
                        "equipment_name": record.values.get("equipment_name"),
                        "equipment_type": record.values.get("equipment_type"),
                        "metric": record.values.get("metric"),
                        "sensor_type": record.values.get("sensor_type"),
                        "count": record.values.get("count"),
                        "mean": round(record.values.get("mean", 0), 4),
                        "min": round(record.values.get("min", 0), 4),
                        "max": round(record.values.get("max", 0), 4)
                    })
            
            logger.info(f"Statistics calculated for {len(results)} sensor(s)")
            
            return [
                types.TextContent(
                    type="text",
                    text=json.dumps({
                        "statistics": results,
                        "time_range": {"start": start_time, "stop": stop_time}
                    }, indent=2)
                )
            ]
        
        elif name == "list_equipment":
            start_time = arguments.get("start_time", "-7d")
            
            flux_query = f'''
                from(bucket: "{INFLUXDB_CONFIG["bucket"]}")
                  |> range(start: {start_time})
                  |> filter(fn: (r) => r["_measurement"] == "sensor_data")
                  |> group(columns: ["equipment_name", "equipment_type"])
                  |> first()
                  |> keep(columns: ["equipment_name", "equipment_type"])
            '''
            
            logger.info(f"Listing equipment")
            tables = query_api.query(flux_query, org=INFLUXDB_CONFIG["org"])
            
            equipment_list = []
            seen = set()
            for table in tables:
                for record in table.records:
                    eq_name = record.values.get("equipment_name")
                    if eq_name and eq_name not in seen:
                        seen.add(eq_name)
                        equipment_list.append({
                            "equipment_name": eq_name,
                            "equipment_type": record.values.get("equipment_type")
                        })
            
            logger.info(f"Found {len(equipment_list)} equipment")
            
            return [
                types.TextContent(
                    type="text",
                    text=json.dumps({
                        "count": len(equipment_list),
                        "equipment": equipment_list
                    }, indent=2)
                )
            ]
        
        elif name == "list_metrics":
            equipment_name = arguments.get("equipment_name")
            start_time = arguments.get("start_time", "-7d")
            
            flux_query = f'''
                from(bucket: "{INFLUXDB_CONFIG["bucket"]}")
                  |> range(start: {start_time})
                  |> filter(fn: (r) => r["_measurement"] == "sensor_data")
            '''
            
            if equipment_name:
                flux_query += f'''
                  |> filter(fn: (r) => r["equipment_name"] == "{equipment_name}")
                '''
            
            flux_query += '''
                  |> group(columns: ["metric", "type"])
                  |> first()
                  |> keep(columns: ["metric", "type"])
            '''
            
            logger.info(f"Listing metrics")
            tables = query_api.query(flux_query, org=INFLUXDB_CONFIG["org"])
            
            metrics = []
            seen = set()
            for table in tables:
                for record in table.records:
                    metric_name = record.values.get("metric")
                    if metric_name and metric_name not in seen:
                        seen.add(metric_name)
                        metrics.append({
                            "metric": metric_name,
                            "sensor_type": record.values.get("type")
                        })
            
            logger.info(f"Found {len(metrics)} metrics")
            
            return [
                types.TextContent(
                    type="text",
                    text=json.dumps({
                        "count": len(metrics),
                        "metrics": metrics
                    }, indent=2)
                )
            ]
        
        elif name == "get_latest_readings":
            equipment_name = arguments.get("equipment_name")
            metric = arguments.get("metric")
            
            flux_query = f'''
                from(bucket: "{INFLUXDB_CONFIG["bucket"]}")
                  |> range(start: -1h)
                  |> filter(fn: (r) => r["_measurement"] == "sensor_data")
                  |> filter(fn: (r) => r["_field"] == "measurement")
            '''
            
            if equipment_name:
                flux_query += f'''
                  |> filter(fn: (r) => r["equipment_name"] == "{equipment_name}")
                '''
            
            if metric:
                flux_query += f'''
                  |> filter(fn: (r) => r["metric"] == "{metric}")
                '''
            
            flux_query += '''
                  |> group(columns: ["equipment_name", "metric"])
                  |> last()
            '''
            
            logger.info(f"Getting latest readings")
            tables = query_api.query(flux_query, org=INFLUXDB_CONFIG["org"])
            
            latest = []
            for table in tables:
                for record in table.records:
                    latest.append({
                        "timestamp": record.get_time().isoformat(),
                        "equipment_name": record.values.get("equipment_name"),
                        "equipment_type": record.values.get("equipment_type"),
                        "metric": record.values.get("metric"),
                        "sensor_type": record.values.get("type"),
                        "value": record.get_value()
                    })
            
            logger.info(f"Retrieved {len(latest)} latest readings")
            
            return [
                types.TextContent(
                    type="text",
                    text=json.dumps({
                        "count": len(latest),
                        "readings": latest
                    }, indent=2)
                )
            ]
        
        else:
            error_msg = f"Unknown tool: {name}"
            logger.error(error_msg)
            raise ValueError(error_msg)
    
    except Exception as e:
        error_msg = f"Error executing {name}: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return [
            types.TextContent(
                type="text",
                text=json.dumps({
                    "error": error_msg,
                    "tool": name,
                    "arguments": arguments
                }, indent=2)
            )
        ]
    finally:
        if 'client' in locals():
            client.close()
            logger.info("InfluxDB client closed")


async def main():
    """Main entry point"""
    logger.info(f"Starting InfluxDB MCP Server")
    logger.info(f"Connecting to InfluxDB at {INFLUXDB_CONFIG['url']}")
    logger.info(f"Using bucket: {INFLUXDB_CONFIG['bucket']}")
    
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="influxdb-mcp-server",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.error(f"Server error: {str(e)}", exc_info=True)
        raise