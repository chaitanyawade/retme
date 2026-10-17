import {createClient} from '@supabase/supabase-js';
const url=import.meta.env.VITE_SUPABASE_URL,key=import.meta.env.VITE_SUPABASE_ANON_KEY;
export const configured=Boolean(url&&key&&!url.startsWith('your_'));
export const API='/api'; // same origin: Vite proxy in dev, Vercel function in production
export const TOKEN_KEY='rf_jwt';
// Browser uses Supabase only for the anonymous customer functions. Admin data goes through our own API.
export const supabase=createClient(configured?url:'http://localhost:54321',configured?key:'missing',{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});