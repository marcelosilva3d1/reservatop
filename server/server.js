import jsonServer from 'json-server';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Criar diretório de dados se não existir
const dataDir = join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Verificar se o arquivo de banco de dados existe, se não, copiar do template
const dbPath = join(__dirname, 'data', 'db.json');
const templatePath = join(__dirname, 'db.json');
if (!fs.existsSync(dbPath)) {
  fs.copyFileSync(templatePath, dbPath);
}

const server = jsonServer.create();
const router = jsonServer.router(dbPath); // Usar o arquivo da pasta data
const middlewares = jsonServer.defaults();

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, join(__dirname, '../public/uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname.substring(file.originalname.lastIndexOf('.')));
  }
});

const upload = multer({ storage: storage });

// Usar middlewares padrão (logger, static, cors e no-cache)
server.use(middlewares);

// Converter body para JSON
server.use(jsonServer.bodyParser);

// Middleware para autenticação
server.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/login') {
    const { email, password } = req.body;
    const db = router.db;
    const user = db.get('users').find({ email: email }).value();

    if (user) {
      res.jsonp({
        token: 'fake-jwt-token',
        user: user
      });
    } else {
      res.status(400).jsonp({
        error: "Usuário não encontrado"
      });
    }
  } else {
    next();
  }
});

// Rota para registro de profissionais
server.post('/professionals', upload.fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 }
]), (req, res, next) => {
  const professional = {
    id: Date.now().toString(),
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  if (req.files) {
    if (req.files.avatar) {
      professional.avatar = `/uploads/${req.files.avatar[0].filename}`;
    }
    if (req.files.coverImage) {
      professional.coverImage = `/uploads/${req.files.coverImage[0].filename}`;
    }
  }

  // Parse JSON strings back to objects
  if (typeof professional.services === 'string') {
    professional.services = JSON.parse(professional.services);
  }
  if (typeof professional.workingHours === 'string') {
    professional.workingHours = JSON.parse(professional.workingHours);
  }

  const db = router.db;
  db.get('professionals').push(professional).write();
  
  res.jsonp(professional);
});

// Usar router do json-server para outras rotas
server.use(router);

// Iniciar servidor
const port = 8082;
server.listen(port, () => {
  console.log(`JSON Server está rodando na porta ${port}`);
});
