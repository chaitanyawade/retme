import {createContext,useContext,useState} from 'react';import {API,TOKEN_KEY} from '../lib/supabase';
const Ctx=createContext(null);export const useAuth=()=>useContext(Ctx);
const decode=t=>{try{const p=JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')));return p.exp*1000>Date.now()?p:null}catch{return null}};
export function AuthProvider({children}){
  const [user,setUser]=useState(()=>{const t=localStorage.getItem(TOKEN_KEY);return t?decode(t):null});
  const call=async(path,body)=>{try{const r=await fetch(API+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    const d=await r.json().catch(()=>({}));return r.ok?{data:d}:{error:d.error||'Something went wrong',needsVerification:d.needsVerification}}
    catch{return {error:'Cannot reach the server. Please try again.'}}};
  const setToken=t=>{localStorage.setItem(TOKEN_KEY,t);setUser(decode(t))};
  const signOut=()=>{localStorage.removeItem(TOKEN_KEY);setUser(null)};
  return <Ctx.Provider value={{user,session:user,loading:false,call,setToken,signOut}}>{children}</Ctx.Provider>}