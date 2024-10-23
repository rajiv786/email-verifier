// // import { validate } from 'deep-email-validator';
// const { validate } = require('deep-email-validator');

// const main = async () => {
//   // Validate a single email
//   const emailToValidate = 'Admin@slushie.in';
//   let res = await validate(emailToValidate);
//   console.log(`Validation result for ${emailToValidate}:`, res);

//   // Validate with additional options
// //   const detailedValidation = await validate({
// //     email: 'name@example.org',
// //     sender: 'name@example.org',
// //     validateRegex: true,
// //     validateMx: true,
// //     validateTypo: true,
// //     validateDisposable: true,
// //     validateSMTP: true,
// //   });

// //   console.log(`Detailed validation result:`, detailedValidation);
// };

// main().catch((error) => {
//   console.error('Error validating email:', error);
// });
// const { validate } = require('deep-email-validator');

// const emailsToValidate = [
//   'rajiv@hubhawks.com','kamin@h.in','arya@slushie.in','admin@slushie.in'
//   // Add more emails as needed
// ];

// const main = async () => {
//   // Iterate over each email and validate
//   for (const email of emailsToValidate) {
//     try {
//       const result = await validate(email);
//       console.log(`Validation result for ${email}:`, result);
//     } catch (error) {
//       console.error(`Error validating email ${email}:`, error);
//     }
//   }
// };

// main().catch((error) => {
//   console.error('Error in main execution:', error);
// });
const express = require('express');
const { validate } = require('deep-email-validator');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON request bodies and enable CORS
app.use(express.json());
app.use(cors());

// Endpoint to validate emails
app.post('/validate-emails', async (req, res) => {
  const emailsToValidate = req.body.emails; // Expecting an array of emails

  if (!Array.isArray(emailsToValidate)) {
    return res.status(400).json({ error: 'Emails must be an array' });
  }

  // Create an array of promises for email validation
  const validationPromises = emailsToValidate.map(async (email) => {
    try {
		const result = await validate(email);
		// console.log(result)
      return { email, result };
    } catch (error) {
      return { email, error: error.message };
    }
  });

  // Wait for all validations to complete
  const validationResults = await Promise.all(validationPromises);
//   console.log(validationResults)
  // Send the validation results back to the client
  res.json(validationResults);
});

  
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
