const loadAuth = (req, res) => {
    res.render('login'); // Trang xác thực (login)
};
const handleLogin = (req, res) => {
    const { email, password } = req.body;
    // Query the database to check if the user exists
    User.findOne({ email: email }, (err, user) => {
      if (err) {
        res.send("Error occurred while logging in");
      } else if (user) {
        if (user.password === password) {
          res.send(`Welcome ${email}`);
        } else {
          res.send("Invalid email or password");
        }
      }
    });
  };
const successGoogleLogin = (req, res) => {
    if (!req.user) {
        return res.redirect('/failure');
    }
    res.send(`Welcome ${req.user.email}`);
};
const successFacebookLogin = (req, res) => {
    if (!req.user) {
        return res.redirect('/failure');
    }
    res.send(`Welcome ${req.user.displayName}`);
};
const failureLogin = (req, res) => {
    res.send("Error during login");
};
module.exports = {
    loadAuth,
    successGoogleLogin,
    successFacebookLogin,
    failureLogin
};
