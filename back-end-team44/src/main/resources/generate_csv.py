#!/usr/bin/env python3
import csv
import sys
import json

batches = json.loads(sys.stdin.read())

filename = "batches_export.csv"

with open(filename, mode='w', newline='', encoding='utf-8') as file:
    writer = csv.writer(file)

    # CSV header — matches Batch entity
    writer.writerow([
        "batch_id",
        "batch_number",
        "production_order_number",
        "recipe_id",
        "planned_start_time",
        "actual_start_time",
        "planned_end_time",
        "actual_end_time",
        "execution_status",
        "internal_id",
        "name"
    ])

    # Write each batch line
    for batch in batches:
        writer.writerow([
            batch.get("batchId"),
            batch.get("batchNumber"),
            batch.get("productionOrderNumber"),
            batch.get("recipeId"),
            batch.get("plannedStartTime"),
            batch.get("actualStartTime"),
            batch.get("plannedEndTime"),
            batch.get("actualEndTime"),
            batch.get("executionStatus"),
            batch.get("internalId"),
            batch.get("name"),
        ])

print(filename)