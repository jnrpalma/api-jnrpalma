const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const app = express();
const port = process.env.PORT || 3000;

// Inicializar o Firebase Admin SDK
const serviceAccount = require('./config/cuesta-sheep-firebase-adminsdk-bncra-715dd1acff.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

app.use(cors());
app.use(express.json());

// Rota para cadastrar um novo animal
app.post('/animals', async (req, res) => {
  try {
    const animal = req.body;
    const docRef = await db.collection('animals').add(animal);
    res.status(201).json({
      code: 'SUCCESS',
      message: 'Animal cadastrado com sucesso.',
      id: docRef.id,
      animal,
      _messages: [{
        code: 'INFO',
        type: 'information',
        message: 'Animal cadastrado com sucesso.',
        detailedMessage: `O animal com ID ${docRef.id} foi cadastrado.`,
      }],
    });
  } catch (error) {
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      type: 'error',
      message: 'Ocorreu um erro ao cadastrar o animal.',
      detailedMessage: error.message,
    });
  }
});

// Rota para obter todos os animais
app.get('/animals', async (req, res) => {
  try {
    const snapshot = await db.collection('animals').get();
    const animals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(animals);
  } catch (error) {
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      type: 'error',
      message: 'Ocorreu um erro ao recuperar os animais.',
      detailedMessage: error.message,
    });
  }
});

// Rota para deletar um animal
app.delete('/animals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('animals').doc(id).delete();
    res.json({
      code: 'SUCCESS',
      message: 'Animal excluído com sucesso.',
      id,
      _messages: [{
        code: 'INFO',
        type: 'information',
        message: 'Animal excluído com sucesso.',
        detailedMessage: `O animal com ID ${id} foi excluído.`,
      }],
    });
  } catch (error) {
    res.status(500).json({
      code: 'INTERNAL_ERROR',
      type: 'error',
      message: 'Ocorreu um erro ao excluir o animal.',
      detailedMessage: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}!`);
});
