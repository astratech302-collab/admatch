import { all, one, run } from './db';
import { getAd } from './ads';
export type Variation={id:string;adId:string;headline:string;description:string;angle:string;explanation:string;publishedHeadline:string|null;publishedDescription:string|null;publishedAt:string|null};
export const getVariations=()=>all<Variation>('SELECT * FROM variations ORDER BY rowid DESC');
export const getVariation=(id:string)=>one<Variation>('SELECT * FROM variations WHERE id=?',id);
export function saveVariation(input:Record<string,unknown>,publish=false){const adId=String(input.adId??'');if(!getAd(adId))throw new Error('Select an existing ad.');const id=adId;const headline=String(input.headline??'').trim(),description=String(input.description??'').trim();if(!headline||headline.length>180||!description||description.length>600)throw new Error('Enter a headline (up to 180 characters) and description (up to 600 characters).');const angle=String(input.angle??'Edited copy').slice(0,100),explanation=String(input.explanation??'Merchant-edited copy.').slice(0,1000);
run(`INSERT INTO variations (id,adId,headline,description,angle,explanation) VALUES (?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET headline=excluded.headline,description=excluded.description,angle=excluded.angle,explanation=excluded.explanation`,id,adId,headline,description,angle,explanation);
if(publish)run('UPDATE variations SET publishedHeadline=?,publishedDescription=?,publishedAt=? WHERE id=?',headline,description,new Date().toISOString(),id);return getVariation(id);}
export function unpublish(id:string){run('UPDATE variations SET publishedHeadline=NULL,publishedDescription=NULL,publishedAt=NULL WHERE id=?',id);}
export function deleteVariation(id:string){run('DELETE FROM variations WHERE id=?',id);}
