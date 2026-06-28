import app from './app.js';
import env from './config/env.js';
import { connectDB } from './config/db.js';

async function start() {
  try {
    await connectDB();
    app.listen(env.port, () => {
      console.log(`✓ API running on http://localhost:${env.port} (${env.nodeEnv})`);
      console.log(`  LLM provider: ${env.hasLlm ? `Groq (${env.groqModel})` : 'mock (no GROQ_API_KEY set)'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
