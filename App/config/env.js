// API de dados
module.exports.apiAccessPoint = process.env.API || 'http://localhost:7778/api'

module.exports.apiRoute = (route) => this.apiAccessPoint + route 

// Servidor de autenticação
module.exports.authAccessPoint = process.env.AUTH || 'http://localhost:7779/users'

module.exports.authRoute = (route) => this.authAccessPoint + route