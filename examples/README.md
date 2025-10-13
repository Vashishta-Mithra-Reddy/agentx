# Example Files

This directory contains example files to help you get started with AgentX.

## sample_tasks.csv

A sample CSV file demonstrating the correct format for uploading tasks to the system.

### Format Requirements

The CSV file must contain the following columns:
- **FirstName**: Contact's first name
- **Phone**: Contact's phone number
- **Notes**: Task description or notes

### How to Use

1. Ensure you have an active agent account
2. Login to get authentication token
3. Upload the file using the API:

```bash
curl -X POST http://localhost:5000/api/tasks/upload \
  -b cookies.txt \
  -F "file=@sample_tasks.csv"
```

Or use Postman:
1. Set request type to POST
2. URL: `http://localhost:5000/api/tasks/upload`
3. Body → form-data
4. Add key "file" with type "File"
5. Select the sample_tasks.csv file
6. Ensure you have the authentication cookie set

### Creating Your Own Files

#### CSV Format
```csv
FirstName,Phone,Notes
John Doe,1234567890,Task description here
Jane Smith,9876543210,Another task description
```

#### Excel Format
You can also create Excel files (.xls or .xlsx) with the same column headers.

| FirstName | Phone | Notes |
|-----------|-------|-------|
| John Doe | 1234567890 | Task description here |
| Jane Smith | 9876543210 | Another task description |

### Common Issues

**Error: "Invalid format. Required columns: FirstName, Phone, Notes"**
- Ensure column names exactly match: FirstName, Phone, Notes
- Check for extra spaces in column headers
- Verify the file is saved as CSV/Excel format

**Error: "No agents available to distribute tasks"**
- Ensure at least one agent account is active
- Use the `/api/auth/add-agent` endpoint to create active agents

**Error: "Only CSV, XLS, XLSX files are allowed"**
- Check file extension is .csv, .xls, or .xlsx
- Verify file MIME type is correct

### Tips

- Keep task descriptions concise but informative
- Include all necessary contact information
- Test with a small file first before uploading large batches
- Phone numbers can be in any format (the system doesn't validate format currently)
