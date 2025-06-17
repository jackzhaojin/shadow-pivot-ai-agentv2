#!/usr/bin/env node

/**
 * Script to fetch and display debug logs from the running server
 * Usage:
 *   node scripts/get-debug-logs.js [options]
 * 
 * Options:
 *   --count=N        Number of recent logs to fetch (default: 50)
 *   --category=NAME  Filter by specific category (e.g., FIGMA_EVAL, AI_CLIENT)
 *   --requestId=ID   Filter by specific request ID
 *   --format=FORMAT  Output format: 'text' or 'json' (default: text)
 *   --file=PATH      Save logs to file instead of console
 *   --server=URL     Server URL (default: http://localhost:3000)
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    options[key] = value || true;
  }
});

// Default options
const serverUrl = options.server || 'http://localhost:3000';
const count = options.count || '50';
const category = options.category;
const requestId = options.requestId;
const format = options.format || 'text';
const outputFile = options.file;

async function fetchLogs() {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (count) params.append('count', count);
    if (category) params.append('category', category);
    if (requestId) params.append('requestId', requestId);
    params.append('format', format);

    const url = `${serverUrl}/api/debug/logs?${params.toString()}`;
    console.log(`🔍 Fetching logs from: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    let content;
    if (format === 'text') {
      content = await response.text();
    } else {
      const data = await response.json();
      if (data.success) {
        content = data.logs;
      } else {
        throw new Error(data.error || 'Failed to fetch logs');
      }
    }

    // Output or save logs
    if (outputFile) {
      fs.writeFileSync(outputFile, content, 'utf8');
      console.log(`📁 Logs saved to: ${outputFile}`);
      console.log(`📊 Log length: ${content.length} characters`);
    } else {
      console.log('📋 DEBUG LOGS:');
      console.log('='.repeat(60));
      console.log(content);
    }

  } catch (error) {
    console.error('❌ Error fetching logs:', error.message);
    
    if (error.cause && error.cause.code === 'ECONNREFUSED') {
      console.log('\n💡 Tips:');
      console.log('   • Make sure the server is running: npm run dev');
      console.log('   • Check if the server is running on a different port');
      console.log('   • Use --server=http://localhost:PORT if using a different port');
    }
    
    process.exit(1);
  }
}

// Show help
if (options.help || options.h) {
  console.log(`
🔍 Debug Logs Fetcher

Usage: node scripts/get-debug-logs.js [options]

Options:
  --count=N        Number of recent logs to fetch (default: 50)
  --category=NAME  Filter by category (FIGMA_EVAL, AI_CLIENT, etc.)
  --requestId=ID   Filter by specific request ID
  --format=FORMAT  Output format: 'text' or 'json' (default: text)
  --file=PATH      Save logs to file instead of console
  --server=URL     Server URL (default: http://localhost:3000)
  --help, -h       Show this help

Examples:
  # Get last 50 logs
  node scripts/get-debug-logs.js

  # Get last 100 logs and save to file
  node scripts/get-debug-logs.js --count=100 --file=debug.log

  # Get only Figma evaluation logs
  node scripts/get-debug-logs.js --category=FIGMA_EVAL

  # Get logs for specific request
  node scripts/get-debug-logs.js --requestId=figma-eval-1234567890-0

  # Get JSON format logs
  node scripts/get-debug-logs.js --format=json
`);
  process.exit(0);
}

fetchLogs();
