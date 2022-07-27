var db = require('../db/db')

const { Sequelize, DataTypes } = require('sequelize')

const Usuarios = db.define('usuarios', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Preencha o campo nome !"
            }
        }
    },

    senha : {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Preencha o campo senha !"
            }
        }
    },

    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: {
                msg : "Preencha um E-MAIL valido ! "
            }
        }
    }

})

// db.sync({alter:true})

module.exports = Usuarios