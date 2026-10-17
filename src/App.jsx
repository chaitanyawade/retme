import {Routes,Route,Navigate} from 'react-router-dom';
import {configured} from './lib/supabase';import {useAuth} from './context/AuthContext';
import AuthPage from './pages/AuthPage';import Dashboard from './pages/Dashboard';import Pay from './pages/Pay';
const Guard=({children})=>{const {session}=useAuth();return session?children:<Navigate to="/login" replace/>};
export default function App(){
  if(!configured)return <div className="center"><div className="card narrow"><h2>Setup needed</h2><p>Create <code>.env.local</code> with VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and VITE_API_URL, then restart <code>npm run dev</code>.</p></div></div>;
  return(<Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
    <Route path="/login" element={<AuthPage/>}/>
    <Route path="/dashboard" element={<Guard><Dashboard/></Guard>}/>
    <Route path="/pay/:token" element={<Pay/>}/>
    <Route path="*" element={<div className="center">Page not found</div>}/></Routes>)}