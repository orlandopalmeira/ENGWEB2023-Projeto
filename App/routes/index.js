var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'uploads' })
var fs = require('fs')
var jsonfile = require('jsonfile')
var jwt = require('jsonwebtoken');
var querystring = require('querystring');
const API = require('../controllers/API')
const Auth = require('../controllers/Auth')

const tempToken = Auth.genServerTokenSync()
const tribunais = API.getTribunaisSync(tempToken)

function fileUnlink(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log(`${filePath} file was successfully deleted.`);
    });
}

// Constante que indica quantos registos apresentamos numa página.
const registosPorPagina = 10

/* Página de login, tem um pequeno formulário para o utilizador iniciar sessão. */
router.get('/login', function (req, res, next) {
    let token = req.cookies.token
    if (token) {
        jwt.verify(token, "EngWeb2023", function (e, payload) {
            if (e) { // ocorreu um erro
                if (e.name == 'TokenExpiredError') { // Se o token expirar
                    res.render('login', { title: "Login", warning: "Sessão expirou." })
                }

                else { // Pode haver dois outros tipos de erro JsonWebTokenError e NotBeforeError, mas a mensagem de erro nestes casos pode ser generica.
                    res.render('login', { title: "Login", warning: "Ocorreu um problema no login." })
                }
            }
            else { // Login bem-sucedido
                req.isAdmin = (payload.level == 'admin') // verifica se o token é referente a um utilizador que é administrador
                res.render('login', { title: "Login" })
            }
        })
    }
    else {
        // Se o utilizador não tiver nenhum token associado.
        res.render('login', { title: "Login" })
    }
})

/* Envia os dados de login para o servidor de autenticação.
Se os dados forem válidos, o servidor de autenticação responde com um token jwt. Caso contrário,
responde com um código 401 (Unauthorized) */
router.post('/login', function (req, res, next) {
    Auth.login(req.body)
        .then((response) => {
            res.cookie('token', response.data.token)
            const redirectTo = req.session.redirectTo || '/home'
            delete req.session.redirectTo // limpar a variável de sessão
            res.redirect(redirectTo)
        }).catch((err) => {
            res.render('login', { title: "Login", warning: "Credenciais inválidas.", loginData: { email: req.body.email, password: req.body.password } })
        });
})

router.get('/signup', function (req, res, next) {
    res.render('signup', { title: "Sign-up" })
})

// Esta rota apenas é usada pelo cliente, retornando:
// (code 512): Com uma mensagem de erro com o nome "warning".
router.post('/signup', function (req, res, next) {
    let signupData = { username: req.body.username, name: req.body.name, email: req.body.email, password: req.body.password }
    // Verificação dos campos provenientes do cliente
    let missingField = null
    for (let field in signupData) {
        if (signupData[field].length <= 0) {
            missingField = field
            break
        }
    }

    if (missingField) {
        warning = `Campo "${missingField}" por preencher.`
        res.status(512).jsonp({ warning: warning })
        missingField = null
    }
    else {
        Auth.register(signupData)
            .then((response) => {
                let error = response.data.error
                if (error) { // Se a autenticação falhou.
                    if (error.name == "UserExistsError") res.status(512).jsonp({ warning: "Já existe um utilizador com este email associado." })
                    else if (error.name == "MissingUsernameError") res.status(512).jsonp({ warning: "Não foi especificado um endereço de email." })
                    else res.status(512).jsonp({ warning: error.message })
                }
                else { // Se a autenticaçao correu bem, cola o token de auth nas cookies e direciona o user para a home.
                    res.cookie('token', response.data.token)
                    const redirectTo = req.session.redirectTo || '/home'
                    delete req.session.redirectTo // limpar a variável de sessão
                    res.redirect(redirectTo)
                }
            }).catch((err) => {
                res.status(512).jsonp({ warning: "Ocorreu um erro no serviço da criação da conta." })
            });

    }
})

router.get('/signupAdmin', Auth.verificaAdmin, function (req, res, next) {
    res.render('signupADM')
})

