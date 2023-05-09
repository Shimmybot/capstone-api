const router = require("express").Router();

router.get("/", (req, res) => {
  res.send("success");
});

module.exports = router;
