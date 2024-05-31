const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const peoples = require("./src/peoples/peoples.json");


app.delete("/peoples/:id", (req, res) => {
  const id = req.params.id;
  const index = peoples.findIndex(item => item.id === parseInt(id));

  if (index > -1) {
    peoples.splice(index, 1);
    res.json({
      code: "SUCCESS",
      message: "Item excluído com sucesso."
    });
  } else {
    res.status(404).json({
      code: "NOT_FOUND",
      message: "Item não encontrado."
    });
  }
});


// Função para filtrar e ordenar os dados
function filterAndSort(data, query) {
  // Filtro
  let result = data.filter((item) => {
    for (let key in query) {
      if (key !== "order" && key !== "page" && key !== "pageSize" && (!item[key] || !item[key].toString().toLowerCase().includes(query[key].toLowerCase()))) {
        return false;
      }
    }
    return true;
  });

  // Ordenação
  if (query.order) {
    const orders = query.order.split(',');
    result = result.sort((a, b) => {
      for (let order of orders) {
        const desc = order.startsWith('-');
        const key = desc ? order.slice(1) : order;
        if (a[key] < b[key]) return desc ? 1 : -1;
        if (a[key] > b[key]) return desc ? -1 : 1;
      }
      return 0;
    });
  }

  return result;
}

// Função para implementar a paginação
function paginate(data, page, pageSize) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return data.slice(start, end);
}

app.get("/peoples", (req, res) => {
  try {
    let { page, pageSize } = req.query;
    page = page ? parseInt(page) : 1;
    pageSize = pageSize ? parseInt(pageSize) : 10;

    let filteredAndSorted = filterAndSort(peoples, req.query);
    const paginated = paginate(filteredAndSorted, page, pageSize);
    
    res.json({
      hasNext: filteredAndSorted.length > page * pageSize,
      items: paginated,
      _messages: [{
        code: "INFO",
        type: "information",
        message: "Dados recuperados com sucesso.",
        detailedMessage: "A lista de pessoas foi filtrada, ordenada e paginada conforme solicitado."
      }]
    });
  } catch (error) {
    res.status(500).json({
      code: "INTERNAL_ERROR",
      type: "error",
      message: "Ocorreu um erro ao processar sua requisição.",
      detailedMessage: error.message
    });
  }
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}!`);
});
