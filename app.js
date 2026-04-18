// app.js
const express = require('express');
const path = require('path');
const db = require('./db');
const fs = require('fs');
const multer = require('multer');
const gabaritosView = require('./views/gabaritosView');
const propostasView = require('./views/propostasView');
const painelView = require('./views/painelView');

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

    function tratarData(valor) {
      if (!valor) return null;
      if (typeof valor === 'string' && valor.trim() === '') return null;
      return valor;
    }

    const {
      cliente,
      designer,
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
        designer,
        data_inicio,
        data_fim,
        observacao,
        data_solicitacao_cliche,
        data_chegada_cliche
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        cliente,
        designer || null,
        tratarData(data_inicio),
        tratarData(data_fim),
        observacao || null,
        tratarData(data_solicitacao_cliche),
        tratarData(data_chegada_cliche)
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
        [
          propostaId,
          m.descricao || null,
          tratarData(m.data_modificacao)
        ]
      );
    }

    res.json({ success: true, id: propostaId });

  } catch (err) {
    console.error('Erro ao criar proposta:', err);
    res.status(500).json({ success: false });
  }
});

// =======================
// CONFIGURAÇÃO DO MULTER - GABARITOS
// =======================
const storageGabaritos = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, 'public', 'gabaritos');
    // Cria a pasta public/gabaritos automaticamente se ela não existir
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Adiciona um timestamp para evitar nomes duplicados no servidor
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, Date.now() + '-' + safeName);
  }
});
const uploadGabarito = multer({ storage: storageGabaritos });


// =======================
// ROTAS – GABARITOS
// =======================

// 1. Renderizar a página de gabaritos
app.get('/admin/gabaritos', async (req, res) => {
  try {
    const [gabaritos] = await db.query('SELECT * FROM gabaritos ORDER BY criada_em DESC');
    res.send(gabaritosView(gabaritos));
  } catch (err) {
    console.error('Erro ao carregar a página de gabaritos:', err);
    res.status(500).send('Erro interno ao carregar os gabaritos.');
  }
});


// =======================
// API – BUSCAR DETALHES POR DIA (FILTRADO POR DATA_INICIO)
// =======================
app.get('/admin/api/propostas-por-dia/:data', async (req, res) => {
  try {
    const { data } = req.params; // Formato YYYY-MM-DD
    const [propostas] = await db.query(
      `SELECT id, cliente, designer, DATE_FORMAT(criada_em, '%H:%i') as hora 
       FROM propostas 
       WHERE data_inicio = ? 
       ORDER BY criada_em DESC`,
      [data]
    );
    res.json(propostas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar detalhes do dia' });
  }
});


// 2. Upload de novo gabarito
app.post('/admin/gabaritos/upload', uploadGabarito.single('arquivo_gabarito'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('Nenhum arquivo enviado ou formato inválido.');
    }

    const nome_original = req.file.originalname;
    const caminho_url = `/public/gabaritos/${req.file.filename}`;

    await db.query(
      'INSERT INTO gabaritos (nome, url) VALUES (?, ?)',
      [nome_original, caminho_url]
    );

    res.redirect('/admin/gabaritos');
  } catch (err) {
    console.error('Erro ao salvar o gabarito:', err);
    res.status(500).send('Erro interno ao salvar o arquivo.');
  }
});

// 3. Deletar gabarito (Remove do DB e da pasta física)
app.post('/admin/gabaritos/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Busca o gabarito no banco para descobrir onde o arquivo físico está salvo
    const [[gabarito]] = await db.query('SELECT url FROM gabaritos WHERE id = ?', [id]);

    if (gabarito) {
      // Monta o caminho absoluto do arquivo no servidor
      const filePath = path.join(__dirname, gabarito.url);
      
      // Se o arquivo existir na pasta, apaga ele
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Deleta o registro do banco de dados
      await db.query('DELETE FROM gabaritos WHERE id = ?', [id]);
    }

    res.redirect('/admin/gabaritos');
  } catch (err) {
    console.error('Erro ao excluir gabarito:', err);
    res.status(500).send('Erro interno ao tentar excluir o arquivo.');
  }
});

// Buscar propostas paginadas (Ajustado para 24 itens por página)
app.get('/propostas', async (req, res) => {
  try {
    const { cliente, data_inicio, data_fim, page = 1 } = req.query;

    const limit = 24; // Atualizado para suportar grid 4x6
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
      designer,
      data_inicio,
      data_fim,
      observacao,
      data_solicitacao_cliche,
      data_chegada_cliche,
      modificacoes = []
    } = req.body;

    await db.query(
      `
      UPDATE propostas SET
        cliente = ?,
        designer = ?,
        data_inicio = ?,
        data_fim = ?,
        observacao = ?,
        data_solicitacao_cliche = ?,
        data_chegada_cliche = ?
      WHERE id = ?
      `,
      [
        cliente,
        designer || null,
        data_inicio || null,
        data_fim || null,
        observacao || null,
        data_solicitacao_cliche || null,
        data_chegada_cliche || null,
        id
      ]

    );

    // remove modificações antigas
    await db.query(
      'DELETE FROM proposta_modificacoes WHERE proposta_id = ?',
      [id]
    );

    // insere modificações atuais
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

// =======================
// ROTA – PAINEL / DASHBOARD (DATA_INICIO)
// =======================
app.get('/admin', async (req, res) => {
  try {
    // 1. Busca as propostas agrupadas por data_inicio dos últimos 3 meses
    const [rows] = await db.query(`
      SELECT 
        DATE_FORMAT(data_inicio, '%Y-%m-%d') as data_criacao,
        COUNT(id) as total
      FROM propostas
      WHERE data_inicio >= DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL 2 MONTH), '%Y-%m-01')
      GROUP BY DATE_FORMAT(data_inicio, '%Y-%m-%d')
      ORDER BY data_criacao ASC
    `);

    // 2. Estrutura para os 3 meses
    const dataAtual = new Date();
    const mesesGrafico = [];

    const nomesMeses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    for (let i = 0; i < 3; i++) {
      const d = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - i, 1);
      mesesGrafico.push({
        mes: d.getMonth(),
        ano: d.getFullYear(),
        nome: nomesMeses[d.getMonth()],
        dias: [],
        totais: []
      });
    }

    // 3. Preenche os dias de cada mês com 0
    mesesGrafico.forEach(m => {
      const diasNoMes = new Date(m.ano, m.mes + 1, 0).getDate();
      for (let dia = 1; dia <= diasNoMes; dia++) {
        m.dias.push(dia.toString().padStart(2, '0'));
        m.totais.push(0);
      }
    });

    // 4. Preenche com os dados reais vindos da consulta de data_inicio
    rows.forEach(row => {
      const [ano, mes, dia] = row.data_criacao.split('-');
      
      const mesIndex = mesesGrafico.findIndex(m => m.ano === parseInt(ano) && m.mes === (parseInt(mes) - 1));
      if (mesIndex !== -1) {
        mesesGrafico[mesIndex].totais[parseInt(dia) - 1] = row.total;
      }
    });

    res.send(painelView(mesesGrafico));

  } catch (err) {
    console.error('Erro ao carregar o painel:', err);
    res.status(500).send('Erro interno ao carregar o dashboard.');
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