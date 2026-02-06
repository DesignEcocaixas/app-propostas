// app.js
const express = require('express');
const path = require('path');
const db = require('./db');
const propostasView = require('./views/propostasView');

const app = express();
const PORT = process.env.PORT || 3050;

// =======================
// Middlewares
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(path.join(__dirname, 'public')));

// =======================
// ROTAS – PROPOSTAS
// =======================

// =======================
// CRIAR PROPOSTA
// =======================
app.post('/propostas', async (req, res) => {
  try {
    const {
      cliente,
      data_inicio,
      data_fim,
      observacao,
      data_solicitacao_cliche,
      data_chegada_cliche,
      modificacoes = []
    } = req.body;

    const [result] = await db.query(
      `
      INSERT INTO propostas
      (
        cliente,
        data_inicio,
        data_fim,
        observacao,
        data_solicitacao_cliche,
        data_chegada_cliche
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        cliente,
        data_inicio,
        data_fim,
        observacao || null,
        data_solicitacao_cliche || null,
        data_chegada_cliche || null
      ]
    );

    const propostaId = result.insertId;

    // salva modificações
    for (const m of modificacoes) {
      await db.query(
        `
        INSERT INTO proposta_modificacoes
        (proposta_id, descricao, data_modificacao)
        VALUES (?, ?, ?)
        `,
        [propostaId, m.descricao, m.data_modificacao]
      );
    }

    res.json({ success: true, id: propostaId });

  } catch (err) {
    console.error('Erro ao criar proposta:', err);
    res.status(500).json({ success: false });
  }
});

// Criar proposta
app.get('/propostas', async (req, res) => {
  try {
    const { cliente, data_inicio, data_fim, page = 1 } = req.query;

    const limit = 9;
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params = [];

    if (cliente) {
      where += ' AND p.cliente LIKE ?';
      params.push(`%${cliente}%`);
    }

    if (data_inicio && data_fim) {
      where += ' AND p.data_inicio >= ? AND p.data_fim <= ?';
      params.push(data_inicio, data_fim);
    }

    // total de registros
    const [[{ total }]] = await db.query(
      `
      SELECT COUNT(DISTINCT p.id) AS total
      FROM propostas p
      ${where}
      `,
      params
    );

    // dados paginados
    const [rows] = await db.query(
      `
      SELECT p.*, COUNT(m.id) AS total_modificacoes
      FROM propostas p
      LEFT JOIN proposta_modificacoes m ON m.proposta_id = p.id
      ${where}
      GROUP BY p.id
      ORDER BY p.criada_em DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    res.json({
      data: rows,
      pagination: {
        total,
        page: Number(page),
        perPage: limit,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// Buscar proposta por ID (com modificações)
app.get('/propostas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [[proposta]] = await db.query(
      'SELECT * FROM propostas WHERE id = ?',
      [id]
    );

    if (!proposta) {
      return res.status(404).json({ success: false, error: 'Proposta não encontrada' });
    }

    const [modificacoes] = await db.query(
      'SELECT * FROM proposta_modificacoes WHERE proposta_id = ? ORDER BY data_modificacao DESC',
      [id]
    );

    res.json({ proposta, modificacoes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro ao buscar proposta' });
  }
});

// Atualizar proposta
app.put('/propostas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const {
      cliente,
      data_inicio,
      data_fim,
      observacao,
      data_solicitacao_cliche,
      data_chegada_cliche,
      modificacoes = []
    } = req.body;

    // atualiza proposta
    await db.query(
      `
      UPDATE propostas SET
        cliente = ?,
        data_inicio = ?,
        data_fim = ?,
        observacao = ?,
        data_solicitacao_cliche = ?,
        data_chegada_cliche = ?
      WHERE id = ?
      `,
      [
        cliente,
        data_inicio,
        data_fim,
        observacao,
        data_solicitacao_cliche || null,
        data_chegada_cliche || null,
        id
      ]
    );

    // 🔥 REMOVE TODAS AS MODIFICAÇÕES ANTIGAS
    await db.query(
      'DELETE FROM proposta_modificacoes WHERE proposta_id = ?',
      [id]
    );

    // 🔥 INSERE AS MODIFICAÇÕES ATUAIS DO MODAL
    for (const m of modificacoes) {
      await db.query(
        `
        INSERT INTO proposta_modificacoes
        (proposta_id, descricao, data_modificacao)
        VALUES (?, ?, ?)
        `,
        [id, m.descricao, m.data_modificacao]
      );
    }

    res.json({ success: true });

  } catch (err) {
    console.error('Erro ao atualizar proposta:', err);
    res.status(500).json({ success: false });
  }
});


// Deletar proposta
app.delete('/propostas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM propostas WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro ao deletar proposta' });
  }
});

// =======================
// ROTAS – MODIFICAÇÕES
// =======================

// Criar modificação (card)
app.post('/propostas/:id/modificacoes', async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, data_modificacao } = req.body;

    const [result] = await db.query(
      `INSERT INTO proposta_modificacoes
       (proposta_id, descricao, data_modificacao)
       VALUES (?, ?, ?)`,
      [id, descricao, data_modificacao]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro ao criar modificação' });
  }
});

// Atualizar modificação
app.put('/modificacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, data_modificacao } = req.body;

    await db.query(
      `UPDATE proposta_modificacoes
       SET descricao = ?, data_modificacao = ?
       WHERE id = ?`,
      [descricao, data_modificacao, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro ao atualizar modificação' });
  }
});

// Deletar modificação
app.delete('/modificacoes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.query('DELETE FROM proposta_modificacoes WHERE id = ?', [id]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Erro ao deletar modificação' });
  }
});

app.get('/', (req, res) => {
  res.send(propostasView());
});

// =======================
// START SERVER
// =======================
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
