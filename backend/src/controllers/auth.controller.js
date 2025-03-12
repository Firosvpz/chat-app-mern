import { generateToken } from "../lib/util.js"
import User from "../models/user.model.js"
import bcrypt from 'bcryptjs'

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body
    try {

        if (!fullName || !email || !password)  return res.status(400).json({ message: "All field must be filled" })
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        const user = await User.findOne({ email })
        if (user) return res.status(400).json({ message: "Email already exist" })
        
        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password,salt)
        
        const newUser = new User(
            {
                fullName,
                email,
                password:hashPassword
            }
        )

        if(newUser){
            generateToken(newUser._id,res)
            await newUser.save()


            res.status(201).json({
                _id:newUser._id,
                fullName : newUser.fullName,
                email:newUser.email,
                profilePic:newUser.profilePic
            })
        }else{
            res.status(400).json({message:"invalid userdata"})
        }

    } catch (error) {
        console.log('sign up controller error',error.message);
        res.status(500).json({message:"Internal server error"})
        
    }
}

export const login = (req, res) => {
    res.send('login route')
}

export const logout = (req, res) => {
    res.send('logout route')
}