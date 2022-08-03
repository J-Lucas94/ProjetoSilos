//express
const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')


//Tabelas
const Movimentos = require('./models/movimentos')
const Usuarios = require('./models/usuarios')
const dbsequelize = require('./db/db')

//Bcrypt
const bcrypt = require('bcryptjs')

//passport
const passport = require('passport')
require("./config/auth")(passport)
const { eAdmin } = require('./helpers/eAdmin')



//Body-parser
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Handlebars

const handlebars = require('express-handlebars')
const sequelize = require('sequelize')
app.engine('handlebars', handlebars.engine({ defaultLayout: __dirname + '/views/layouts/main' }))
app.set('view engine', 'handlebars')

//Mensagens e Session
const session = require('express-session')
const flash = require('connect-flash')
//Config

//Sessão
app.use(session({
    secret: "332427zea",
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())




//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null
    res.locals.eAdmin = eAdmin || null;
    next()
})



//Arquivos estáticos

app.use(express.static(path.join(__dirname, "public")))


//Rotas

//Login de Usuarios



app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/saldos",
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next)
})

app.get('/logout', async (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        req.flash("success_msg", "Deslogado com sucesso!")
        res.redirect("/login")
    })
})





// app.get('/', eAdmin, async (req, res) => {
//     res.render('saldos')
// })


app.get('/form-usuarios', eAdmin, async (req, res) => {
    res.render("form-usuarios")
})

app.post('/add-usuarios', eAdmin, async (req, res) => {
    var errors = []

    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        errors.push({ error: "Error:  Necessário preencher o campo senha!" })
    }
    if (!req.body.rep_senha || typeof req.body.rep_senha == undefined || req.body.rep_senha == null) {
        errors.push({ error: "Error:  Necessário preencher o campo repetir senha!" })
    }
    if (req.body.senha != req.body.rep_senha) {
        errors.push({ error: "Error:  As senhas são diferentes!" })
    }
    if (req.body.senha.length < 6) {
        errors.push({ error: "Error: Senha muito fraca!" })
    }

    if (errors.length > 0) {
        res.render("form-usuarios", { errors: errors })
    } else {
        Usuarios.findOne({ where: { email: req.body.email } }).then((usuario) => {
            if (usuario) {
                req.flash("error_msg", "Error: Já existe uma conta com esse E-mail !")
                res.redirect('/form-usuarios')
            } else {

                const usuario = new Usuarios({
                    nome: req.body.nome,
                    senha: req.body.senha,
                    email: req.body.email
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(usuario.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Error: Houve um erro no cadastro tente novamente!")
                        } else {
                            usuario.senha = hash
                            usuario.save().then(() => {
                                req.flash("success_msg", "Usuário criado com sucesso !")
                                res.redirect("/usuarios")
                            }).catch((erro) => {
                                req.flash("error_msg", "Error: Usuário não foi cadastrado com sucesso!")
                                res.render("/form-usuarios")
                            })
                        }

                    })

                })

            }
        }).catch((erro) => {
            req.flash("error_msg", "Error: Não foi possivel cadastrar o usuário !")
            res.redirect("/home")
        })
    }
})

app.get('/edit-senha', eAdmin, async(req, res)=>{
   const usuarios = await Usuarios.findOne({where: {id: req.user.id}})
    if(usuarios){
        res.render("edit-senha", {usuarios: usuarios})
    }else{
        req.flash("error_msg", "Error: Não foi possivel encontrar o usuário !")
        res.redirect("/edit-senha")
    }
})

app.post("/update-senha-perfil", eAdmin, (req, res)=>{
    var errors =[]
    
    if (!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo senha!" })
    }
    if (!req.body.rep_senha || typeof req.body.rep_senha == undefined || req.body.rep_senha == null) {
        errors.push({ error: "Erro: Necessário preencher o campo repetir senha!" })
    }
    if (req.body.senha != req.body.rep_senha) {
        errors.push({ error: "Erro: As senhas são diferentes!" })
    }
    if (req.body.senha.length < 6) {
        errors.push({ error: "Erro: Senha muito fraca!" })
    }

    if(errors.length > 0){
res.render("/edit-senha", {errors: errors})
    }else {
        Usuarios.findOne({id: req.user.id}).then((usuario)=>{
            usuario.senha = req.body.senha
            bcrypt.genSalt(10, (erro, salt)=>{
                bcrypt.hash(usuario.senha, salt, (erro, hash)=>{
                    if(erro){
                        req.flash("error_msg", "Error: Não foi possivel editar a senha, entre em contato com o adminstrador !")
                        res.redirect("/usuarios")
                    }else{
                        usuario.senha = hash
                        usuario.save().then(()=>{
                            req.flash("success_msg", "Senha Editada com sucesso !")
                        res.redirect("/usuarios")
                        }).catch((erro)=>{
                            req.flash("error_msg", "Error: Não foi possivel editar a senha, entre em contato com o adminstrador !")
                        res.redirect("/usuarios")
                        })
                    }
                })
            })
        }).catch((erro)=>{
            req.flash("error_msg", "Error: Perfil não encontrado!")
            res.redirect("/usuarios")
        })
    }
})



app.get('/usuarios', eAdmin, async (req, res) => {
    try {
        const usuarios = await Usuarios.findAll()
        res.render('usuarios', { usuarios: usuarios })
    } catch (error) {
        res.send(error)
    }
})



