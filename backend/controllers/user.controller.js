const bcrypt = require('bcryptjs');
const userService = require('../services/user.services');
const { createUserSchema, updateUserSchema } = require('../validator/user.validator');

const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();

    res.json({ success: true, users });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createUser = async (req, res) => {
  try {

    const { error } = createUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message.replace(/"/g, '') });
    }

    const existingUseruser = await userService.getUserByName(req.body.username);
    
    if (existingUseruser.length>0) {
      return res.status(400).json({ success: false, message: 'User Already Exist. Username must be unique. ' });
    }


    const user = await userService.createUser(req.body);

    res.status(201).json({ success: true, message: 'User created', user });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {

    const { error } = updateUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message.replace(/"/g, '') });
    }

    const user = await userService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let updateExpression = 'set ';
    let expressionAttributeNames = {};
    let expressionAttributeValues = {};
    const updates = [];

    if (req.body.username) {
      updates.push('#u = :username');
      expressionAttributeNames['#u'] = 'username';
      expressionAttributeValues[':username'] = req.body.username;
    }

    if (req.body.password) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      updates.push('#p = :password');
      expressionAttributeNames['#p'] = 'password';
      expressionAttributeValues[':password'] = hashedPassword;
    }

    if (req.body.role) {
      updates.push('#r = :role');
      expressionAttributeNames['#r'] = 'role';
      expressionAttributeValues[':role'] = req.body.role;
    }

    updateExpression += updates.join(', ');

    await userService.updateUser(
      req.params.id,
      updateExpression,
      expressionAttributeNames,
      expressionAttributeValues
    );

    res.json({ success: true, message: 'User updated' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {

    const user = await userService.getUserById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await userService.deleteUser(req.params.id);

    res.json({ success: true, message: 'User deleted' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getProfile
};