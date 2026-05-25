const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dynamoDb = require('../config/dbconnection');
const { ScanCommand } = require('@aws-sdk/lib-dynamodb');
const delay = Number(process.env.API_DELAY);

const { createUserSchema } = require('../validator/user.validator');
const login = async (req, res) => {
  try {

    const { error } = createUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    const { username, password, role } = req.body;
  

    setTimeout(async () => {

      const command = new ScanCommand({ TableName: 'users' });
      const result = await dynamoDb.send(command);
      const user = result.Items.find( item => item.username === username );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const isMatch = await bcrypt.compare(  password, user.password );

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      if (user.role !== role) {
        return res.status(401).json({
          success: false,
          message: 'Role mismatch'
        });
      }

      const token = jwt.sign(
        {
          userId: user.userId,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          userId: user.userId,
          username: user.username,
          role: user.role
        }
      });

    }, delay);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = { login };