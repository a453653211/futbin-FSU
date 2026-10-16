/* Bounded, feasible-first SBC planning. No network or account mutation. MIT. */
const FsuSbcComplex = (() => {
    const compare = (a, op, b) => op === 'min' ? a >= b : op === 'max' ? a <= b : a === b;
    const distance = (a, op, b) => op === 'min' ? Math.max(0, b - a) : op === 'max' ? Math.max(0, a - b) : Math.abs(a - b);
    const identity = p => String(p.databaseId);
    const physical = p => p.owned !== false ? String(p.id) : null;
    const sum = values => values.reduce((a, b) => a + b, 0);
    const counts = (players, field) => {
        const result = new Map();
        for (const p of players) if (p) result.set(p[field], (result.get(p[field]) || 0) + 1);
        return result;
    };
    const aggregateFields = { NATION_COUNT: 'nationId', LEAGUE_COUNT: 'leagueId', CLUB_COUNT: 'clubId',
        SAME_NATION_COUNT: 'nationId', SAME_LEAGUE_COUNT: 'leagueId', SAME_CLUB_COUNT: 'clubId' };
    const playerKeys = new Set(['PLAYER_MIN_OVR','PLAYER_MAX_OVR','PLAYER_EXACT_OVR','PLAYER_QUALITY',
        'PLAYER_LEVEL','PLAYER_RARITY','PLAYER_RARITY_GROUP','NATION_ID','LEAGUE_ID','CLUB_ID','PLAYER_TRADABILITY']);
    const combinedKeys = new Set(['PLAYER_MIN_OVR','PLAYER_MAX_OVR','PLAYER_EXACT_OVR','NATION_ID','LEAGUE_ID','CLUB_ID','PLAYER_TRADABILITY']);

    function describe(requirements, enums) {
        return requirements.map(r => ({ label: r.buildString(), scope: enums.scope[r.scope], count: r.count,
            keys: r.keys().map(k => ({ name: enums.key[k], value: r.getValue(k) })) }));
    }
    function compile(requirements, slots) {
        if (!requirements.length) throw new Error('挑战没有可读取的要求。');
        return requirements.map(req => {
            const op = { GREATER:'min', LOWER:'max', EXACT:'exact' }[req.scope];
            const fail = () => { throw new Error(`暂不支持此条件：${req.label || '未知条件'}。`); };
            if (!op || !req.keys?.length || req.keys.some(k => !k.name || !Array.isArray(k.value) || !k.value.length || !k.value.every(Number.isFinite))) return fail();
            const first = req.keys[0], name = first.name, value = first.value[0];
            if (req.keys.length === 1 && aggregateFields[name]) {
                if (first.value.length !== 1 || !Number.isInteger(value) || value < 0) return fail();
                return { label:req.label, kind:name.startsWith('SAME_')?'same':'distinct', field:aggregateFields[name], op, target:value };
            }
            if (req.keys.length === 1 && ['TEAM_RATING','CHEMISTRY_POINTS'].includes(name)) {
                if (first.value.length !== 1 || value < 0) return fail();
                return { label:req.label, kind:name === 'TEAM_RATING'?'rating':'chemistry', op, target:value };
            }
            if (req.keys.length === 1 && name === 'FIRST_OWNER_PLAYERS_COUNT') {
                if (first.value.length !== 1 || !Number.isInteger(value) || value < 0) return fail();
                return { label:req.label, kind:'firstOwner', op, target:value };
            }
            if (req.keys.some(k => !(req.keys.length > 1 ? combinedKeys : playerKeys).has(k.name))) return fail();
            if (req.keys.length > 1 && req.keys.some(k => k.name === 'PLAYER_QUALITY')) return fail();
            const quality = req.keys.length === 1 && name === 'PLAYER_QUALITY';
            if (!quality && (!Number.isInteger(req.count) || req.count < 0)) return fail();
            return { label:req.label, kind:'players', op:quality?'exact':op, playerOp:op,
                target:quality?slots:req.count, keys:req.keys };
        });
    }
    function playerValue(player, key, op, combined) {
        const values=key.value, v=values[0];
        switch(key.name) {
        case 'PLAYER_MIN_OVR': return +(player.rating>=v);
        case 'PLAYER_MAX_OVR': return +(player.rating<=v);
        case 'PLAYER_EXACT_OVR': return +(player.rating===v);
        case 'PLAYER_QUALITY': return +compare(player.tier,op,v);
        case 'PLAYER_LEVEL': return values.filter(x=>player.tier===x).length;
        case 'PLAYER_RARITY': return values.filter(x=>player.rareflag===x).length;
        case 'PLAYER_RARITY_GROUP': return values.filter(x=>player.groups?.includes(x)).length;
        case 'NATION_ID': return (combined?[v]:values).filter(x=>player.nationId===x).length;
        case 'LEAGUE_ID': return (combined?[v]:values).filter(x=>player.leagueId===x).length;
        case 'CLUB_ID': return (combined?[v]:values).filter(x=>player.clubId===x).length;
        case 'PLAYER_TRADABILITY': return +(player.tradable===(v===0));
        default: throw new Error(`未知球员规则 ${key.name}`);
        }
    }
    function rating(players, floating = true) {
        const total=sum(players.filter(Boolean).map(p=>p.rating));
        const average=Math.min(floating?total/11:Math.floor(total/11),99);
        const adjusted=total+sum(players.filter(Boolean).map(p=>Math.max(0,p.rating-average)));
        return Math.min(99,Math.max(0,Math.floor((floating?Math.round(adjusted):adjusted)/11)));
    }
    function chemistry(players, positions, context) {
        if (context.chemistry) return context.chemistry(players,positions);
        // The fast model is explicitly limited to ordinary chemistry profiles.
        if (players.some(p=>p && p.standardChemistry === false)) throw new Error('特殊默契卡需要 EA 默契计算器。');
        const active=players.filter((p,i)=>p?.positions?.includes(positions[i]));
        const fields={NAT:'nationId',LEA:'leagueId',CLU:'clubId'};
        if (!context.thresholds?.length || ['NAT','LEA','CLU'].some(k=>!context.thresholds.some(t=>t.abbr===k))) throw new Error('缺少当前赛季默契阈值。');
        const byField=Object.fromEntries(Object.values(fields).map(f=>[f,counts(active,f)]));
        const points=players.map((p,i)=>p?.positions?.includes(positions[i]) ? Math.min(3,sum(context.thresholds.map(t=>{
            const f=fields[t.abbr];if(!f) throw new Error('未知默契参数。');
            const n=byField[f].get(p[f])||0;
            return sum(t.thresholds.filter(x=>n>=x.requirement).map(x=>x.points));
        }))) : 0);
        return { total:sum(points), points };
    }
    function evaluate(players, positions, rules, context) {
        const present=players.filter(Boolean), chem=chemistry(players,positions,context);
        const teamRating=rating(players,context.floatRating);
        const group={};
        const metrics=rules.map(rule=>{
            let actual;
            switch(rule.kind) {
            case 'same': case 'distinct': {
                const c=group[rule.field] ||= counts(present,rule.field);
                actual=rule.kind==='same'?Math.max(0,...c.values()):c.size;break;
            }
            case 'rating': actual=teamRating;break;
            case 'chemistry': actual=chem.total;break;
            case 'firstOwner': actual=present.filter(p=>p.owners===1).length;break;
            case 'players': actual=sum(present.map(p=>rule.keys.length>1?+rule.keys.every(k=>playerValue(p,k,rule.playerOp,true)>0):playerValue(p,rule.keys[0],rule.playerOp,false)));break;
            default: throw new Error(`未知阵容规则 ${rule.kind}`);
            }
            return {label:rule.label,actual,target:rule.target,op:rule.op,met:compare(actual,rule.op,rule.target),distance:distance(actual,rule.op,rule.target),kind:rule.kind};
        });
        const duplicates=present.length-new Set(present.map(identity)).size;
        const weights={distinct:12,same:9,rating:5,chemistry:0.6,players:25,firstOwner:25};
        const penalty=(positions.length-present.length+duplicates)*1000+sum(metrics.map(m=>weights[m.kind]*m.distance*m.distance));
        return {valid:penalty===0,penalty,rating:teamRating,chemistry:chem.total,points:chem.points,metrics,
            missing:present.filter(p=>p.owned===false).length,ratingSum:sum(present.map(p=>p.rating))};
    }
    const better = (a,b) => !b || a.missing<b.missing || (a.missing===b.missing && a.ratingSum<b.ratingSum);

    async function search({players,positions,rules,context,fixed=[],reserved=new Set(),maxMs=5000,maxIterations=120000,
        seed=1,cancelled=()=>false,yieldFn=()=>new Promise(r=>setTimeout(r,0)),onProgress=()=>{},stopAtFirst=false}) {
        if (!positions.length || positions.length>11 || fixed.length>positions.length) throw new Error('阵容位置异常。');
        let randomState=seed>>>0;
        const random=()=>((randomState=(Math.imul(randomState,1664525)+1013904223)>>>0)/4294967296);
        const pick=arr=>arr[Math.floor(random()*arr.length)];
        const fixedPlayers=positions.map((_,i)=>fixed[i]||null), fixedKeys=new Set(fixedPlayers.filter(Boolean).map(identity));
        if(fixedKeys.size!==fixedPlayers.filter(Boolean).length) throw new Error('保留球员存在不同版本重复。');
        const pool=players.filter(p=>!fixedKeys.has(identity(p)) && (!physical(p)||!reserved.has(physical(p))));
        const open=positions.map((_,i)=>i).filter(i=>!fixedPlayers[i]);
        if (new Set(pool.map(identity)).size < open.length) return {status:'infeasible',reason:'not-enough-unique-players',solution:null,iterations:0};
        const start=Date.now();let iterations=0,best=null,bestMetrics=null,bestPenalty=Infinity;
        const scopes=[pool];
        const nationRule=rules.find(r=>r.kind==='distinct'&&r.field==='nationId'&&r.op==='exact');
        if(nationRule?.target===2 && fixedKeys.size===0){
            const nations=[...counts(pool,'nationId')].sort((a,b)=>b[1]-a[1]);
            const pairs=[];
            for(let a=0;a<nations.length;a++)for(let b=a+1;b<nations.length;b++){
                const ps=pool.filter(p=>p.nationId===nations[a][0]||p.nationId===nations[b][0]);
                if(new Set(ps.map(identity)).size<positions.length)continue;
                const coverage=positions.filter(pos=>ps.some(p=>p.positions?.includes(pos))).length;
                pairs.push({ps,score:coverage*100+ps.length});
            }
            pairs.sort((a,b)=>b.score-a.score);scopes.unshift(...pairs.slice(0,30).map(p=>p.ps));
        }
        const check=async()=>{await yieldFn();if(cancelled())throw new Error('页面、阵容或设置已改变，规划已取消。');};
        await check();
        const consider=(s,m)=>{
            bestPenalty=Math.min(bestPenalty,m.penalty);
            if(m.valid&&better(m,bestMetrics)){best=s.slice();bestMetrics=m;onProgress({solution:best.slice(),metrics:m,iterations});}
        };
        // A feasible-first search can stop with costly filler cards. Try cheaper
        // one-card substitutions while rechecking every squad requirement.
        const refine=async()=>{
            if(!best||!open.length)return;
            const ranked=pool.slice().sort((a,b)=>Number(a.owned===false)-Number(b.owned===false)||a.rating-b.rating);
            let improved=true;
            while(improved&&iterations<maxIterations&&Date.now()-start<maxMs){
                improved=false;
                for(const slot of open){
                    const original=best[slot];
                    for(const candidate of ranked){
                        if(iterations>=maxIterations||Date.now()-start>=maxMs)return;
                        if(identity(candidate)===identity(original))continue;
                        const fewerMissing=original.owned===false&&candidate.owned!==false;
                        if(!fewerMissing&&(candidate.owned===false)!==(original.owned===false))continue;
                        if(!fewerMissing&&candidate.rating>=original.rating)continue;
                        if(best.some((p,i)=>i!==slot&&identity(p)===identity(candidate)))continue;
                        const next=best.slice();next[slot]=candidate;
                        const metrics=evaluate(next,positions,rules,context);iterations++;
                        if(iterations%200===0)await check();
                        if(metrics.valid&&better(metrics,bestMetrics)){
                            consider(next,metrics);improved=true;break;
                        }
                    }
                }
            }
        };
        for(let restart=0;iterations<maxIterations && Date.now()-start<maxMs;restart++){
            const scoped=scopes[restart%scopes.length];
            const choices=positions.map(pos=>{const match=scoped.filter(p=>p.positions?.includes(pos));return match.length?match:scoped;});
            let current=fixedPlayers.slice();const occupied=new Set(fixedKeys);
            for(const slot of open.slice().sort((a,b)=>choices[a].length-choices[b].length)){
                const opts=choices[slot].filter(p=>!occupied.has(identity(p)));
                const p=opts.length?pick(opts):pick(scoped.filter(p=>!occupied.has(identity(p))));
                if(!p)break;current[slot]=p;occupied.add(identity(p));
            }
            if(current.some(p=>!p))continue;
            let metrics=evaluate(current,positions,rules,context);consider(current,metrics);
            if(best&&stopAtFirst)break;
            if(!open.length)break;
            for(let step=0;step<2500 && iterations<maxIterations;step++,iterations++){
                if(iterations%200===0){await check();if(Date.now()-start>=maxMs)break;}
                const next=current.slice(), slot=pick(open);
                if(random()<0.10 && open.length>1){const other=pick(open);[next[slot],next[other]]=[next[other],next[slot]];}
                else{
                    const changes=random()<0.16?2:1;
                    for(let k=0;k<changes;k++){
                        const at=k?pick(open):slot;
                        let options=random()<0.88?choices[at]:scoped;
                        if(random()<0.55){const anchor=pick(current);const linked=options.filter(p=>p.nationId===anchor.nationId||p.leagueId===anchor.leagueId||p.clubId===anchor.clubId);if(linked.length)options=linked;}
                        next[at]=pick(options);
                    }
                }
                if(new Set(next.map(identity)).size!==next.length)continue;
                const m=evaluate(next,positions,rules,context);consider(next,m);
                if(best&&stopAtFirst)break;
                const temperature=5*Math.pow(0.015,step/2500)+0.02;
                const score=x=>x.penalty+x.missing*0.025+x.ratingSum*0.00001;
                const delta=score(m)-score(metrics);
                if(delta<=0||random()<Math.exp(-delta/temperature)){current=next;metrics=m;}
            }
            if(best&&stopAtFirst)break;
        }
        await refine();
        await check();
        return {status:best?'feasible':'unknown',reason:best?'found':'search-budget',solution:best,metrics:bestMetrics,iterations,bestPenalty,optimal:false};
    }
    async function planGroup({challenges,players,context,maxMs=30000,seed=1,cancelled=()=>false,yieldFn,onProgress=()=>{}}){
        if(!challenges.length||challenges.length>6||new Set(challenges.map(c=>c.id)).size!==challenges.length)
            throw new Error('联合规划需要 1–6 个不同挑战。');
        const start=Date.now(),fixedOwner=new Map();
        for(const c of challenges)for(const p of c.fixed||[])if(p&&physical(p)){
            if(fixedOwner.has(physical(p))&&fixedOwner.get(physical(p))!==c.id)throw new Error('同一张已放入的实体卡被多个挑战占用，请先处理冲突。');
            fixedOwner.set(physical(p),c.id);
        }
        const orders=[];
        const permute=(prefix,left)=>{if(!left.length){orders.push(prefix);return;}if(orders.length>=24)return;for(const c of left)permute(prefix.concat(c),left.filter(x=>x!==c));};
        const sorted=challenges.slice().sort((a,b)=>{
            const target=c=>c.rules.find(r=>r.kind==='distinct'&&r.field==='nationId'&&r.op==='exact')?.target||99;
            return target(a)-target(b);
        });
        permute([],sorted);let best=null,attempts=0;
        for(const order of orders){
            if(Date.now()-start>=maxMs)break;
            const reserved=new Set(fixedOwner.keys()),solutions=[];
            for(const c of order){
                const own=new Set((c.fixed||[]).filter(Boolean).map(physical));
                const exclude=new Set([...reserved].filter(id=>!own.has(id)));
                const remaining=maxMs-(Date.now()-start);
                if(remaining<=0)break;
                const result=await search({...c,players,context:typeof context==='function'?context(c):context,reserved:exclude,
                    maxMs:Math.min(5000,remaining),seed:seed+attempts++*97,cancelled,yieldFn,stopAtFirst:true});
                if(!result.solution)break;
                solutions.push({challengeId:c.id,...result});
                for(const p of result.solution)if(physical(p))reserved.add(physical(p));
                onProgress({completed:solutions.length,total:challenges.length,challengeId:c.id});
            }
            if(solutions.length===challenges.length){
                const metrics={missing:sum(solutions.map(s=>s.metrics.missing)),ratingSum:sum(solutions.map(s=>s.metrics.ratingSum))};
                if(better(metrics,best?.metrics))best={status:'feasible',solutions,metrics,optimal:false};
                if(metrics.missing===0)break;
            }
        }
        return best||{status:'unknown',reason:'joint-search-budget',solutions:[],optimal:false};
    }
    function needs(plan){
        if(plan.status!=='feasible'||!plan.solutions?.length||plan.solutions.some(s=>!s.solution?.length||!s.metrics?.valid))throw new Error('只有完整可行计划才能生成补购清单。');
        const used=new Set(),result=[];
        for(const s of plan.solutions)for(let slot=0;slot<s.solution.length;slot++){
            const p=s.solution[slot],id=physical(p);
            if(id){if(used.has(id))throw new Error('联合计划重复使用实体卡。');used.add(id);}
            else result.push({key:`${s.challengeId}:${slot}`,challengeId:s.challengeId,slot,definitionId:p.definitionId,databaseId:p.databaseId,name:p.name,rating:p.rating,player:p});
        }
        return result;
    }
    return {describe,compile,evaluate,rating,chemistry,search,planGroup,needs};
})();
if (typeof module !== 'undefined') module.exports = FsuSbcComplex;
