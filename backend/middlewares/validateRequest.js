const Joi = require("joi");

exports.validateSampleRequest = (req, res, next) => {
  const schema = Joi.object({
    sampleType: Joi.string()
      .valid("Metallic", "Ceramic", "Polymeric", "Composite", "Other")
      .required(),
    sampleDescription: Joi.string().allow(""),
    characterizationType: Joi.array()
      .items(
        Joi.string().valid(
          "Tension-Static",
          "Compression-Static",
          "Torsional-Static",
          "Tension-Fatigue",
          "Compression-Fatigue",
          "Torsional-Fatigue",
          "MicroCT",
          "Hardness",
          "MicroHardness",
          "SurfaceProfilometry"
        )
      )
      .min(1)
      .required(),
    numberOfSamples: Joi.number().integer().min(1).required(),
    icmrProject: Joi.object({
      isFunded: Joi.boolean().required(),
      projectNumber: Joi.when("isFunded", {
        is: true,
        then: Joi.string().required(),
        otherwise: Joi.string().allow("NA"),
      }),
    }).required(),
  });

  if (req.body?.icmrProject?.isFunded) {
    req.body.icmrProject.isFunded =
      req.body.icmrProject.isFunded.toLowerCase() === "true";
  }

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  next();
};
