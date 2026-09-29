/* Exact-version, exact-quantity SBC purchasing. Adapter owns pacing and the shared market lock. */
const FsuSbcProcurement = (() => {
    const same = (a,b) => Number(a) === Number(b);
    const open = r => !['claimed','lost'].includes(r.state);
    function quote(item, need, adapter) {
        const p=adapter.player(item), a=adapter.auction(item);
        if (!p.player || !same(p.defId,need.definitionId) || p.rating!==need.rating ||
            !a.valid || !a.active || a.closed || a.expired || a.owner || a.stale ||
            !/^\d+$/.test(a.tradeId) || !Number.isInteger(a.buy) || a.buy<=0) return null;
        return {tradeId:a.tradeId,amount:a.buy,item};
    }
    class Buyer {
        constructor(adapter) {
            this.a=adapter;this.scope=adapter.scope();this.busy=false;
            const saved=adapter.loadPurchases();
            if(saved && (saved.scope!==this.scope || !Array.isArray(saved.records))) throw new Error('补购记录无法核对，已停止。');
            this.records=saved?.records||[];
        }
        save(){this.a.savePurchases({version:1,scope:this.scope,records:this.records});}
        check(){this.a.check();if(this.a.scope()!==this.scope)throw new Error('账号已切换，补购停止。');}
        async recover() {
            for(const r of this.records.filter(open)) {
                this.check();
                // The exact physical item may already have been claimed before a reload.
                const owned=await this.a.findOwned(r);
                if(owned){r.state='claimed';r.itemId=String(owned.id);this.save();continue;}
                const item=await this.a.recoverTrade(r);
                if(!item){r.state='unresolved';this.save();throw new Error('历史交易结果尚不明确，请在转会目标核对；不会重复购买。');}
                const p=this.a.player(item),a=this.a.auction(item);
                if(!same(p.defId,r.definitionId)||p.rating!==r.rating)throw new Error('历史交易的球员版本不一致，补购停止。');
                if(a.won && a.closed) {
                    r.state='won';r.itemId=String(item.id);this.save();
                    const claimed=await this.a.claim(item,r);
                    if(!claimed)throw new Error('球员已成交，尚未进入可用库存。请领取后继续，不会重复购买。');
                    r.state='claimed';r.itemId=String(claimed.id);this.save();
                } else if(a.closed && !a.highest && !a.won){r.state='lost';this.save();}
                else {r.state='unresolved';this.save();throw new Error('交易仍待确认，补购暂停。');}
            }
        }
        async buy(need,planId) {
            if(this.busy)throw new Error('补购正在执行。');this.busy=true;
            try {
                this.check();await this.recover();
                if(this.records.some(r=>r.planId===planId&&r.needKey===need.key&&r.state==='claimed')) {
                    if(await this.a.ensureNeed(need))throw new Error('该缺口已购卡但库存尚不可用，请核对领取或重新规划；不会重复购买。');
                    return {status:'already-claimed'};
                }
                if(!await this.a.ensureNeed(need))return {status:'already-owned'};
                const matches=[];
                // Read cheap listings first, then a bounded exact-version search if necessary.
                for(const cap of [1000,this.a.maxPrice(need)]) {
                    if(!Number.isFinite(cap)||cap<=0)continue;
                    for(let page=1;page<=3;page++) {
                        this.check();
                        const result=await this.a.search({defId:need.definitionId},cap,'buy',page);
                        for(const item of result.items){const q=quote(item,need,this.a);if(q&&q.amount<=cap)matches.push(q);}
                        if(result.end)break;
                    }
                    if(matches.length)break;
                }
                matches.sort((a,b)=>a.amount-b.amount);
                const selected=matches[0];
                if(!selected)throw new Error(`未找到 ${need.name} 的可买挂牌；没有购买。`);
                let approved=1000;
                for(let attempt=0;attempt<4;attempt++) {
                    this.check();
                    if(!(await this.a.refresh([selected.item])).includes(selected.tradeId))throw new Error('挂牌已失效，请重新查询。');
                    const q=quote(selected.item,need,this.a);
                    if(!q)throw new Error('挂牌状态改变，未购买。');
                    if(q.amount>approved) {
                        if(!await this.a.confirm({...need,amount:q.amount,tradeId:q.tradeId}))return {status:'declined'};
                        approved=q.amount;continue; // Always refresh after the user's decision.
                    }
                    await this.a.currencies();
                    if(!await this.a.ensureNeed(need))return {status:'already-owned'};
                    // ensureNeed can take several pages: refresh the auction again immediately before buying.
                    if(!(await this.a.refresh([selected.item])).includes(selected.tradeId))throw new Error('挂牌已消失。');
                    const final=quote(selected.item,need,this.a);
                    if(!final)throw new Error('挂牌已失效。');
                    if(final.amount>approved)continue;
                    this.check();
                    if(!this.a.canBuy(selected.item,this.a.coins()))throw new Error('余额不足或挂牌不可购买。');
                    const record={planId,needKey:need.key,definitionId:need.definitionId,rating:need.rating,
                        name:need.name,challengeId:need.challengeId,tradeId:final.tradeId,amount:final.amount,
                        state:'intent',at:Date.now()};
                    this.records.push(record);this.save(); // Durable intent BEFORE the irreversible request.
                    try {await this.a.buy(selected.item,final.amount);}
                    catch(error){record.state='unresolved';this.save();throw error;}
                    record.state='confirming';this.save();
                    await this.recover();
                    return {status:'claimed',record};
                }
                throw new Error('挂牌多次变价，已停止购买，请重新查询。');
            } finally {this.busy=false;}
        }
    }
    return {Buyer,quote};
})();
if (typeof module !== 'undefined') module.exports = FsuSbcProcurement;
