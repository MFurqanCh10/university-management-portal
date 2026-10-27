



export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  console.error(err);

  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(409).json({
      message: "A record with this value already exists",
    });
  }

  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      message: err.errors.map((e) => e.message).join(", "),
    });
  }

  if (err.name === "SequelizeForeignKeyConstraintError") {
    return res.status(409).json({
      message: "Related records prevent this operation",
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }

  res.status(500).json({ message: "Internal server error" });
};