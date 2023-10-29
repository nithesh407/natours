const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../../models/tourModel");

dotenv.config({ path: "../../config.env" });

const DB = process.env.DATABASE_HOSTED.replace(
  "<password>",
  process.env.DATABASE_PASSWORD,
).replace("<database>", process.env.DATABASE_NAME);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`));
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("tours created successfully");
  } catch (e) {
    console.log(e);
  }

  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany({});
    console.log("tours deleted successfully");
  } catch (e) {
    console.log(e);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
