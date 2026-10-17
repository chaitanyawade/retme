// Opens the Google review link. On Android we ask Chrome to open the Google Maps app (where users are usually
// signed in), falling back to the normal https link. We cannot detect whether the user is logged in to Google.
export function openReview(url){
  if(/Android/i.test(navigator.userAgent)){
    const u=new URL(url);
    window.location.href=`intent://${u.host}${u.pathname}${u.search}#Intent;scheme=https;package=com.google.android.apps.maps;S.browser_fallback_url=${encodeURIComponent(url)};end`;
    return;
  }
  window.location.href=url; // iOS/desktop: universal link opens Maps app if installed, else browser
}