const Joi = require('joi');

const createUserSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string()
    .valid('Admin', 'General User')
    .required()
});

const updateUserSchema = Joi.object({
  username: Joi.string().min(3),
  password: Joi.string().min(6),
  role: Joi.string().valid('Admin', 'General User')
}).min(1);

module.exports = {
  createUserSchema,
  updateUserSchema
};