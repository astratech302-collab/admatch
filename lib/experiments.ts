import { randomInt, randomUUID } from 'node:crypto';
import {all,one,run} from './db';
import {getVariation} from './variations';
import {getAd} from './ads';
export type Experiment={id:string;name:string;adId:string;adReference:string;variantId:string;headline:string;description:string;createdAt:string};
export const getExperiments=()=>all<Experiment>('SELECT * FROM experiments ORDER BY rowid DESC');
export const getExperiment=(id:string)=>one<Experiment>('SELECT * FROM experiments WHERE id=?',id);
export function createExperiment(variantId:string,name:string){const v=getVariation(variantId);if(!v?.publishedAt||!v.publishedHeadline||!v.publishedDescription)throw new Error('Publish a variation first.');if(!name.trim()||name.length>120)throw new Error('Enter an experiment name (up to 120 characters).');const a=getAd(v.adId)!;const id=`test-${randomUUID().slice(0,8)}`;run('INSERT INTO experiments VALUES (?,?,?,?,?,?,?,?)',id,name.trim(),a.id,a.reference,v.id,v.publishedHeadline,v.publishedDescription,new Date().toISOString());return getExperiment(id);}
export function assign(experimentId:string,visitorId:string):'original'|'matching'{const choice=randomInt(2)?'matching':'original';run('INSERT OR IGNORE INTO assignments VALUES (?,?,?)',experimentId,visitorId,choice);return one<{arm:'original'|'matching'}>('SELECT arm FROM assignments WHERE experimentId=? AND visitorId=?',experimentId,visitorId)!.arm;}
