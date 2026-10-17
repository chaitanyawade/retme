import {useState} from 'react';import {useNavigate} from 'react-router-dom';import {useAuth} from '../context/AuthContext';
export default function AuthPage(){
  const {call,setToken}=useAuth(),nav=useNavigate(),[email,setE]=useState(''),[pw,setP]=useState(''),[err,setErr]=useState(''),[busy,setBusy]=useState(false);
  const go=async e=>{e.preventDefault();setErr('');setBusy(true);const r=await call('/auth/login',{email,password:pw});setBusy(false);
    if(r.error)return setErr(r.error);setToken(r.data.token);nav('/dashboard')};
  return <div className="center"><form className="card narrow" onSubmit={go}><h2>Admin login</h2>
    <label htmlFor="e">Email</label><input id="e" type="email" required autoComplete="username" value={email} onChange={e=>setE(e.target.value)}/>
    <label htmlFor="p">Password</label><input id="p" type="password" required autoComplete="current-password" value={pw} onChange={e=>setP(e.target.value)}/>
    {err&&<p className="err" role="alert">{err}</p>}<button className="full" disabled={busy}>{busy?'Please wait…':'Log in'}</button></form></div>}