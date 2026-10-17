// Local development only: `npm run dev:api` (reads .env.local in the project root)
import dotenv from 'dotenv';dotenv.config({path:'.env.local'});
const {default:app}=await import('./index.js');
app.listen(4000,()=>console.log('API on http://localhost:4000'));