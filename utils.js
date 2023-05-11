const jwt = require("jsonwebtoken");

function authorize(auth) {
  if (auth) {
    const token = auth.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    return decodedToken;
  } else {
    return undefined;
  }
}

module.exports = { authorize };
