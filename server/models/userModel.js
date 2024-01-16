const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    username : {
        type: String,
    },
    email : {
        type: String,
    },
    password : {
        type: String,
    },
    userID : {
        type : String,
        unique: true,
    },
    role : {
        type: String,
        enum: ['user', 'admin'],
    },
    place : {
        type: String,
    },
    phoneNumber : {
        type:String,
    },
    refreshToken: {
        type : [String],
    },
})

const User = mongoose.model("User", userSchema);
module.exports = User;