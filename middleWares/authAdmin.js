import jwt from "jsonwebtoken";
const authAdmin = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.json({
        success: false,
        message: "Access Denied. Not provided in correct format",
        data: null,
      });
    }
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWTSECRET);
    next();
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: error.message,
      data: null,
    });
  }
};
export default authAdmin;
