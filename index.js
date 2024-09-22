require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Cấu hình session
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET
}));
// Cấu hình Passport cho Google và Facebook
require('./passport');
// Cấu hình view engine EJS
app.set('view engine', 'ejs');
// Cấu hình xử lý các route
const userRoutes = require('./routes/userRoute');
// app.use('/', userRoutes);
app.post('/login', (req, res) => {
  // Handle login logic here
  res.send('Login successful!');
});
app.use('/', userRoutes);
// Thêm route handler cho root URL (/) để render login page
app.get('/', (req, res) => {
  res.render('login'); // Render login.ejs page
});

app.use(express.static('public'));

// Thiết lập cổng chạy server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port: http://localhost:${port}`);
});