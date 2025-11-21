# BE_PRECISE API Prompt Extension

When explaining API endpoints, workflows, or related processes, follow these guidelines:

- Use structured ASCII diagrams (text-based flowcharts or trees) to illustrate each endpoint’s flow.  
- Clearly identify any optional fields in the input sections by labeling them as (optional).  
- Include error handling and common response codes where relevant, either in the system process or returns section.  
- Keep steps logically grouped under:
  - User input details
  - System processes
  - Return values or outputs (including success and error responses)  
- Clearly list related database tables or records when mentioned in the process.  
- Each endpoint section should briefly specify HTTP method, path, expected input structure, and output including status codes.  
- Include a Summary at the end, when relevant, to give an overview of the endpoint’s purpose and behavior.

Example format for an endpoint:

```text
POST /api/execute-query/{connection_id}/{category_name}
   ├─ Input: SQLQueryRequest
   │  ├─ query (SQL query)
   │  ├─ report_title, report_filename (optional)
   │  ├─ export_format (PDF/CSV/Excel/Word/HTML)
   │  ├─ start_date, end_date (optional, YYYY-MM-DD)
   │  ├─ business_hours_filter (optional)
   │  └─ template_id (optional, for PDF styling)
   │
   ├─ Validation:
   │  ├─ Verify connection exists
   │  ├─ Verify category exists
   │  ├─ Validate date formats
   │  └─ Validate SQL query syntax
   │
   ├─ Template Loading (if template_id provided):
   │  └─ Load ReportTemplate config for PDF styling
   │
   ├─ Query Processing:
   │  ├─ Decode connection password (base64)
   │  ├─ Add date filters (auto-detect date column if needed)
   │  ├─ Add business hours filter (if requested)
   │  └─ Create query template for future updates
   │
   ├─ Database Execution:
   │  ├─ Connect to database (PostgreSQL/MySQL/MSSQL/Vertica)
   │  ├─ Execute processed SQL query
   │  └─ Load results into pandas DataFrame
   │
   ├─ Report Generation (ALL formats):
   │  ├─ For each ExportFormat (PDF, CSV, Excel, Word, HTML):
   │  │  ├─ Generate report file in temp directory
   │  │  ├─ Create secure download token (10-year expiry)
   │  │  ├─ Create CategoryTable record (metadata)
   │  │  ├─ Create TempReport record (temporary tracking)
   │  │  └─ Generate download/preview URLs
   │  └─ Commit all database records
   │
   └─ Returns: Report IDs, download URLs, preview URLs, data info
```

## Database Tables

- `user_connection.category_table` - Report metadata per format
- `user_connection.temp_reports` - Temporary report tracking
- `user_connection.category_definitions` - Category validation
- `user_connection.user_db_connections` - Connection credentials

## Supported Databases

- PostgreSQL, MySQL, MSSQL, Vertica

## Summary

Executes a SQL query against a database connection and generates reports in multiple formats (PDF, CSV, Excel, Word, HTML). Validates connection and category, optionally applies date and business hours filters, executes the query, and generates all requested formats. Each format gets a secure download token, metadata records, and download/preview URLs. Supports template-based PDF styling and auto-detects date columns for filtering.
