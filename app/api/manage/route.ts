import {isSameOriginRequest} from '../../../lib/request-origin';
import {NextResponse} from 'next/server';
import {getAds,saveAd,deleteAd,resetDemo,getAd} from '../../../lib/ads';
import {getVariations,saveVariation,unpublish,deleteVariation} from '../../../lib/variations';
import {getExperiments,createExperiment} from '../../../lib/experiments';
import {sampleAdapter,approvedFacts} from '../../../lib/suggestions';
import {results} from '../../../lib/events';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(){return NextResponse.json({ads:getAds(),variations:getVariations(),experiments:getExperiments(),results:results()});}
export async function POST(request:Request){try{if(!isSameOriginRequest(request))return NextResponse.json({error:'Request origin is not allowed.'},{status:403});const body=await request.json();let result;switch(body.action){case 'saveAd':result=saveAd(body);break;case 'deleteAd':deleteAd(body.id);break;case 'suggest':{const ad=getAd(body.id);if(!ad)throw new Error('Ad no longer exists.');result=await sampleAdapter.suggest(ad,approvedFacts);break;}case 'draft':result=saveVariation(body);break;case 'publish':if(body.reviewed!==true)throw new Error('Review and confirm the copy before publishing.');result=saveVariation(body,true);break;case 'unpublish':unpublish(body.id);break;case 'deleteVariation':deleteVariation(body.id);break;case 'experiment':result=createExperiment(body.id,String(body.name??''));break;case 'reset':if(body.confirmation!=='RESET')throw new Error('Type RESET to confirm.');resetDemo();break;default:throw new Error('Unknown action.');}return NextResponse.json({ok:true,result});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Something went wrong.'},{status:400});}}
