import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { customerOrders, pickupStore, mobileSearchStart } from './purchase-images';
import {mobileFirst, mobileSearch, mobileCard, desktopFirst, desktopSearch, desktopCard, menu, openchat, launch, room, nickname, notice} from './guide-images';

type Screen = {id:string;label:string;lead:string;detail:string;note?:string};
const STEPS = [
  {id:'find',short:'지점 찾기',title:'내 지점부터 찾아볼까요?',summary:'가까운 매장과 연결하기'},
  {id:'join',short:'방 참여',title:'우리 지점의 카카오톡방으로',summary:'특가 소식을 만나는 곳'},
  {id:'nickname',short:'닉네임',title:'프로필과 이름을 설정하세요',summary:'주문할 때 알아보기 쉽게'},
  {id:'purchase',short:'구매 방법',title:'공지를 확인하고 주문하세요',summary:'주문부터 매장 픽업까지'},
];
const SCREENS:Screen[][] = [
  [
    {id:'search',label:'검색 화면',lead:'검색창에 지점명이나 동네 이름을 입력하세요.',detail:'예를 들어 ‘마곡’을 검색해 보세요. ‘서울·경기’와 시·구를 선택하면 찾는 지역을 좁힐 수 있어요.',note:'지점이 보이지 않으면 ‘전체 초기화’를 누르고 지점명으로 다시 검색해 주세요.'},
    {id:'results',label:'검색 결과',lead:'검색된 지점의 이름과 주소를 확인하세요.',detail:'‘마곡’ 검색 결과에 나온 마곡 엠밸리점은 설명을 위한 예시예요. 이름이 비슷한 지점이 있을 수 있으니 실제로 이용할 매장이 맞는지 확인해 주세요.',note:'지점을 확인했다면 다음 ‘입장 버튼’ 안내에서 두 버튼의 차이를 살펴보세요.'},
    {id:'entry',label:'입장 버튼',lead:'웹 주문과 카카오톡방 입장 중 원하는 버튼을 선택하세요.',detail:'파란색 ‘웹에서 주문’은 지점의 상품과 웹 주문 페이지로, 노란색 ‘카카오톡방 입장’은 해당 지점의 채팅방 연결 화면으로 이동해요.',note:'다음 안내는 카카오톡방에 참여하는 과정이에요. 실제 이용은 아래 ‘내 지점 찾으러 가기’에서 시작해 주세요.'},
  ],
  [
    {id:'connect',label:'연결 화면',lead:'‘그룹 오픈채팅 참여하기’를 눌러 카카오톡으로 이동하세요.',detail:'선택한 지점의 연결 화면에서 버튼을 눌러 주세요. 기기에 따라 이 화면 없이 카카오톡 앱이 바로 열릴 수도 있어요.',note:'앱이 열렸다면 다음 ‘채팅방 참여’에서 방 이름과 참여 버튼을 확인하세요.'},
    {id:'room',label:'채팅방 참여',lead:'채팅방 이름을 확인한 뒤 ‘오픈채팅 참여하기’를 누르세요.',detail:'방 이름이 이용할 지점과 일치하는지 먼저 살펴보세요. 맞는 지점이라면 노란색 참여 버튼을 눌러 프로필과 닉네임 설정으로 넘어가세요.',note:'화면 배치는 기기와 앱 버전에 따라 다를 수 있어요.'},
  ],
  [
    {id:'profile',label:'프로필 선택',lead:'프로필 설정에서 ‘카카오프렌즈’를 선택하세요.',detail:'아래 원본 화면에서 오른쪽 카카오프렌즈 프로필을 확인해 주세요. 프로필을 선택한 뒤에는 이름 입력란에 사용할 닉네임을 설정해요.',note:'세 항목은 같은 프로필 설정 화면을 순서대로 설명해요.'},
    {id:'name',label:'닉네임 입력',lead:'닉네임 뒤에 본인 전화번호 마지막 4자리를 붙여 주세요.',detail:'예를 들어 닉네임이 ‘만만러버’, 전화번호 끝자리가 ‘0000’이면 ‘만만러버0000’으로 입력해요. 숫자 4자리만 적지 않고 닉네임과 함께 입력해 주세요.',note:'이 안내 페이지에는 개인정보를 입력하지 않아요. 실제 카카오톡 프로필 설정에서 변경해 주세요.'},
    {id:'confirm',label:'입장 확인',lead:'선택한 프로필과 이름을 확인한 뒤 ‘확인’을 누르세요.',detail:'카카오프렌즈 프로필과 ‘닉네임 + 전화번호 뒤 4자리’가 맞는지 확인하면 채팅방 입장을 마칠 수 있어요. 입장 후에는 필독 공지를 먼저 확인해 주세요.',note:'지점 공지에 별도 이름 규칙이 있으면 해당 안내를 따라 주세요.'},
  ],
  [
    {id:'notice',label:'공지 확인',lead:'채팅방에 들어오면 필독 공지부터 읽어 주세요.',detail:'공지에서 주문하는 방법, 상품별 픽업 일정과 이용 지점을 확인하세요. 아래 캡처는 마곡 엠밸리점의 예시이며, 실제 이용 지점의 최신 안내를 기준으로 따라 주세요.'},
    {id:'order',label:'주문하기',lead:'카카오톡 또는 웹에서 지점 안내에 따라 주문하세요.',detail:'사진 속 ‘야채샌드1’처럼 상품명과 수량을 적어요. 실제 주문은 지점 공지에 안내된 방식을 따라 주세요. 웹 주문은 지점 카드의 파란색 ‘웹에서 주문’ 버튼이나 해당 지점 공지의 웹 주문 링크를 이용하세요.',note:'주문 접수 확인이나 변경·취소가 궁금하면 지점 공지를 확인하거나 이용 지점에 문의해 주세요.'},
    {id:'pickup',label:'픽업하기',lead:'상품별로 안내받은 일정에 이용 지점으로 방문하세요.',detail:'주문한 상품의 픽업일과 수령할 매장을 확인한 뒤 방문해 주세요. 결제와 수령 방법은 해당 지점 안내를 따라 주세요.',note:'매장 상시 판매 상품은 사전 주문 없이 구매할 수 있어요. 상품 구성과 재고는 지점별로 확인해 주세요.'},
  ],
];
const LOGO='https://biz.manmanmarket.com/images/logo.svg',FOOTER='https://biz.manmanmarket.com/images/footer-logo.png',KEY='mm-guide:entry:v1';
function route(e:React.MouseEvent<HTMLAnchorElement>,path:string){
  if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  const label=path==='/stores'?'만만마켓 내부 지점 찾기 이동':'만만마켓 내부 홈 이동';
  const link=e.currentTarget.ownerDocument.querySelector<HTMLElement>(`a[aria-label="${label}"]`);
  if(link){e.preventDefault();link.click();}
}
function readHash(){const [id,sub]=window.location.hash.slice(1).split('/');const found=STEPS.findIndex(s=>s.id===id);const step=found<0?0:found;return {step,screen:Math.max(0,SCREENS[step].findIndex(s=>s.id===sub))};}
function Shot({src,alt,compact=false,caption='마곡 엠밸리점 화면 예시'}:{src:string;alt:string;compact?:boolean;caption?:string}){
  const [failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);useEffect(()=>setFailed(false),[src]);
  return <figure className={`mg-shot ${compact?'mg-shot-compact':''}`}>
    {failed?<div className="mg-error"><p>화면 예시를 불러오지 못했어요.</p><p>{alt}</p><button onClick={()=>{setFailed(false);setAttempt(x=>x+1);}}>다시 불러오기</button></div>:<div className="mg-image-frame"><img key={`${src}-${attempt}`} src={src} alt={alt} loading="eager" onError={()=>setFailed(true)}/></div>}
    <figcaption>{caption}</figcaption>
  </figure>;
}