// Esta rota apenas é usada pelo cliente, retornando:
// (code 512): Com uma mensagem de erro com o nome "warning".
router.post('/signupAdmin', Auth.verificaAdmin,  function (req, res, next) {
    let token = req.cookies.token
    let signupData = { username: req.body.username, name: req.body.name, email: req.body.email, password: req.body.password }
    // Verificação dos campos provenientes do cliente
    let missingField = null
    for (let field in signupData) {
        if (signupData[field].length <= 0) {
            missingField = field
            break
        }
    }

    if (missingField) {
        warning = `Campo "${missingField}" por preencher.`
        res.status(512).jsonp({ warning: warning })
        missingField = null
    }
    else {
        Auth.registerAdmin(signupData, token)
            .then((response) => {
                let error = response.data.error
                if (error) { // Se a autenticação falhou.
                    if (error.name == "UserExistsError") res.status(512).jsonp({ warning: "Já existe um utilizador com este email associado." })
                    else if (error.name == "MissingUsernameError") res.status(512).jsonp({ warning: "Não foi especificado um endereço de email." })
                    else res.status(512).jsonp({ warning: error.message })
                }
                else {
                    res.redirect('/signupAdmin')
                }
            }).catch((err) => {
                res.status(512).jsonp({ warning: "Ocorreu um erro no serviço da criação da conta." })
            });

    }
})

router.get('/logout', function (req, res, next) {
    res.clearCookie('token')
    res.redirect('/login')
})

router.get('/profile', Auth.verificaAutenticacao, function (req, res, next) {
    let token = req.cookies.token
    Auth.getUser(req.idUser, token)
        .then((result) => {
            let user = result.data.dados
            res.render('profile', { title: "Perfil", user: user, admin: req.isAdmin })
        }).catch((err) => {
            res.render('profile', { title: "Perfil", admin: req.isAdmin })
        });
})

/* Página principal, é apresentado um formulário de pesquisa que o utilizador pode preencher
com diversos parâmetros. Tem algumas ligações para certas funcionalidades. */
router.get('/home', Auth.verificaAutenticacao, function (req, res, next) {
    var token = req.cookies.token
    API.getUserHistorico(req.idUser, token)
        .then((result) => {
            let historico = result.data
            if (historico.length > 0) {
                API.getAcordaoPreviews(historico, token)
                    .then((previews) => {
                        res.render('home', { title: 'Home', tribunais_dic: tribunais, historico: previews.data, admin: req.isAdmin })
                    }).catch((err) => {
                        res.render('home', { title: 'Home', tribunais_dic: tribunais, admin: req.isAdmin })
                    });
            }
            else { // se nao houver historico, não precisa de estar a pedir nada à API
                res.render('home', { title: 'Home', tribunais_dic: tribunais, admin: req.isAdmin })
            }
        }).catch((err) => {
            res.render('home', { title: 'Home', tribunais_dic: tribunais, admin: req.isAdmin })
        });
});

/* Mostra a página tribubais.pug que tem links com o nome de cada tribunal e cada link redireciona
para a página showAcordaos.pug que mostra todos os acórdãos do tribunal seleccionado. */
router.get('/tribunais', Auth.verificaAutenticacao, function (req, res, next) {
    res.render('tribunais', { title: 'Tribunais', tribunais_dic: tribunais, admin: req.isAdmin })
});

/* Carrega a página showAcordaos.pug onde são apresentados os diversos acórdãos de um determinado
tribunal */
router.get('/acordaos/tribunal/:id_trib', Auth.verificaAutenticacao, function (req, res, next) {
    let numPaginas = (nr_registos) => Math.ceil(nr_registos / registosPorPagina)
    let token = req.cookies.token
    let tribunal = tribunais[req.params.id_trib]
    let numPagina = req.query.page ? parseInt(req.query.page) : 1; // paginação, 1 é o valor padrão se este não estiver definido na query string 
    if (numPagina < 1)
        numPagina = 1 

    let resultPromise = API.acordaosFromTribunal(req.params.id_trib, token, numPagina)
    let favoritosPromise = API.getUserFavourites(req.idUser, token)
    Promise.all([resultPromise, favoritosPromise])
        .then(([result, favoritos]) => {
            // o result.data é um objecto com o formato: {'acordaos': [...], 'querySize': int}
            let favs = favoritos.data.map(fav => fav.idAcordao) // id's dos acórdãos favoritos do utilizador que fez o pedido

            res.render('showAcordaos', {
                title: `Acórdãos: ${tribunal}`,
                acordaos: result.data.acordaos,
                admin: req.isAdmin,
                url: `/acordaos/tribunal/${req.params.id_trib}?`,
                paginacao: {
                    pagina: numPagina,
                    ultimaPagina: numPaginas(result.data.querySize),
                    fim: numPagina == numPaginas(result.data.querySize)
                },
                'favoritos': favs
            }
            )
        }).catch((err) => {
            res.render('error', { title: "Erro", error: err, admin: req.isAdmin })
        });
})

