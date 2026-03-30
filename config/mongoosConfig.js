import mongoose from "mongoose";
const mongooseConnection = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("mongoose connected");
    });
    await mongoose.connect(`${process.env.MONGOURL}trainning`);
  } catch (error) {
    console.log("error mongoose connection", error);
  }
};
export default mongooseConnection;