type MobileScreen={title:string;support:string;note:string;crop:[number,number,number,number,number,number];start?:number};
const MOBILE:MobileScreen[][]=[
 [
  {title:'지점명이나 동네를\n검색해 주세요.',support:'예: 마곡 · 지역 필터로 좁힐 수 있어요.',note:'안 보이면 전체 초기화 후 다시 검색해요.',crop:[540,663,0,0,540,663],start:0},
  {title:'지점 이름과 주소를\n확인해 주세요.',support:'내가 이용할 매장이 맞는지 살펴보세요.',note:'마곡 엠밸리점은 설명을 위한 예시예요.',crop:[390,800,0,0,390,800],start:420},
  {title:'원하는 입장 버튼을\n선택해 주세요.',support:'파랑은 웹 주문, 노랑은 카카오톡방이에요.',note:'다음부터는 카카오톡방 참여 안내예요.',crop:[366,204,0,0,366,204]},
 ],[
  {title:'카카오톡 연결 버튼을\n눌러 주세요.',support:'그룹 오픈채팅 참여하기를 선택해요.',note:'앱이 바로 열리면 다음 안내로 넘어가요.',crop:[1712,1654,0,0,1712,1654]},
  {title:'방 이름을 확인하고\n참여해 주세요.',support:'노란색 오픈채팅 참여하기를 누르세요.',note:'선택한 지점의 채팅방인지 확인해요.',crop:[680,1276,0,0,680,1276],start:695},
 ],[
  {title:'카카오프렌즈 프로필을\n선택해 주세요.',support:'화면 오른쪽 프로필을 선택해요.',note:'기기에 따라 화면 배치는 다를 수 있어요.',crop:[598,718,0,0,598,718]},
  {title:'닉네임에 전화번호\n끝 4자리를 붙여요.',support:'예: 만만러버0000',note:'숫자만 쓰지 않고 닉네임도 함께 적어요.',crop:[598,718,0,0,598,718],start:200},
  {title:'프로필과 이름 확인 후\n입장해 주세요.',support:'노란색 확인 버튼을 누르면 입장해요.',note:'입장 후에는 지점 공지를 확인해요.',crop:[598,718,0,0,598,718],start:230},
 ],[
  {title:'필독 공지를\n먼저 읽어 주세요.',support:'주문 방법과 픽업 일정을 확인해요.',note:'이용 지점의 최신 공지를 따라 주세요.',crop:[678,1124,0,0,678,1124]},
  {title:'상품명과 수량을\n적어 주세요.',support:'예: 야채샌드1',note:'지점 공지의 주문 방식을 따라 주세요.',crop:[922,1060,0,0,480,1060],start:650},
  {title:'안내받은 픽업일에\n매장으로 방문하세요.',support:'상품별 날짜와 수령 지점을 확인해요.',note:'결제·수령 방법은 지점 안내를 따라요.',crop:[1024,768,0,0,1024,768]},
 ],
];
function FocusedShot({src,alt,crop,start=0}:{src:string;alt:string;crop:MobileScreen['crop'];start?:number}){
 const frame=useRef<HTMLDivElement>(null),scroll=useRef<HTMLDivElement>(null),[size,setSize]=useState({w:350,h:310}),[failed,setFailed]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{setFailed(false);},[src]);
 useEffect(()=>{const node=frame.current?.parentElement;if(!node)return;const ro=new ResizeObserver(([entry])=>setSize({w:entry.contentRect.width,h:entry.contentRect.height}));ro.observe(node);return()=>ro.disconnect();},[]);
 const [iw,ih,x,y,w,h]=crop,scale=Math.max(.01,(size.w-2)/w),contentHeight=h*scale,visibleHeight=Math.min(size.h,contentHeight+2),canScroll=contentHeight>visibleHeight-2;
 useEffect(()=>{if(scroll.current)scroll.current.scrollTop=Math.max(0,start*scale);},[src,start,scale,visibleHeight]);
 return <div ref={frame} className="mg-focused-photo" style={{height:visibleHeight}}>
 {failed?<button className="mg-photo-error" onClick={()=>{setFailed(false);setAttempt(a=>a+1);}}>사진을 불러오지 못했어요.<br/>눌러서 다시 불러오기</button>:<div ref={scroll} className="mg-photo-scroll" role="region" aria-label={`${alt} 전체 사진${canScroll?' — 위아래로 이동해서 볼 수 있어요':''}`} tabIndex={canScroll?0:undefined}><div className="mg-photo-crop" style={{width:w*scale,height:contentHeight}}><img key={attempt} src={src} alt={alt} draggable={false} onError={()=>setFailed(true)} style={{width:iw*scale,height:ih*scale,left:-x*scale,top:-y*scale}}/></div></div>}
 </div>;
}

