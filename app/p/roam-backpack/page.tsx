import {headers} from 'next/headers';
import {openLanding} from '../../../lib/landing';
import '../../../lib/ads';
import {ProductPage} from '../../../components/ProductPage';
export const dynamic='force-dynamic';
export const runtime='nodejs';
export default async function Page({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){const q=await searchParams;const first=(v:string|string[]|undefined)=>Array.isArray(v)?v[0]:v;const visitor=(await headers()).get('x-admatch-visitor')!;const landing=openLanding({variant:first(q.variant),experiment:first(q.experiment),preview:first(q.preview)},visitor);return <ProductPage {...landing}/>;}
