import {isSameOriginRequest} from '../../../lib/request-origin';
import {NextResponse} from 'next/server';
import {collect} from '../../../lib/events';
export const runtime='nodejs';
export async function POST(request:Request){try{if(!isSameOriginRequest(request))return NextResponse.json({error:'Request origin is not allowed.'},{status:403});const body=await request.json();return NextResponse.json(collect(String(body.sessionId),String(body.type),body.quantity??1));}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Could not record event.'},{status:400});}}
