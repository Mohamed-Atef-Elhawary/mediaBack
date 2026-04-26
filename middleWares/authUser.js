import jwt from "jsonwebtoken";
const authUser = async (req, res, next) => {
  try {
    // const { token } = req.headers;
    // if (!token) {
    //   return res.json({
    //     success: false,
    //     message: "Authentication Faild",
    //     data: null,
    //   });
    // }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. Not provided in correct format",
        data: null,
      });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    console.log("from authUser decoded is ", decoded);
    if (!req.body) {
      req.body = {};
    }

    req.body.userId = decoded.id;
    next();
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Invalid or Expired Token",
      data: null,
    });
  }
};
export default authUser;
