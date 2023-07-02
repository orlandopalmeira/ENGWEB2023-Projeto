var Acordao = require('../models/acordao')
var Tribunal = require('../controllers/tribunal')

// Função auxiliar para gerar uma expressão regular diacritic insensitive
function diacriticSensitiveRegex(string) {
    return string
        .replace(/a/g, '[a,á,à,ä,â,ã]')
        .replace(/A/g, '[A,Á,À,ä,Â,Ã]')
        .replace(/e/g, '[e,é,ë,è,ê]')
        .replace(/E/g, '[E,É,ë,È,Ê]')
        .replace(/i/g, '[i,í,ï,ì]')
        .replace(/I/g, '[I,Í,ï,Ì]')
        .replace(/o/g, '[o,ó,ö,ò]')
        .replace(/O/g, '[O,Ó,ö,Ò]')
        .replace(/u/g, '[u,ü,ú,ù]')
        .replace(/U/g, '[U,ü,Ú,Ù]');
}

// Listagem de todos os acórdãos, paginação opcional.
module.exports.list = (page = 1, limit = 0) => {
    return Acordao.find().sort({ data: -1 }).skip((page - 1) * limit).limit(limit)
        .then(dados => {
            return dados
        })
        .catch(erro => {
            throw erro
        })
}

// Obtém um acórdão pelo seu ID
module.exports.getAcordao = id => {
    return Acordao.findById(id)
        .then(acordao => {
            if (!acordao) {
                throw error
            }
            return acordao
        })
        .catch(erro => {
            throw erro
        })
}

// Obtém acórdãos através de múltiplos campos, paginação opcional e opções de sorting extra em que {Campo:1} ordena pelo "Campo" ascendentemente.
module.exports.getAcordaosByManyFields = (fields, page = 1, limit = 0, sorting = {}) => {
    var searchKW = false

    // verificamos se o campo das palavras chave foi utilizado
    if ('keywords' in fields) {
        searchKW = true
        fields['$text'] = { '$search': fields.keywords }
        delete fields.keywords
    }

    if ('Descritores' in fields) {
        arrDescritores = fields['Descritores'].split(";").map(e => e.trim())
        fields['Descritores'] = { $all: arrDescritores }
    }

    if ('Juiz' in fields) {
        let diacriticFormat = diacriticSensitiveRegex(fields.Juiz)
        let regexJuiz = new RegExp(`${diacriticFormat}`, 'iu');
        fields['Juiz'] = { $regex: regexJuiz }
    }

    // Verificamos se o utilizador pretende um intervalo de datas e agimos em conformidade.
    if (fields.date_type == 'intervaloDatas') {
        fields['Data do Acordão'] = { $gte: fields['Data do Acordão'], $lte: fields.data_final }
    }

    // Estes campos não serão necessários para a pesquisa.
    delete fields.date_type
    delete fields.data_final

    // Query da procura e contagem de documentos total feitas, concorrentemente para efeitos de performance
    let countDocs = Acordao.countDocuments(fields)
    let projection = { Processo: 1, Descritores: 1, Juiz: 1, "Data do Acordão": 1 }
    let skipValue = (page - 1) * limit

    let documents = Acordao.find(fields, projection).collation({ locale: "pt", strength: 2 }).sort(sorting).skip(skipValue).limit(limit);

    return Promise.all([documents, countDocs])
        .then(([acordaos, querySize]) => {
            return { 'acordaos': acordaos, 'querySize': querySize }
        }).catch((err) => {
            throw err
        });
}

/**
 * Ordena corretamente os acordãos do results conforme a ordem dos ids especificados
 * @param {lista} results - lista de objetos para ordenar
 * @param {lista} order - lista de ids ordenada
 * @returns {lista} Lista de objetos ordenada.
 */
function sortPreviews(results, order) {
    results.sort((a, b) => {
        let indexA = order.indexOf(a._id.toString())
        let indexB = order.indexOf(b._id.toString())
        return indexA - indexB
    })
    return results
}

// Obtém um acórdão pelo seu ID
module.exports.getAcordaoPreviews = lista_ids => {
    let projection = { Processo: 1, Descritores: 1, Juiz: 1, "Data do Acordão": 1 }
    return Acordao.find({ _id: { $in: lista_ids } }, projection)
        .then(previews => {
            //* Ordenar corretamente os acordãos retornados
            return sortPreviews(previews, lista_ids)
        })
        .catch(erro => {
            throw erro
        })
}

