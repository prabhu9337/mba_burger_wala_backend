import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";

import {User} from '../models/UserModel.js'

export const connectPassport = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
    }, async function (accessToken, refreshToken, profile, next) {
        // find user in database by user profile id
        const user = await User.findOne({
            googleId: profile.id
        })

        // if user is found in database
        if(!user) {
            // then creating a new user profile
            const newUser = await User.create({
                googleId: profile.id,
                name: profile.displayName,
                photo: profile.photos[0].value,
            })

            // then return the new user
            return next(null, newUser)
        } else {
            // then simply return the existing user
            return next(null, user)
        }
    }))

    passport.serializeUser((user, next) => {
        next(null, user.id)
    })

    passport.deserializeUser(async (id, next) => {
        const user = await User.findById(id)
        next(null, user)
    })
}