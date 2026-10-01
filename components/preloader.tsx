'use client';
import Image from 'next/image';
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion';
import {useEffect,useState} from 'react';

export function Preloader(){
  const [visible,setVisible]=useState(true);
  const reduced=useReducedMotion();
  useEffect(()=>{
    let seen=false;
    try{seen=window.sessionStorage.getItem('aurum-loaded')==='1';}catch{seen=false;}
    let finished=false;
    const finish=()=>{
      if(finished)return;
      finished=true;
      try{window.sessionStorage.setItem('aurum-loaded','1');}catch{}
      setVisible(false);
    };
    const delay=seen?180:1200;
    const timer=window.setTimeout(finish,delay);
    const safetyTimer=window.setTimeout(finish,2400);
    if(document.readyState==='complete')window.setTimeout(finish,seen?180:300);
    else window.addEventListener('load',finish,{once:true});
    return()=>{
      window.clearTimeout(timer);
      window.clearTimeout(safetyTimer);
      window.removeEventListener('load',finish);
    };
  },[]);
  return <AnimatePresence>{visible&&<motion.div role="status" aria-label="Загрузка сайта" className="fixed inset-0 z-[100] grid place-items-center bg-obsidian" initial={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?.01:.45}}><div className="text-center"><Image src="/brand/aurum-mark.svg" alt="" width={72} height={72} priority className="mx-auto"/><p className="mt-5 font-display text-2xl tracking-wide">Aurum Drive</p><div className="relative mt-5 h-px w-40 overflow-hidden bg-slate"><span className="absolute inset-y-0 w-1/2 animate-shimmer bg-aurum"/></div></div></motion.div>}</AnimatePresence>;
}
