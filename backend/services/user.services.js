const dynamoDb = require('../config/dbconnection');
const { GetCommand, ScanCommand, PutCommand, DeleteCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');


const getUsers = async () => {
  try {
    const command = new ScanCommand({ TableName: 'users',
        ProjectionExpression: 'userId, username, #r',
        ExpressionAttributeNames: {
        '#r': 'role'
        }
    });
    const result = await dynamoDb.send(command);
    return result.Items || [];
  } catch (error) {
    console.log('Get users DB Error:', error);
    throw new Error('Failed to fetch users');
  }
};

const getUserById = async (id) => {
  try {
    const command = new GetCommand({
        TableName: 'users',
        Key: { userId: id },
        ProjectionExpression: 'userId, username, #r',
        ExpressionAttributeNames: {
          '#r': 'role'
        }
      })
    const result = await dynamoDb.send(command);
    return result.Item;
  } 
  catch (error) {
    console.log('Get user DB Error:', error);
    throw new Error('Failed to fetch user');
  }
};


const getUserByName = async (username) => {
  try {
    const command =  new ScanCommand({
        TableName: 'users',
        FilterExpression: 'username = :username',
        ExpressionAttributeValues: {
          ':username': username
        }
      })
    const existingUser = await dynamoDb.send(command);
    console.log(existingUser)
    return existingUser.Items;
  } 
  catch (error) {
    console.log('Get user DB Error:', error);
    throw new Error('Failed to fetch user');
  }
};


const createUser = async (data) => {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = {
      userId: uuidv4(),
      username: data.username,
      password: hashedPassword,
      role: data.role
    };

    await dynamoDb.send(
      new PutCommand({
        TableName: 'users',
        Item: user
      })
    );

  } catch (error) {
    console.log('Create user DB Error:', error);
    throw new Error('Failed to create user');
  }
};

const updateUser = async ( id, updateExpression, expressionAttributeNames, expressionAttributeValues ) => {
  try {

    await dynamoDb.send(
      new UpdateCommand({
        TableName: 'users',
        Key: { userId: id },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues
      })
    );

  } catch (error) {
    console.log('Update user DB Error:', error);
    throw new Error('Failed to update user');
  }
};

const deleteUser = async (id) => {
  try {

    await dynamoDb.send(
      new DeleteCommand({
        TableName: 'users',
        Key: { userId: id }
      })
    );

  } catch (error) {
    console.log('Delete user DB Error:', error);
    throw new Error('Failed to delete user');
  }
};

module.exports = {
  getUsers,
  getUserById,
  getUserByName,
  createUser,
  updateUser,
  deleteUser
};