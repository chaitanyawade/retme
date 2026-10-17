import {supabase as s,API,TOKEN_KEY} from './supabase';
const x=async p=>{const {data,error}=await p;if(error)throw error;return data};
const api=async(path,method='GET',body)=>{
  const r=await fetch(API+path,{method,headers:{'Content-Type':'application/json',Authorization:'Bearer '+localStorage.getItem(TOKEN_KEY)},body:body?JSON.stringify(body):undefined});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.error||'Something went wrong');return d};
// admin (through our server)
export const getQRs=()=>api('/admin/qrs');
export const saveQR=(v,id)=>id?api('/admin/qrs/'+id,'PUT',v):api('/admin/qrs','POST',v);
export const deleteQR=id=>api('/admin/qrs/'+id,'DELETE');
// customer (anonymous)
export const getPayInfo=(t,log)=>x(s.rpc('get_pay_info',{p_token:t,p_log:!!log}));
export const goReview=t=>x(s.rpc('go_review',{p_token:t}));