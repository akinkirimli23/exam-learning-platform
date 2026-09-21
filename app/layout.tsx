import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'İvme · Her gün bir adım',description:'Fizik öğren, sorularla kendini kontrol et ve kendi çalışma ritmini kur. 18+ eğitim pilotu.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="tr"><body>{children}</body></html>;}
