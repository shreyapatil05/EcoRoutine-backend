import { body, param, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      data: errors.array()
    });
  }
  next();
};

export const userValidations = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
];

export const selectTaskValidations = [
  body("taskId").isMongoId().withMessage("Valid taskId is required"),
  body("days").isInt({ gt: 0 }).withMessage("Days must be a positive integer")
];

export const completeTaskValidations = [
  param("id").isMongoId().withMessage("Valid userTask ID is required")
];
