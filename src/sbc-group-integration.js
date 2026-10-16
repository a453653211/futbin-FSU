/* Joint SBC planning and explicitly started procurement. Runs in FSU's closure. */
events.smartSbcCard = p => ({id:String(p.id),definitionId:p.definitionId,databaseId:p.databaseId,
    name:p.getStaticData?.()?.name || String(p.definitionId),rating:p.rating,rareflag:p.rareflag,
    nationId:p.nationId,leagueId:p.leagueId,clubId:repositories.TeamConfig.getLinkedTeam(p.teamId),
    positions:p.possiblePositions?.slice()||[],tier:p.getTier(),groups:p.groups||[],
    owners:p.owners,tradable:p.tradable,owned:!p.concept,entity:p});

events.smartSbcDescriptor = c => {
    if(c.eligibilityOperation!==SBCEligibilityOperation.AND)throw new Error('暂不支持 OR 挑战。');
    const slots=c.squad.getFieldPlayers().filter(s=>!s.isBrick());
    const requirements=FsuSbcComplex.describe(c.eligibilityRequirements,{key:SBCEligibilityKey,scope:SBCEligibilityScope});
    // EA expands linked men's/women's teams only for stand-alone club predicates.
    for(const req of requirements)if(req.keys.length===1&&req.keys[0].name==='CLUB_ID')
        req.keys[0].value=[...new Set(req.keys[0].value.flatMap(id=>[id,repositories.TeamConfig.getLinkedTeam(id)]))];
    return {id:c.id,entity:c,indices:slots.map(s=>s.index),positions:slots.map(s=>s.getGeneralPosition()),
        fixed:slots.map(s=>{const p=s.getItem();return p?.id&&!p.concept?events.smartSbcCard(p):null;}),
        rules:FsuSbcComplex.compile(requirements,slots.length)};
};
events.smartSbcContext = descriptor => ({
    floatRating:services.Configuration.checkFeatureEnabled(UTServerSettingsRepository.KEY.SQUAD_RATING_FLOAT_CALCULATION_ENABLED),
    chemistry(players) {
        const c=descriptor.entity, items=c.squad.getPlayers().map(s=>s.getItem());
        descriptor.indices.forEach((index,i)=>{items[index]=players[i]?.entity||new UTItemEntity();});
        const result=c.squad.chemCalculator.calculate(c.squad.getFormation(),items,[new UTNullItemEntity()]);
        return {total:result.chemistry,points:descriptor.indices.map(index=>result.slots[index].points)};
    }
});
events.smartSbcSignature = squad => squad.getPlayers().map(s=>`${s.getItem()?.id}:${s.getItem()?.definitionId}`).join('|');

