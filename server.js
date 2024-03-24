const dotenv = require('dotenv');

// This will read the data from the .env file and save then in the node process.env object
dotenv.config({ path: './.env' });

const app = require('./app');

// This env variable is set by express
// console.log(app.get('env'));

// This env variable is set by node
// console.log(process.env);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express running on port ${port}!!`);
});
