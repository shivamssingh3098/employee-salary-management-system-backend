const mongoose = require("mongoose");

exports.connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`
    );
    console.log("Mongodb connected", connectionInstance.connection.host);
  } catch (error) {
    console.log("mongodb connection failed", error);
    process.exit(1);
  }
};
