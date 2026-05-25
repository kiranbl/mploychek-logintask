const express = require('express');
const cors = require('cors');
const PORT = 3000;

const {seedDatabase} = require('./services/seed.services');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Running');
});

app.use((err, req, res, next) => {

  if (err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format'
    });
  }
  next();
});

app.use('/auth',authRoutes);
app.use('/users', userRoutes);







const startServer = async () => {
  // Seed database first
  await seedDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

};

startServer();