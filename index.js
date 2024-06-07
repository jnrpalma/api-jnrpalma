const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let peoples = require("./src/peoples/peoples.json");

app.delete("/peoples/:id", (req, res) => {
  const id = decodeURIComponent(req.params.id);
  console.log("ID recebido para exclusão:", id); // Log do ID recebido

  // Dividir a chave composta em seus componentes
  const [name, status, genreDescription] = id.split('|');

  // Tentar encontrar o item usando a chave composta
  const index = peoples.findIndex(item => 
    item.name === name && 
    item.status === status && 
    item.genreDescription === genreDescription
  );

  console.log("Índice encontrado:", index); // Log do índice encontrado

  if (index > -1) {
    const deletedItem = peoples.splice(index, 1);
    res.json({
      code: "SUCCESS",
      message: "Item excluído com sucesso.",
      deletedItem: deletedItem[0],
      _messages: [{
        code: "INFO",
        type: "information",
        message: "Item excluído com sucesso.",
        detailedMessage: `O item com ID ${id} foi excluído.`,
      }],
    });
  } else {
    res.status(404).json({
      code: "NOT_FOUND",
      message: "Item não encontrado.",
      detailedMessage: `O item com ID ${id} não foi encontrado.`,
      _messages: [{
        code: "ERROR",
        type: "error",
        message: "Item não encontrado.",
        detailedMessage: `O item com ID ${id} não foi encontrado.`,
      }],
    });
  }
});


// Função para filtrar e ordenar os dados
function filterAndSort(data, query) {
  let result = data.filter((item) => {
    for (let key in query) {
      if (
        key !== "order" &&
        key !== "page" &&
        key !== "pageSize" &&
        (!item[key] ||
          !item[key]
            .toString()
            .toLowerCase()
            .includes(query[key].toLowerCase()))
      ) {
        return false;
      }
    }
    return true;
  });

  if (query.order) {
    const orders = query.order.split(",");
    result = result.sort((a, b) => {
      for (let order of orders) {
        const desc = order.startsWith("-");
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
      _messages: [
        {
          code: "INFO",
          type: "information",
          message: "Dados recuperados com sucesso.",
          detailedMessage:
            "A lista de pessoas foi filtrada, ordenada e paginada conforme solicitado.",
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      code: "INTERNAL_ERROR",
      type: "error",
      message: "Ocorreu um erro ao processar sua requisição.",
      detailedMessage: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}!`);
});
