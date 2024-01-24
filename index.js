const express = require("express");
const app = new express();
const knex = require('./database/database');

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/ranking", async (req, res) => {
    try {
        const ranking = await knex.select('*').from("usuario").orderBy('pontuacao', 'desc');
        console.log("Dados do Ranking Carregados");
        res.render("ranking", { ranking });
    } catch (error) {
        console.error("Ocorreu um erro ao buscar os dados do ranking", error);
        res.status(500).send('Erro ao buscar o ranking.');
    }
});

app.post("/atualizar-pontuacao", async (req, res, next) => {
    try {
        const pontuacao = req.body.pontuacao;
        const nome = (req.body.nome).trim()
        console.log(pontuacao, nome)

        if (isNaN(pontuacao) || typeof nome !== 'string') {
            throw new Error('Dados inválidos. Certifique-se de fornecer pontuação como número e nome como string.');
        }

        const updateResult = await knex('usuario')
            .where({ nome: nome })
            .update({ pontuacao: pontuacao });
        console.log(updateResult)

        if (updateResult === 1) {
            console.log('Pontuação atualizada com sucesso.');
            res.status(200).json({ message: 'Pontuação atualizada com sucesso.' });
        } else {
            console.log('Usuário não encontrado ou pontuação já é igual à fornecida.');
            res.status(404).json({ error: 'Usuário não encontrado ou pontuação já é igual à fornecida.' });
        }
    } catch (error) {
        next(error);
    }
});

app.post("/iniciar", (req, res) => {
    const nome = req.body.nome;

    const usuario = {
        nome: nome,
        pontuacao: 0
    };

    knex("usuario").insert(usuario)
        .then(data => {
            console.log("Usuário inserido com sucesso!", usuario);
            res.render("iniciar", { nome });
        })
        .catch(error => {
            console.error("Erro ao inserir o usuário no banco de dados", error);
        });
});

app.listen(3030, () => {
    console.log("Servidor Online");
});
