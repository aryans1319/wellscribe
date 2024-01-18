const { User } = require('../models/index')
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');


const signUp = asyncHandler(async (req, res) => {
      const { username, email, password, role, place, phoneNumber } = req.body;
  
      try {
        const existingUser = await User.findOne({
          email: email,
          username: username,
        });
  
        if (existingUser) {
          return res.status(400).json({
            message: "User already exists",
          });
        }
        const userID = uuidv4();
        // const hashedPassword = await bcrypt.hash(password, 10);
  
        const newUser = await User.create({
          username: username,
          email: email,
          password: password,
          userID: userID,
          role: role,
          place: place,
          phoneNumber: phoneNumber  
        });
        req.io.emit('newUser', newUser);
        res.status(201).json({
          user: newUser,
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({
          message: "Something went wrong",
        });
      }
    });


const allUsers = asyncHandler (async (req, res) => {
  const users = await User.find();
  res.status(200).json(users);
})


module.exports = { signUp, allUsers };