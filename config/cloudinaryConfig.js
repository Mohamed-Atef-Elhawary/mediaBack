import { v2 as cloudinary } from "cloudinary";

const cloudConnection = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDNAME,
      api_key: process.env.CLOUDAPIKEY,
      api_secret: process.env.CLOUDAPISECRET,
    });

    const result = await cloudinary.api.ping();
    if (result.status === "ok") {
      console.log("cloudinary connected");
    } else {
      console.log("cloudinary conection fail");
    }
  } catch (error) {
    console.log(error);
  }
};

export default cloudConnection;