export default function Layer(){
  const root=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null);
  const [position,setPosition]=useState({step:0,screen:0}),[mobile,setMobile]=useState(false),[fromStores,setFromStores]=useState(false),[dockHost,setDockHost]=useState<HTMLElement|null>(null);
  const touch=useRef<{x:number;y:number}|null>(null);
  const [completed,setCompleted]=useState(false),[sheet,setSheet]=useState<'menu'|'details'|null>(null);
  const sheetRef=useRef<HTMLDialogElement>(null),sheetReturn=useRef<HTMLElement|null>(null),completeHeading=useRef<HTMLHeadingElement>(null);
  const {step,screen}=position;
  const lastMotion=useRef<{index:number;step:number;src:string}|null>(null);
  useEffect(()=>{
    let pending:any=null;try{pending=JSON.parse(sessionStorage.getItem(KEY)||'null');sessionStorage.removeItem(KEY);}catch{}
    let initial=readHash();
    if(pending&&Date.now()-pending.at<120000){const i=STEPS.findIndex(s=>s.id===pending.step);if(i>=0){initial={step:i,screen:0};try{history.replaceState(null,'',`#${STEPS[i].id}`);}catch{}}}
    setCompleted(window.location.hash==='#complete');setPosition(initial);setFromStores(pending?.from==='stores');setDockHost(root.current?.ownerDocument.body||null);
    const sync=()=>{setPosition(readHash());setCompleted(window.location.hash==='#complete');};window.addEventListener('hashchange',sync);window.addEventListener('popstate',sync);
    const ro=new ResizeObserver(es=>setMobile(es[0].contentRect.width<760));if(root.current)ro.observe(root.current);
    return()=>{ro.disconnect();window.removeEventListener('hashchange',sync);window.removeEventListener('popstate',sync);};
  },[]);
  const navigate=(nextStep:number,nextScreen=0,focusTarget:'heading'|'next'|'prev'='heading')=>{
    if(!SCREENS[nextStep]?.[nextScreen])return;
    setCompleted(false);setPosition({step:nextStep,screen:nextScreen});
    try{history.pushState(null,'',`#${STEPS[nextStep].id}${nextScreen?'/'+SCREENS[nextStep][nextScreen].id:''}`);}catch{}
    requestAnimationFrame(()=>{const anchor=mobile?root.current:root.current?.querySelector<HTMLElement>('.mg-layout');const bounds=anchor?.getBoundingClientRect();if(mobile||(bounds&&(bounds.top<0||bounds.top>160)))anchor?.scrollIntoView({block:'start',behavior:mobile||root.current?.ownerDocument.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});if(focusTarget==='heading'){heading.current?.focus({preventScroll:true});}else{const doc=root.current?.ownerDocument;let target=doc?.querySelector<HTMLElement>(focusTarget==='next'?'.mg-dock-next':'.mg-dock-prev');if(target?.hasAttribute('disabled'))target=doc?.querySelector<HTMLElement>('.mg-dock-next');target?.focus({preventScroll:true});}});
  };
  const previous=screen>0?{step,screen:screen-1}:step>0?{step:step-1,screen:SCREENS[step-1].length-1}:null;
  const next=screen<SCREENS[step].length-1?{step,screen:screen+1}:step<3?{step:step+1,screen:0}:null;
  const nextLabel=next?(next.step===step?SCREENS[next.step][next.screen].label:STEPS[next.step].short):'';
  const current=STEPS[step],explanation=SCREENS[step][screen],mobileCopy=MOBILE[step][screen];
  const globalIndex=SCREENS.slice(0,step).reduce((sum,items)=>sum+items.length,0)+screen;
  const openSheet=(kind:'menu'|'details',el:HTMLElement)=>{sheetReturn.current=el;setSheet(kind);};
  const closeSheet=(restore=true)=>{sheetRef.current?.close();setSheet(null);if(restore)requestAnimationFrame(()=>sheetReturn.current?.focus({preventScroll:true}));};
  useEffect(()=>{if(sheet&&!sheetRef.current?.open)sheetRef.current?.showModal();},[sheet]);
  const finishGuide=()=>{setCompleted(true);try{history.pushState(null,'','#complete');}catch{}requestAnimationFrame(()=>{root.current?.scrollIntoView({block:'start',behavior:'auto'});completeHeading.current?.focus({preventScroll:true});});};
  const images=mobile?[mobileSearchStart,mobileSearch,mobileCard]:[desktopFirst,desktopSearch,desktopCard];
  const src=step===0?images[screen]:step===1?(screen===0?launch:room):step===2?nickname:screen===0?notice:screen===1?customerOrders:pickupStore;
  const alt=step===0?`${explanation.label}: 만만마켓 지점 찾기`:step===1?(screen===0?'브라우저에서 그룹 오픈채팅 참여하기':'지점명 확인 후 오픈채팅 참여하기'):step===2?'카카오프렌즈 프로필 선택과 닉네임 설정':screen===0?'필독 공지: 웹 주문, 채팅 주문, 픽업 안내':screen===1?'고객들이 카카오톡 채팅방에 상품명과 수량을 적어 주문하는 실제 대화':'냉장 진열장과 키오스크가 보이는 만만마켓 매장 내부';
  useEffect(()=>{
    const index=SCREENS.slice(0,step).reduce((sum,items)=>sum+items.length,0)+screen;
    const previous=lastMotion.current;
    lastMotion.current={index,step,src};
    const host=root.current,view=host?.ownerDocument.defaultView;
    if(!host||!view||!previous||previous.index===index)return;
    const preference=view.matchMedia('(prefers-reduced-motion: reduce)');
    if(preference.matches)return;
    const direction=index>previous.index?1:-1;
    const animations:Animation[]=[];
    const enter=(element:Element|null,distance:number,duration:number)=>{
      if(!element||typeof element.animate!=='function')return;
      animations.push(element.animate([
        {opacity:.35,transform:`translate3d(${distance*direction}px,0,0)`},
        {opacity:1,transform:'translate3d(0,0,0)'}
      ],{duration,easing:'cubic-bezier(.22,1,.36,1)'}));
    };
    // Keep controls mounted and responsive; only the latest screen is animated.
    enter(host.querySelector(mobile?'.mg-mobile-copy':'.mg-explanation'),8,260);
    if(previous.src!==src||mobile)enter(host.querySelector('.mg-image-stage'),12,320);
    if(previous.step!==step)enter(heading.current,6,240);
    const stop=()=>animations.forEach(animation=>animation.cancel());
    const onPreferenceChange=()=>{if(preference.matches)stop();};
    preference.addEventListener('change',onPreferenceChange);
    return()=>{stop();preference.removeEventListener('change',onPreferenceChange);};
  },[step,screen,src]);
  return <div ref={root} className={`mg-root ${mobile?'mg-is-mobile':''}`}><style>{CSS}</style>
    <a className="mg-skip" href="#mg-guide" onClick={e=>{e.preventDefault();(completed?completeHeading.current:heading.current)?.focus();}}>이용 안내로 바로 가기</a>
    <header className="mg-header"><div className="mg-shell mg-header-row"><a href="/" onClick={e=>route(e,'/')} aria-label="만만마켓 홈페이지"><img src={LOGO} alt="만만마켓"/></a>{mobile?<button className="mg-all-steps" onClick={e=>openSheet('menu',e.currentTarget)} aria-haspopup="dialog">전체 단계 <span aria-hidden="true">☰</span></button>:<><span className="mg-header-label">이용 방법</span><a className="mg-header-store" href="/stores" onClick={e=>route(e,'/stores')}>지점 찾기 <span aria-hidden="true">↗</span></a></>}</div></header>
    <main>
      <h1 className="mg-page-label">만만마켓 이용 방법</h1>
      {mobile?(completed?<section className="mg-mobile-complete"><span className="mg-complete-check" aria-hidden="true">✓</span><p className="mg-eyebrow">이용 안내 완료</p><h2 ref={completeHeading} tabIndex={-1}>이제 내 지점에서<br/>시작해 보세요.</h2><p>가까운 만만마켓을 찾고<br/>특가 소식과 필요한 상품을 만나세요.</p><a className="mg-primary" href="/stores" onClick={e=>route(e,'/stores')}>가까운 지점 찾고 시작하기 →</a><button className="mg-restart" onClick={()=>navigate(0)}>처음부터 다시 보기</button></section>:<section className="mg-mobile-view" id="mg-guide" aria-labelledby="mg-step-title">
        <div className="mg-mobile-progress"><div><strong>{step+1}. {current.short}</strong><span>{globalIndex+1} / 11</span></div><div className="mg-progress-track" role="progressbar" aria-label="이용 안내 진행" aria-valuemin={1} aria-valuemax={11} aria-valuenow={globalIndex+1}><span style={{width:`${(globalIndex+1)/11*100}%`}}/></div></div>
        <div className="mg-mobile-copy" aria-live="polite" aria-atomic="true"><h2 ref={heading} tabIndex={-1} id="mg-step-title">{mobileCopy.title}</h2>{((step===2||step===3)&&screen===1)&&<p>{mobileCopy.support}</p>}</div>
        <div className={`mg-image-stage mg-mobile-stage ${step===3&&screen===1?'mg-order-photo':''}`} onTouchStart={e=>touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}} onTouchEnd={e=>{if(!touch.current)return;const dx=e.changedTouches[0].clientX-touch.current.x,dy=e.changedTouches[0].clientY-touch.current.y;touch.current=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){const target=dx<0?next:previous;if(target){e.preventDefault();navigate(target.step,target.screen);}}}}><FocusedShot src={src} alt={alt} crop={mobileCopy.crop} start={mobileCopy.start}/></div>
        <button className="mg-more" onClick={e=>openSheet('details',e.currentTarget)} aria-haspopup="dialog">자세한 설명 보기 <span aria-hidden="true">＋</span></button>
      </section>):<>
      <div className="mg-shell mg-layout" id="mg-guide">
        <div className="mg-topnav"><nav aria-label="이용 안내 단계" className="mg-steps">{STEPS.map((s,i)=><button key={s.id} aria-current={step===i?'step':undefined} onClick={()=>navigate(i)} className={step===i?'is-active':''}><span className="mg-number">0{i+1}</span><span><strong>{s.short}</strong><small>{s.summary}</small></span><span className="mg-step-arrow" aria-hidden="true">→</span></button>)}</nav></div>
        <section className="mg-panel" aria-labelledby="mg-step-title">
          <div className="mg-workspace">
          <div className="mg-instruction">
          <div className="mg-panel-top"><span>STEP 0{step+1}</span><span>{step+1} / 4</span></div>
          <h2 ref={heading} tabIndex={-1} id="mg-step-title">{current.title}</h2>
          <div className="mg-screen-tabs" style={{'--screen-count':SCREENS[step].length,'--screen-index':screen} as React.CSSProperties} aria-label={`${current.short} 상세 안내`}>{SCREENS[step].map((s,i)=><button key={s.id} aria-pressed={screen===i} onClick={()=>navigate(step,i)}>{s.label}</button>)}</div>
          <div className="mg-explanation" aria-live="polite" aria-atomic="true"><span className="mg-explanation-label">{explanation.label} · {screen+1}/{SCREENS[step].length}</span><strong>{explanation.lead}</strong><p>{explanation.detail}</p>{explanation.note&&<p className="mg-explanation-note">{explanation.note}</p>}</div>
          {step===0&&screen===2&&<a className="mg-text-link mg-real-start" href="/stores" onClick={e=>route(e,'/stores')}>내 지점 찾으러 가기 →</a>}
          </div>
          <div className="mg-visual">
          <div className="mg-image-stage" onTouchStart={e=>touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}} onTouchEnd={e=>{if(!touch.current)return;const dx=e.changedTouches[0].clientX-touch.current.x,dy=e.changedTouches[0].clientY-touch.current.y;touch.current=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){const target=dx<0?next:previous;if(target){e.preventDefault();navigate(target.step,target.screen);}}}}>
            <Shot src={src} alt={alt} compact={step===0&&screen===2} caption={step===2?'마곡 엠밸리점 예시 · 같은 설정 화면의 순서별 안내':step===3?(screen===0?'마곡 엠밸리점 필독 공지 예시':screen===1?'실제 고객 카카오톡 주문 대화 예시':'만만마켓 매장 내부 예시 · 매장 모습은 지점마다 달라요'):'마곡 엠밸리점 화면 예시'}/>
          </div>
          </div>
          </div>
          {step===1&&<div className="mg-help-content"><p className="mg-note">화면은 예시이며, 기기와 앱 버전에 따라 배치가 다를 수 있어요.</p><details className="mg-details"><summary>웹 주문 페이지에서 카카오톡방 찾기 <span>＋</span></summary><p>웹 주문 페이지 왼쪽 위 메뉴를 열고 ‘카카오톡 오픈채팅방’을 선택하세요. 지점 찾기의 노란색 입장 버튼을 눌렀다면 이 과정은 필요하지 않아요.</p><div className="mg-alternative"><Shot src={menu} alt="웹 주문 페이지 왼쪽 위 메뉴 열기"/><Shot src={openchat} alt="메뉴의 카카오톡 오픈채팅방 선택"/></div></details><details className="mg-details"><summary>PC에서 카카오톡이 열리지 않나요? <span>＋</span></summary><p>연결 화면의 ‘모바일 카카오톡으로 링크받기’나 QR 코드 안내를 확인하세요. PC에서 계속 이용하려면 카카오톡 PC버전 설치 상태를 확인해 주세요. 캡처 속 QR과 링크는 예시 지점용이에요.</p></details></div>}
          {step===2&&screen===1&&<div className="mg-nickname-example"><span>닉네임 예시</span><strong>만만러버<span>0000</span></strong><small>닉네임 + 전화번호 마지막 4자리</small></div>}
        </section>
      </div>
      <section className="mg-shell mg-finish"><div><p className="mg-eyebrow">우리 동네에서 시작하기</p><h2>이제 내 지점에서<br className="mg-mobile-br"/> 시작해 보세요.</h2><p>특가 소식을 만나고, 필요한 상품을 주문하세요.</p></div><div className="mg-finish-actions"><a className="mg-primary" href="/stores" onClick={e=>route(e,'/stores')}>가까운 지점 찾고 시작하기 →</a>{fromStores&&<a className="mg-text-link" href="/stores" onClick={e=>route(e,'/stores')}>지점 목록으로 돌아가기</a>}</div></section>
      </>}
    </main>
    {(!mobile||completed)&&<footer className="mg-footer"><div className="mg-shell"><a href="/" onClick={e=>route(e,'/')}><img src={FOOTER} alt="만만마켓"/></a><p>주식회사 셀렉티카 <span>|</span> 대표이사: 김정대 <span>|</span> 사업자등록번호: 366-88-03550</p><p>주소: 경기도 과천시 과천대로7길 33, 디테크타워 과천 A동 407호</p><div className="mg-contacts"><a href="tel:02-6242-0229">TEL: 02-6242-0229</a><a href="mailto:selectika@selectika.kr">E-mail: selectika@selectika.kr</a></div><p className="mg-copyright">Copyright ⓒ 2025 SELECTIKA. All rights reserved.</p></div></footer>}
    {dockHost&&(!mobile||!completed)&&createPortal(<nav className={`mg-dock ${mobile?'mg-dock-mobile':''}`} aria-label="안내 화면 이동"><div className="mg-dock-info"><strong>{step+1}. {current.short}</strong><span>{explanation.label} · {screen+1}/{SCREENS[step].length}</span></div><button className="mg-dock-prev" disabled={!previous} aria-label={previous?`이전: ${STEPS[previous.step].short} ${SCREENS[previous.step][previous.screen].label}`:'이전 화면 없음'} onClick={()=>previous&&navigate(previous.step,previous.screen,'prev')}>← 이전</button>{next?<button className="mg-dock-next" onClick={()=>navigate(next.step,next.screen,'next')}>다음: {nextLabel} →</button>:mobile?<button className="mg-dock-next" onClick={finishGuide}>이용 안내 마치기 →</button>:<a className="mg-dock-next" href="/stores" onClick={e=>route(e,'/stores')}>내 지점 찾고 시작하기 →</a>}</nav>,dockHost)}
    <dialog ref={sheetRef} className="mg-sheet" aria-labelledby="mg-sheet-title" onCancel={e=>{e.preventDefault();closeSheet();}} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeSheet();}}}>
      <div className="mg-sheet-bar"><h2 id="mg-sheet-title">{sheet==='menu'?'전체 단계':explanation.label}</h2><button autoFocus onClick={()=>closeSheet()} aria-label="설명 창 닫기">닫기 ×</button></div>
      <div className="mg-sheet-body">{sheet==='menu'?<><p className="mg-sheet-intro">필요한 안내부터 바로 볼 수 있어요.</p><nav aria-label="전체 이용 안내">{STEPS.map((item,i)=><section className="mg-menu-group" key={item.id}><h3>{i+1}. {item.short}</h3>{SCREENS[i].map((sub,j)=><button key={sub.id} aria-current={!completed&&i===step&&j===screen?'step':undefined} onClick={()=>{closeSheet(false);navigate(i,j);}}>{sub.label}<span aria-hidden="true">{!completed&&i===step&&j===screen?'✓':'→'}</span></button>)}</section>)}</nav><a className="mg-primary" href="/stores" onClick={e=>route(e,'/stores')}>내 지점 찾으러 가기 →</a><button className="mg-business" onClick={()=>{closeSheet(false);finishGuide();}}>이용 안내 마무리 · 사업자 정보</button></>:<><strong className="mg-sheet-lead">{explanation.lead}</strong><p>{explanation.detail}</p>{explanation.note&&<p className="mg-sheet-note">{explanation.note}</p>}<p className="mg-sheet-caption">{step===3&&screen===2?'만만마켓 매장 내부 예시 · 매장 모습은 지점마다 달라요.':step===3&&screen===1?'실제 고객의 카카오톡 주문 대화 예시입니다.':step===2?'같은 프로필 설정 화면을 순서대로 안내합니다.':step===0&&screen===0?'만만마켓 지점 찾기 화면 예시입니다.':'마곡 엠밸리점 화면을 예시로 안내합니다.'}</p>{step===0&&screen===2&&<a className="mg-primary" href="/stores" onClick={e=>route(e,'/stores')}>내 지점 찾으러 가기 →</a>}{step===1&&<details className="mg-details"><summary>웹 주문 페이지에서 방 찾기 <span>＋</span></summary><p>왼쪽 위 메뉴를 열고 ‘카카오톡 오픈채팅방’을 선택하세요. 지점 찾기의 노란색 입장 버튼을 눌렀다면 이 과정은 필요하지 않아요.</p><Shot src={menu} alt="웹 주문 페이지 왼쪽 위 메뉴 열기"/><Shot src={openchat} alt="메뉴의 카카오톡 오픈채팅방 선택"/></details>}</>}</div>
    </dialog>
  </div>;
}

