import asyncio
import os
import json
from typing import Any
import psycopg2
from psycopg2.extras import RealDictCursor
from mcp.server.models import InitializationOptions
import mcp.types as types
from mcp.server import NotificationOptions, Server
import mcp.server.stdio

# Database configuration from environment variables
DB_CONFIG = {
    "host": os.getenv("POSTGRES_HOST", "ucll.cloud"),
    "port": int(os.getenv("POSTGRES_PORT", "30368")),
    "database": os.getenv("POSTGRES_DB", "db"),
    "user": os.getenv("POSTGRES_USER", "userMJG"),
    "password": os.getenv("POSTGRES_PASSWORD", "OBSLvVTuc3YOkJAb"),
}

# Create MCP server instance
server = Server("postgresql-mcp-server")


def get_db_connection():
    """Create a new database connection"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)


@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """List available tools"""
    return [
        types.Tool(
            name="query",
            description="Execute a SELECT query on the PostgreSQL database. Returns query results as JSON.",
            inputSchema={
                "type": "object",
                "properties": {
                    "sql": {
                        "type": "string",
                        "description": "The SELECT SQL query to execute",
                    }
                },
                "required": ["sql"],
            },
        ),
        types.Tool(
            name="list_tables",
            description="List all tables in the current database schema",
            inputSchema={
                "type": "object",
                "properties": {
                    "schema": {
                        "type": "string",
                        "description": "Schema name (default: public)",
                        "default": "public",
                    }
                },
            },
        ),
        types.Tool(
            name="describe_table",
            description="Get detailed information about a table's structure including columns, types, and constraints",
            inputSchema={
                "type": "object",
                "properties": {
                    "table_name": {
                        "type": "string",
                        "description": "Name of the table to describe",
                    },
                    "schema": {
                        "type": "string",
                        "description": "Schema name (default: public)",
                        "default": "public",
                    },
                },
                "required": ["table_name"],
            },
        ),
        types.Tool(
            name="execute",
            description="Execute an INSERT, UPDATE, or DELETE query. Returns the number of affected rows.",
            inputSchema={
                "type": "object",
                "properties": {
                    "sql": {
                        "type": "string",
                        "description": "The SQL query to execute (INSERT, UPDATE, DELETE)",
                    }
                },
                "required": ["sql"],
            },
        ),
    ]


@server.call_tool()
async def handle_call_tool(
    name: str, arguments: dict[str, Any] | None
) -> list[types.TextContent | types.ImageContent | types.EmbeddedResource]:
    """Handle tool execution requests"""
    
    if arguments is None:
        arguments = {}

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if name == "query":
            sql = arguments.get("sql", "")
            
            # Basic SQL injection prevention - only allow SELECT
            if not sql.strip().lower().startswith("select"):
                raise ValueError("Only SELECT queries are allowed with the query tool")

            cursor.execute(sql)
            results = cursor.fetchall()
            
            # Convert to list of dicts
            results_list = [dict(row) for row in results]
            
            return [
                types.TextContent(
                    type="text",
                    text=json.dumps(results_list, indent=2, default=str),
                )
            ]

        elif name == "list_tables":
            schema = arguments.get("schema", "public")
            
            cursor.execute(
                """
                SELECT table_name, table_type 
                FROM information_schema.tables 
                WHERE table_schema = %s 
                ORDER BY table_name
                """,
                (schema,)
            )
            results = cursor.fetchall()
            results_list = [dict(row) for row in results]

            return [
                types.TextContent(
                    type="text",
                    text=json.dumps(results_list, indent=2),
                )
            ]

        elif name == "describe_table":
            table_name = arguments.get("table_name")
            schema = arguments.get("schema", "public")

            # Get columns information
            cursor.execute(
                """
                SELECT 
                    column_name, 
                    data_type, 
                    character_maximum_length,
                    is_nullable,
                    column_default
                FROM information_schema.columns 
                WHERE table_schema = %s AND table_name = %s
                ORDER BY ordinal_position
                """,
                (schema, table_name)
            )
            columns = [dict(row) for row in cursor.fetchall()]

            # Get constraints information
            cursor.execute(
                """
                SELECT
                    tc.constraint_name,
                    tc.constraint_type,
                    kcu.column_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.key_column_usage kcu
                    ON tc.constraint_name = kcu.constraint_name
                    AND tc.table_schema = kcu.table_schema
                WHERE tc.table_schema = %s AND tc.table_name = %s
                """,
                (schema, table_name)
            )
            constraints = [dict(row) for row in cursor.fetchall()]

            result = {
                "columns": columns,
                "constraints": constraints,
            }

            return [
                types.TextContent(
                    type="text",
                    text=json.dumps(result, indent=2, default=str),
                )
            ]

        elif name == "execute":
            sql = arguments.get("sql", "")
            
            # Only allow INSERT, UPDATE, DELETE
            trimmed_sql = sql.strip().lower()
            if not (
                trimmed_sql.startswith("insert") or
                trimmed_sql.startswith("update") or
                trimmed_sql.startswith("delete")
            ):
                raise ValueError("Only INSERT, UPDATE, and DELETE queries are allowed with the execute tool")

            cursor.execute(sql)
            conn.commit()
            rows_affected = cursor.rowcount

            return [
                types.TextContent(
                    type="text",
                    text=f"Query executed successfully. Rows affected: {rows_affected}",
                )
            ]

        else:
            raise ValueError(f"Unknown tool: {name}")

    except Exception as e:
        return [
            types.TextContent(
                type="text",
                text=f"Error: {str(e)}",
            )
        ]
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


async def main():
    """Main entry point for the server"""
    async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            InitializationOptions(
                server_name="postgresql-mcp-server",
                server_version="1.0.0",
                capabilities=server.get_capabilities(
                    notification_options=NotificationOptions(),
                    experimental_capabilities={},
                ),
            ),
        )


if __name__ == "__main__":
    asyncio.run(main())
