const mongoose = require('mongoose');
const dotenv = require('dotenv');

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
app.listen(port, () => {
  console.log(`Express running on port ${port}!!`);
});
