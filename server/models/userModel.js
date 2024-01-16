const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username : {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true
    },
    password : {
        type: String,
        required: true
    },
    confirmPassword : {
        type: String,
        required: true
    },
    userID : {
        type : String,
        required: true,
        unique: true,
    },
    role : {
        type: String,
        enum: ['user', 'admin'],
        required: true,
    },
    place : {
        type: String,
        required: true,
    },
    phoneNumber : {
        type:String,
        required: true,
    },
    refreshToken: {
        type : [String],
    },
})

const User = mongoose.model("User", userSchema);
module.exports = User;