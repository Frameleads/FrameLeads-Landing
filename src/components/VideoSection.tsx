"use client";

import { useEffect, useState } from "react";
import {observeMeasurement} from '../measurement';
import {playbackProgress} from '../vsl-engagement';

const videoId = "ga8mejqKNII";
const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
// Autoplay is requested only after the visitor clicks the branded poster.
const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1&origin=https%3A%2F%2Fframeleads.io`;

export default function VideoSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(()=>{
    if(!isLoaded)return;
    type Player={getCurrentTime:()=>number;getPlayerState:()=>number;playVideo:()=>void;mute:()=>void};
    const w=window as Window&{YT?:{Player:new(id:string,options:unknown)=>Player};onYouTubeIframeAPIReady?:()=>void};
    let cancelled=false,player:Player|undefined,timer:ReturnType<typeof setInterval>|undefined,watched=0,previous=0,triedMutedFallback=false;
    const previousReady=w.onYouTubeIframeAPIReady;
    const ready=()=>{if(cancelled||player||!w.YT)return;try{player=new w.YT.Player('frameleads-vsl',{events:{
      onReady:()=>{
        // Start the already-requested video without waiting for another click on YouTube.
        try{player?.playVideo();}catch{}
        timer=setInterval(()=>{try{if(!player)return;const current=player.getCurrentTime();watched+=playbackProgress(previous,current,player.getPlayerState()===1);previous=current;if(watched>=30){observeMeasurement('VSL_ENGAGED');clearInterval(timer);}}catch{}},1000);
      },
      onAutoplayBlocked:()=>{
        // Some iOS/in-app browsers disallow unmuted autoplay after an iframe loads.
        // If needed, keep the one-click experience by starting muted. Native YouTube
        // controls stay available so viewers can enable audio when they choose.
        if(cancelled||triedMutedFallback||!player)return;
        triedMutedFallback=true;
        try{player.mute();player.playVideo();}catch{}
      }
    }});}catch{}};
    w.onYouTubeIframeAPIReady=()=>{try{previousReady?.();}catch{}ready();};
    if(w.YT)ready();else if(!document.getElementById('frameleads-youtube-api')){const script=document.createElement('script');script.id='frameleads-youtube-api';script.src='https://www.youtube.com/iframe_api';script.async=true;document.head.appendChild(script);}
    return()=>{cancelled=true;if(timer)clearInterval(timer);w.onYouTubeIframeAPIReady=previousReady;};
  },[isLoaded]);

  return <div className="mx-auto mb-10 w-full max-w-6xl rounded-2xl border border-white/10 bg-[#18181b] p-2.5 shadow-[0_0_30px_rgba(255,90,31,0.15)] sm:p-4"><div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]">{isLoaded ? <><iframe id="frameleads-vsl" src={embedUrl} title="FrameLeads: What happens after someone replies" className="absolute inset-0 h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" loading="eager" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /><a href={watchUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-3 right-3 rounded-md border border-white/15 bg-black/60 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-white/65 transition hover:text-white">Watch on YouTube ↗</a></> : <button type="button" onClick={() => setIsLoaded(true)} className="group relative h-full w-full overflow-hidden text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5A1F]"><span className="absolute inset-0 bg-[url('https://i.ytimg.com/vi/ga8mejqKNII/maxresdefault.jpg')] bg-cover bg-center opacity-45 transition duration-500 group-hover:scale-[1.02] group-hover:opacity-55" /><span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/45" /><span className="relative z-10 flex h-full items-center justify-center"><span className="grid h-16 w-16 place-items-center rounded-full border border-[#FF5A1F]/50 bg-[#FF5A1F] text-white shadow-[0_0_32px_rgba(255,90,31,.42)] transition-transform duration-200 group-hover:scale-105 sm:h-20 sm:w-20"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-7 w-7 fill-current sm:h-8 sm:w-8"><path d="M8 4.8a1 1 0 0 1 1.5-.85l11 7.2a1 1 0 0 1 0 1.7l-11 7.2A1 1 0 0 1 8 19.2Z" /></svg></span></span></button>} {!isLoaded && <a href={watchUrl} target="_blank" rel="noopener noreferrer" className="absolute bottom-4 right-4 z-20 font-mono text-[8px] uppercase tracking-wider text-white/60 underline decoration-white/25 underline-offset-4 transition hover:text-white">Open on YouTube ↗</a>}</div></div>;
}
