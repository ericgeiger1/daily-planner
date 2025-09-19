const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const { parseDate, parseMonth, formatDate, validateDateRange, DATE_FORMATS } = require('../shared/dateParser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Utility function to get repo root
function getRepoRoot() {
  let currentDir = __dirname;
  while (currentDir !== path.dirname(currentDir)) {
    if (fs.existsSync(path.join(currentDir, '.git'))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  return process.cwd(); // fallback to current working directory
}

// API Routes

/**
 * GET /api/health - Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    repoRoot: getRepoRoot()
  });
});

/**
 * GET /api/formats - Get supported date formats
 */
app.get('/api/formats', (req, res) => {
  res.json({
    success: true,
    formats: DATE_FORMATS,
    examples: {
      ISO: '2025-09-14',
      ISO_DATETIME: '2025-09-14 14:30:00',
      US: '09/14/2025',
      EU: '14/09/2025',
      SHORT: '09/14/25',
      NATURAL: 'September 14, 2025'
    }
  });
});

/**
 * POST /api/validate/date - Validate a date string
 */
app.post('/api/validate/date', (req, res) => {
  const { date, timezone = 'UTC' } = req.body;
  
  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'Date string is required in request body'
    });
  }

  const result = parseDate(date, timezone);
  
  if (result.success) {
    res.json({
      success: true,
      originalInput: date,
      parsedDate: result.date.toISOString(),
      detectedFormat: result.format,
      timezone: timezone,
      formatted: {
        iso: formatDate(result.date, 'ISO', timezone),
        us: formatDate(result.date, 'US', timezone),
        eu: formatDate(result.date, 'EU', timezone),
        natural: formatDate(result.date, 'NATURAL', timezone)
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: result.error,
      originalInput: date,
      supportedFormats: DATE_FORMATS
    });
  }
});

/**
 * POST /api/validate/month - Validate a month string
 */
app.post('/api/validate/month', (req, res) => {
  const { month, timezone = 'UTC' } = req.body;
  
  if (!month) {
    return res.status(400).json({
      success: false,
      error: 'Month string is required in request body'
    });
  }

  const result = parseMonth(month, timezone);
  
  if (result.success) {
    res.json({
      success: true,
      originalInput: month,
      parsedMonth: result.date.toISOString(),
      detectedFormat: result.format,
      timezone: timezone,
      monthInfo: {
        year: result.date.getFullYear(),
        month: result.date.getMonth() + 1,
        monthName: formatDate(result.date, 'NATURAL', timezone).split(' ')[0]
      },
      formatted: {
        yearMonth: `${result.date.getFullYear()}-${String(result.date.getMonth() + 1).padStart(2, '0')}`,
        natural: formatDate(result.date, 'NATURAL', timezone)
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: result.error,
      originalInput: month,
      examples: ['2025-09', '2025-9', '09/14/2025', 'September 2025']
    });
  }
});

/**
 * POST /api/validate/range - Validate a date range
 */
app.post('/api/validate/range', (req, res) => {
  const { startDate, endDate, timezone = 'UTC' } = req.body;
  
  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      error: 'Both startDate and endDate are required in request body'
    });
  }

  const startResult = parseDate(startDate, timezone);
  const endResult = parseDate(endDate, timezone);

  if (!startResult.success) {
    return res.status(400).json({
      success: false,
      error: `Invalid start date: ${startResult.error}`,
      field: 'startDate'
    });
  }

  if (!endResult.success) {
    return res.status(400).json({
      success: false,
      error: `Invalid end date: ${endResult.error}`,
      field: 'endDate'
    });
  }

  const rangeValidation = validateDateRange(startResult.date, endResult.date);
  
  if (!rangeValidation.valid) {
    return res.status(400).json({
      success: false,
      error: rangeValidation.error,
      startDate: startResult.date.toISOString(),
      endDate: endResult.date.toISOString()
    });
  }

  // Calculate duration
  const diffMs = endResult.date.getTime() - startResult.date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  res.json({
    success: true,
    startDate: {
      original: startDate,
      parsed: startResult.date.toISOString(),
      format: startResult.format
    },
    endDate: {
      original: endDate,
      parsed: endResult.date.toISOString(),
      format: endResult.format
    },
    duration: {
      totalDays: diffDays,
      totalHours: diffHours,
      humanReadable: diffDays === 1 ? '1 day' : `${diffDays} days`
    },
    timezone: timezone
  });
});

/**
 * GET /api/pages/:year/:month/:day - Get daily planner page (if it exists)
 */
app.get('/api/pages/:year/:month/:day', (req, res) => {
  const { year, month, day } = req.params;
  const dateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  
  // Validate the date
  const dateResult = parseDate(dateString);
  if (!dateResult.success) {
    return res.status(400).json({
      success: false,
      error: `Invalid date: ${dateResult.error}`
    });
  }

  // Build file path
  const repoRoot = getRepoRoot();
  const filePath = path.join(repoRoot, 'pages', year, month.padStart(2, '0'), `${dateString}.md`);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    res.json({
      success: true,
      date: dateString,
      path: filePath,
      content: content,
      exists: true
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Page not found',
      date: dateString,
      expectedPath: filePath,
      exists: false
    });
  }
});

/**
 * GET /api/pages/:year/:month - Get monthly overview page (if it exists)
 */
app.get('/api/pages/:year/:month', (req, res) => {
  const { year, month } = req.params;
  const monthString = `${year}-${month.padStart(2, '0')}`;
  
  // Validate the month
  const monthResult = parseMonth(monthString);
  if (!monthResult.success) {
    return res.status(400).json({
      success: false,
      error: `Invalid month: ${monthResult.error}`
    });
  }

  // Build file path for overview
  const repoRoot = getRepoRoot();
  const filePath = path.join(repoRoot, 'pages', year, month.padStart(2, '0'), `${monthString}-overview.md`);
  
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    res.json({
      success: true,
      month: monthString,
      path: filePath,
      content: content,
      exists: true
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Monthly overview not found',
      month: monthString,
      expectedPath: filePath,
      exists: false
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /api/health',
      'GET /api/formats', 
      'POST /api/validate/date',
      'POST /api/validate/month',
      'POST /api/validate/range',
      'GET /api/pages/:year/:month/:day',
      'GET /api/pages/:year/:month'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Daily Planner API server running on port ${PORT}`);
  console.log(`Repository root: ${getRepoRoot()}`);
  console.log(`Available endpoints:`);
  console.log(`  GET  http://localhost:${PORT}/api/health`);
  console.log(`  GET  http://localhost:${PORT}/api/formats`);
  console.log(`  POST http://localhost:${PORT}/api/validate/date`);
  console.log(`  POST http://localhost:${PORT}/api/validate/month`);
  console.log(`  POST http://localhost:${PORT}/api/validate/range`);
  console.log(`  GET  http://localhost:${PORT}/api/pages/:year/:month/:day`);
  console.log(`  GET  http://localhost:${PORT}/api/pages/:year/:month`);
});

module.exports = app;