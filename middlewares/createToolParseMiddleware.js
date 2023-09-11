const createToolParseMiddleware = async (req, res, next) => {
  console.log(req.body);

  console.log(JSON.parse(req.body.data));
   const specificationsJSON = req.body.data.specifications;
  const descriptionJSON = req.body.data.description;

  try {
    req.body.specifications = JSON.parse(specificationsJSON);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Invalid JSON format for specifications" });
  }

  try {
    req.body.description = JSON.parse(descriptionJSON);
  } catch (error) {
    return res
      .status(400)
      .json({ error: "Invalid JSON format for description" });
  }

  next();
};

module.exports = {
  createToolParseMiddleware,
};