async function validateSubmission(dados) {
    // Definição de valores restritivos
    const max_num_registers = 50
    const max_num_fields = 30
    const mandatory_fields = ["Processo", "tribunal", "Juiz", "Data do Acordão", "Descritores"]
    const forbidden_field_names = ["_id"]
    const forbidden_field_regex = /[\.\,\-\$\(\)]/
    const pontovirgula_regex = /\;/
    const tribunais = await Tribunal.list()
    const tribs = Object.keys(tribunais)

    // Verificação do ficheiro .JSON
    var reg_is_single = false
    var lista_acordaos = Array.isArray(dados) ? lista_acordaos = dados : (reg_is_single = true, lista_acordaos = [dados])

    // Verifica se tem conteudo
    if (lista_acordaos.length == 0) {
        throw ({ "ERRO": "Ficheiro sem registos!" })
    }

    // Verifica se não ultrapassa o limite de registos
    if (lista_acordaos.length > max_num_registers) {
        throw ({ "ERRO": `Ficheiro ultrapassa o nº limite de registos - ${max_num_registers}.` })
    }

    // Itera pelos registos e faz a verificaçao de cada registo
    var n_registo = 1
    for (let registo of lista_acordaos) {
        var all_fields = Object.keys(registo)

        // Verificação do nº de campos do registo
        if (all_fields.length > max_num_fields) {
            throw ({ "ERRO": "Número máximo de registos atingido" + (reg_is_single ? "." : `no registo nº${n_registo}.`), "registo": registo })
        }

        // Verificação da inexistência de sinais de pontuação nos nomes dos campos 
        if (all_fields.some(elem => forbidden_field_regex.test(elem))) {
            throw ({ "ERRO": "Proibidos campos com sinais de pontuação." + (reg_is_single ? "" : ` Encontrado no registo nº${n_registo}.`), "registo": registo })
        }

        // Verificação da existência de campos proibidos
        for (forb_field of forbidden_field_names) {
            if (all_fields.includes(forb_field)) {
                throw ({ "ERRO": `Proibidos campos com o nome ${forb_field}.` + (reg_is_single ? "" : ` Encontrado no registo nº${n_registo}.`), "registo": registo })
            }
        }

        for (let campo of all_fields) {
            let value = registo[campo]
            // Proibido campos vazios
            if (value === "") {
                throw ({ "ERRO": `Valor do campo \"${campo}\" é vazio.` + (reg_is_single ? "" : ` Encontrado no registo nº${n_registo}.`), "registo": registo })
            }
            // Descritores tem de ser lista
            else if (campo === "Descritores" && typeof value !== "string" && !Array.isArray(value)) {
                throw ({ "ERRO": `Campo \"Descritores\" não tem um tipo válido (Lista de String).` + (reg_is_single ? "" : ` Encontrado no registo nº${n_registo}.`), "registo": registo })
            }
            // Obriga a que nenhum descritor tenha um ";"
            else if (campo === "Descritores") { 
                value.forEach((v) => {
                    if (pontovirgula_regex.test(v)) throw ({ "ERRO": `Campo "Descritores" "${v}" contém um ";" proibido num descritor.` + (reg_is_single ? "" : ` Encontrado no registo nº${n_registo}.`), "registo": registo })
                })
            }
            // Obrigação dos campos serem strings (exceto o Descritores)
            else if (campo !== "Descritores" && typeof value !== "string") {
                throw ({ "ERRO": `Encontrados campos que não são strings. Encontrado no campo ${campo}` + (reg_is_single ? "." : `, no registo nº${n_registo}.`), "registo": registo })
            }
            // Tribunais tem de estar na lista de tribunais
            else if (campo === "tribunal" && !tribs.includes(value)) {
                throw ({ "ERRO": `Tribunal ${value} não está nos tribunais abrangidos pelo sistema.` + (reg_is_single ? "." : `, no registo nº${n_registo}.`), "registo": registo })
            }
        }

        // Obrigaçao de ter os seguintes campos
        var has_mandatory = true
        for (var i = 0; has_mandatory && i < mandatory_fields.length; i++) {
            m_field = mandatory_fields[i]
            has_mandatory = all_fields.includes(m_field)
            if (!has_mandatory) {
                throw ({ "ERRO": `Encontrados registos sem o campo obrigatório \"${m_field}\".` + (reg_is_single ? "" : ` Encontrado no registo nº${n_registo}.`), "registo": registo })
            }
        }

        n_registo++
    }
    return { "message": `Inseridos ${lista_acordaos.length} novos registos com sucesso.` }
}

module.exports.addAcordao = a => {
    return new Promise((resolve, reject) => {
        validateSubmission(a)
            .then(msg => {
                var promise;
                if (Array.isArray(a)) promise = Acordao.insertMany(a, {rawResult: true})
                else promise = Acordao.collection.insertOne(a)

                promise.then(mongomsg => {
                    resolve(mongomsg)
                })
                .catch(erro => {
                    reject(erro)
                })
            })
            .catch(erro => { // Caso não seja uma submissão válida
                reject(erro)
            })
    })
}


module.exports.updateAcordao = a => {
    return Acordao.updateOne({ _id: a._id }, a)
        .then(dados => {
            return dados
        })
        .catch(erro => {
            throw erro
        })
}

module.exports.deleteAcordao = id => {
    return Acordao.deleteOne({ _id: id })
        .then(dados => {
            dados.message = 'Acórdão eliminado com sucesso'
            return dados
        })
        .catch(erro => {
            throw erro
        })
}

module.exports.getTaxonomia = (minimumOccurrences = 0) => {
    return Acordao.aggregate([
        {
            $unwind: "$Descritores"
        },
        {
            $group: {
                _id: "$Descritores",
                count: { $sum: 1 }
            }
        },
        {
            $match: { count: { $gte: minimumOccurrences } }
        },
        {
            $project: {
                classe: { $arrayElemAt: [{ $split: ["$_id", " "] }, 0] },
                descritor: "$_id"
            }
        },
        {
            $group: {
                _id: "$classe",
                descritores: { $addToSet: "$descritor" }
            }
        },
        {
            $sort: { _id: 1 }
        },
        {
            $project: {
                _id: 0,
                classe: "$_id",
                descritores: 1
            }
        }
    ]).then((result) => {// result no formato: [ { classe: "...", descritores: [...] } ]
        let aux = {}
        result.forEach(elem => {
            if (elem.classe[0] in aux)
                aux[elem.classe[0]][elem.classe] = elem.descritores
            else{
                let toInsert = {}; toInsert[elem.classe] = elem.descritores
                aux[elem.classe[0]] = toInsert
            }
        })
        return aux
    }).catch((erro) => {
        throw erro
    });
}