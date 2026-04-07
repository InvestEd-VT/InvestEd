import app from './app.js';
import { env } from './config/env.js';
import { startSnapshotJob } from './jobs/portfolioSnapshot.job.js';
import { startExpirationJob } from './jobs/optionsExpiration.job.js';
import { start } from 'node:repl';

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  startSnapshotJob();
  startExpirationJob();
});
