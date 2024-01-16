const { User } = require('../models/index')
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid');


const ACCESS_TOKEN_SECRET = "authnow";
const REFRESH_TOKEN_SECRET = "authnow";

const signUp = asyncHandler(async (req, res) => {
      const { username, email, password, confirmPassword, role, place, phoneNumber } = req.body;
  
      try {
        if (!(username && email && password && confirmPassword && role && place && phoneNumber)) {
          return res.status(400).json({
            message: "All fields are compulsory",
          });
        }
  
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
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const newUser = await User.create({
          username: username,
          email: email,
          password: hashedPassword,
          confirmPassword: confirmPassword,
          userID: userID,
          role: role,
          place: place,
          phoneNumber: phoneNumber  
        });
  
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

const signIn = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const cookies = req.cookies;
      if (!(email && password)) {
        return res.status(400).json({
          message: "All fields are compulsory",
        });
      }
      const existingUser = await User.findOne({ email: email }).exec();
  
      if (!existingUser) {
        return res.status(404).json({
          message: "User not found! Signup Now",
        });
      }
  
      const matchedPassword = await bcrypt.compare(
        password,
        existingUser.password
      );
  
      if (!matchedPassword) {
        return res.status(400).json({
          message: "Invalid Credentials",
        });
      }
  
      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: existingUser.email,
            roles: existingUser.role,
          },
        },
        ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );
  
      const newRefreshToken = jwt.sign(
        { username: existingUser.email },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "15s" }
      );
  
      let newRefreshTokenArray = !cookies?.jwt
        ? existingUser.refreshToken
        : existingUser.refreshToken.filter(
            (newToken) => newToken !== cookies.jwt
          );
  
      if (cookies?.jwt) {
        /*
        - User logs in but never uses Refresh token and does not logout
        - Refresh token is stolen
        - if 1 & 2, reuse detection is needed to clear all RTs when user logs in
      */
        const refreshToken = cookies.jwt;
        const foundToken = await User
          .findOne({
            refreshToken,
          })
          .exec();
        if(!foundToken){
          console.log('attempted refresh token reuse at login!');
          newRefreshTokenArray = [];
        }
        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "none",
          secure: false,
        });
      }
      existingUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
      const result = await existingUser.save();
      res.cookie("jwt", newRefreshToken, {
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: "none",
        httpOnly: true,
        secure: false,
      });
      res.status(200).json({
        accessToken: accessToken,
        message: "Login Successful",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Something went wrong",
      });
    }
});

const signOut = asyncHandler(async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
        return res.status(204).json({
            message: "No cookies"
        });
    }
    console.log("ho");
    const refreshToken = cookies.jwt;
    // Is refresh token in DB? 
    const existingUser = await User.findOne({ refreshToken }).exec();
    if (!existingUser) {
        // Clear the cookie on the client side
        res.clearCookie(
            'jwt',
            {
                httpOnly: true,
                sameSite: 'none',
                secure: false,
            }
        );
        console.log("ho");
        // Send the "Logged Out" message
        return res.status(200).json({
            message: "Logged Out"
        });
    }

    // Delete refresh token in the database
    existingUser.refreshToken = existingUser.refreshToken.filter(
        newToken => newToken !== refreshToken
    );

    const result = await existingUser.save();
    console.log(result);

    // Clear the cookie on the client side
    res.clearCookie(
        'jwt',
        {
            httpOnly: true,
            sameSite: 'none',
            secure: false,
        }
    );

    // Send the "Logged Out" message
    return res.status(200).json({
        message: "Logged Out"
    });
});


const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })
    const refreshToken = cookies.jwt
    res.clearCookie(
        'refreshToken',
        {
            httpOnly : true,
            sameSite : 'none',
            secure : false,
        }
    );
    const existingUser = await User.findOne({ refreshToken }).exec();
    // Detected Refresh Token reuse
    if(!existingUser){
        jwt.verify(
            refreshToken,
            REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                    if (err || existingUser.email !== decoded.email) {
                        return res.status(403).json({ 
                            message: 'Forbidden' 
                        });
                    }
                    console.log('attempted refresh token reuse');
                    const hackedUser = await User.findOne({
                        email: decoded.email
                    }).exec();
                    hackedUser.refreshToken = [];
                    const result = await hackedUser.save();
                    console.log(result);    
        })
        return res.status(403).json({
            message: "Unauthorized",
        });
    }
    const newRefreshTokenArray = existingUser.refreshToken.filter(
        newToken => newToken !== refreshToken
    );
    jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if(err){
                console.log('Expired refresh token');
                existingUser.refreshToken = [...newRefreshTokenArray];
                const result = await existingUser.save();
                console.log(result);
            }
            if(err || existingUser.email !== decoded.email) return res.status(403).json({ message: 'Forbidden' })
            // Refresh token was still valid
            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "email": existingUser.email,
                    }
                },
                ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            );

            const newRefreshToken = jwt.sign(
                { "username": existingUser.email },
                REFRESH_TOKEN_SECRET,
                { expiresIn: '1h' }
            );
          
            existingUser.refreshToken = [...newRefreshTokenArray, newRefreshToken];
            const result = await existingUser.save();
            res.cookie(
                'jwt', 
                newRefreshToken,
                {
                    maxAge : 1000 *
                             60 *
                             60 *
                             24,
                    sameSite : 'none',
                    httpOnly : true,
                    secure : false,         
                }
            ); 
            res.json({ accessToken })
        }
    )
});

module.exports = { signIn, signUp, signOut, handleRefreshToken };