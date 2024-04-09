const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION');
  console.log(err.name, err.message);
  // Do we need to exit the process ??
  // process.exit(1);
});

dotenv.config({ path: './.env' }); // This will read the data from the .env file and save then in the node process.env object
const app = require('./app');

// This env variable is set by express
// console.log(app.get('env'));

// This env variable is set by node
// console.log(process.env);

const uri = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD,
);

const clientOptions = {
  serverApi: { version: '1', strict: true, deprecationErrors: true },
};

async function run() {
  try {
    // Create a Mongoose client with a MongoClientOptions object to set the Stable API version
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!',
    );
  } catch (error) {
    console.dir(error);
  }
}
run();

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Express running on port ${port}!!`);
});

// Whenever there is an unhandled promise rejection, process object emits the below event.
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED PROMISE REJECTION');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
