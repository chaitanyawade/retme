export const isValidUPI=v=>/^[A-Za-z0-9._-]{2,}@[A-Za-z]{2,}$/.test(v||'');
// No amount => the customer types the amount inside their own UPI app.
export const buildUPIUrl=({upi,name,amount})=>{const e=encodeURIComponent;
  return `upi://pay?pa=${e(upi)}&pn=${e(name)}${amount?`&am=${Number(amount).toFixed(2)}`:''}&cu=INR&tn=${e('Payment to '+name)}`};