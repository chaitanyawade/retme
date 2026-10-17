import {useEffect,useRef,useState} from 'react';import {useParams} from 'react-router-dom';
import {getPayInfo,goReview} from '../lib/database';import {buildUPIUrl} from '../lib/payment';import {openReview} from '../lib/redirect';
export default function Pay(){
  const {token}=useParams(),k='rf_pay_'+token,left=useRef(false);
  const [info,setInfo]=useState(),[err,setErr]=useState(''),[loading,setLoading]=useState(true),[stage,setStage]=useState('pay');
  const toReview=async()=>{setStage('returned');sessionStorage.removeItem(k);
    try{const u=await goReview(token);if(u)openReview(u);else setErr('Review link unavailable.')}catch{setErr('Something went wrong. Please try again.')}};
  const startPay=i=>{sessionStorage.setItem(k,String(Date.now()));left.current=false;setStage('paying');
    window.location.href=buildUPIUrl({upi:i.upi_id,name:i.shop_name})};
  useEffect(()=>{(async()=>{try{
    const first=!sessionStorage.getItem('seen_'+token);sessionStorage.setItem('seen_'+token,'1');
    const i=await getPayInfo(token,first);setInfo(i);setLoading(false);if(!i)return;
    const age=Date.now()-Number(sessionStorage.getItem(k)||0);
    if(age>8000&&age<30*60e3){toReview();return}      // page reloaded after the UPI app
    startPay(i);                                          // first visit: open UPI app straight away
  }catch{setErr('Something went wrong. Please try again.');setLoading(false)}})()},[token]);// eslint-disable-line
  useEffect(()=>{const h=()=>{ if(document.hidden)left.current=true;
      else if(left.current&&sessionStorage.getItem(k)){left.current=false;toReview()} };   // user came back from UPI app
    document.addEventListener('visibilitychange',h);return()=>document.removeEventListener('visibilitychange',h)},[token]);// eslint-disable-line
  if(loading)return <div className="center">Loading…</div>;
  if(!info)return <div className="center">{err||'This QR code is not valid.'}</div>;
  return <div className="center"><div className="card narrow" style={{textAlign:'center'}}>
    <h2 style={{margin:0}}>{info.shop_name}</h2>
    <p className="muted">{[info.branch,info.table_no&&'Table '+info.table_no].filter(Boolean).join(' · ')}</p>
    {stage==='returned'?<><p>Taking you to Google…</p><button className="full" onClick={toReview}>Open review page</button></>
    :<><p className="muted">{stage==='paying'?'Opening your UPI app…':''} Enter the amount and your PIN in your UPI app. Afterwards you’ll be taken to Google to rate your experience.</p>
      <button className="full" onClick={()=>startPay(info)}>Pay with UPI</button>
      <p><a href="#" onClick={e=>{e.preventDefault();toReview()}}>Already paid? Go to review</a></p></>}
    {err&&<p className="err" role="alert">{err}</p>}</div></div>}