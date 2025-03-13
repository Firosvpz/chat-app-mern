import cloudinary from "../lib/cloudinary.js"
import { generateToken } from "../lib/util.js"
import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body
    try {

        if (!fullName || !email || !password) return res.status(400).json({ message: "All field must be filled" })
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const user = await User.findOne({ email })
        if (user) return res.status(400).json({ message: "Email already exist" })

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password, salt)

        const newUser = new User(
            {
                fullName,
                email,
                password: hashPassword
            }
        )

        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save()


            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json({ message: "invalid userdata" })
        }

    } catch (error) {
        console.log('sign up controller error', error.message);
        res.status(500).json({ message: "Internal server error" })

    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    console.log(req.body);

    try {
        if (!email || !password) return res.status(400).json({ message: "All fields is required" })
        const user = await User.findOne({ email })
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" })
        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch)
            return res.status(400).json({ message: "Invalid credentials" })

        generateToken(user._id, res)
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })

    } catch (error) {
        console.log('login controller error', error.message);
        res.status(500).json({ message: "Internal server error" })
    }
}

export const logout = async (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 0 })
        res.status(200).json({ message: "logged out successfully" })
    } catch (error) {
        console.log('logout controller error', error.message);
        res.status(500).json({ message: "Internal server error" })
    }
}

export const updateProfile = async (req, res) => {
    try {
      const { profilePic } = req.body;
      const userId = req.user._id;
  
      if (!profilePic) {
        return res.status(400).json({ message: "Profile pic is required" });
      }
  
      const uploadResponse = await cloudinary.uploader.upload(profilePic);
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: uploadResponse.secure_url },
        { new: true }
      );
  
      res.status(200).json(updatedUser);
    } catch (error) {
      console.log("error in update profile:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  export const checkAuth = (req, res) => {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      console.log("Error in checkAuth controller", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };