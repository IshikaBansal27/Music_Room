const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function registerUser(req , res)
{
    try{

        const {username , email , password} = req.body;

        const existingEmail = await User.findOne({email});
        if(existingEmail)
        {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const existingUsername = await User.findOne({username});
        if(existingUsername)
        {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password , 10);
        const user = await User.create({username , email , password: hashedPassword});
        const token = jwt.sign(
            { id: user._id , username: user.username} , 
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );
        res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email } });
    }  catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }  
}

async function loginUser(req , res)
{
    try
    {
         const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password , user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
    
        const token = jwt.sign(
        { id: user._id, username: user.username },
            process.env.JWT_SECRET,
        { expiresIn: '7d' }
        );

        res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

async function getCurrentUser(req , res) {
    try
    {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = {registerUser , loginUser , getCurrentUser};