import app from './app.js';
import { env } from './config/env.js';
import { startSnapshotJob } from './jobs/portfolioSnapshot.job.js';

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
  startSnapshotJob();
});