app.get('/del-usuarios/:id', eAdmin, async (req, res) => {
    try {
        const usuarios = await Usuarios.destroy({ where: { id: req.params.id } })
        if (usuarios) {
            req.flash("success_msg", "Usuário Apagado com sucesso !")
            res.redirect("usuarios")
        } else {
            req.flash("error_msg", "Error: Não foi possivel cadastrar o Usuário !")
            res.redirect("/usuarios")
        }
    } catch (error) {
        res.send(error)
    }
})




//Controle de Movimentação
app.get('/form-carregamento', eAdmin, async (req, res) => {
    res.render("form-carregamento")
})

app.get('/form-apontamentos', eAdmin, async (req, res) => {
    res.render("form-apontamentos")
})


app.get('/saldos', eAdmin, async (req, res) => {
    var [results] = await dbsequelize.query('SELECT silo,produto,sum(quantidade) quantidade FROM movimentos GROUP BY silo,produto', { raw: true })
    console.log(results)
    res.render("saldos", { saldos: results })

})



app.post('/zerasaldo/:silo', eAdmin, async (req, res) => {
    var [results] = await dbsequelize.query('SELECT silo,produto,sum(quantidade) quantidade FROM movimentos WHERE silo=' + req.params.silo + ' GROUP BY silo,produto', { raw: true })
    console.log(results)
    Movimentos.create({
        silo: req.params.silo,
        quantidade: -results[0].quantidade,
        produto: results[0].produto,
        id_usuario: 1,
        tipo_movimentacao: "Ajuste"
    })
    res.render("saldos", { saldos: results })
})


app.post('/add-carregamento', eAdmin, async (req, res) => {

    try {
        var [results] = await dbsequelize.query('SELECT silo,produto,sum(quantidade) quantidade FROM movimentos WHERE silo=' + req.params.silo + ' GROUP BY silo,produto', { raw: true })
        console.log(results)
        if (results != 0) {
            req.flash("error_msg", "Silo com produto !")
            res.redirect("/form-carregamento")
        } else {
            const movimentos = await Movimentos.create({
                id_usuario: req.body.id_usuario,
                silo: req.body.silo,
                produto: req.body.produto,
                quantidade: req.body.quantidade,
                lote: req.body.lote,
                data: req.body.data,
                tipo_movimentacao: "Carregamento",
            })
            if (movimentos) {
                req.flash("success_msg", "Carregamento regitrado com sucesso !")
                res.redirect("/movimentos")
            } else {
                req.flash("error_msg", "Não foi possivel regitrar o carregamento !")
                res.redirect("/form-carregamento")
            }
        }

    } catch (error) {
        res.send(error)
    }
})

app.get('/edit-movimentos/:id', eAdmin, (req, res)=>{
   Movimentos.findOne({where:{id: req.params.id}}).then((usuario)=>{
    req.flash("success_msg", "Sucesso" )
    res.render("edit-movimentos", {usuario: usuario})
   }).catch((error)=>{
    res.render(error)
   })
})

app.post('/edit-movimento', eAdmin, async (req, res) => {
    try {
        const movimentos = await Movimentos.create({
            id_usuario: req.body.id_usuario,
            silo: req.body.silo,
            produto: req.body.produto,
            quantidade: req.body.quantidade,
            lote: req.body.lote,
            data: req.body.data,
            tipo_movimentacao: "Editar"
        })
        if (movimentos) {
            req.flash("success_msg", "Movimento editado com sucesso !")
            res.redirect('/movimentos')
        } else {
            return res.status(400),
                res.redirect('/movimentos'),
                req.flash("error_msg", "Error: Não foi editar  o movimento!")
        }
    } catch (error) {
        res.send(error)
    }
})




app.post('/add-apontamentos', eAdmin, async (req, res) => {
    try {
        const movimentos = await Movimentos.create({
            id_usuario: req.body.id_usuario,
            silo: req.body.silo,
            produto: req.body.produto,
            quantidade: req.body.quantidade,
            lote: req.body.lote,
            data: req.body.data,
            tipo_movimentacao: "Apontamentos"
        })
        if (movimentos) {
            req.flash("success_msg", "Apontamento registrado com sucesso !")
            res.redirect('/movimentos')
        } else {
            return res.status(400),
                res.redirect('/form-apontamentos'),
                req.flash("error_msg", "Error: Não foi Possivel registrar o apontamento!")
        }
    } catch (error) {
        res.send(error)
    }
})

app.get('/movimentos', eAdmin, async (req, res) => {
    try {
        const movimentos = await Movimentos.findAll()
        res.render('movimentos', { movimentos: movimentos })
    } catch (error) {
        res.send(error)
    }
})


app.get('/del-movimentos/:id', eAdmin, async (req, res) => {
    try {
        const movimentos = await Movimentos.destroy({ where: { 'id': req.params.id } })
        if (movimentos) {
            res.send("Movimento Apagado com sucesso !")
        } else {
            res.redirect('/movimentos'),
                req.flash("error", "Error: Não foi Possivel registrar o apontamento!")
        }
    } catch (error) {
        res.send(error)
    }
})


app.listen(2000, console.log("Servidor Iniciado !!"))