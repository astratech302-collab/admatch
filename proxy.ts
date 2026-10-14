import {NextRequest,NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
export function proxy(request:NextRequest){let id=request.cookies.get('admatch-visitor')?.value;if(!id||!/^[a-f0-9-]{36}$/.test(id))id=randomUUID();const headers=new Headers(request.headers);headers.set('x-admatch-visitor',id);const response=NextResponse.next({request:{headers}});response.cookies.set('admatch-visitor',id,{httpOnly:true,sameSite:'lax',path:'/',maxAge:60*60*24*365});response.headers.set('Cache-Control','private, no-store');return response;}
export const config={matcher:['/p/:path*']};
