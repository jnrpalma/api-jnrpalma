const express = require("express");
const app = express();
const port = process.env.PORT || 3000

const peoples = require("./src/peoples/peoples.json")

app.get("/peoples", (req,res) => {
    return res.json(peoples)
})


app.listen(port, () => {
    console.log("servidor rodando de boas!")
})