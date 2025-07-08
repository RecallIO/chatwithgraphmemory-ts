import express from 'express';
import path from 'path';
import { RecallioClient, RecallioError } from 'recallio';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.RECALLIO_API_KEY || '';
const projectId = process.env.RECALLIO_PROJECT_ID || 'demo';
const userId = process.env.RECALLIO_USER_ID || 'demo-user';

const client = new RecallioClient({ apiKey });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/api/message', async (req, res) => {
  const { message } = req.body as { message: string };
  if (!message) {
    return res.status(400).json({ error: 'Message required' });
  }
  try {
    if (message.trim().endsWith('?')) {
      const results = await client.searchGraphMemory({
        query: message,
        user_id: userId,
        project_id: projectId,
        limit: 5,
        threshold: 0.7
      });
      res.json({ type: 'answer', results });
    } else {
      await client.addGraphMemory({
        data: message,
        user_id: userId,
        project_id: projectId,
      });
      const relationships = await client.getGraphRelationships({
        userId: userId,
        projectId: projectId,
        limit: 50,
      });
      res.json({ type: 'added', relationships });
    }
  } catch (err) {
    if (err instanceof RecallioError) {
      res.status(err.status || 500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unexpected error' });
    }
  }
});

app.get('/api/graph', async (_req, res) => {
  try {
    const relationships = await client.getGraphRelationships({
      userId: userId,
      projectId: projectId,
      limit: 50,
    });
    res.json(relationships);
  } catch (err) {
    if (err instanceof RecallioError) {
      res.status(err.status || 500).json({ error: err.message });
    } else {
      res.status(500).json({ error: 'Unexpected error' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
