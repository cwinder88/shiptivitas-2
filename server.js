import express from 'express';
import Database from 'better-sqlite3';

const app = express();
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  return res.status(200).send({
    message: 'SHIPTIVITY API. Read documentation to see API docs'
  });
});

// Keep one SQLite connection alive
const db = new Database('./clients.db');

// Close DB on exit
const closeDb = () => db.close();
process.on('SIGTERM', closeDb);
process.on('SIGINT', closeDb);

/**
 * Validate id input
 */
function validateId(id) {
  return !isNaN(parseInt(id));
}

/**
 * GET all clients (load board)
 */
app.get('/clients', (req, res) => {
  const stmt = db.prepare(`
    SELECT id, name, description, status, "order"
    FROM clients
    ORDER BY status ASC, "order" ASC
  `);

  const clients = stmt.all();
  return res.status(200).json(clients);
});

/**
 * UPDATE swimlane status
 */
app.put('/clients/:id/status', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (!validateId(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const stmt = db.prepare(`
    UPDATE clients
    SET status = ?
    WHERE id = ?
  `);

  stmt.run(status, id);

  return res.status(200).json({
    message: 'Status updated',
    id,
    status
  });
});

/**
 * UPDATE card order
 */
app.put('/clients/:id/order', (req, res) => {
  const id = req.params.id;
  const { order } = req.body;

  if (!validateId(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  const stmt = db.prepare(`
    UPDATE clients
    SET "order" = ?
    WHERE id = ?
  `);

  stmt.run(order, id);

  return res.status(200).json({
    message: 'Order updated',
    id,
    order
  });
});

/**
 * Start server
 */
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
