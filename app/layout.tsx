import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'AdMatch — Make every message land',description:'A local demo for matching ad messages to approved landing-page copy.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>;}
