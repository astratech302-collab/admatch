import { randomUUID } from 'node:crypto';
import {getExperiment,assign} from './experiments';
import {getVariation} from './variations';
import {getAd} from './ads';
import {originalCopy} from './suggestions';
import {run} from './db';
export function resolveLanding(query:{variant?:string;experiment?:string;preview?:string},visitorId:string){let copy={...originalCopy},variantId:string|null=null,experimentId:string|null=null,adReference:string|null=null,arm='original';const preview=query.preview==='1';
const e=query.experiment?getExperiment(query.experiment):undefined;
if(e){experimentId=e.id;adReference=e.adReference;arm=preview?'matching':assign(e.id,visitorId);if(arm==='matching'){copy={headline:e.headline,description:e.description};variantId=e.variantId;}}
else if(!query.experiment&&query.variant){const v=getVariation(query.variant);if(v?.publishedAt&&v.publishedHeadline&&v.publishedDescription){copy={headline:v.publishedHeadline,description:v.publishedDescription};variantId=v.id;adReference=getAd(v.adId)?.reference??null;arm='matching';}}
return {...copy,variantId,experimentId,adReference,arm,preview};}
export function openLanding(query:{variant?:string;experiment?:string;preview?:string},visitorId:string){const resolved=resolveLanding(query,visitorId),sessionId=randomUUID();run('INSERT INTO sessions VALUES (?,?,?,?,?,?,?,?)',sessionId,visitorId,resolved.adReference,resolved.variantId,resolved.experimentId,resolved.arm,resolved.preview?1:0,new Date().toISOString());return {...resolved,sessionId};}