/* Apresenta uma página (addAcordao.pug) com um formulário (grande) onde se pode criar um novo acórdão. */
//! OPERAÇÃO EXCLUSIVA DO ADMINISTRADOR
router.get('/acordaos/add', Auth.verificaAdmin, function (req, res, next) {
    res.render('addAcordao', { title: 'Adicionar acórdão', tribunais: tribunais, admin: req.isAdmin })
})

/* Mostra toda a informação de um acórdão através da página showAcordao.pug */
router.get('/acordaos/:id', Auth.verificaAutenticacao, function (req, res, next) {
    let token = req.cookies.token
    let idAcordao = req.params.id
    let acordaoPromisse = API.getAcordao(req.params.id, token) // obtenção do acórdão
    let favoritoPromise = API.isUserFavourite(req.idUser, idAcordao, token)
    Promise.all([acordaoPromisse, favoritoPromise])
        .then(([acordao, favorito]) => {
            API.addHistoricoToUser(req.idUser, idAcordao, token) // envia indicação que este acordão foi visitado
            res.render('showAcordao', { title: `Acórdão: ${tribunais[acordao.data.tribunal]}`, proc: acordao.data, admin: req.isAdmin, isFav: favorito.data, referer: (req.headers.referer || '/home') })
        }).catch((err) => {
            res.render('error', { title: 'Acordão não encontrado', error: `O acordão ${idAcordao} não foi encontrado!`, admin: req.isAdmin })
        });
});

/* Pedido GET cuja query string tem diversos parâmetros (gerados pelo formulário da home page)
e serve para encontrar todos os acordãos que fazem correspondência com todos os parâmetros
presentes na query string. Estes acórdãos são apresentados na página showAcordaos.pug */
router.get('/search', Auth.verificaAutenticacao, function (req, res, next) {
    let numPaginas = (nr_registos) => Math.ceil(nr_registos / registosPorPagina)
    let query = req.query
    let token = req.cookies.token
    // Descartamos campos vazios
    Object.keys(query).forEach(key => {
        if (!query[key])
            delete query[key];
    });

    let numPagina = req.query.page ? parseInt(req.query.page) : 1; // paginação, 1 é o valor padrão se este não estiver definido na query string 
    if (numPagina < 1)
        numPagina = 1


    // Já não precisamos destes valores no objecto query e também porque eles podem afectar o bom funcionamento do código a partir daqui
    delete query.page
    delete query.limit

    let queryString = querystring.stringify(query)

    let resultPromise = API.getAcordaosByManyFields(query, numPagina, token)
    let favoritosPromise = API.getUserFavourites(req.idUser, token)
    Promise.all([resultPromise, favoritosPromise])
        .then(([result, favoritos]) => {
            let favs = favoritos.data.map(fav => fav.idAcordao)

            res.render('showAcordaos', {
                title: 'Resultados da pesquisa',
                acordaos: result.data.acordaos,
                admin: req.isAdmin,
                url: `/search?${queryString}&`,
                favoritos: favs,
                paginacao: {
                    pagina: numPagina,
                    ultimaPagina: numPaginas(result.data.querySize),
                    fim: numPagina == numPaginas(result.data.querySize)
                }
            })
        }).catch((err) => {
            res.render('error', { title: "Erro", error: err, admin: req.isAdmin })
        });
})

/* Abre uma página (editAcordao.pug) onde é possível editar um certo acórdão.
O formulário dessa página faz um pedido POST (para este servidor) cujo body são os dados desse 
acórdão e este servidor envia esse body para a API de dados que encarregar-se-á de actualizar
os dados do acórdão.  */
//! OPERAÇÃO EXCLUSIVA DO ADMINISTRADOR
router.get('/acordaos/edit/:idAcordao', Auth.verificaAdmin, function (req, res, next) {
    let token = req.cookies.token
    API.getAcordao(req.params.idAcordao, token)
        .then((acordao) => {
            res.render('editAcordao', { title: 'Edição do acórdão', "acordao": acordao.data, tribunais: tribunais, admin: req.isAdmin })
        }).catch((err) => {
            res.render('error', { title: "Erro", error: err, admin: req.isAdmin })
        });
})

