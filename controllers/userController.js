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

  static userReset = async(req,res)=>{
    try {
        const useremail=req.body.uemail;
        if(useremail){
            const finduser=await Register.findOne({email:useremail});

            if(finduser){
                const resettoken=await finduser.generateresetToken();
                const link=`http://localhost:3000/password/reset/${finduser._id}/${resettoken}`;
                console.log(link);

                let info=await transpoter.sendMail({
                    from:process.env.EMAIL_FROM,
                    to:finduser.email,
                    subject:"password reset link",
                    html:`<a href=${link}>click here </a>`,

                })
                res.send("email has been sent");


            }else{
                res.send("Email Doest Not Exist");
            }
        }else{
            res.status(400).send("Invalid Email");
        }
        
    } catch (e) {
        res.status(400).send(e);
        
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
      res.send({ "status": "failed", "message": "Passwword not reset" })
    }
  }
  static change_nickname = async (req, res) => {
      const new_nickname = req.body.new_nickname;
      console.log(
        await User.updateOne({ email: req.userEmail }, { nickname: new_nickname })
      );
      res.redirect("/user/nickname");
      res.status(201).json({
        message: `Nickname updated to ${new_nickname}`,
      });
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
      const bandaemail=req.body.uemail;
    const displaynickname=await Register.findOne({email:bandaemail});
    const username=displaynickname.nickname;
     res.render("nickname",{
        nicknameofperson:username
     });
    };
    static delete_user = async (req, res) => {
      try {
        const admin = await user.findOne({ _id: req.userId });
        const user = await user.findOne({ email: req.params.email });
        if (user) {
          console.log(user);
          if (admin.role === "admin") {
            console.log(
              await user.deleteOne({ email: req.params.email }),
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
        console.log(error)
            res.send
            ({ "status": "failed", "message": "Unable to Login" })
        };
        
      }
    }
    


export default UserController