const CSS=`
@import url('https://cdn.jsdelivr.net/gh/fonts-archive/Paperlogy/Paperlogy.css');
div:has(>.mg-root),div:has(>div>.mg-root),div:has(>div>div>.mg-root){width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;padding:0!important}
a[aria-label="만만마켓 내부 지점 찾기 이동"],a[aria-label="만만마켓 내부 홈 이동"]{display:none!important}
.mg-root{container:mg/inline-size;width:100%;height:auto;min-width:0;background:#F7F9FD;color:#15243E;font:16px/1.75 'Paperlogy','Noto Sans KR',sans-serif;-webkit-font-smoothing:antialiased;text-align:left}.mg-root *{box-sizing:border-box}.mg-root :is(h1,h2,h3,p,figure){margin:0}.mg-root img{display:block;max-width:100%}.mg-root button,.mg-root a{font:inherit}.mg-root button{cursor:pointer}.mg-root a{color:inherit;text-decoration:none}.mg-root button:disabled{opacity:.35;cursor:default}.mg-root :focus-visible{outline:3px solid #B87712;outline-offset:4px}.mg-root :is(h1,h2,h3){word-break:keep-all;line-height:1.4;letter-spacing:-.8px;font-weight:700}.mg-shell{max-width:1200px;width:calc(100% - 80px);margin:0 auto}.mg-header{background:#fff;border-bottom:1px solid #E4EAF3}.mg-header-row{display:flex;align-items:center;gap:24px;min-height:76px}.mg-header img{width:158px}.mg-header-label{font-size:14px;color:#55647C;border-left:1px solid #DCE4F0;padding-left:24px}.mg-header-store{margin-left:auto;display:flex;align-items:center;gap:14px;min-height:44px;font-size:14px!important;font-weight:600}.mg-eyebrow{font-size:12px;font-weight:700;color:#2858D9;letter-spacing:.4px}.mg-intro{padding-top:44px;padding-bottom:36px}.mg-intro h1{font-size:40px;margin-top:9px}.mg-intro>p:last-child{color:#62718A;margin-top:12px;font-size:17px}.mg-mobile-br{display:none}.mg-layout{display:grid;grid-template-columns:226px minmax(0,1fr);gap:28px;align-items:start;padding-bottom:42px}.mg-steps{display:grid;gap:8px}.mg-steps button{min-height:87px;display:flex;align-items:center;gap:12px;border:1px solid transparent;background:transparent;padding:16px 13px;border-radius:14px;text-align:left;color:#607088;width:100%}.mg-steps button.is-active{color:#244FC8;background:#EAF0FF;border-color:#CAD8FB}.mg-number{font-size:12px;font-weight:700;border:1px solid #DCE4F0;border-radius:10px;width:32px;height:32px;flex-shrink:0;display:grid;place-items:center;background:#fff}.is-active .mg-number{background:#2858D9;border-color:#2858D9;color:white}.mg-steps strong{display:block;font-size:16px}.mg-steps small{display:block;font-size:11px;margin-top:3px}.mg-step-arrow{margin-left:auto}.mg-side-note{border-top:1px solid #DFE7F3;margin-top:24px;padding:23px 10px;color:#6D7B90;font-size:12px}.mg-side-note strong{color:#4E607B}.mg-side-note p{margin-top:6px}.mg-panel{background:white;border:1px solid #DFE7F3;border-radius:22px;padding:32px;box-shadow:0 8px 25px #18345E04;min-width:0}.mg-panel-top{display:flex;justify-content:space-between;color:#2D5CDC;font-size:11px;font-weight:700;letter-spacing:1px}.mg-panel-top>span:last-child{color:#8390A4}.mg-panel h2{font-size:28px;margin-top:9px;scroll-margin-top:25px}.mg-panel h2:focus{outline:none}.mg-desc{margin-top:12px!important;color:#5C6D84;font-size:16px;word-break:keep-all}.mg-progress{display:flex;gap:5px;margin:24px 0}.mg-progress i{height:3px;flex:1;border-radius:8px;background:#E8EDF5}.mg-progress .done{background:#3C6FF6}.mg-screen-tabs{display:flex;border-radius:10px;padding:4px;background:#F1F4FA;gap:4px;margin-bottom:18px}.mg-screen-tabs button{flex:1;border:0;min-height:44px;background:transparent;font-size:13px;color:#62718A;padding:8px;border-radius:7px}.mg-screen-tabs button[aria-pressed=true]{background:#fff;color:#224FC6;box-shadow:0 2px 6px #172F5810;font-weight:600}.mg-shot{min-width:0}.mg-image-frame{display:block;position:relative;border:1px solid #DDE5F2;background:#F5F7FB;width:100%;padding:20px;border-radius:14px;overflow:hidden}.mg-image-frame img{width:auto;max-width:100%;max-height:540px;object-fit:contain;margin:auto;box-shadow:0 4px 16px #17325609}.mg-shot-compact .mg-image-frame{padding:30px 20px}.mg-shot figcaption{font-size:11px;color:#71829A;margin-top:8px;text-align:right}.mg-sub-controls{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;color:#728199;margin:8px 0 17px}.mg-sub-controls button{background:none;border:0;min-height:44px;font-size:12px;color:#426087;padding:4px}.mg-options{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:20px 0 10px}.mg-options>div{padding:17px;border:1px solid #E4EAF4;border-radius:12px}.mg-tag{display:inline-flex;padding:3px 9px;border-radius:5px;font-size:11px;font-weight:700}.mg-blue{color:#2858D9;background:#ECF1FF}.mg-yellow{color:#463C02;background:#FFF4A8}.mg-options p,.mg-purchase-methods p{font-size:14px;color:#5C6D84;margin-top:9px;word-break:keep-all}.mg-text-link{display:inline-flex;align-items:center;min-height:44px;font-size:14px!important;font-weight:600;color:#2858D9!important}.mg-step-controls{display:flex;justify-content:space-between;gap:14px;margin-top:30px;padding-top:23px;border-top:1px solid #E6ECF5}.mg-step-controls>button:not(.mg-primary){background:none;border:0;color:#64768F;font-size:13px;padding:8px;min-height:48px}.mg-primary{display:inline-flex;align-items:center;justify-content:center;gap:15px;padding:13px 20px;min-height:50px;border:0;border-radius:10px;background:#2858D9;color:white!important;font-size:14px!important;font-weight:600!important;text-align:center;line-height:1.5}.mg-primary:hover{background:#224ABD}.mg-note{color:#6B7B92;font-size:13px;margin:17px 0!important;word-break:keep-all}.mg-callout{background:#EFF4FF;border-radius:10px;padding:15px 17px;color:#3A5887;font-size:14px;word-break:keep-all;margin-top:18px!important}.mg-details{border-top:1px solid #E0E7F1;margin-top:14px}.mg-details summary{display:flex;justify-content:space-between;align-items:center;gap:12px;list-style:none;cursor:pointer;padding:19px 0;min-height:54px;font-size:14px;font-weight:600}.mg-details summary::-webkit-details-marker{display:none}.mg-details>p{font-size:14px;color:#62718A;margin-bottom:18px;word-break:keep-all}.mg-details[open] summary>span{transform:rotate(45deg)}.mg-alternative{display:grid;grid-template-columns:1fr 1fr;gap:16px}.mg-alternative .mg-image-frame{padding:10px}.mg-nickname-example{padding:20px 22px;border:1px solid #D9E4FC;border-radius:13px;background:#F5F8FF;margin-bottom:20px}.mg-nickname-example>span,.mg-nickname-example small{display:block;font-size:12px;color:#677C9C}.mg-nickname-example strong{display:block;font-size:28px;letter-spacing:-1px;margin:3px 0}.mg-nickname-example strong>span{color:#2B61E8;margin-left:3px}.mg-action-list{padding-left:24px;margin:22px 0;font-size:16px;color:#425673;display:grid;gap:10px}.mg-action-list li::marker{color:#2858D9;font-weight:700}.mg-purchase-methods{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:23px}.mg-purchase-methods>div{border:1px solid #E0E7F3;border-radius:12px;padding:18px}.mg-purchase-methods h3{font-size:18px;margin-top:13px}.mg-pickup{margin:26px 0 15px}.mg-pickup h3{font-size:20px;margin-top:8px}.mg-pickup p{font-size:15px;margin-top:10px;color:#5C6D84;word-break:keep-all}.mg-finish{display:flex;align-items:center;justify-content:space-between;gap:25px;background:#EBF1FF;border:1px solid #DFE8FC;border-radius:18px;padding:30px 36px;margin-bottom:48px}.mg-finish h2{font-size:25px;margin:6px 0 10px}.mg-finish p:last-child{font-size:14px;color:#64738B}.mg-finish-actions{display:grid;gap:5px;text-align:center}.mg-finish-actions .mg-text-link{justify-content:center}.mg-footer{background:#07112A;color:#C0CBE0;padding:34px 0 28px}.mg-footer img{width:150px;margin-bottom:22px}.mg-footer p{font-size:12px;line-height:1.9;word-break:keep-all}.mg-footer p>span{padding:0 7px;color:#667895}.mg-contacts{display:flex;gap:24px;font-size:12px}.mg-contacts a{display:flex;align-items:center;min-height:44px}.mg-copyright{border-top:1px solid #24314B;padding-top:18px;margin-top:15px!important;font-size:11px!important}.mg-skip{position:absolute;left:15px;top:5px;transform:translateY(-180%);background:white;padding:12px;z-index:30}.mg-skip:focus{transform:none}.mg-error{padding:30px;background:#F5F7FB;border-radius:12px;color:#536782;text-align:center;font-size:14px}.mg-error button{margin-top:15px;min-height:44px;border:1px solid #BED0EC;background:#fff;padding:10px 20px;border-radius:8px;color:#2858D9}
@container mg (max-width:1000px){.mg-shell{width:calc(100% - 48px)}.mg-layout{grid-template-columns:185px minmax(0,1fr);gap:20px}.mg-panel{padding:25px}.mg-steps small{display:none}.mg-steps button{min-height:72px}.mg-side-note{padding-inline:0}.mg-finish{padding:28px}.mg-intro h1{font-size:34px}.mg-purchase-methods{grid-template-columns:1fr}}
@container mg (max-width:759px){.mg-shell{width:calc(100% - 40px)}.mg-header-row{min-height:60px;gap:12px}.mg-header img{width:115px}.mg-header-label{padding-left:12px;font-size:12px}.mg-header-store{font-size:12px!important;gap:7px}.mg-intro{padding:27px 0 24px}.mg-eyebrow{font-size:11px}.mg-intro h1{font-size:29px;letter-spacing:-1px;margin-top:8px}.mg-intro>p:last-child{font-size:16px;margin-top:11px}.mg-mobile-br{display:block}.mg-layout{display:block;padding-bottom:28px}.mg-steps{grid-template-columns:1fr 1fr;gap:8px;margin-bottom:18px}.mg-steps button{min-height:56px;padding:10px 12px;gap:10px;background:white;border-color:#E0E7F3;border-radius:10px}.mg-number{width:26px;height:26px;border-radius:7px;font-size:10px}.mg-steps strong{font-size:14px}.mg-step-arrow{font-size:13px}.mg-side-note{display:none}.mg-panel{border-radius:16px;padding:21px 17px}.mg-panel h2{font-size:23px;margin-top:9px}.mg-desc{font-size:16px;line-height:1.8}.mg-progress{margin:20px 0}.mg-screen-tabs{gap:2px;padding:3px;margin-bottom:14px}.mg-screen-tabs button{font-size:12px;padding:7px 3px;min-height:44px}.mg-image-frame{padding:10px;background:#F3F6FB;border-radius:10px}.mg-image-frame img{max-height:440px}.mg-shot-compact .mg-image-frame{padding:18px 8px}.mg-shot figcaption{font-size:11px}.mg-options{grid-template-columns:1fr;gap:10px;padding-top:8px}.mg-options>div{padding:14px}.mg-options p{font-size:16px}.mg-options p br{display:none}.mg-tag{font-size:12px}.mg-text-link{font-size:14px!important}.mg-sub-controls{font-size:12px}.mg-sub-controls button{font-size:12px}.mg-step-controls{gap:8px;margin-top:22px;padding-top:18px;align-items:center}.mg-step-controls>button:not(.mg-primary){font-size:12px;padding:4px}.mg-step-controls .mg-primary{padding:12px 13px;font-size:13px!important}.mg-callout,.mg-details>p{font-size:16px}.mg-note{font-size:13px;line-height:1.85}.mg-details summary{font-size:14px}.mg-alternative{grid-template-columns:1fr}.mg-nickname-example{padding:16px}.mg-nickname-example strong{font-size:27px}.mg-purchase-methods{gap:12px}.mg-purchase-methods p{font-size:16px}.mg-purchase-methods h3{font-size:18px}.mg-pickup h3{font-size:20px}.mg-pickup p{font-size:16px}.mg-finish{display:block;padding:24px 20px;margin-bottom:30px}.mg-finish h2{font-size:23px}.mg-finish p:last-child{font-size:16px}.mg-finish-actions{margin-top:20px}.mg-finish .mg-primary{width:100%;font-size:14px!important}.mg-footer{padding:28px 0 calc(26px + env(safe-area-inset-bottom,0px))}.mg-footer img{width:132px}.mg-footer p{font-size:12px}.mg-contacts{display:block;font-size:12px}.mg-footer p>span{padding:0 3px}.mg-copyright{font-size:11px!important}}
@media(prefers-reduced-motion:reduce){.mg-root *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}

.mg-root{padding-bottom:108px}.mg-panel h2{scroll-margin-top:20px}.mg-explanation{margin-top:20px;padding:18px 20px;background:#F5F8FF;border:1px solid #E0E8F8;border-radius:12px;word-break:keep-all}.mg-explanation-label{display:block;font-size:12px;font-weight:700;color:#2858D9;margin-bottom:7px}.mg-explanation>strong{display:block;font-size:18px;line-height:1.6;color:#263D61}.mg-explanation>p{font-size:16px;color:#536782;margin-top:8px;line-height:1.8}.mg-explanation .mg-explanation-note{font-size:14px;color:#677C99;margin-top:10px}.mg-progress{margin:22px 0 18px}.mg-screen-tabs{margin-bottom:18px}.mg-real-start{margin-top:15px}.mg-nickname-example{margin-top:20px;margin-bottom:0}.mg-dock{position:fixed;z-index:50;left:50%;bottom:16px;transform:translateX(-50%);display:grid;grid-template-columns:132px 1fr minmax(220px,auto);align-items:center;gap:20px;box-sizing:border-box;width:min(1200px,calc(100% - 48px));padding:14px 18px;background:#FFFFFFFA;border:1px solid #DAE3F2;border-radius:16px;box-shadow:0 8px 40px #1B365F24;font-family:'Paperlogy','Noto Sans KR',sans-serif;line-height:1.5;color:#193253}.mg-dock *{box-sizing:border-box}.mg-dock-info{grid-column:2;grid-row:1;display:flex;align-items:center;justify-content:center;gap:16px;font-size:13px}.mg-dock-info strong{font-size:14px;font-weight:700}.mg-dock-info span{color:#677D9C}.mg-dock button,.mg-dock a{font:inherit;text-decoration:none;cursor:pointer;display:flex;align-items:center;justify-content:center;min-height:48px;padding:12px 18px;border-radius:10px;font-size:14px;font-weight:600;white-space:normal;text-align:center}.mg-dock-prev{grid-column:1;grid-row:1;border:1px solid #D5E0F0;color:#4A6181;background:white}.mg-dock-next{grid-column:3;grid-row:1;background:#2858D9;color:white;border:1px solid #2858D9}.mg-dock-prev:disabled{opacity:.38;cursor:default}.mg-dock-next:hover{background:#214ABD}.mg-dock :focus-visible{outline:3px solid #B87712;outline-offset:3px}.mg-dock-mobile{bottom:0;width:100%;border-radius:15px 15px 0 0;padding:9px 16px calc(12px + env(safe-area-inset-bottom,0px));grid-template-columns:100px minmax(0,1fr);gap:8px 10px}.mg-dock-mobile .mg-dock-info{grid-column:1/-1;grid-row:1;justify-content:space-between;font-size:11px;gap:10px}.mg-dock-mobile .mg-dock-info strong{font-size:12px}.mg-dock-mobile .mg-dock-prev{grid-column:1;grid-row:2}.mg-dock-mobile .mg-dock-next{grid-column:2;grid-row:2}.mg-dock-mobile button,.mg-dock-mobile a{font-size:13px;min-height:48px;padding:10px 12px}
@container mg (max-width:759px){.mg-root{padding-bottom:120px}.mg-explanation{padding:15px 14px;margin-top:16px;border-radius:10px}.mg-explanation>strong{font-size:16px;line-height:1.65}.mg-explanation>p{font-size:16px;line-height:1.75}.mg-explanation .mg-explanation-note{font-size:13px;line-height:1.8}.mg-explanation-label{font-size:11px}.mg-panel{padding:21px 16px}.mg-progress{margin:18px 0 16px}.mg-screen-tabs button{font-size:12px;min-height:44px}.mg-footer{padding-bottom:38px}}

.mg-page-label{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px!important;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}.mg-layout{padding-top:24px}
@container mg (max-width:759px){.mg-layout{padding-top:16px}}

/* Compact top navigation and a shared explanation/image workspace. */
.mg-layout{display:block;padding-top:16px}.mg-topnav{margin-bottom:16px}.mg-steps{grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:0}.mg-steps button{min-height:58px;padding:10px 14px;border-radius:12px;border-color:#DFE7F3;background:#fff;gap:10px}.mg-steps small,.mg-step-arrow{display:none}.mg-steps strong{font-size:15px}.mg-panel{padding:24px}.mg-workspace{display:grid;grid-template-columns:minmax(320px,2fr) minmax(0,3fr);gap:28px;align-items:start}.mg-instruction,.mg-visual{min-width:0}.mg-instruction{display:flex;flex-direction:column}.mg-panel h2{font-size:25px;line-height:1.4;margin-top:8px}.mg-screen-tabs{margin:16px 0 0;padding:4px;gap:2px}.mg-screen-tabs button{font-size:12px;padding:8px 4px;min-height:44px}.mg-explanation{margin-top:16px;padding:16px}.mg-explanation>strong{font-size:18px;line-height:1.55}.mg-explanation>p{line-height:1.7}.mg-explanation .mg-explanation-note{line-height:1.65}.mg-image-stage>.mg-shot>.mg-image-frame{padding:12px;display:flex;align-items:center;justify-content:center;min-height:300px;height:clamp(300px,calc(100dvh - 320px),510px)}.mg-image-stage>.mg-shot>.mg-image-frame img{max-height:100%;max-width:100%;width:auto;height:auto;object-fit:contain}.mg-image-stage>.mg-shot figcaption{margin-top:6px;font-size:11px}.mg-header-row{min-height:68px}
@container mg (min-width:760px) and (max-width:999px){.mg-workspace{grid-template-columns:minmax(280px,1fr) minmax(0,1fr);gap:20px}.mg-panel{padding:20px}.mg-panel h2{font-size:23px}.mg-explanation{padding:14px}.mg-steps button{padding:10px;min-height:56px}.mg-steps strong{font-size:14px}.mg-number{width:28px;height:28px}.mg-explanation>strong{font-size:17px}}
@container mg (max-width:759px){.mg-topnav{margin-bottom:14px}.mg-steps{grid-template-columns:1fr 1fr;gap:8px}.mg-steps button{min-height:52px;padding:9px 12px}.mg-steps strong{font-size:14px}.mg-header-row{min-height:60px}.mg-panel{padding:20px 16px}.mg-panel h2{font-size:23px}.mg-workspace{display:block}.mg-instruction{display:flex}.mg-real-start{order:4;margin-top:0;margin-bottom:12px}.mg-screen-tabs{order:3;margin:16px 0 14px}.mg-explanation{order:2;margin-top:16px;padding:15px 14px}.mg-explanation>strong{font-size:16px;line-height:1.65}.mg-explanation>p{line-height:1.75}.mg-explanation .mg-explanation-note{line-height:1.8}.mg-image-stage>.mg-shot>.mg-image-frame{height:auto;min-height:0;padding:10px}.mg-image-stage>.mg-shot>.mg-image-frame img{max-height:440px}.mg-image-stage>.mg-shot-compact>.mg-image-frame{padding:18px 8px}}

/* Gentle motion: no navigation delays, layout stays in place. */
@keyframes mg-panel-enter{from{opacity:.6;transform:translate3d(0,8px,0)}to{opacity:1;transform:none}}
@keyframes mg-modal-enter{from{opacity:0;transform:translate3d(0,8px,0) scale(.985)}to{opacity:1;transform:none}}
@keyframes mg-backdrop-enter{from{opacity:0}to{opacity:1}}
.mg-panel{animation:mg-panel-enter 340ms cubic-bezier(.22,1,.36,1) both}
.mg-steps button,.mg-number{transition:background-color 220ms ease,border-color 220ms ease,color 220ms ease,box-shadow 220ms ease,transform 180ms cubic-bezier(.22,1,.36,1)}
.mg-steps .is-active .mg-number{transform:scale(1.04)}
.mg-screen-tabs{position:relative;isolation:isolate}
.mg-screen-tabs::before{content:'';position:absolute;z-index:0;top:4px;bottom:4px;left:4px;width:calc((100% - 8px - (var(--screen-count) - 1)*2px)/var(--screen-count));border-radius:7px;background:#fff;box-shadow:0 2px 6px #172F5810;transform:translateX(calc(var(--screen-index)*(100% + 2px)));transition:transform 280ms cubic-bezier(.22,1,.36,1),width 220ms ease;pointer-events:none}
.mg-screen-tabs button{position:relative;z-index:1;transition:color 180ms ease,transform 160ms ease}
.mg-screen-tabs button[aria-pressed=true]{background:transparent;box-shadow:none}
.mg-image-frame{transition:border-color 220ms ease,box-shadow 220ms ease,background-color 220ms ease}
.mg-primary,.mg-dock button,.mg-dock a{transition:background-color 180ms ease,border-color 180ms ease,box-shadow 220ms ease,transform 160ms cubic-bezier(.22,1,.36,1)}
.mg-text-link,.mg-header-store{transition:color 180ms ease}
.mg-details summary>span{transition:transform 220ms cubic-bezier(.22,1,.36,1)}
@media(hover:hover) and (pointer:fine){
.mg-steps button:not(.is-active):hover{background:#F4F7FF;border-color:#CAD8FB;transform:translateY(-2px)}

.mg-primary:hover,.mg-dock-next:hover{transform:translateY(-1px);box-shadow:0 4px 12px #2858D925}
.mg-dock-prev:not(:disabled):hover{background:#F5F8FF;border-color:#AEC3F1}
.mg-text-link:hover,.mg-header-store:hover{color:#224FC6}
}
.mg-steps button:active,.mg-screen-tabs button:active,.mg-primary:active,.mg-dock button:not(:disabled):active,.mg-dock a:active{transform:scale(.98)}
@media(prefers-reduced-motion:reduce){
.mg-steps button,.mg-steps .mg-number,.mg-screen-tabs button,.mg-primary,.mg-dock button,.mg-dock a{transform:none!important}
}

/* Selected mobile concept: one action and one original-photo focus per viewport. */
.mg-root.mg-is-mobile{box-sizing:border-box;padding-bottom:0;background:#fff;min-height:100dvh}
.mg-root.mg-is-mobile:has(.mg-mobile-view){padding-bottom:calc(80px + env(safe-area-inset-bottom,0px))}
.mg-is-mobile .mg-header-row{min-height:52px;width:calc(100% - 36px);gap:12px}
.mg-is-mobile .mg-header img{width:120px}
.mg-all-steps{margin-left:auto;display:flex;align-items:center;gap:9px;min-height:44px;border:0;background:none;color:#475775;font-size:13px!important;padding:0 0 0 12px}
.mg-all-steps span{font-size:19px}
.mg-mobile-view{height:auto;min-height:max(435px,calc(100dvh - 133px - env(safe-area-inset-bottom,0px)));padding:13px 20px 10px;display:grid;grid-template-rows:auto auto minmax(155px,1fr) auto 44px;gap:12px}
.mg-mobile-progress>div:first-child{display:flex;justify-content:space-between;align-items:center;font-size:13px;line-height:20px;margin-bottom:10px}
.mg-mobile-progress strong{font-weight:600;color:#324766}
.mg-mobile-progress>div>span{color:#7B879B;font-size:12px;font-variant-numeric:tabular-nums}
.mg-progress-track{height:3px;background:#E9EDF4;border-radius:3px;overflow:hidden}
.mg-progress-track span{display:block;height:100%;background:#2858D9;border-radius:3px;transition:width 250ms ease}
.mg-mobile-copy h2{font-size:28px;line-height:1.32;letter-spacing:-.5px;white-space:pre-line;outline:none}
.mg-mobile-copy p{font-size:15px;color:#6D7C93;line-height:1.65;margin-top:8px}
.mg-mobile-stage{min-height:0;min-width:0}
.mg-focused-photo{width:100%;height:100%;min-height:155px;position:relative;display:flex;align-items:center;justify-content:center;padding:0 0 14px;border:1px solid #E0E7F2;background:#F7F9FC;border-radius:14px;overflow:hidden;touch-action:pan-y}
.mg-photo-crop{display:block;overflow:hidden;position:relative;border-radius:6px;flex-shrink:0}
.mg-photo-crop img{position:absolute;max-width:none;display:block;object-fit:fill}
.mg-order-photo .mg-focused-photo{background:#141414;border-color:#141414}
.mg-mobile-note{font-size:14px;color:#536782;line-height:1.55;padding:0 1px;word-break:keep-all}
.mg-more{border:0;background:#F1F5FC;color:#476183;display:flex;align-items:center;justify-content:space-between;padding:0 14px;border-radius:10px;font-size:15px!important;min-height:44px}
.mg-more span{font-size:20px;color:#7588A4}
.mg-dock-mobile{border-radius:0;border-width:1px 0 0;box-shadow:0 -4px 20px #1B365F06;padding:12px 20px calc(14px + env(safe-area-inset-bottom,0px));grid-template-columns:84px minmax(0,1fr);gap:10px}
.mg-dock-mobile .mg-dock-info{display:none}
.mg-dock-mobile .mg-dock-prev,.mg-dock-mobile .mg-dock-next{grid-row:1;min-height:52px;font-size:14px;padding:10px 8px;border-radius:11px}
.mg-sheet{box-sizing:border-box;margin:auto auto 0;width:min(100%,600px);max-width:100%;max-height:85dvh;border:1px solid #DEE6F3;border-bottom:0;border-radius:22px 22px 0 0;padding:0;color:#193253;background:white;overscroll-behavior:contain}
.mg-sheet::backdrop{background:#0B1F4280}
.mg-sheet[open]{animation:mg-sheet-enter 260ms cubic-bezier(.22,1,.36,1) both}
@keyframes mg-sheet-enter{from{transform:translateY(32px);opacity:.45}to{transform:none;opacity:1}}
.mg-sheet-bar{position:sticky;top:0;background:white;z-index:2;padding:14px 20px;display:flex;justify-content:space-between;align-items:center;gap:14px;border-bottom:1px solid #E6ECF5}
.mg-sheet-bar h2{font-size:19px}
.mg-sheet-bar button{display:inline-flex;align-items:center;justify-content:center;text-align:center;min-height:44px;min-width:64px;border:1px solid #DFE7F3;background:#fff;border-radius:8px;color:#536782;font-size:13px}
.mg-sheet-body{padding:20px 22px calc(24px + env(safe-area-inset-bottom,0px));font-size:16px;line-height:1.8;word-break:keep-all}
.mg-sheet-body>p{margin-top:15px;color:#536782}
.mg-sheet-lead{font-size:20px;line-height:1.6;display:block}
.mg-sheet-note{background:#F2F6FF;padding:14px;border-radius:10px}
.mg-sheet-body .mg-sheet-caption{font-size:13px;color:#7A8AA1;border-top:1px solid #E4EAF3;padding-top:15px}
.mg-sheet-body>.mg-primary{width:100%;margin-top:18px}
.mg-sheet-body .mg-sheet-intro{font-size:14px;margin-top:0}
.mg-menu-group{margin-top:18px}.mg-menu-group h3{font-size:14px;color:#2858D9;margin-bottom:5px}
.mg-menu-group button{display:flex;justify-content:space-between;width:100%;padding:10px 12px;min-height:44px;border:0;border-radius:8px;background:white;color:#536782;font-size:15px}
.mg-menu-group button[aria-current=step]{background:#ECF2FF;color:#2858D9;font-weight:600}
.mg-business,.mg-restart{display:block;min-height:44px;padding:10px;border:0;background:none;color:#667C9D;font-size:13px!important;margin:12px auto 0}
.mg-mobile-complete{text-align:center;padding:40px 22px 32px}.mg-mobile-complete h2{font-size:28px;margin:10px 0 14px;outline:none}.mg-mobile-complete>p:not(.mg-eyebrow){font-size:16px;color:#667C9D;line-height:1.7}.mg-mobile-complete .mg-primary{width:100%;margin-top:26px}.mg-complete-check{display:grid;place-items:center;width:52px;height:52px;background:#EDF3FF;color:#2858D9;font-size:26px;border-radius:50%;margin:0 auto 18px}
@media(prefers-reduced-motion:reduce){.mg-sheet[open],.mg-progress-track span{animation:none!important;transition:none!important}}

/* Full-width original captures; no letterboxed strips. */
.mg-mobile-view{grid-template-rows:auto auto minmax(155px,1fr) 44px;gap:10px}
.mg-mobile-stage{display:flex;align-items:center;justify-content:center}
.mg-focused-photo{display:block;position:relative;min-height:0;padding:0;border:1px solid #DEE5EF;border-radius:12px;background:#F5F7FC;overflow:hidden;max-height:100%;width:100%}
.mg-photo-scroll{width:100%;height:100%;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;touch-action:pan-y;scrollbar-width:thin;scrollbar-color:#8393AE #FFFFFF20}
.mg-photo-crop{position:relative;border-radius:0;display:block;overflow:hidden}
.mg-photo-error{width:100%;height:100%;border:0;background:#F1F5FC;color:#536782;font-size:14px}
.mg-order-photo .mg-focused-photo{border-color:#222;background:#141414}



.mg-mobile-view{padding:10px 20px 7px;gap:8px}
.mg-mobile-stage{position:relative}
.mg-mobile-stage>.mg-focused-photo{position:absolute;left:0;top:50%;transform:translateY(-50%)}
`;