/* O formulário da página editAcordao.pug faz um pedido POST (para este servidor) cujo body são
os dados editados de um acórdão e este servidor envia esse body para a API de dados que encarregar-se-á de
actualizar os dados do acórdão. */
//! OPERAÇÃO EXCLUSIVA DO ADMINISTRADOR
router.post('/acordaos/edit/:idAcordao', Auth.verificaAdmin, function (req, res, next) {
    let token = req.cookies.token
    API.updateAcordao(req.body, token)
        .then((result) => {
            // Redireciona o utilizador para a página de visualização do acórdão para ele o poder ver já editado.
            res.redirect(`/acordaos/${req.params.idAcordao}`)
        }).catch((err) => {
            res.render('error', { title: "Erro", error: err, admin: req.isAdmin })
        });

})

/* O formulário da página addAcordao.pug envia um pedido POST para este servidor.
Este pedido POST tem no body os dados do acórdão que está a ser criado e envia os dados desse body
para a API de dados que encarregar-se-á de acrescentar o novo acórdão na base de dados. */
//! OPERAÇÃO EXCLUSIVA DO ADMINISTRADOR
router.post('/acordaos/add', Auth.verificaAdmin, function (req, res, next) {
    let token = req.cookies.token
    if (req.body.Descritores) { // Tratamento do caso em que o campo 'Descritores' no body não é um array e tem de ser transformado para ser correctamente colocado na API
        if (!Array.isArray(req.body.Descritores))
            req.body.Descritores = [req.body.Descritores]
    }
    
    API.addAcordao(req.body, token)
        .then((result) => {
            res.redirect(`/acordaos/${result.data.insertedId}`)
        }).catch((err) => {
            err.title = 'Erro na submissão do acórdão'
            res.render('acordaoOperationFailed', err)
        });
})

/* Na página addAcordao.pug também é possível submeter um acórdão contido num ficheiro json. 
O formulário responsável por essa funcionalidade efectua o pedido abaixo que lê o ficheiro json
fornecido e envia os dados desse ficheiro para a API de dados que encarregar-se-á de colocar o
novo acoŕdão na base de dados.
*/
//! OPERAÇÃO EXCLUSIVA DO ADMINISTRADOR
router.post('/acordaos/addFromFile', Auth.verificaAdmin, upload.single('myFile'), function (req, res, next) {
    const filePath = req.file.path;
    let token = req.cookies.token
    jsonfile.readFile(filePath)
        .then((fileContent) => {
            API.addAcordao(fileContent, token)
                .then((result) => {
                    var resultIds = null;
                    if (result.data.insertedIds) resultIds = Object.values(result.data.insertedIds)
                    else if (result.data.insertedId) resultIds = [result.data.insertedId]
                    if (resultIds && resultIds.length > 0) {
                        API.getAcordaoPreviews(resultIds, token)
                            .then((previews) => {
                                res.render('showAcordaos', {
                                    title: 'Acordãos adicionados',
                                    acordaos: previews.data,
                                    admin: req.isAdmin,
                                    favoritos: []
                                })
                                fileUnlink(filePath)
                            }).catch((err) => {
                                res.render('error', { title: "Erro", error: err, admin: req.isAdmin })
                                fileUnlink(filePath)
                            });
                    }
                    else {
                        res.render('error', { title: "Erro", error: "Não submeteu nenhuma informação no ficheiro!", redirect: "/acordaos/add", redirectButtonText: "Tentar novamente", admin: req.isAdmin })
                        fileUnlink(filePath)
                    }
                }).catch((err) => { // Caso em que a validação não foi cumprida. 
                    //* err = {ERRO: String, registo:JSON-object}
                    err.title = 'Ficheiro inválido'
                    res.render('acordaoOperationFailed', err)
                    fileUnlink(filePath)
                });
        })
        .catch(err => {
            res.render('error', { title: "Erro", error: "Houve um problema na submissão do ficheiro!\nCertifique-se que o formato do ficheiro JSON está correto.", admin: req.isAdmin })
            fileUnlink(filePath)
        });
})

