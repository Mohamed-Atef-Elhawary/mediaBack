import jwt from "jsonwebtoken";
const authUser = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({
        success: false,
        message: "Authentication Faild",
        data: null,
      });
    }
    const verifyedToken = jwt.verify(token, process.env.JWTSECRET);
    if (!verifyedToken) {
      return res.json({
        success: false,
        message: "Authentication Faild",
        data: null,
      });
    } else {
      if (!req.body) {
        req.body = {};
      }
      req.body.userId = verifyedToken.id;
      next();
    }
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Session Expired, please login again",
      data: null,
    });
  }
};
export default authUser;
