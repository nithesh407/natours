/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNHANDLED EXCEPTION!! Shutting Down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: 'config.env' });

const DB = process.env.DATABASE_HOSTED.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
).replace('<database>', process.env.DATABASE_NAME);

mongoose
  .connect(DB, {
    // .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'));
// .catch(err => console.error(err));

const app = require('./app');

console.log(process.env.NODE_ENV);

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTECTION!! Shutting Down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
