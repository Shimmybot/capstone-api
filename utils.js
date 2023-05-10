const jwt = require("jsonwebtoken");

function authorize(auth, res) {
  // auth = req.headers.authorization;

  if (!auth) {
    return res.status(401).send("no auth");
  }

  // Parse out the bearer token
  const token = auth.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
  return decodedToken;
}

module.exports = { authorize };
