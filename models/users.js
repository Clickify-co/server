const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required: true,
        trim:true
    },
    password:{
        type:String,
        required: true,
    },
    fullName:{
        firstName:{
            type:String,
            required:false,
        },
        lastName:{
            type:String,
            required:false
        }
    }
})
userSchema.index({email:1},{unique:true})
userSchema.index({username:1},{unique:true})

module.exports = mongoose.model('users',userSchema)