/* Este pedido pode ser oriundo de diversas páginas que incluem a funcionalidade de eliminar
acórdãos. Neste pedido, é recebido o ID do acórdão a eliminar e este servidor encarrega-se de 
encaminhas esse pedido à API de dados de tratará de eliminar o acórdão da base de dados. */
//! OPERAÇÃO EXCLUSIVA DO ADMINISTRADOR
router.get('/acordaos/delete/:idAcordao', Auth.verificaAdmin, (req, res, next) => {
    let token = req.cookies.token
    API.deleteAcordao(req.params.idAcordao, token)
        .then((result) => {
            res.sendStatus(200)
        }).catch((err) => {
            res.sendStatus(500)
        });

})


/* Este pedido responde com a página dos favoritos (favourites.pug) de um certo utilizador.
O id do utilizador é obtido a partir do seu token de autenticação. */
router.get('/favoritos', Auth.verificaAutenticacao, function (req, res, next) {
    let token = req.cookies.token
    API.getUserFavourites(req.idUser, token)
        .then((result) => {
            let dados = result.data
            favoritos_ids = dados.map(e => e.idAcordao)
            descricoes = dados.map(e => e.descricao)
            if (favoritos_ids.length > 0) { // se nao houver favoritos, não precisa de estar a pedir nada à API
                API.getAcordaoPreviews(favoritos_ids, token)
                    .then((previews) => {
                        acordaos = previews.data
                        for (let i = 0; i < acordaos.length; i++) {
                            acordaos[i].descricao = descricoes[i]
                        }
                        res.render('favourites', { title: 'Favoritos', favoritos: acordaos, admin: req.isAdmin })
                    }).catch((err) => {
                        res.render('error', { title: "Erro", error: err, admin: req.isAdmin })
                    });
            }
            else {
                res.render('favourites', { title: 'Favoritos', favoritos: [], admin: req.isAdmin })
            }
        }).catch((err) => {
            res.render('error', { title: "Erro", error: err, admin: req.isAdmin })
        });
})

router.post('/editFavourite', Auth.verificaAutenticacao, function (req, res, next) {
    let token = req.cookies.token
    API.updateFavouriteInUser(req.idUser, req.body, token)
        .then((result) => {
            res.jsonp(result.data)
        }).catch((err) => {
            res.jsonp(err)
        });
})

router.get('/deleteFavourite', Auth.verificaAutenticacao, function (req, res, next) {
    let token = req.cookies.token
    let idAcordao = req.query.idAcordao
    API.removeFavouriteFromUser(req.idUser, idAcordao, token)
        .then((result) => {
            res.jsonp(result.data)
        }).catch((err) => {
            res.jsonp(err)
        });
})

router.post('/addFavourite', Auth.verificaAutenticacao, function (req, res, next) {
    let token = req.cookies.token
    API.addFavouriteToUser(req.idUser, req.body, token)
        .then((result) => {
            res.jsonp(result.data) 
        }).catch((err) => {
            res.jsonp(err)
        });
})

router.post('/editProfile', Auth.verificaAutenticacao, function (req, res, next) {
    let token = req.cookies.token
    let editData = { username: req.body.username, name: req.body.name, email: req.body.email }
    // Verificação dos campos provenientes do cliente
    let missingField = null
    for (let field in editData) {
        if (editData[field].length <= 0) {
            missingField = field
            break
        }
    }
    if (missingField) {
        res.status(512).jsonp({ editData: editData })
        missingField = null
    }
    else {
        Auth.updateUser(req.idUser, req.body, token)
            .then((result) => {
                res.jsonp(result.data)
            }).catch((err) => {
                res.status(409).jsonp(err) // email conflituoso
            });
    }
})

router.get('/taxonomia', Auth.verificaAutenticacao, function (req, res, next) {
    let token = req.cookies.token
    API.getTaxonomia(token)
        .then((result) => {
            res.render('taxonomia', { title: "Taxonomia", taxonomia: result.data, admin: req.isAdmin })
        }).catch((err) => {
            res.render('error', { title: "Erro", error: err, admin: req.isAdmin })
        });
})

router.post('/addTribunal', Auth.verificaAdmin, function (req, res, next) {
    let token = req.cookies.token
    API.addTribunal(req.body, token)
        .then((result) => {
            tribunais[req.body._id] = req.body.name
            res.redirect('/tribunais')
        }).catch((err) => {
            res.render('error', { title: "Erro", error: "Ocorreu um erro na inserção do novo tribunal", redirect: '/tribunais', redirectButtonText: 'Tentar novamente', admin: req.isAdmin })
        });
})

module.exports = router;


