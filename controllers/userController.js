import User from '../models/User.js';
import generateId from '../helpers/generateId.js';
import generateJWT from '../helpers/generateJWT.js';
import {emailRegister, emailPassword} from '../helpers/emails.js'

export const registerUser = async (req, res) => {
    const { email } = req.body;
    const checkUser = await User.findOne({ email })

    if (checkUser) {
        const error = new Error ('User already registered');
        return res.status(400).json({msg: error.message})
    }
    try {
        const user = new User(req.body)
        user.token = generateId();
        await user.save();
        emailRegister({
            email: user.email,
            name: user.name,
            token: user.token,
        })

        res.json({msg: 'User created successfully, check your email to confirm your registration' })
        
    } catch (error) {
        console.log (error)
    }
}

export const authenticateUser = async (req, res) => {
    const { email, password } = req.body;

    // Check if the user already exist
    const user = await User.findOne({ email })
    if (!user) {
        const error = new Error('User not exist');
        return res.status(404).json({msg: error.message})
    }

    // Check if the user is confirmed
    const {confirmed} = user;

    if (!confirmed) {
        const error = new Error('User is not confirmed');
        return res.status(404).json({msg: error.message})
    }
    // Check if the password is correct
    if( await user.checkPassword(password)){
        res.json ({
            _id: user._id,
            user: user.name,
            email: user.email,
            token: generateJWT(user._id),
        })
    } else {
        const error = new Error('Wrong password');
        res.status(403).json({msg: error.message})
    }
}

export const confirmUser = async (req, res) => {
    const {token} = req.params
    const userConfirm = await User.findOne({ token })
    if (!userConfirm){
        const error = new Error('Invalid token');
        return res.status(404).json({msg: error.message})
    }
    userConfirm.confirmed = true;
    userConfirm.token = '';
    await userConfirm.save();
    res.json({msg: 'User confirmed successfully'})
}

export const forgetPassword = async (req, res) =>{
    const {email} = req.body;
    const recoverUser = await User.findOne({ email });
    if (!recoverUser){
        const error = new Error('User not exist');
        return res.status(404).json({msg: error.message})
    }
    try {
        recoverUser.token = generateId();
        await recoverUser.save();
        emailPassword({
            email: recoverUser.email,
            name: recoverUser.name,
            token: recoverUser.token,
        })
        res.json({msg: 'We have sent an email. Check your inbox'})

    } catch (error) {
        console.log(error);
    }
}

export const checkToken = async (req, res) => {
    const {token} = req.params
    const validToken = await User.findOne({ token })
    if (!validToken){
        const error = new Error('Invalid token');
        return res.status(404).json({msg: error.message})
    }
    validToken.token = '';
    res.json(validToken)
}

export const newPassword = async (req, res) => {
    const { token } = req.params;
    const {password} = req.body;
    const user = await User.findOne({ token })
    
    if (user){
        user.password = password;
        user.token = '';
        await user.save();
        res.json({msg: 'Password change successfully'})
    }else { 
        const error = new Error('Invalid token');
        return res.status(404).json({msg: error.message})
    }
}

export const profile = async (req, res) => {
    const { user } = req;
    res.json(user)
}