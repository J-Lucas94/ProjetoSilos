var db = require('../db/db')

const { Sequelize, DataTypes } = require('sequelize')

const Movimentos = db.define('movimentos', {

    id_usuario: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Por favor Preencha o campo Hora !"
            }
        }
    },

    id_apontamento: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: {
                msg: "Por favor Preencha o campo Hora !"
            }
        }
    },

    ciclo: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: {
                msg: "Por favor Preencha o campo Hora !"
            }
        }
    },

    requisicao: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: {
                msg: "Por favor Preencha o campo Hora !"
            }
        }
    },

    silo :{
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Por favor Preencha o campo Silos!"
            }
        }
    },

    produto: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Por favor Preencha o campo Produtos!"
            }
        }
    },

    quantidade: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Por favor Preencha o campo Produtos!"
            }
        }
    },

    tipo_movimentacao: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: {
                msg: "Por favor preencha o campo Movimentação !"
            }
        }
    },

    lote: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            notEmpty: {
                msg: "Por favor preencha o campo Movimentação !"
            }
        }
    },

    data: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            notEmpty: {
                msg: "Por favor Preencha o campo Data !"
            }
        }
    },


    hora: {
        type: DataTypes.DATE,
        allowNull: true,
        validate: {
            notEmpty: {
                msg: "Por favor Preencha o campo Data !"
            }
        }
    }
})





//Movimentos.sync({alter:true})

module.exports = Movimentos