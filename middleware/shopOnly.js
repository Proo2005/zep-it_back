module.exports = (req, res, next) => {
  if (req.user.type !== "shop") {
    return res.status(403).json({ message: "Only shops can add items" });
  }
  next();
};
