import 'dotenv/config';
import app from './server';
import { setupSwagger } from './swagger';

const port = Number(process.env.PORT || 3000);
setupSwagger(app);
app.listen(port, () => console.log(`API http://localhost:${port} (docs: /api/docs)`));
