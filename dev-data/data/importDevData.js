const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './.env' }); // This will read the data from the .env file and save then in the node process.env object

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

// Read the data from file.
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// Import data into DB
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('DB successfully seeded');
    } catch (error) {
        console.log(error);
    }
    process.exit();
};

// Remove existing data
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('all data in DB deleted');
    } catch (error) {
        console.log(error);
    }
    process.exit();
};

// argv is an arry containing the cli arguments that are passsed when this script is run.
// console.log(process.argv);

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}
