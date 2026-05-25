const bcrypt = require('bcryptjs');
const dynamoDb = require('../config/dbconnection');
const { ScanCommand, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

const seedDatabase = async () => {

  try {

    // =========================
    // USERS TABLE
    // =========================

    const usersCommand = new ScanCommand({ TableName: 'users' });
    const usersResult = await dynamoDb.send(usersCommand);
    const users = usersResult.Items || [];

    // =========================
    // ADMIN USER
    // =========================

    const adminExists = users.find( (user) => user.username === 'admin' );

    if (!adminExists) {

      const adminPassword = await bcrypt.hash('admin123', 10);

      const adminCommand = new PutCommand({
          TableName: 'users',
          Item: {
            userId: uuidv4(),
            username: 'admin',
            password: adminPassword,
            role: 'Admin'
          }
        });

      await dynamoDb.send(adminCommand);

      console.log( 'Admin user created' );
    }

    // =========================
    // GENERAL USER
    // =========================

    const generalUserExists = users.find( (user) => user.username === 'user' );

    if (!generalUserExists) {

      const userPassword = await bcrypt.hash('user123', 10);

      const userCommand = new PutCommand({
          TableName: 'users',
          Item: {
            userId: uuidv4(),
            username: 'user',
            password: userPassword,
            role: 'General User'
          }
        });

      await dynamoDb.send(userCommand);

      console.log( 'General user created' );
    }

    // =========================
    // RECORDS TABLE
    // =========================

    const recordsCommand = new ScanCommand({ TableName: 'records' });
    const recordsResult = await dynamoDb.send(recordsCommand);
    const records = recordsResult.Items || [];

    if (records.length === 0) {
      const sampleRecords = [
        {
          recordId: uuidv4(),
          title: 'Finance Report',
          accessLevel: 'Admin'
        },
        {
          recordId:uuidv4(),
          title: 'HR Payroll',
          accessLevel: 'Admin'
        },
        {
          recordId: uuidv4(),
          title: 'Public Notice',
          accessLevel: 'General User'
        },
        {
          recordId: uuidv4(),
          title: 'Company News',
          accessLevel: 'General User'
        }
      ];

      for (const record of sampleRecords) {

        const recordCommand = new PutCommand({ TableName: 'records', Item: record });
        await dynamoDb.send( recordCommand );

      }

      console.log( 'Sample records inserted' );
    }

  } 
  catch (error) {
    console.log('Database seed error',error);
  }
};

module.exports = {
  seedDatabase
};