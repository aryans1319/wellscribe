const { default: mongoose } = require("mongoose");

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(
      "mongodb+srv://aryan4p130202:abcd123@cluster0.y6xu8bq.mongodb.net/?retryWrites=true&w=majority",
      {}
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit();
  }
};

module.exports = connectDB;
