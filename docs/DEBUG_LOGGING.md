# Debug Logging System

The application includes a comprehensive debug logging system to help troubleshoot AI API issues, parsing errors, and rate limits.

## Quick Access to Server Logs

### Using npm scripts (Recommended)

```bash
# Get last 50 debug logs
npm run logs

# Save logs to file for easy copying
npm run logs:save

# Get only Figma evaluation logs
npm run logs:figma

# Get only AI client logs (rate limits, etc.)
npm run logs:ai
```

### Using the script directly

```bash
# Get last 100 logs
node scripts/get-debug-logs.js --count=100

# Get logs for a specific request ID
node scripts/get-debug-logs.js --requestId=figma-eval-1234567890-0

# Save logs to a file
node scripts/get-debug-logs.js --file=my-debug-logs.txt

# Get logs in JSON format
node scripts/get-debug-logs.js --format=json
```

## Common Issues and Log Categories

### Rate Limit Issues (429 Errors)
- **Category:** `AI_CLIENT_RATE_LIMIT`
- **Look for:** Status 429, retry-after headers, remaining token counts
- **Command:** `npm run logs:ai`

### JSON Parsing Errors
- **Category:** `FIGMA_EVAL_PARSE`
- **Look for:** Raw AI responses, markdown detection, parsing failures
- **Command:** `npm run logs:figma`

### Figma Evaluation Flows
- **Category:** `FIGMA_EVAL`
- **Look for:** Spec processing, AI request/response cycles
- **Command:** `npm run logs:figma`

## API Endpoint

You can also access logs directly via the API:

```bash
# Get recent logs as text
curl "http://localhost:3000/api/debug/logs?count=50&format=text"

# Get logs for specific category
curl "http://localhost:3000/api/debug/logs?category=FIGMA_EVAL&format=text"

# Download logs as a file
curl "http://localhost:3000/api/debug/logs?count=100&format=text" -o debug-logs.txt
```

## Log Structure

Each log entry includes:
- **Timestamp:** ISO 8601 format
- **Level:** info, warn, error, debug
- **Category:** Logical grouping (FIGMA_EVAL, AI_CLIENT, etc.)
- **Message:** Human-readable description
- **Data:** Structured data with relevant details
- **Request ID:** Unique identifier for tracking related operations

## Troubleshooting Steps

1. **For Parsing Issues:**
   ```bash
   npm run logs:figma
   ```
   Look for `FIGMA_EVAL_PARSE` entries and check the raw AI responses.

2. **For Rate Limits:**
   ```bash
   npm run logs:ai
   ```
   Look for `AI_CLIENT_RATE_LIMIT` entries and check retry-after times.

3. **For Full Context:**
   ```bash
   npm run logs:save
   ```
   Opens debug-logs.txt with complete log history for copying to AI tools.

## Copy-Paste for AI Analysis

The logs are formatted to be easily copy-pasteable into AI tools like ChatGPT or Claude for analysis:

1. Run `npm run logs:save`
2. Open the generated `debug-logs.txt` file
3. Copy the relevant sections
4. Paste into your AI tool with context like: "I'm getting parsing errors in my Figma evaluation service. Here are the debug logs:"

## Log Retention

- Logs are kept in memory for the current server session
- Maximum 1000 log entries (older entries are automatically purged)
- Logs are cleared when the server restarts
- Use the save commands to preserve logs before restarting
