import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { aiProvider } from './server/aiProvider.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function extractErrorStatusAndMessage(err: unknown): { status: number; message: string } {
  const errObj = err as { status?: number; message?: string } | null;
  const status = typeof errObj?.status === 'number' && errObj.status >= 400 ? errObj.status : 500;
  const rawMessage = errObj?.message || 'An unexpected error occurred while contacting the AI service.';

  if (status === 403 || rawMessage.includes('PERMISSION_DENIED')) {
    return {
      status: 403,
      message:
        'Gemini API access was denied. Please verify your API key in the Settings > Secrets panel.',
    };
  }
  if (status === 400 && rawMessage.includes('API_KEY_INVALID')) {
    return {
      status: 400,
      message: 'The configured Gemini API key appears invalid. Please check Settings > Secrets.',
    };
  }
  if (status === 429 || rawMessage.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      message:
        'AI request rate limit or quota reached. Please wait a moment and try again, or check your quota in Settings > Secrets.',
    };
  }

  return { status, message: rawMessage };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      aiConfigured: aiProvider.isConfigured(),
      provider: aiProvider.providerName,
      model: aiProvider.modelName,
    });
  });

  app.post('/api/ai/what-if', async (req: Request, res: Response) => {
    try {
      const {
        projectTitle,
        genres = [],
        synopsis = '',
        question,
        changeType = 'Plot twist',
        canonEntries = [],
        characters = [],
        selectedExperiments = [],
      } = req.body ?? {};

      if (!question || typeof question !== 'string' || !question.trim()) {
        res.status(400).json({ error: 'Please enter a What-If question to explore.' });
        return;
      }

      const result = await aiProvider.generateWhatIfBranches({
        projectTitle: String(projectTitle || 'Untitled Story'),
        genres: Array.isArray(genres) ? genres.map(String) : [],
        synopsis: String(synopsis || ''),
        question: question.trim(),
        changeType: String(changeType),
        canonEntries: Array.isArray(canonEntries) ? canonEntries : [],
        characters: Array.isArray(characters) ? characters : [],
        selectedExperiments: Array.isArray(selectedExperiments) ? selectedExperiments : [],
      });

      res.json(result);
    } catch (err) {
      const { status, message } = extractErrorStatusAndMessage(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/what-if/explore-further', async (req: Request, res: Response) => {
    try {
      const {
        projectTitle,
        canonEntries = [],
        characters = [],
        branchTitle,
        branchPremise,
        branchConsequences = [],
        followUpPrompt,
      } = req.body ?? {};

      if (!followUpPrompt || typeof followUpPrompt !== 'string' || !followUpPrompt.trim()) {
        res.status(400).json({ error: 'Please enter a follow-up question for this branch.' });
        return;
      }

      const result = await aiProvider.exploreBranchFurther({
        projectTitle: String(projectTitle || 'Untitled Story'),
        canonEntries: Array.isArray(canonEntries) ? canonEntries : [],
        characters: Array.isArray(characters) ? characters : [],
        branchTitle: String(branchTitle || 'Experimental Branch'),
        branchPremise: String(branchPremise || ''),
        branchConsequences: Array.isArray(branchConsequences) ? branchConsequences : [],
        followUpPrompt: followUpPrompt.trim(),
      });

      res.json(result);
    } catch (err) {
      const { status, message } = extractErrorStatusAndMessage(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    try {
      const {
        projectTitle,
        genres = [],
        synopsis = '',
        canonEntries = [],
        characters = [],
        attachedBranches = [],
        history = [],
        message,
      } = req.body ?? {};

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({ error: 'Please enter a message for the AI Writing Companion.' });
        return;
      }

      const result = await aiProvider.chatWithCompanion({
        projectTitle: String(projectTitle || 'Untitled Story'),
        genres: Array.isArray(genres) ? genres.map(String) : [],
        synopsis: String(synopsis || ''),
        canonEntries: Array.isArray(canonEntries) ? canonEntries : [],
        characters: Array.isArray(characters) ? characters : [],
        attachedBranches: Array.isArray(attachedBranches) ? attachedBranches : [],
        history: Array.isArray(history) ? history : [],
        message: message.trim(),
      });

      res.json(result);
    } catch (err) {
      const { status, message } = extractErrorStatusAndMessage(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/continuity-check', async (req: Request, res: Response) => {
    try {
      const {
        projectTitle,
        sceneTitle = 'Untitled Scene',
        sceneText,
        canonEntries = [],
        characters = [],
      } = req.body ?? {};

      if (!sceneText || typeof sceneText !== 'string' || sceneText.trim().length < 15) {
        res.status(400).json({
          error: 'Please write or paste a scene (at least 15 characters) to check for continuity.',
        });
        return;
      }

      const result = await aiProvider.checkContinuity({
        projectTitle: String(projectTitle || 'Untitled Story'),
        sceneTitle: String(sceneTitle),
        sceneText: sceneText.trim(),
        canonEntries: Array.isArray(canonEntries) ? canonEntries : [],
        characters: Array.isArray(characters) ? characters : [],
      });

      res.json(result);
    } catch (err) {
      const { status, message } = extractErrorStatusAndMessage(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/ai/continuity-revise', async (req: Request, res: Response) => {
    try {
      const { projectTitle, sceneText, findingsSummary = '', canonEntries = [] } = req.body ?? {};
      if (!sceneText || typeof sceneText !== 'string') {
        res.status(400).json({ error: 'Scene text is required to suggest a revision.' });
        return;
      }

      const result = await aiProvider.suggestSceneRevision({
        projectTitle: String(projectTitle || 'Untitled Story'),
        sceneText,
        findingsSummary: String(findingsSummary),
        canonEntries: Array.isArray(canonEntries) ? canonEntries : [],
      });

      res.json(result);
    } catch (err) {
      const { status, message } = extractErrorStatusAndMessage(err);
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Plotline server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Plotline server:', err);
  process.exit(1);
});
