//express
const express = require('express')
const app = express()
app.use(express.json())
const path = require('path')

//Tabelas
const Movimentos = require('./models/movimentos')
const Usuarios = require('./models/usuarios')
const dbsequelize = require('./db/db')


//Body-parser
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//Handlebars

const handlebars = require('express-handlebars')
const sequelize = require('sequelize')
app.engine('handlebars', handlebars.engine({ defaultLayout: __dirname + '/views/layouts/main' }))
app.set('view engine', 'handlebars')

//Arquivos estáticos

app.use(express.static(path.join(__dirname, "public")))


//Rotas


app.get('/home', (req, res) => {
    res.render("home")
})


app.get('/form-usuarios', (req, res) => {
    res.render("form-usuarios")
})

app.post('/add-usuarios', async (req, res) => {
    try {
        const movimentos = await Usuarios.create(req.body)
        if (movimentos) {
            res.redirect('/usuarios')
        } else {
            return res.status(400),
                res.send("Não foi Possivel registrar o movimento !")
        }
    } catch (error) {
        res.send(error)
    }
})

app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuarios.findAll()
        res.render('usuarios', { usuarios: usuarios })
    } catch (error) {
        res.send(error)
    }
})

app.get('/del-usuarios/:id', async (req, res) => {
    try {
        const movimentos = await Usuarios.destroy({ where: { 'id': req.params.id } })
        if (movimentos) {
            res.send("Movimento Apagado com sucesso !")
        } else {
            res.status(400),
                res.send("Não foi Possivel Apagar o Movimento! ")
        }
    } catch (error) {
        res.send(error)
    }
})



//Controle de Movimentação
app.get('/form-carregamento', (req, res) => {
    res.render("form-carregamento")
})

app.get('/form-apontamentos', (req, res) => {
    res.render("form-apontamentos")
})


app.get('/saldos', async (req, res) => {
    var [results] = await dbsequelize.query('select silo,produto,sum(quantidade) quantidade from movimentos group by silo,produto', { raw: true })
    console.log(results)
    res.render("saldos", { saldos: results })
})

app.post('/zerasaldo/:silo', async (req, res) => {
    var [results] = await dbsequelize.query('select silo,produto,sum(quantidade) quantidade from movimentos where silo=' + req.params.silo + ' group by silo,produto', { raw: true })
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

app.post('/add-carregamento', async (req, res) => {
    try {
        var [results] = await dbsequelize.query('select silo,produto,sum(quantidade) quantidade from movimentos where silo=' + req.params.silo + ' group by silo,produto', { raw: true })
        if (results != 0) {
            res.send("Silo com produto favor Zerar a quantidade !")
            res.redirect('/saldos')
        } else {
            Movimentos.create(req.body, {
                tipo_movimentacao: "Ajuste"
            })}
            
    } catch (error) {
        res.send(error)
    }
})

app.post('/add-apontamentos', async (req, res) => {
    try {
        const movimentos = await Movimentos.create(req.body)
        if (movimentos) {
            res.redirect('/movimentos')
        } else {
            return res.status(400),
                res.send("Não foi Possivel registrar o movimento !")
        }
    } catch (error) {
        res.send(error)
    }
})

app.get('/movimentos', async (req, res) => {
    try {
        const movimentos = await Movimentos.findAll()
        res.render('movimentos', { movimentos: movimentos })
    } catch (error) {
        res.send(error)
    }

})


app.get('/del-movimentos/:id', async (req, res) => {
    try {
        const movimentos = await Movimentos.destroy({ where: { 'id': req.params.id } })
        if (movimentos) {
            res.send("Movimento Apagado com sucesso !")
        } else {
            res.status(400),
                res.send("Não foi Possivel Apagar o Movimento! ")
        }
    } catch (error) {
        res.send(error)
    }
})


app.listen(2000, console.log("Servidor Iniciado !!"))