import express from 'express';
import { spawn } from 'child_process';
import quizzesHandler from './api/quizzes.js';
import gameHandler from './api/game.js';

const app = express();
app.use(express.json());

// Emulate Vercel's serverless routing by routing Express requests to the handler functions
app.all('/api/quizzes', (req, res) => quizzesHandler(req, res));
app.all('/api/game', (req, res) => gameHandler(req, res));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 [Backend] Local Emulated serverless API running on http://localhost:${PORT}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📦 [Frontend] Starting Vite dev server on http://localhost:5173...\n`);
    
    // Spawn Vite dev server
    const vite = spawn('npx', ['vite'], { stdio: 'inherit', shell: true });
    
    // Wire up Ctrl+C termination to kill the Vite process
    process.on('SIGINT', () => {
      vite.kill();
      process.exit();
    });
  }
});
