import { v2 as cloudinary } from "cloudinary";
const cloudConnection = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDNAME,
      api_key: process.env.CLOUDAPIKEY,
      api_secret: process.env.CLOUDAPISECRET,
    });
    const response = await cloudinary.api.ping();
    if (response.status == "ok") {
      console.log("cloudinary connected");
    }
  } catch (error) {
    console.log("cloudinary error connection ", error);
  }
};
export default cloudConnection;
