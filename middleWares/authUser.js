import jwt from "jsonwebtoken";

const authUser = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access Denied. Not provided in correct format",
        data: null,
      });
    }
    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWTSECRET);

    if (!req.body) {
      req.body = {};
    }

    req.body.userId = decoded.id;
    next();
  } catch (error) {
    return res.json({
      success: false,
      message: "Invalid or Expired Token",
      data: null,
    });
  }
};
export default authUser;
