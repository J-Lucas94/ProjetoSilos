module.exports = {
    eAdmin: (req, res, next)=>{
        if(req.isAuthenticated()){
            return next()
        } else {
            req.flash("error_msg", "Necessário realizar o login para acessar a Página solicitada!")
            res.redirect("/login")
        }
    }
}