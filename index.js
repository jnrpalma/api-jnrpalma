const express = require("express");
const cors = require("cors"); // Importa o pacote CORS
const app = express();
const port = process.env.PORT || 3000;

// Aplica o CORS para permitir acesso de diferentes origens
app.use(cors());

const peoples = require("./src/peoples/peoples.json");

app.get("/peoples", (req, res) => {
    return res.json(peoples);
});

app.listen(port, () => {
    console.log("servidor rodando de boas!");
});
