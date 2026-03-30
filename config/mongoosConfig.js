import mongoose from "mongoose";
const mongooseConnection = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("mongoose connected"),
    );
    await mongoose.connect(`${process.env.MONGOURL}media2`);
  } catch (error) {
    console.log("mongoose error connection ", error);
  }
};
export default mongooseConnection;
