// server/server.js
// Minimal Express server for PromoPro AI (placeholder)
// - Serves static frontend from the public/ directory
// - Provides a placeholder /api/validate endpoint for promo code validation
// - Add real promo-code discovery/validation logic and secure configuration before production

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (adjust the path if your frontend lives elsewhere)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Placeholder promo code validation endpoint
// Expecting body: { code: string, context?: { cart, user, channel } }
app.post('/api/validate', async (req, res) => {
  const { code, context = {} } = req.body || {};

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid `code` in request body' });
  }

  // Simulated result (always returns invalid in this placeholder)
  const validationResult = {
    code: code.trim(),
    valid: false,
    reason: 'placeholder-validation-not-implemented',
    testedAt: new Date().toISOString(),
    metadata: {
      channel: context.channel || 'unknown',
      storefront: context.storefront || null,
      cartTotal: context.cart ? context.cart.total : null,
    }
  };

  // Simulate async work
  await new Promise(r => setTimeout(r, 50));

  res.json(validationResult);
});

// Fallback to index.html for SPA (if you use one)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'), err => {
    if (err) {
      res.status(404).send('Not found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`PromoPro server listening on port ${PORT}`);
});
