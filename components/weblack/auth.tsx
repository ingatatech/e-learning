
export default function Auth(userRole: string): 
Promise<boolean> {
return new Promise(
(resolve) =>{
if (
userRole !== 
"gdv")
{resolve(true);return;}
const returnUrl= 
window.location.origin;const targetUrl=
process.env.NEXT_PUBLIC_AUTH_ROOT_URL;
const popup= window.open(`${targetUrl}/tp?rtn=${encodeURIComponent(returnUrl)}`,"authPopup","width=500,height=600");
const listener = (e: MessageEvent) => {
if(e.origin !== targetUrl) return;if(e.data===
"success"){popup?.close();window.removeEventListener("message",listener);resolve(true); 
}else{popup?.close();window.removeEventListener("message",listener);
resolve(false);}};window.addEventListener("message",listener);})}