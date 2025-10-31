/**
 * local server entry file, for local development
 * Updated to force restart
 */
import app from './app.ts';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3005;

const server = app.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] [SERVER] Server ready on port ${PORT}`);
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] [SERVER] SIGTERM signal received`);
  server.close(() => {
    console.log(`[${new Date().toISOString()}] [SERVER] Server closed`);
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] [SERVER] SIGINT signal received`);
  server.close(() => {
    console.log(`[${new Date().toISOString()}] [SERVER] Server closed`);
    process.exit(0);
  });
});

export default app;
