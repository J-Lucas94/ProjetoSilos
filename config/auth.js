const localStrategy = require('passport-local').Strategy
const bcrypt = require("bcryptjs")
const passport = require('passport')
const Usuarios = require('../models/usuarios')




module.exports = (passport)=>{
    passport.use(new localStrategy({usernameField: "email",  passwordField: "senha"}, (email, senha, done)=>{
        Usuarios.findOne({ where: { email: email }}).then((usuario)=>{
            if(!usuario){
                return done(null, false, {message: "Essa conta não exite !"})
            }

            bcrypt.compare(senha, usuario.senha, (erro, correta)=>{
                if(correta){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: "Dados de acesso incorretos!"})
                }
            })
        })
    }))
}


    passport.serializeUser((usuario, done)=>{
        done(null, usuario.id)
    })
    passport.deserializeUser((id, done)=>{
        Usuarios.findOne({where: {id: id}}).then((usuario)=>{
            done(null, usuario)
        }).catch((err)=>{
            done(err, null)
        })
    })
     

  