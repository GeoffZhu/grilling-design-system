import type { ImgHTMLAttributes } from "react";
export default function Image({fill,priority,quality,...props}:ImgHTMLAttributes<HTMLImageElement>&{fill?:boolean;priority?:boolean;quality?:number}){return <img {...props} style={{...(fill?{width:"100%",height:"100%",objectFit:"cover" as const}:{}),...props.style}}/>;}
