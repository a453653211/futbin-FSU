async page => {
    return page.evaluate(({ catalogSource, coreSource, adapterSource }) => {
        if (window.__fsuMarketLiveTest) return window.__fsuMarketLiveTest.status();
        if (typeof services === 'undefined' || !services.User.getUser()?.getSelectedPersona?.())
            throw Error('请先登录 FC27 并进入转会中心');
        // Source strings are inserted from the current production files by the local
        // installer. No scheduler is started and no prototype/UI hooks are installed.
        const create = new Function('GM_setValue', 'GM_getValue',
            'const module=undefined; const info={base:{year:APP_YEAR_SHORT,platform:services.User.getUser().getSelectedPersona().sku===GameSku.PC?"pc":"other"}};const events={};\n' +
            catalogSource + '\n' + coreSource + '\n' + adapterSource + '\nreturn {adapter:events.autoBidAdapter(),observe:events.autoBidObserve};');
        const {adapter:a,observe} = create((k,v)=>sessionStorage.setItem(k,v),(k,d)=>sessionStorage.getItem(k)||d);
        a.check();const scope=a.scope();
        const key='fsuMarketLiveTest.2026-09-20.'+scope;
        const ledger=JSON.parse(sessionStorage.getItem(key)||'{"limit":1000,"reserved":0,"attempts":[],"nextAt":0}');
        if (ledger.limit!==1000) throw Error('测试预算状态异常');
        const candidates=new Map();let busy=false,release;
        const save=()=>sessionStorage.setItem(key,JSON.stringify(ledger));
        const brief=item=>{const p=a.player(item),t=a.auction(item);return {name:p.name,defId:p.defId,
            tradeId:t.tradeId,seconds:t.seconds,current:t.current,start:t.start,buy:t.buy,highest:t.highest,
            outbid:t.outbid,won:t.won,closed:t.closed,active:t.active,owner:t.owner,stale:t.stale};};
        const request=async(label,fn)=>{
            if(busy)throw Error('已有请求进行中');
            a.check();a.session();if(a.scope()!==scope)throw Error('账号已改变');
            if(Date.now()<ledger.nextAt)throw Error('请求间隔不足5秒');
            busy=true;try{return await fn();}finally{busy=false;ledger.nextAt=Date.now()+5000;save();}
        };
        const takeLock=()=>new Promise((resolve,reject)=>{
            navigator.locks.request('fsu-auto-bid:'+scope,{ifAvailable:true},async lock=>{
                if(!lock){reject(Error('另一个标签页正在运行购买'));return;}
                const held=new Promise(r=>{release=r;});resolve();await held;
            }).catch(reject);
        });
        const api={
            status:()=>({limit:ledger.limit,reserved:ledger.reserved,remaining:ledger.limit-ledger.reserved,
                coins:a.coins(),attempts:ledger.attempts,waitMs:Math.max(0,ledger.nextAt-Date.now()),busy,locked:!!release}),
            async lock(){if(!release)await takeLock();return api.status();},
            async coins(){await request('coins',()=>a.currencies());return api.status();},
            async search(kind){
                if(!release)throw Error('请先取得测试锁');
                if(!['bid','buy'].includes(kind))throw Error('无效模式');
                const items=await request('search',()=>{
                    const c=new UTSearchCriteriaDTO();c.type=SearchType.PLAYER;c.level=SearchLevel.BRONZE;
                    c.category=SearchCategory.ANY;c.count=20;c.offset=0;
                    if(kind==='buy')c.maxBuy=500;else c.maxBid=400;
                    return observe(()=>services.Item.itemDao.searchTransferMarket(c));
                });
                const found=items.response?.items;if(!Array.isArray(found))throw Error('市场列表格式异常');
                const rows=[];
                for(const item of found){const p=a.player(item),t=a.auction(item);
                    if(!t.valid||!t.active||t.owner||t.highest||t.outbid||t.seconds<=0||p.position===p.gk)continue;
                    if(kind==='bid'&&(t.seconds>60||(t.buy>0&&(t.current?a.next(t.current):t.start)>=t.buy)))continue;
                    const amount=kind==='buy'?t.buy:(t.current?a.next(t.current):t.start);
                    if(amount<=0||amount>(kind==='buy'?500:400)||a.floor(amount)!==amount)continue;
                    candidates.set(t.tradeId,{item,kind,defId:p.defId,refreshedAt:0});rows.push(brief(item));
                }
                return rows;
            },
            async exact(tradeId){const r=candidates.get(tradeId);if(!r)throw Error('未知挂牌');
                const result=await request('exact',()=>a.search({defId:r.defId},r.kind==='buy'?500:400,r.kind,1));
                return result.items.map(brief);
            },
            async refresh(tradeId){const r=candidates.get(tradeId);if(!r)throw Error('未知挂牌');
                const ids=await request('refresh',()=>a.refresh([r.item]));
                if(!ids.includes(tradeId))throw Error('服务器未返回这条拍卖');r.refreshedAt=Date.now();
                const result=brief(r.item),attempt=ledger.attempts.find(x=>x.tradeId===tradeId);
                if(attempt){attempt.confirmedWon=result.won;attempt.closed=result.closed;attempt.highest=result.highest;save();}
                return result;
            },
            async submit(tradeId){
                if(!release)throw Error('未取得测试锁');
                const r=candidates.get(tradeId);if(!r)throw Error('未知挂牌');
                if(ledger.attempts.some(x=>x.kind===r.kind))throw Error('每种模式仅允许一次测试提交，不重试');
                if(Date.now()-r.refreshedAt>12000)throw Error('拍卖快照过期，请先刷新');
                const t=a.auction(r.item),p=a.player(r.item),coins=a.coins();
                const amount=r.kind==='buy'?t.buy:(t.current?a.next(t.current):t.start);
                if(p.defId!==r.defId||t.tradeId!==tradeId||!t.valid||!t.active||t.owner||t.highest||t.outbid||t.stale||
                    t.seconds<=0||(r.kind==='bid'&&t.seconds>60)||coins<1000||amount>coins||
                    !Number.isInteger(amount)||amount<150||amount>(r.kind==='buy'?500:400)||a.floor(amount)!==amount||
                    ledger.reserved+amount>1000||!(r.kind==='buy'?a.canBuy(r.item,coins):a.canBid(r.item,amount,coins)))
                    throw Error('挂牌、余额或1000金币预算校验不通过');
                return request('submit',async()=>{
                    const attempt={kind:r.kind,tradeId,defId:r.defId,name:p.name,amount,at:Date.now(),outcome:'uncertain'};
                    ledger.reserved+=amount;ledger.attempts.push(attempt);save();
                    try{await(r.kind==='buy'?a.buy(r.item,amount):a.bid(r.item,amount));attempt.outcome='acknowledged';save();}
                    catch(e){attempt.error=e.message;save();throw e;}
                    r.refreshedAt=0;return {attempt,auction:brief(r.item),budgetRemaining:1000-ledger.reserved};
                });
            },
            async watched(){const items=await request('watched',()=>a.watched());
                return items.filter(i=>ledger.attempts.some(r=>r.tradeId===a.auction(i).tradeId)).map(brief);},
            finish(){if(busy)throw Error('请求尚未结束');release?.();release=null;return api.status();}
        };
        window.__fsuMarketLiveTest=api;return api.status();
    }, __PRODUCTION_SOURCES__);
}
