const localStrategy = require('passport-local')
const bcrypt = require('bcrypt')

function initialize(passport, getUser, getUserbyID) {
    const authenticateUser = async(email,password,done)=>{
        const user = await getUser(email)
        if(user===null)
            return done(null,false,{message:"User not found"})
        try {            
            if(await bcrypt.compare(password,user.password))
                return done(null,user)
            else
                return done(null,false,{message:"Incorrect Password"})
        } catch (e) {
            return done(e)
        }
    }
    passport.use(new localStrategy({usernameField:'email',passwordField:'password'},authenticateUser))
    passport.serializeUser(async(user,done)=> done(null,await user.username))
    passport.deserializeUser(async (username,done)=>{
        return done(null, await getUserbyID(username))
    })
}
module.exports = initialize;