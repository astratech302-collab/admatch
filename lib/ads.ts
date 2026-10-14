import { all, one, run, transaction } from './db';
import { randomUUID } from 'node:crypto';
export type Ad = {id:string;reference:string;name:string;primaryText:string;headline:string;libraryUrl:string;destinationUrl:string;notes:string;sample:number};
export const sampleAds = [
{id:'commute',reference:'ROAM-A',name:'Work commute',primaryText:'Laptop, charger, bottle, and the everyday essentials. Give your workday a little more organisation.',headline:'Meet your everyday work backpack.'},
{id:'weekend',reference:'ROAM-B',name:'Weekend travel',primaryText:'A change of clothes, your essentials, and room for the little extras. Pack for your next weekend away.',headline:'Ready for a weekend away?'},
{id:'work-travel',reference:'ROAM-C',name:'Work and travel',primaryText:'From your morning commute to your next short trip. One backpack for the different parts of your week.',headline:'One bag. Different plans.'}];
function seed(){ for(const a of sampleAds) run(`INSERT INTO ads (id,reference,name,primaryText,headline,sample) VALUES (?,?,?,?,?,1)`,a.id,a.reference,a.name,a.primaryText,a.headline); }
export function initialize(){ if(!one('SELECT value FROM meta WHERE key=?','seeded')) transaction(()=>{seed();run('INSERT INTO meta VALUES (?,?)','seeded','1');}); }
initialize();
export const getAds = ()=>all<Ad>('SELECT * FROM ads ORDER BY sample DESC,rowid');
export const getAd = (id:string)=>one<Ad>('SELECT * FROM ads WHERE id=?',id);
function text(v:unknown, label:string, max=3000, required=true){if(typeof v!=='string'||v.length>max||(required&&!v.trim())) throw new Error(`Please enter ${label} (${max} characters maximum).`);return v.trim();}
export function saveAd(input:Record<string,unknown>){const id=typeof input.id==='string'?input.id:randomUUID();if(input.id&&!getAd(id))throw new Error('Ad no longer exists.'); const reference=text(input.reference,'an internal ad reference',100), name=text(input.name,'an ad name',120),primaryText=text(input.primaryText,'primary text'),headline=text(input.headline,'an ad headline',250),libraryUrl=text(input.libraryUrl??'','an Ad Library URL',1000,false),destinationUrl=text(input.destinationUrl??'/p/roam-backpack','a destination URL',1000),notes=text(input.notes??'','creative notes',3000,false);
for(const u of [libraryUrl,destinationUrl]) if(u&&!(u.startsWith('/')&&!u.startsWith('//'))) {try{if(!['http:','https:'].includes(new URL(u).protocol))throw new Error();}catch{throw new Error('Use an http or https URL, or a local path.');}}
run(`INSERT INTO ads (id,reference,name,primaryText,headline,libraryUrl,destinationUrl,notes,sample) VALUES (?,?,?,?,?,?,?,?,0) ON CONFLICT(id) DO UPDATE SET reference=excluded.reference,name=excluded.name,primaryText=excluded.primaryText,headline=excluded.headline,libraryUrl=excluded.libraryUrl,destinationUrl=excluded.destinationUrl,notes=excluded.notes`,id,reference,name,primaryText,headline,libraryUrl,destinationUrl,notes);return getAd(id);}
export function deleteAd(id:string){run('DELETE FROM ads WHERE id=?',id);}
export function resetDemo(){transaction(()=>{for(const table of ['events','sessions','assignments','experiments','variations','ads'])run(`DELETE FROM ${table}`);seed();});}
