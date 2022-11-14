import UserModel from '../models/User.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from '../config/emailConfig.js'

class UserController {
  static userSignup = async (req, res) => {
    const { email, nickname, password, password_confirmation, role } = req.body
    const user = await UserModel.findOne({ email: email })
    if (user) {
      res.send({ "status": "failed", "message": "Email already exists" })
    } else {
      if (email && nickname && password && password_confirmation && role) {
        if (password === password_confirmation) {
          try {
            const salt = await bcrypt.genSalt(10)
            const hashPassword = await bcrypt.hash(password, salt)
            const doc = new UserModel({
              email: email,
              nickname: nickname,
              password: hashPassword,
              role: role
            })
            await doc.save()
            const saved_user = await UserModel.findOne({ email: email })
            // Generate JWT Token
            const token = jwt.sign({ userID: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
            res.status(201).send({ "status": "success", "message": "Registration Success", "token": token })
          } catch (error) {
            console.log(error)
            res.send({ "status": "failed", "message": "Unable to Register" })
          }
        } else {
          res.send({ "status": "failed", "message": "Password and Confirm Password doesn't match" })
        }
      } else {
        res.send({ "status": "failed", "message": "All fields are required" })
      }
    }
  }

  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body
      if (email && password) {
        const user = await UserModel.findOne({ email: email })
        if (user != null) {
          const isMatch = await bcrypt.compare(password, user.password)
          if ((user.email === email) && isMatch) {
            // Generate JWT Token
            const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '5d' })
            res.send({ "status": "success", "message": "Login Success", "token": token })
          } else {
            res.send({ "status": "failed", "message": "Email or Password is not Valid" })
          }
        } else {
          res.send({ "status": "failed", "message": "You are not a Registered User" })
        }
      } else {
        res.send({ "status": "failed", "message": "All Fields are Required" })
      }
    } catch (error) {
      console.log(error)
      res.send({ "status": "failed", "message": "Unable to Login" })
    }
  }

  static userReset = async (req, res) => {
    const { email } = req.body
    if (email) {
      const user = await UserModel.findOne({ email: email })
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY
        const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' })
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
        console.log(link)
        // // Send Email
        // let info = await transporter.sendMail({
        //   from: process.env.EMAIL_FROM,
        //   to: user.email,
        //   subject: "GeekShop - Password Reset Link",
        //   html: `<a href=${link}>Click Here</a> to Reset Your Password`
        // })
        res.send({ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email" })
      } else {
        res.send({ "status": "failed", "message": "Email doesn't exists" })
      }
    } else {
      res.send({ "status": "failed", "message": "Email Field is Required" })
    }
  }

  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body
    const { id, token } = req.params
    const user = await UserModel.findById(id)
    const new_secret = user._id + process.env.JWT_SECRET_KEY
    try {
      jwt.verify(token, new_secret)
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
        } else {
          const salt = await bcrypt.genSalt(10)
          const newHashPassword = await bcrypt.hash(password, salt)
          await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } })
          res.send({ "status": "success", "message": "Password Reset Successfully" })
        }
      } else {
        res.send({ "status": "failed", "message": "All Fields are Required" })
      }
    } catch (error) {
      console.log(error)
      res.send({ "status": "failed", "message": "Invalid Token" })
    }
  }
  static change_nickname = async (req, res) => {
      const new_nickname = req.body.new_nickname;
      console.log(
        await User.updateOne({ email: req.userEmail }, { nickname: new_nickname })
      );
      res.redirect("/user/nickname");
      // res.status(201).json({
      //   message: `Nickname updated to ${new_nickname}`,
      // });
    };
    static makeAdmin = async (req, res) => {
      res.redirect(`/admin/make_admin/${req.query.email}`);
    }
    static change_role = async (req, res) => {
      const user_email = req.params.email;
      const user = await user.findOne({ email: user_email });
      const admin = await user.findOne({ _id: req.userId });
      if (admin.role === "admin") {
        if (user) {
          console.log(
            await user.updateOne({ email: user_email }, { role: "admin" }),
            "User is authorized as an Admin"
          );
          res.render("success", { message: "User is authorized for admin's role" });
    
          
        } else {
          res.send({ "status": "failed", "message": "User not found"})
        }
      }
    }
    static get_nickname = async (req, res) => {
      try {
        const user = await User.findOne({ _id: req.userId });
        if (user) {
          console.log("Nickname:", user.nickname);
          res.render("profile", {
            name: user.nickname,
            email: user.email,
            role: user.role,
          });
          
        } else {
          console.log("Error finding user");
          res.render("error", {
            message_1: "SORRY",
            message_2: "Error finding user",
            brace: "(",
          });
          
        }
      } catch (err) {
        console.log(err);
        res.render("error", {
          message_1: "OOPS!",
          message_2: "Something went wrong",
          brace: "(",
        });
        
      }
    };
    static delete_user = async (req, res) => {
      try {
        const admin = await User.findOne({ _id: req.userId });
        const user = await User.findOne({ email: req.params.email });
        if (user) {
          console.log(user);
          if (admin.role === "admin") {
            console.log(
              await User.deleteOne({ email: req.params.email }),
              "\n user deleted"
            );
            res.render("success", { message: "User Deleted" });
    
            
          } else {
            console.log("Unauthorized to delete");
            res.render("error", {
              message_1: "SORRY!",
              message_2: "Not Authorized to do that",
              brace: "(",
            });
            
          }
        }
      } catch (err) {
        console.log(err);
        res.render("error", {
          message_1: "OOPS!",
          message_2: "Something went wrong",
          brace: "(",
        });
        
      }
    }
    
}

export default UserController