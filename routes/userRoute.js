const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { User } = require('../models/user'); // Mô hình người dùng (User)
const { Token } = require('../models/token'); // Mô hình token
const sendEmail = require('../utils/sendEmail'); // Hàm gửi email
const { validate } = require('../validators/userValidator'); // Hàm validate dữ liệu từ client
const passport = require('passport');
const userController = require('../controllers/userController');
require('dotenv').config(); // Để sử dụng biến môi trường từ .env

router.use(passport.initialize()); 
router.use(passport.session());
// Trang login chính
router.get('/login', userController.loadAuth);
// Google login
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/failure'
}), userController.successGoogleLogin);

// Facebook login
router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    failureRedirect: '/failure'
}), userController.successFacebookLogin);

// Xử lý thất bại đăng nhập
router.get('/failure', userController.failureLogin);

router.get("/register", (req, res) => {
    res.render("register"); // Render form đăng ký
});
router.post("/register", async (req, res) => {
    try {
      // Validate dữ liệu từ form đăng ký
      const { error } = validate(req.body);
      if (error) return res.status(400).send({ message: error.details[0].message });
  
      // Kiểm tra xem email đã được sử dụng chưa
      let user = await User.findOne({ email: req.body.email });
      if (user) return res.status(409).send({ message: "User with given email already exists!" });
  
      // Mã hóa mật khẩu trước khi lưu
      const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS)); // SALT_ROUNDS là số vòng mã hóa
      const hashPassword = await bcrypt.hash(req.body.password, salt);
  
      // Tạo người dùng mới
      user = await new User({ ...req.body, password: hashPassword }).save();
  
      // Tạo token xác thực
      const token = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
  
      // Tạo link xác thực
      const verificationLink = `${process.env.BASE_URL}/users/verify/${user._id}/${token.token}`;
      
      // Gửi email xác thực
      await sendEmail(user.email, "Verify Email", verificationLink);
  
      // Thông báo người dùng kiểm tra email
      res.status(201).send({ message: "An Email sent to your account, please verify." });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
});
router.get("/verify/:userId/:token", async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) return res.status(400).send({ message: "Invalid link" });
  
      const token = await Token.findOne({
        userId: user._id,
        token: req.params.token,
      });
      if (!token) return res.status(400).send({ message: "Invalid link" });
  
      // Xác thực thành công, cập nhật trạng thái người dùng
      await User.updateOne({ _id: user._id }, { isVerified: true });
      await token.remove(); // Xóa token sau khi xác thực
  
      res.status(200).send({ message: "Email verified successfully!" });
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: "Internal Server Error" });
    }
});
  
//



//
module.exports = router;
