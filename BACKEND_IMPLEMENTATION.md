# 🔧 Backend Implementation Guide - httpOnly Cookies

## 📋 Endpoints Necessários

### 1. POST /api/auth/set-cookies
**Purpose**: Definir httpOnly cookies após login/refresh

```javascript
// Express.js Implementation
app.post('/api/auth/set-cookies', (req, res) => {
  const { accessToken, refreshToken, expiresAt } = req.body;
  
  // Validar tokens
  if (!accessToken || !refreshToken) {
    return res.status(400).json({ error: 'Tokens obrigatórios' });
  }
  
  // Configurar cookies httpOnly
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600000 // 1 hora em ms
  });
  
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 86400000 // 24 horas em ms
  });
  
  res.json({ success: true, expiresAt });
});
```

### 2. POST /api/auth/clear-cookies
**Purpose**: Limpar cookies no logout

```javascript
app.post('/api/auth/clear-cookies', (req, res) => {
  res.cookie('access_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0 // Expirar imediatamente
  });
  
  res.cookie('refresh_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0 // Expirar imediatamente
  });
  
  res.json({ success: true });
});
```

### 3. POST /api/auth/refresh
**Purpose**: Renovar access token usando refresh token

```javascript
app.post('/api/auth/refresh', async (req, res) => {
  try {
    // Em produção, o refresh token vem via cookie httpOnly
    // Em desenvolvimento, pode vir via Authorization header
    const refreshToken = req.cookies?.refresh_token || 
                       req.headers.authorization?.replace('Bearer ', '');
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token não encontrado' });
    }
    
    // Validar refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    // Gerar novos tokens
    const newAccessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    const newRefreshToken = jwt.sign(
      { userId: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: '24h' }
    );
    
    const expiresAt = Date.now() + (3600 * 1000); // 1 hora
    
    // Definir novos cookies
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600000
    });
    
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 86400000
    });
    
    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      expiresAt
    });
    
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Refresh token inválido' });
  }
});
```

## 🔒 CORS Configuration

### Express.js CORS Setup
```javascript
const cors = require('cors');

// Configuração CORS para httpOnly cookies
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // ESSENCIAL para cookies!
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

// Para pre-flight requests
app.options('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

### Node.js (sem framework) CORS
```javascript
// Middleware CORS manual
app.use((req, res, next) => {
  const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Expose-Headers', 'Set-Cookie');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
```

## 🔄 Atualizar Login Existente

### Modificar Endpoint de Login
```javascript
// Antigo login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Autenticar usuário...
  const user = await authenticateUser(email, password);
  
  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }
  
  // Gerar tokens
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: '24h' }
  );
  
  const expiresAt = Date.now() + (3600 * 1000);
  
  // REDIRECIONAR para set-cookies endpoint
  res.redirect(307, '/api/auth/set-cookies').json({
    accessToken,
    refreshToken,
    expiresAt
  });
  
  // Ou definir cookies diretamente:
  /*
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 3600000
  });
  
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 86400000
  });
  
  res.json({ 
    success: true,
    user: { id: user.id, email: user.email, name: user.name }
  });
  */
});
```

## 🛡️ Middleware de Autenticação

### Verificar Cookies em Rotas Protegidas
```javascript
// Middleware para verificar httpOnly cookies
const authenticateCookie = (req, res, next) => {
  const accessToken = req.cookies?.access_token;
  
  if (!accessToken) {
    return res.status(401).json({ error: 'Token não encontrado' });
  }
  
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      // Tentar refresh automático
      return res.status(401).json({ 
        error: 'Token expirado',
        requiresRefresh: true 
      });
    }
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Usar em rotas protegidas
app.get('/api/perfil', authenticateCookie, async (req, res) => {
  const user = await getUserById(req.user.userId);
  res.json(user);
});
```

## 📦 Package Dependencies

### npm install
```bash
npm install cookie-parser cors jsonwebtoken
npm install -D @types/cookie-parser @types/cors @types/jsonwebtoken
```

### Configurar Middlewares
```javascript
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(cookieParser());
app.use(cors(corsConfig));
```

## 🔧 Environment Variables

### .env
```env
# JWT Secrets
JWT_SECRET=your_super_secret_jwt_key_here
REFRESH_SECRET=your_super_secret_refresh_key_here

# CORS
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
```

## 🧪 Testing

### Testar Cookies Manualmente
```bash
# 1. Fazer login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"user@example.com","password":"password"}'

# 2. Acessar rota protegida
curl -X GET http://localhost:3001/api/perfil \
  -b cookies.txt \
  -v

# 3. Fazer logout
curl -X POST http://localhost:3001/api/auth/clear-cookies \
  -b cookies.txt \
  -c cookies.txt
```

### Testar CORS
```javascript
// No browser console
fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
})
.then(res => res.json())
.then(console.log);
```

## 🚀 Deploy Considerations

### Produção
- `secure: true` nos cookies
- HTTPS obrigatório
- `NODE_ENV=production`
- Frontend URL configurado

### Development
- `secure: false` nos cookies
- HTTP permitido
- `NODE_ENV=development`
- `http://localhost:5173`

---

## ✅ Checklist de Implementação

- [ ] Instalar dependências (cookie-parser, cors, jsonwebtoken)
- [ ] Configurar CORS com `credentials: true`
- [ ] Implementar `/api/auth/set-cookies`
- [ ] Implementar `/api/auth/clear-cookies`
- [ ] Implementar `/api/auth/refresh`
- [ ] Atualizar middleware de autenticação
- [ ] Modificar endpoint de login
- [ ] Configurar environment variables
- [ ] Testar fluxo completo
- [ ] Deploy em produção com HTTPS

**Status**: Guia completo para implementação backend
