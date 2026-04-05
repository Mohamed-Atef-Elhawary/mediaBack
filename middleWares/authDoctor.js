// jwt.sign({ id: doctor._id }, process.env.JWTSECRET);
import jwt from "jsonwebtoken";
const authDoctor = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer")) {
      return res.json({
        success: false,
        message: "Access Denied. Not provided in correct format",
        data: null,
      });
    }
    const token = authorization.split(" ")[1];
    const decode = jwt.verify(token, process.env.JWTSECRET);

    if (!req.body) {
      req.body = {};
    }
    req.body.docId = decode.id;
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

export default authDoctor;
