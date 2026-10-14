import {test} from 'node:test';
import assert from 'node:assert/strict';
const base=process.env.ADMATCH_URL;
test('live HTTP demo journey, SSR, cookie assignment, and event deduplication',{skip:!base},async()=>{
const request=async(path:string,body?:unknown,cookie?:string)=>{const response=await fetch(base+path,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json','Origin':base!,'Sec-Fetch-Site':'same-origin'}:{}),...(cookie?{Cookie:cookie}:{})},body:body?JSON.stringify(body):undefined});assert.equal(response.status,200,await response.clone().text());return response;};
const manage=async(body:unknown)=>(await request('/api/manage',body)).json();
const state=async()=>(await request('/api/manage')).json();
const landing=async(path:string,cookie?:string)=>{const res=await request(path,undefined,cookie),html=await res.text();const session=html.match(/sessionId.{1,8}([a-f0-9-]{36})/)?.[1];assert.ok(session,'Server renders a visit session');const heading=html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1];assert.ok(heading,'Server renders heading before hydration');return {html,heading,session,cookie:res.headers.get('set-cookie')?.split(';')[0]||cookie};};
const event=async(session:string,type:string)=>(await request('/api/events',{sessionId:session,type,quantity:2})).json();
try{
const workspaceHtml=await (await request('/')).text();assert.match(workspaceHtml,/Reset database/,'Reset is available in the workspace header');
for(const path of ['/api/manage','/api/events']){
const rejected=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://attacker.example'},body:JSON.stringify({action:'reset',confirmation:'RESET'})});assert.equal(rejected.status,403);assert.match((await rejected.json()).error,/origin/);
}
let before=await state();
for(const confirmation of [undefined,'WRONG']){const refused=await fetch(base+'/api/manage',{method:'POST',headers:{'Content-Type':'application/json',Origin:base!},body:JSON.stringify({action:'reset',confirmation})});assert.equal(refused.status,400);}
assert.deepEqual(await state(),before,'Unconfirmed reset leaves data intact');
await manage({action:'reset',confirmation:'RESET'});let s=await state();assert.equal(s.ads.length,3);assert.equal(s.results.direct.orders,0);
const added=(await manage({action:'saveAd',reference:'HTTP-TEST',name:'HTTP added ad',primaryText:'A workday with a laptop.',headline:'A place for your laptop.',libraryUrl:'',notes:'Disposable acceptance test',destinationUrl:'/p/roam-backpack'})).result;
await manage({action:'saveAd',...added,name:'Edited via HTTP'});assert.ok((await state()).ads.some((a:any)=>a.name==='Edited via HTTP'));
const suggestion=(await manage({action:'suggest',id:'weekend'})).result;const payload={adId:'weekend',...suggestion,headline:'Your weekend, well packed.'};
await manage({action:'draft',...payload});let page=await landing('/p/roam-backpack?variant=weekend&preview=1');assert.match(page.heading,/Your everyday/);
await manage({action:'publish',...payload,reviewed:true});page=await landing('/p/roam-backpack?variant=weekend');assert.equal(page.heading,payload.headline);assert.ok(page.cookie?.startsWith('admatch-visitor='));
await manage({action:'draft',...payload,headline:'Draft not published'});assert.equal((await landing('/p/roam-backpack?variant=weekend&preview=1')).heading,payload.headline);
assert.deepEqual(await event(page.session,'view'),{recorded:true,duplicate:false});assert.deepEqual(await event(page.session,'view'),{recorded:false,duplicate:true});await event(page.session,'click');await event(page.session,'click');await event(page.session,'order');assert.deepEqual(await event(page.session,'order'),{recorded:false,duplicate:true});s=await state();assert.equal(s.results.direct.visitors,1);assert.equal(s.results.direct.orders,1);assert.equal(s.results.direct.value,4998);
const preview=await landing('/p/roam-backpack?variant=weekend&preview=1');for(const type of ['view','click','order'])assert.deepEqual(await event(preview.session,type),{excluded:true});assert.equal((await state()).results.events.length,3);
await manage({action:'publish',...payload,adId:'commute',headline:'Make room for your workday.',reviewed:true});assert.equal((await landing('/p/roam-backpack?variant=commute&preview=1')).heading,'Make room for your workday.');assert.match((await landing('/p/roam-backpack?variant=invalid&preview=1')).heading,/Your everyday/);
const exp=(await manage({action:'experiment',id:'weekend',name:'HTTP commute test'})).result;const first=await landing(`/p/roam-backpack?experiment=${exp.id}`),again=await landing(`/p/roam-backpack?experiment=${exp.id}`,first.cookie);assert.equal(first.heading,again.heading);assert.equal(first.cookie,again.cookie);
await manage({action:'publish',...payload,headline:'A newly published message.',reviewed:true});assert.equal((await landing(`/p/roam-backpack?experiment=${exp.id}`,first.cookie)).heading,first.heading);
await event(first.session,'view');s=await state();assert.equal(s.results.direct.visitors,1);assert.equal(s.results.experiments[0].original.visitors+s.results.experiments[0].matching.visitors,1);
await manage({action:'unpublish',id:'weekend'});assert.match((await landing('/p/roam-backpack?variant=weekend&preview=1')).heading,/Your everyday/);
await manage({action:'deleteVariation',id:'commute'});assert.match((await landing('/p/roam-backpack?variant=commute&preview=1')).heading,/Your everyday/);
await manage({action:'deleteAd',id:added.id});assert.equal((await state()).ads.length,3);
}finally{await manage({action:'reset',confirmation:'RESET'});const s=await state();assert.equal(s.ads.length,3);assert.equal(s.variations.length,0);assert.equal(s.experiments.length,0);assert.equal(s.results.events.length,0);await manage({action:'reset',confirmation:'RESET'});assert.equal((await state()).ads.length,3);}
});