events.smartSbcGroup = async (controller, button) => {
    if(info.run.smartSbc || info.base.savesquad)return;
    try { events.smartSbcCheckIdle(); }
    catch (error) { events.notice(error.message, 2); return; }
    const current=controller._challenge;
    if(!current?.squad)return;
    const adapter=events.smartSbcMarketAdapter(),scope=adapter.scope();
    info.run.smartSbc=true;
    const root=button.getRootElement(),panel=document.createElement('section');
    panel.style.cssText='padding:16px;background:#202630;color:white;line-height:1.6;max-height:65vh;overflow:auto;';
    root.after(panel);
    const add=(tag,text,parent=panel)=>{const node=document.createElement(tag);node.textContent=text;parent.append(node);return node;};
    add('h3','整组 SBC 规划');
    const status=add('p','读取当前组、库存和主力阵容…'),detail=add('div',''),actions=add('div','');
    let stopped=false,busy=true,plan=null,descriptors=[],inventory=[],protectedIds=new Set(),lastRequest=0;
    let savedCount=0;
    const settings=()=>JSON.stringify([info.set,info.build,info.lock,events.smartSbcLegacyFilters()]);
    const initialSettings=settings(),signatures=new Map();
    const check=()=>{
        events.smartSbcCheckIdle();
        if(stopped||!panel.isConnected||controller._challenge!==current||settings()!==initialSettings||adapter.scope()!==scope||info.base.savesquad)
            throw new Error('页面、账号或筛选设置已改变，规划已停止。');
        if(!adapter.session())throw new Error('EA 正在重新认证，请稍后重新打开规划。');
        for(const d of descriptors)if(signatures.get(d.id)!==events.smartSbcSignature(d.entity.squad))
            throw new Error('挑战阵容已改变，请重新规划。');
    };
    const pace=async fn=>{
        check();if(info.smartSbcMarketTainted)throw new Error('上次请求结果不确定，请刷新网页后继续。');
        const delay=Math.max(0,lastRequest+5000-Date.now());
        if(delay)await new Promise(r=>setTimeout(r,delay));check();
        try{return await fn();}finally{lastRequest=Date.now();}
    };
    const request=create=>pace(()=>events.smartSbcMarketObserve(create));
    const refreshInventory=async()=>{
        const list=(await request(()=>services.Squad.requestSquadList())).data;
        const active=(await request(()=>services.Squad.requestSquadById(list.activeSquadId))).data.squad;
        protectedIds=new Set(active.getPlayers().map(s=>String(s.getItem()?.id)));
        inventory=await events.smartSbcInventory(check,request);check();
        return events.smartSbcCandidates(inventory).players.filter(p=>!protectedIds.has(String(p.id)));
    };
    const fullItems=solution=>{
        const d=descriptors.find(x=>x.id===solution.challengeId),items=d.entity.squad.getPlayers().map(s=>s.getItem());
        d.indices.forEach((index,i)=>{items[index]=solution.solution[i].entity;});return items;
    };
    const validate=()=>{
        plan.verified=false;check();FsuSbcComplex.needs(plan);
        for(const s of plan.solutions){
            const d=descriptors.find(x=>x.id===s.challengeId),v=events.createVirtualChallenge(d.entity);
            v.squad.setPlayers(fullItems(s),true);
            if(!v.meetsRequirements())throw new Error(`EA 校验不通过：${d.entity.name}。没有购买或保存。`);
        }
        plan.verified=true;
    };
    const remoteUnchanged=async()=>{
        for(const d of descriptors){
            const latest=(await request(()=>services.SBC.sbcDAO.loadChallenge(d.id,d.entity.isInProgress()))).response?.squad;
            if(!latest||events.smartSbcSignature(latest)!==signatures.get(d.id))throw new Error('服务器上的阵容已变化，请重新规划。');
        }
    };
    const rebind=async()=>{
        const available=await refreshInventory(),byId=new Map(available.map(p=>[String(p.id),p]));
        // Existing manually placed cards remain fixed; new selections must still pass protections.
        const fixed=new Map(descriptors.flatMap(d=>d.fixed.filter(Boolean).map(p=>[p.id,p.entity])));
        const all=new Map(inventory.map(p=>[String(p.id),p])),used=new Set();
        for(const s of plan.solutions)for(let i=0;i<s.solution.length;i++){
            const p=s.solution[i];if(p.owned===false)continue;
            const fresh=byId.get(p.id)||(fixed.has(p.id)?all.get(p.id):null);
            if(!fresh||fresh.definitionId!==p.definitionId||used.has(p.id))throw new Error('所需库存缺失或保护状态改变，请重新规划。');
            used.add(p.id);s.solution[i]=events.smartSbcCard(fresh);
        }
        for(const s of plan.solutions)for(let i=0;i<s.solution.length;i++){
            const p=s.solution[i];if(p.owned!==false)continue;
            const found=available.find(x=>x.definitionId===p.definitionId&&!used.has(String(x.id)));
            if(found){used.add(String(found.id));s.solution[i]=events.smartSbcCard(found);}
        }
        validate();
    };
    const render=()=>{
        detail.replaceChildren();if(!plan?.solutions?.length)return;
        const missing=FsuSbcComplex.needs(plan);
        add('p',`完整可行方案；补购 ${missing.length} 张。未证明评分或价格最低。`,detail);
        for(const s of plan.solutions){
            const d=descriptors.find(x=>x.id===s.challengeId),m=FsuSbcComplex.evaluate(s.solution,d.positions,d.rules,events.smartSbcContext(d));
            const box=add('details','',detail);add('summary',`${d.entity.name}：总评 ${m.rating} / 默契 ${m.chemistry}`,box);
            s.solution.forEach((p,i)=>add('p',`${i+1}. ${p.name} ${p.rating} · 版本 ${p.definitionId} · ${p.owned===false?'待补购':'已有'}`,box));
        }
        saveButton.disabled=busy||!plan.verified||missing.length>0;buyButton.disabled=busy||!plan.verified||missing.length===0;
    };
    const run=async fn=>{
        if(busy)return;busy=true;saveButton.disabled=true;buyButton.disabled=true;expandButton.disabled=true;
        try{check();await fn();}catch(e){status.textContent=e.message;console.warn('[FSU 整组 SBC]',e);}
        finally{busy=false;render();expandButton.disabled=!!plan?.verified;if(!panel.isConnected)info.run.smartSbc=false;}
    };
    const makeButton=(label,fn)=>{const b=add('button',label,actions);b.style.cssText='margin:4px;padding:8px;';b.onclick=fn;return b;};
    const saveButton=makeButton('保存整组阵容',()=>run(async()=>{
        await remoteUnchanged();await rebind();
        if(FsuSbcComplex.needs(plan).length)throw new Error('仍有缺卡，无法保存完整阵容。');
        validate();
        for(const s of plan.solutions){
            check();const d=descriptors.find(x=>x.id===s.challengeId),c=d.entity;
            try{
                // Prepare a separate entity so cancellation checks still observe the real squad.
                const v=events.createVirtualChallenge(c);v.id=c.id;v.setId=c.setId;v.squad.setPlayers(fullItems(s),true);
                status.textContent=`保存 ${c.name}…`;
                await request(()=>services.SBC.saveChallenge(v));
                const result=await request(()=>services.SBC.sbcDAO.loadChallenge(c.id,true));
                const server=result.response?.squad;
                if(!server||events.smartSbcSignature(server)!==events.smartSbcSignature(v.squad))throw new Error('服务器保存结果需要重新打开挑战核对。');
                c.squad=server;signatures.set(d.id,events.smartSbcSignature(server));
                if(!c.meetsRequirements())throw new Error('服务器阵容校验失败。');
                d.fixed=s.solution.slice();savedCount++;
            }catch(e){e.message=`已保存 ${savedCount} 关；当前关请重新打开核对。${e.message}`;throw e;}
        }
        status.textContent=`已保存并从服务器复核 ${savedCount} 关。请检查后手动提交。`;
        for(const d of descriptors)d.entity.onDataChange.notify({squad:d.entity.squad});
    }));
    const confirmQuote=q=>new Promise(resolve=>{
        const box=add('div','');box.style.cssText='padding:12px;border:2px solid #e8c75a;';
        add('p',`${q.name} · ${q.rating} 分 · 版本 ${q.definitionId} · 用于 ${descriptors.find(d=>d.id===q.challengeId).entity.name} · 1 张 · ${q.amount} 金币`,box);
        const finish=value=>{clearInterval(timer);box.remove();resolve(value);};
        const yes=add('button','确认此价格购买',box),no=add('button','取消',box);
        yes.onclick=()=>finish(true);no.onclick=()=>finish(false);
        const timer=setInterval(()=>{try{check();}catch{finish(false);}},500);
    });
    const purchaseKey=`fsuSbcPurchases.v1.${scope}`;
    const buyingAdapter=()=>{
        const a={...adapter};
        for(const method of ['search','refresh','currencies','buy'])a[method]=(...args)=>pace(()=>adapter[method](...args));
        a.check=()=>{check();adapter.check();};
        a.loadPurchases=()=>JSON.parse(GM_getValue(purchaseKey,'null'));
        a.savePurchases=data=>GM_setValue(purchaseKey,JSON.stringify(data));
        a.maxPrice=need=>Math.min(Number(need.player.entity.getPriceLimits()?.maximum||0),adapter.coins());
        a.confirm=confirmQuote;
        a.findOwned=async record=>{
            if(!record.itemId)return null;
            const items=await refreshInventory();
            return items.find(p=>String(p.id)===record.itemId&&p.definitionId===record.definitionId)||null;
        };
        a.recoverTrade=async record=>{
            if(!/^\d+$/.test(record.tradeId))throw new Error('历史交易编号无效。');
            const probe={getAuctionData:()=>({tradeId:record.tradeId,isValid:()=>true,isUpdating:false})};
            const r=await request(()=>services.Item.transfersDao.getAuctionData([probe]));
            return r.response?.items?.find(p=>String(p.getAuctionData().tradeId)===record.tradeId)||null;
        };
        a.claim=async(item,record)=>{
            // Never let EA's duplicate-swap path move another card implicitly.
            if(!item.id||item.duplicateId)throw new Error('该卡已成交但存在重复或尚不能领取，请手动领取后继续；不会再买。');
            const before=await events.smartSbcInventory(check,request);
            const owned=before.find(p=>String(p.id)===String(item.id));if(owned)return owned;
            if(before.some(p=>p.definitionId===item.definitionId))throw new Error('已成交卡与俱乐部重复，请手动处理领取。');
            await request(()=>services.Item.move([item],ItemPile.CLUB));
            const after=await refreshInventory();
            return after.find(p=>String(p.id)===String(item.id)&&p.definitionId===record.definitionId)||null;
        };
        a.ensureNeed=async need=>{
            await remoteUnchanged();await rebind();render();
            const currentNeed=FsuSbcComplex.needs(plan).find(x=>x.key===need.key);
            if(!currentNeed)return false;
            if(currentNeed.definitionId!==need.definitionId)throw new Error('补购方案已变化。');
            if(inventory.some(p=>p.definitionId===need.definitionId))throw new Error('此版本已在库存中但被保留或保护，重复购买后无法直接领取，请调整方案。');
            return true;
        };
        return a;
    };
    const buyButton=makeButton('仅补购方案缺卡',()=>run(async()=>{
        if(!navigator.locks?.request)throw new Error('浏览器不支持市场单实例锁。');
        await navigator.locks.request(`fsu-auto-bid:${scope}`,{ifAvailable:true},async lock=>{
            if(!lock)throw new Error('其他市场任务正在运行，请先停止。');
            const market=adapter.load();
            if(market?.pending?.length||market?.blocked?.length)throw new Error('市场购买任务仍有待核对交易，请先在转会中心处理。');
            const buyer=new FsuSbcProcurement.Buyer(buyingAdapter());
            await buyer.recover();await rebind();
            for(const need of FsuSbcComplex.needs(plan)){
                status.textContent=`核对并补购：${need.name}…`;
                const result=await buyer.buy(need,plan.id);
                if(result.status==='declined'){status.textContent='已取消补购。';return;}
            }
            await rebind();
            if(FsuSbcComplex.needs(plan).length)throw new Error('仍有库存缺口，请核对已购卡领取状态。');
            status.textContent='缺卡补购与领取已核对完成，可以保存整组阵容。';
        });
    }));
    makeButton('核对上次补购',()=>run(async()=>{
        if(!navigator.locks?.request)throw new Error('浏览器不支持市场单实例锁。');
        await navigator.locks.request(`fsu-auto-bid:${scope}`,{ifAvailable:true},async lock=>{
            if(!lock)throw new Error('其他市场任务正在运行，请先停止。');
            await new FsuSbcProcurement.Buyer(buyingAdapter()).recover();
            if(plan?.verified)await rebind();
            status.textContent='上次补购记录已核对；本操作没有提交新购买。';
        });
    }));
    const solve=async players=>{
        plan=await FsuSbcComplex.planGroup({challenges:descriptors,players:players.map(events.smartSbcCard),
            context:events.smartSbcContext,maxMs:45000,seed:Date.now(),
            cancelled:()=>{try{check();return false;}catch{return true;}},
            onProgress:p=>{status.textContent=`联合规划：已找到 ${p.completed}/${p.total} 关…`;}});
        if(plan.status==='feasible'){
            plan.id=`${current.setId}:${Date.now()}`;validate();
            status.textContent='完整方案已通过 EA 条件校验。展开查看球员，再保存或补购。';
        }else status.textContent='本轮未找到完整方案；未证明库存不足。可扩大搜索，或关闭后重新规划。';
    };
    const expandButton=makeButton('扩大搜索并列出缺卡',()=>run(async()=>{
        const owned=await refreshInventory(),concepts=new Map(),criteria=events.ignorePlayerToCriteria({lock:false});
        const cap=Number(info.set.goldenrange);
        for(let offset=0,page=0;page<30;page++){
            status.textContent=`读取可补购版本：第 ${page+1} 页（最多 30 页）…`;
            const q=new UTSearchCriteriaDTO();Object.assign(q,{type:'player',count:200,offset,ovrMax:cap,rarities:criteria.rareflag});
            const r=await request(()=>services.Item.searchConceptItems(q)),items=r.response?.items;
            if(!Array.isArray(items)||(!items.length&&!r.response.endOfList))throw new Error('概念球员分页异常。');
            for(const p of items){
                if(!p.isPlayer()||p.rating>cap||!criteria.rareflag.includes(p.rareflag)||p.upgrades||p.isLimitedUse()||p.isEnrolledInAcademy())continue;
                if(events.smartSbcLegacyFilters()&&(criteria.NEleagueId?.includes(p.leagueId)||criteria.tradable===false))continue;
                // A purchase is never first-owned. Preserve this fact during planning.
                p.owners=2;p.tradable=true;p.concept=true;concepts.set(p.definitionId,p);
            }
            offset+=items.length;if(r.response.endOfList===true)break;
        }
        await solve(owned.concat([...concepts.values()]));
        if(plan.status!=='feasible')status.textContent+=' 概念目录为有界搜索，未找到不等于无解。';
    }));
    makeButton('停止 / 关闭',()=>{stopped=true;panel.remove();if(!busy)info.run.smartSbc=false;});
    saveButton.disabled=buyButton.disabled=expandButton.disabled=true;
    try{
        const sets=(await request(()=>services.SBC.requestSets())).data.sets,set=sets.find(s=>s.id===current.setId);
        if(!set)throw new Error('找不到当前挑战组。');
        const list=(await request(()=>services.SBC.requestChallengesForSet(set))).data.challenges.filter(c=>c.status!==SBCChallengeStatus.COMPLETED);
        if(!list.length||list.length>6)throw new Error('整组规划支持 1–6 个未完成挑战。');
        for(const c of list){
            const entity=c.id===current.id?current:c;
            if(entity!==current)await request(()=>services.SBC.loadChallenge(entity));
            const d=events.smartSbcDescriptor(entity);descriptors.push(d);signatures.set(d.id,events.smartSbcSignature(entity.squad));
        }
        const candidates=await refreshInventory();await solve(candidates);
    }catch(e){status.textContent=e.message;console.warn('[FSU 整组 SBC]',e);}
    finally{busy=false;render();expandButton.disabled=!!plan?.verified;
        // Keep one panel owner until closed; this prevents two planners reserving the same cards.
        const watch=setInterval(()=>{if(!panel.isConnected){clearInterval(watch);if(!busy)info.run.smartSbc=false;}},500);
    }
};
