const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect('mongodb://localhost/cozy-cup-cafe', { useNewUrlParser: true, useUnifiedTopology: true });

// Define schemas
const menuSchema = new mongoose.Schema({
  name: String,
  price: Number
});
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const orderSchema = new mongoose.Schema({
  user: String,
  menuItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }]
});

// Create models
const Menu = mongoose.model('Menu', menuSchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

// Use cors
app.use(cors());

// Use JSON parser
app.use(express.json());

// Validate and hash password
function validatePassword(password) {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  return bcrypt.hashSync(password, 10);
}

// Generate JWT token
function generateToken(user) {
  return jwt.sign({ _id: user._id, username: user.username }, process.env.SECRET_KEY, { expiresIn: '1h' });
}

// Define routes
app.get('/api/menu', async (req, res) => {
  try {
    const menuItems = await Menu.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving menu items' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      res.status(401).json({ message: 'Invalid username or password' });
    } else {
      const token = generateToken(user);
      res.json({ token });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = validatePassword(password);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.json({ message: 'Registration successful' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/order', async (req, res) => {
  try {
    const { user, menuItems } = req.body;
    const order = new Order({ user, menuItems });
    await order.save();
    res.json({ message: 'Order placed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error placing order' });
  }
});

// Start server
const port = 3001;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

