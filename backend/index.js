import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import operationalRoutes from './routes/operational.js';
import orderRoutes from './routes/orders.js';
import tableRoutes from './routes/tables.js';
import financeRoutes from './routes/finance.js';
import auditRoutes from './routes/audit.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configuração CORS dinâmica para produção e desenvolvimento local
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const corsOptions = {
  origin: (origin, callback) => {
    // Em desenvolvimento, permite qualquer origem
    if (!isProduction) {
      callback(null, true);
      return;
    }
    // Em produção, verifica a lista de origens permitidas
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Acesso bloqueado por política de CORS.'));
    }
  },
  credentials: true
};

// Configuração do Socket.io com suporte a CORS
const io = new Server(server, {
  cors: {
    origin: isProduction ? allowedOrigins : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.set('io', io);

// Middlewares Globais de Segurança
app.use(helmet()); // Define vários cabeçalhos de segurança HTTP
app.use(cors(corsOptions)); // Proteção de origem CORS
app.use(express.json());

// Limitador de requisições de login (Prevenção de Ataques de Força Bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Janela de 15 minutos
  max: 15, // Máximo de 15 tentativas
  message: { error: 'Muitas tentativas de login a partir deste IP. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Aplicar rate limiter na rota de login
app.use('/api/auth/login', loginLimiter);

// Log de requisições simples
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/operational', operationalRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/audit', auditRoutes);

// Rota raiz/fallback de status da API
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'API do Sushi Japa Prime está funcionando!',
    version: '1.0.0'
  });
});

// Socket.io eventos
io.on('connection', (socket) => {
  console.log(`Cliente conectado via WebSocket: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado via WebSocket: ${socket.id}`);
  });
});

// Inicialização do servidor
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Servidor rodando e escutando na porta ${PORT}`);
});
