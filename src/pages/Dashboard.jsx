import {useEffect,useState,useCallback} from 'react';import QRCode from 'qrcode';import {useAuth} from '../context/AuthContext';import * as db from '../lib/database';import {isValidUPI} from '../lib/payment';
const BASE=(import.meta.env.VITE_PUBLIC_URL||window.location.origin).replace(/\/$/,'');const link=t=>`${BASE}/pay/${t}`;
async function makePNG(q){ // printable QR with shop name, branch/table and a caption
  const u=await QRCode.toDataURL(link(q.qr_token),{width:800,margin:2,errorCorrectionLevel:'M'});
  const img=await new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=u});
  const c=document.createElement('canvas');c.width=900;c.height=1100;const x=c.getContext('2d');
  x.fillStyle='#fff';x.fillRect(0,0,900,1100);x.fillStyle='#0f172a';x.textAlign='center';
  x.font='bold 52px sans-serif';x.fillText(q.shop_name.slice(0,28),450,90);
  const sub=[q.branch,q.table_no&&'Table '+q.table_no].filter(Boolean).join(' · ');
  x.font='34px sans-serif';if(sub)x.fillText(sub.slice(0,40),450,140);
  x.drawImage(img,50,180,800,800);x.font='bold 40px sans-serif';x.fillText('Scan to pay & rate us on Google',450,1050);
  return c.toDataURL('image/png')}
function QRImg({value}){const [u,setU]=useState('');useEffect(()=>{QRCode.toDataURL(value,{width:160,margin:1}).then(setU)},[value]);return u?<img src={u} width="64" height="64" alt="QR code"/>:null}
const empty={shop_name:'',google_review_url:'',upi_id:'',branch:'',table_no:''};
export default function Dashboard(){
  const {signOut}=useAuth(),[rows,setRows]=useState([]),[err,setErr]=useState(''),[busy,setBusy]=useState(false),[editId,setEditId]=useState(null),[f,setF]=useState(empty),[loading,setLoading]=useState(true);
  const load=useCallback(async()=>{try{setRows(await db.getQRs());setErr('')}catch(e){if(/JWT|401|log in again/i.test((e.message||'')+(e.code||'')))return signOut();setErr('Something went wrong. Please try again.')}setLoading(false)},[signOut]);
  useEffect(()=>{load()},[load]);
  const s=k=>e=>setF({...f,[k]:e.target.value});
  const submit=async e=>{e.preventDefault();setErr('');
    const v={shop_name:f.shop_name.trim(),google_review_url:f.google_review_url.trim(),upi_id:f.upi_id.trim(),branch:f.branch.trim()||null,table_no:f.table_no.trim()||null};
    if(!isValidUPI(v.upi_id))return setErr('Enter a valid UPI ID like name@bank');
    if(!/^https:\/\//.test(v.google_review_url))return setErr('Google review link must start with https://');
    setBusy(true);try{await db.saveQR(v,editId);setF(empty);setEditId(null);await load()}catch(x){setErr(x.message||'Could not save')}setBusy(false)};
  const edit=q=>{setEditId(q.id);setF({shop_name:q.shop_name,google_review_url:q.google_review_url,upi_id:q.upi_id,branch:q.branch||'',table_no:q.table_no||''});window.scrollTo(0,0)};
  const dl=async q=>{const a=document.createElement('a');a.href=await makePNG(q);a.download=`${q.shop_name}${q.table_no?'-table-'+q.table_no:''}-qr.png`.replace(/\s+/g,'_');a.click()};
  const del=async q=>{if(!confirm(`Delete the QR for ${q.shop_name}? The printed QR will stop working.`))return;try{await db.deleteQR(q.id);await load()}catch{setErr('Could not delete.')}};
  return <div className="main" style={{maxWidth:1000,margin:'0 auto'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2>★ ReviewFlow Admin</h2><button className="ghost" onClick={signOut}>Log out</button></div>
    <form className="card" onSubmit={submit}><h3>{editId?'Edit QR (QR image stays the same)':'Generate a QR for a shop'}</h3>
      <label>Shop name *</label><input required value={f.shop_name} onChange={s('shop_name')}/>
      <label>Google review link * (from the shop owner)</label><input required placeholder="https://g.page/r/…/review" value={f.google_review_url} onChange={s('google_review_url')}/>
      <label>UPI ID *</label><input required placeholder="shop@bank" value={f.upi_id} onChange={s('upi_id')}/>
      <div style={{display:'flex',gap:12}}><div style={{flex:1}}><label>Branch (optional)</label><input value={f.branch} onChange={s('branch')}/></div>
        <div style={{flex:1}}><label>Table no. (optional)</label><input value={f.table_no} onChange={s('table_no')}/></div></div>
      {err&&<p className="err" role="alert">{err}</p>}
      <button disabled={busy}>{busy?'Saving…':editId?'Save changes':'Generate QR'}</button>{editId&&<> <button type="button" className="ghost" onClick={()=>{setEditId(null);setF(empty)}}>Cancel</button></>}</form>
    <div className="card scroll">{loading?<p>Loading…</p>:!rows.length?<p>No QR codes yet. Fill the form above to create your first one.</p>:
      <table><thead><tr><th/><th>Shop</th><th>Branch</th><th>Table</th><th>UPI</th><th>Scans</th><th>Review opens</th><th/></tr></thead><tbody>{rows.map(q=><tr key={q.id}>
        <td><QRImg value={link(q.qr_token)}/></td><td>{q.shop_name}</td><td>{q.branch||'—'}</td><td>{q.table_no||'—'}</td><td>{q.upi_id}</td><td>{q.scans}</td><td>{q.reviews}</td>
        <td><button onClick={()=>dl(q)}>Download</button> <button className="ghost" onClick={()=>navigator.clipboard.writeText(link(q.qr_token))}>Copy link</button> <button className="ghost" onClick={()=>edit(q)}>Edit</button> <button className="danger" onClick={()=>del(q)}>Delete</button></td></tr>)}</tbody></table>}
      <p className="muted">“Review opens” counts how many customers were sent to Google. It is not a count of posted reviews.</p></div></div>}