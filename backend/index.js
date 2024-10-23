const express = require('express');
const { validate } = require('deep-email-validator');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON request bodies and enable CORS
app.use(express.json());
app.use(cors());

// Helper function to validate an email with timeout
const validateWithTimeout = (email, timeout = 5000) => {
  return Promise.race([
    validate(email),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout exceeded")), timeout)
    ),
  ]);
};

// Helper function to retry failed requests
const validateWithRetries = async (email, retries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await validateWithTimeout(email);
    } catch (error) {
      if (attempt === retries) throw error;
      // Wait before retrying
      await new Promise((res) => setTimeout(res, delay));
    }
  }
};

// Helper function to validate emails in batches
const validateEmailsInBatches = async (emails, batchSize = 10) => {
  const results = [];

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    // Validate each batch of emails
    const batchResults = await Promise.all(
      batch.map(async (email) => {
        try {
          const result = await validateWithRetries(email);
          return { email, result };
        } catch (error) {
          return { email, error: error.message };
        }
      })
    );

    results.push(...batchResults);
  }

  return results;
};

// Endpoint to validate emails
app.post('/validate-emails', async (req, res) => {
  const emailsToValidate = req.body.emails; // Expecting an array of emails

  // Check if emails are provided and are in the correct format
  if (!Array.isArray(emailsToValidate)) {
    return res.status(400).json({ error: 'Emails must be an array' });
  }

  try {
    // Perform batch validation
    const validationResults = await validateEmailsInBatches(emailsToValidate);
    res.json(validationResults);
  } catch (error) {
    // Return error if something went wrong during validation
    res.status(500).json({ error: 'Error validating emails', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
