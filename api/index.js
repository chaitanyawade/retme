// Single-admin API. Runs as a Vercel serverless function (and locally via api/dev.js).
import express from 'express';import jwt from 'jsonwebtoken';import crypto from 'crypto';import rateLimit from 'express-rate-limit';import {createClient} from '@supabase/supabase-js';
const E=process.env,SECRET=E.JWT_SECRET;
const db=createClient(E.SUPABASE_URL||'http://localhost',E.SUPABASE_SERVICE_KEY||'missing',{auth:{persistSession:false}});
const app=express();app.set('trust proxy',1);app.use(express.json({limit:'10kb'}));
const bad=(r,m,c=400)=>r.status(c).json({error:m});
const wrap=f=>(q,r)=>f(q,r).catch(e=>{console.error(e);r.status(500).json({error:'Something went wrong. Please try again.'})});
const norm=e=>String(e||'').trim().toLowerCase();
const same=(a,b)=>{const h=s=>crypto.createHash('sha256').update(String(s)).digest();return crypto.timingSafeEqual(h(a),h(b))};
app.post('/api/auth/login',rateLimit({windowMs:15*60*1000,limit:10,standardHeaders:true,legacyHeaders:false}),wrap(async(q,r)=>{
  if(!E.ADMIN_EMAIL||!E.ADMIN_PASSWORD||!SECRET)return bad(r,'Server is not configured. Set the environment variables.',500);
  const a=same(norm(q.body.email),norm(E.ADMIN_EMAIL)),b=same(q.body.password||'',E.ADMIN_PASSWORD);
  if(!(a&&b))return bad(r,'Incorrect email or password.',401);
  r.json({token:jwt.sign({role:'admin',email:norm(E.ADMIN_EMAIL)},SECRET,{expiresIn:'7d'})})}));
const admin=(q,r,n)=>{try{if(!SECRET||jwt.verify((q.headers.authorization||'').slice(7),SECRET).role!=='admin')throw 0;n()}catch{bad(r,'Please log in again.',401)}};
const clean=b=>{const t=v=>String(v??'').trim();
  const v={shop_name:t(b.shop_name),google_review_url:t(b.google_review_url),upi_id:t(b.upi_id),branch:t(b.branch)||null,table_no:t(b.table_no)||null};
  if(!v.shop_name||v.shop_name.length>120)return 'Shop name is required (max 120 characters).';
  if(!/^https:\/\/\S+$/i.test(v.google_review_url))return 'Google review link must start with https://';
  if(!/^[A-Za-z0-9._-]{2,}@[A-Za-z]{2,}$/.test(v.upi_id))return 'Enter a valid UPI ID like name@bank';
  if((v.branch||'').length>80||(v.table_no||'').length>20)return 'Branch or table number is too long.';
  return v};
app.get('/api/admin/qrs',admin,wrap(async(q,r)=>{
  const [a,b]=await Promise.all([db.from('qr_codes').select('*').order('created_at',{ascending:false}),db.rpc('qr_stats')]);
  if(a.error||b.error)throw a.error||b.error;
  const m=Object.fromEntries((b.data||[]).map(x=>[x.qr_id,x]));
  r.json(a.data.map(x=>({...x,scans:Number(m[x.id]?.scans||0),reviews:Number(m[x.id]?.reviews||0)})))}));
app.post('/api/admin/qrs',admin,wrap(async(q,r)=>{const v=clean(q.body);if(typeof v==='string')return bad(r,v);
  const {error}=await db.from('qr_codes').insert(v);if(error)throw error;r.json({ok:true})}));
app.put('/api/admin/qrs/:id',admin,wrap(async(q,r)=>{const v=clean(q.body);if(typeof v==='string')return bad(r,v);
  const {error}=await db.from('qr_codes').update(v).eq('id',q.params.id);if(error)throw error;r.json({ok:true})}));
app.delete('/api/admin/qrs/:id',admin,wrap(async(q,r)=>{const {error}=await db.from('qr_codes').delete().eq('id',q.params.id);if(error)throw error;r.json({ok:true})}));
export default app;