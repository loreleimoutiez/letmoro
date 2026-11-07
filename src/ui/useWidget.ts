import {useEffect,useRef} from 'react';
import {supportsWidget,publishWidgetSnapshot} from '../adapters/widget.ts';

export function useWidget(owner: string | null, snapshot: string | null) {
  const current=useRef(snapshot);current.current=snapshot;
  const present=snapshot!==null;
  useEffect(()=>{
    if(!supportsWidget)return;
    let previous: string | null | undefined;
    const update=()=>{const next=owner?current.current:null;if(previous===next)return;previous=next;void publishWidgetSnapshot(next).catch(()=>{});};
    update();const timer=window.setInterval(update,5000);
    return()=>clearInterval(timer);
  },[owner,present]);
}
