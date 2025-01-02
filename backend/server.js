const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });



// Models
const User = require('./models/User');

const SearchHistory = require('./models/SearchHistory');


// Express App Setup
const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, 'secret', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });

    req.user = decoded;
    next();
  });
};
// Routes
// Registration Route
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user
    const user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user._id, email: user.email }, 'secret', { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//search_history route
app.post('/api/search-history', authenticate, async (req, res) => {
  const { searchUrl, searchResponse } = req.body;
  const userEmail = req.user.email;

  try {
    const searchRecord = new SearchHistory({
      userEmail,
      searchUrl,
      searchResponse
    });
    await searchRecord.save();
    res.status(201).json({ message: 'Search history saved successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving search history' });
  }
});

app.get('/api/search-history', authenticate, async (req, res) => {
  const userEmail = req.user.email;
  try {
    const history = await SearchHistory.find({ userEmail }).sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching search history' });
  }
});


// Protected Route Example
app.get('/api/home', authenticate, (req, res) => {
  res.status(200).json({ message: 'Welcome to the home page!', user: req.user });
});

app.get('/api/user-profile', authenticate, (req, res) => {
  const userEmail = req.user.email;
  res.json({ email: userEmail });
});

// Start the Server
const PORT = 5005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
