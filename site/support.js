/* Support preview: all answers stay in the browser; no ticket or telemetry API. */
(() => {
  "use strict";
  const copy = {
    "zh-CN": {
      nav:"帮助与自查",preview:"本地测试版",title:"一起找到问题，继续探索。",intro:"选择设备出现的现象，按步骤完成检查。没有解决也没关系，我们会整理好已尝试的步骤。",
      stages:["选择现象","逐步排查","查看结果"],scope:"",
      choose:"选择最接近的故障现象",keys:"查看按键说明",docs:"浏览文档",back:"返回上一步",all:"选择其他问题",check:"当前检查",history:"已完成的检查",path:"已选路径",empty:"选择结果后，会在这里记录。",device:"设备信息",hardware:"硬件",model:"型号",modelFull:"CardputerZero",modelLite:"CardputerZero Lite",version:"OS 版本（选填）",versionHint:"不知道可以留空",deviceNote:"请勿填写密码或其他敏感信息。",unresolved:"还需要进一步协助",resolved:"你已确认问题解决",resolvedBody:"下面保留了本次操作和反馈。如果问题再次出现，可以用这份记录继续沟通。",unresolvedBody:"已整理本次排查过程。补充错误提示后，将记录提供给你使用的售后渠道。",report:"排查摘要（可编辑）",copy:"复制摘要",download:"下载文本",copied:"摘要已复制。",copyFailed:"自动复制不可用，请选中下方摘要手动复制。",downloaded:"已生成文本文件，请查看浏览器下载。",local:"此页面只生成本地记录，尚未提交工单。",invalid:"这条排查链接无法继续",invalidBody:"链接中的问题或步骤无效，请重新选择故障现象。",loadError:"暂时无法加载自查内容",loadErrorBody:"请刷新页面重试。已打开的文档仍可从顶部导航访问。",retry:"重新加载",record:"CardputerZero 自查记录",flowVersion:"指引版本",symptom:"故障现象",result:"结果",reportedSolved:"用户反馈已解决",needsSupport:"尚未解决或无法继续检查，原因未确认",answer:"用户选择",unknown:"未提供",extra:"补充错误提示 / 出现时间：",draft:"本地测试记录 · 未提交售后",editor:"编辑自查流程（内部）"
    },
    en: {
      nav:"Support",preview:"LOCAL PREVIEW",title:"Find the issue. Keep exploring.",intro:"Choose what you are seeing and work through a few checks. If you still need help, take your troubleshooting record with you.",
      stages:["Choose a symptom","Check step by step","View the result"],scope:"",
      choose:"Choose the closest symptom",keys:"Keyboard guide",docs:"Browse documents",back:"Previous step",all:"Choose another issue",check:"CURRENT CHECK",history:"Completed checks",path:"Selected path",empty:"Your answers will appear here.",device:"Device information",hardware:"Hardware",model:"Model",modelFull:"CardputerZero",modelLite:"CardputerZero Lite",version:"OS version (optional)",versionHint:"Leave blank if unknown",deviceNote:"Do not enter passwords or other sensitive information.",unresolved:"Let’s get you further help",resolved:"You confirmed the issue is resolved",resolvedBody:"Keep this record of the checks and your answers. It can help if the issue returns.",unresolvedBody:"Your troubleshooting record is ready. Add any error messages, then share it through your usual support channel.",report:"Troubleshooting summary (editable)",copy:"Copy summary",download:"Download text",copied:"Summary copied.",copyFailed:"Automatic copying is unavailable. Select and copy the summary below.",downloaded:"Text file generated. Check your browser downloads.",local:"This page creates a local record only. No ticket has been submitted.",invalid:"This troubleshooting link is invalid",invalidBody:"The issue or answer sequence is invalid. Please choose a symptom again.",loadError:"Support content could not be loaded",loadErrorBody:"Refresh the page to try again. Documents remain available from the navigation.",retry:"Reload",record:"CardputerZero troubleshooting record",flowVersion:"Guide version",symptom:"Symptom",result:"Result",reportedSolved:"User reported resolved",needsSupport:"Unresolved or unable to continue; cause unconfirmed",answer:"User answer",unknown:"Not provided",extra:"Additional error message / time of occurrence:",draft:"Local preview record · Not submitted to support",editor:"Edit self-help flow (internal)"
    },
    ja: {
      nav:"サポート",preview:"ローカルテスト版",title:"問題を見つけて、続きを楽しもう。",intro:"お困りの症状を選び、順番に確認しましょう。解決しない場合も、確認した内容をまとめてサポートに伝えられます。",
      stages:["症状を選択","順番に確認","結果を確認"],scope:"",
      choose:"最も近い症状を選択",keys:"キー操作ガイド",docs:"ドキュメントを見る",back:"前の手順に戻る",all:"別の問題を選ぶ",check:"現在の確認",history:"確認済みの内容",path:"選択した経路",empty:"選択した回答がここに表示されます。",device:"デバイス情報",hardware:"ハードウェア",model:"モデル",modelFull:"CardputerZero",modelLite:"CardputerZero Lite",version:"OS バージョン（任意）",versionHint:"不明な場合は空欄",deviceNote:"パスワードなどの機密情報は入力しないでください。",unresolved:"サポートへの相談を準備しましょう",resolved:"問題の解決を確認しました",resolvedBody:"確認した手順と回答を記録しました。再発した場合の相談にも利用できます。",unresolvedBody:"確認した内容をまとめました。エラー表示などを追記し、普段お使いのサポート窓口にお伝えください。",report:"確認内容のまとめ（編集可能）",copy:"まとめをコピー",download:"テキストを保存",copied:"コピーしました。",copyFailed:"自動コピーを利用できません。下の内容を選択してコピーしてください。",downloaded:"ファイルを生成しました。ブラウザーのダウンロードをご確認ください。",local:"このページでは記録の作成のみ行います。問い合わせは送信されていません。",invalid:"この確認リンクは無効です",invalidBody:"症状または回答の順序が無効です。症状を選び直してください。",loadError:"サポートの内容を読み込めませんでした",loadErrorBody:"ページを再読み込みしてください。ドキュメントは上のメニューから開けます。",retry:"再読み込み",record:"CardputerZero トラブル確認記録",flowVersion:"ガイドの版",symptom:"症状",result:"結果",reportedSolved:"ユーザーが解決を確認",needsSupport:"未解決または確認を続行できない状態。原因は未確認",answer:"ユーザーの回答",unknown:"未入力",extra:"エラー表示・発生日時の補足：",draft:"ローカルテスト記録・未送信",editor:"セルフヘルプを編集（内部）"
    }
  };
  let epoch = 0;
  let dataPromise;
  const device = { osVersion: "", model: "cardputerzero" };
  const drafts = new Map();
  const symbols = { boot:"↥", display:"[ ]", keyboard:"⌘", cap:"◈", sdcard:"SD", charging:"↯", camera:"◎", system:"≋" };
  const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  const text = (value, locale) => value[locale] || value.en;
  function url(topic, answers = []) {
    return `#/support/${encodeURIComponent(topic)}${answers.length ? "/" + answers.join(".") : ""}`;
  }
  async function load() {
    if (!dataPromise) {
      dataPromise = fetch("site/support-flows.json?v=20261118-preview-8")
        .then((response) => {
          if (!response.ok) throw new Error("Support data unavailable");
          return response.json();
        }).then((data) => { globalThis.SupportModel.validateFlows(data); return data; })
        .catch((error) => { dataPromise = null; throw error; });
    }
    return dataPromise;
  }
  function shell(c, stage, body, stageLinks = []) {
    const steps = c.stages.map((label, i) => {
      const link = stageLinks[i];
      const content = link ? `<a href="${escape(link)}">${escape(label)}</a>` : escape(label);
      return `<li ${i===stage?'aria-current="step"':""}><b>0${i+1}</b>${content}</li>`;
    }).join("");
    return `<section class="route-panel support-page"><header class="support-heading"><p class="eyebrow">CARDPUTERZERO / SUPPORT</p><span class="support-tag">${c.preview}</span></header>
      <ol class="support-steps" aria-label="${c.nav}">${steps}</ol>${body}
      </section>`;
  }
  function home(data, locale, c) {
    return shell(c,0,`<div class="support-hero"><h1>${c.title}</h1><p>${c.intro}</p></div>
      <div class="support-grid" aria-label="${c.choose}">${data.topics.map((topic)=>`<a class="support-topic" href="${url(topic.id)}"><span class="support-symbol" aria-hidden="true">${escape(symbols[topic.id]||"?")}</span><div><h2>${escape(text(topic.title,locale))}</h2><p>${escape(text(topic.description,locale))}</p></div><span class="support-arrow" aria-hidden="true">→</span></a>`).join("")}</div>
      <div class="support-links support-footnote"><a href="#/documents/cp0-keys">${c.keys} ↗</a><a href="#/documents">${c.docs} ↗</a><a href="#/support-editor">${c.editor} ↗</a></div>`, ["#/support", "#/support", "#/support"]);
  }
  function side(data, session, locale, c) {
    return `<aside class="support-side"><section class="support-card"><h2>${c.history}</h2>${session.history.length?`<ol class="support-history">${session.history.map((entry)=>{
      const node=data.nodes[entry.nodeId];
      return `<li>${escape(text(node.title,locale))}<span>${escape(text(node.choices[entry.choiceIndex].label,locale))}</span></li>`;
    }).join("")}</ol>`:`<p class="support-footnote">${c.empty}</p>`}</section>
      <section class="support-card"><h2>${c.device}</h2><label class="support-field">${c.model}<select id="support-model" class="select"><option value="cardputerzero" ${device.model === "cardputerzero" ? "selected" : ""}>${c.modelFull}</option><option value="cardputerzero-lite" ${device.model === "cardputerzero-lite" ? "selected" : ""}>${c.modelLite}</option></select></label><label class="support-field">${c.version}<input id="support-version" class="input" maxlength="80" autocomplete="off" placeholder="${c.versionHint}" value="${escape(device.osVersion)}"></label><p class="support-footnote">${c.deviceNote}</p></section></aside>`;
  }
  function pathBar(data, session, topic, locale, c) {
    const items = [{ label: text(topic.title, locale), href: url(topic.id) }];
    const indices = [];
    session.history.forEach((entry) => {
      indices.push(entry.choiceIndex);
      const node = data.nodes[entry.nodeId];
      items.push({
        label: text(node.choices[entry.choiceIndex].label, locale),
        href: url(topic.id, indices.slice())
      });
    });
    return `<nav class="support-path" aria-label="${escape(c.path)}"><span class="support-path-label">${escape(c.path)}</span>${items.map((item, index) => `${index ? '<span class="support-path-separator" aria-hidden="true">›</span>' : ''}<a class="support-path-item" href="${escape(item.href)}"${index === items.length - 1 ? ' aria-current="step"' : ''}>${escape(item.label)}</a>`).join("")}</nav>`;
  }
  function summary(data, session, locale, c) {
    const topic=data.topics.find((item)=>item.id===session.topicId);
    return [c.record,c.draft,`${c.hardware}: ${device.model === "cardputerzero-lite" ? c.modelLite : c.modelFull}`,`${c.version}: ${device.osVersion||c.unknown}`,`${c.flowVersion}: ${data.version}`,`${c.symptom}: ${text(topic.title,locale)}`,"",
      ...session.history.map((entry,i)=>{const node=data.nodes[entry.nodeId];return `${i+1}. ${text(node.title,locale)}\n   ${c.answer}: ${text(node.choices[entry.choiceIndex].label,locale)}`;}),"",
      `${c.result}: ${session.nodeId==="$solved"?c.reportedSolved:c.needsSupport}`,"",c.extra,"",c.deviceNote].join("\n");
  }
  async function render(root, locale, route) {
    const token=++epoch;
    const c=copy[locale]||copy.en;
    let data;
    try { data=await load(); }
    catch (_) {
      if(token!==epoch) return;
      root.innerHTML=shell(c,0,`<div class="support-hero"><h1>${c.loadError}</h1><p>${c.loadErrorBody}</p><button type="button" class="button secondary" id="support-retry">${c.retry}</button></div>`);
      root.querySelector("#support-retry").addEventListener("click",()=>render(root,locale,route));
      return;
    }
    if(token!==epoch) return;
    let session;
    try {
      if(route.invalid || (!route.topic&&route.trail) || !/^(?:\d+(?:\.\d+)*)?$/.test(route.trail)) throw new Error("Invalid route");
      if(!route.topic) { root.innerHTML=home(data,locale,c); return; }
      const answers=route.trail?route.trail.split(".").map(Number):[];
      session=globalThis.SupportModel.replay(data,route.topic,answers);
    } catch (_) {
      root.innerHTML=shell(c,0,`<div class="support-hero"><h1>${c.invalid}</h1><p>${c.invalidBody}</p><a class="button secondary" href="#/support">${c.all}</a></div>`);
      return;
    }
    const topic=data.topics.find((item)=>item.id===session.topicId);
    const indices=session.history.map((entry)=>entry.choiceIndex);
    const terminal=session.nodeId.startsWith("$");
    const back=indices.length?url(topic.id,indices.slice(0,-1)):"#/support";
    let main;
    if(terminal) {
      const solved=session.nodeId==="$solved";
      main=`<p class="eyebrow">${escape(text(topic.title,locale))}</p><h1>${solved?c.resolved:c.unresolved}</h1><p>${solved?c.resolvedBody:c.unresolvedBody}</p><p class="support-note">${c.local}</p><label class="support-field" for="support-report">${c.report}</label><textarea id="support-report" class="support-report" maxlength="12000" spellcheck="false"></textarea><div class="support-actions"><button type="button" class="button" id="support-copy">${c.copy}</button><button type="button" class="button secondary" id="support-download">${c.download}</button></div><p id="support-status" class="support-status" role="status"></p><div class="support-links"><a class="support-back" href="${back}">← ${c.back}</a><a class="support-back" href="#/support">${c.all}</a></div>`;
    } else {
      const node=data.nodes[session.nodeId];
      main=`<p class="eyebrow">${escape(text(topic.title,locale))} / ${c.check} ${indices.length+1}</p><h1>${escape(text(node.title,locale))}</h1><p class="support-instruction">${escape(text(node.body,locale))}</p>${node.note?`<p class="support-note">${escape(text(node.note,locale))}</p>`:""}<nav class="support-choices" aria-label="${c.check}">${node.choices.map((choice,i)=>`<a class="support-choice ${choice.next==="$solved"?"solved":""}" href="${url(topic.id,[...indices,i])}"><span>${escape(text(choice.label,locale))}</span><span aria-hidden="true">→</span></a>`).join("")}</nav><a class="support-back" href="${back}">← ${c.back}</a>`;
    }
    const stageLinks = ["#/support", url(topic.id), terminal ? url(topic.id, indices) : url(topic.id)];
    root.innerHTML=shell(c,terminal?2:1,`<div class="support-layout"><article class="support-card">${pathBar(data,session,topic,locale,c)}${main}</article>${side(data,session,locale,c)}</div>`, stageLinks);
    const draftKey=`${data.version}:${topic.id}:${indices.join(".")}:${locale}:${device.osVersion}`;
    const report=root.querySelector("#support-report");
    if(report) {
      report.value=drafts.get(draftKey)||summary(data,session,locale,c);
      report.addEventListener("input",()=>{
        drafts.set(draftKey,report.value.slice(0,12000));
        if(drafts.size>20) drafts.delete(drafts.keys().next().value);
      });
      const status=root.querySelector("#support-status");
      root.querySelector("#support-copy").addEventListener("click",async()=>{
        try { await navigator.clipboard.writeText(report.value); status.textContent=c.copied; }
        catch (_) { report.focus(); report.select(); status.textContent=c.copyFailed; }
      });
      root.querySelector("#support-download").addEventListener("click",()=>{
        const file=new Blob([report.value],{type:"text/plain;charset=utf-8"});
        const link=document.createElement("a");
        const objectUrl=URL.createObjectURL(file);
        link.href=objectUrl; link.download=`cardputerzero-support-${topic.id}.txt`;
        document.body.append(link); link.click(); link.remove();
        setTimeout(()=>URL.revokeObjectURL(objectUrl),1000); status.textContent=c.downloaded;
      });
    }
    root.querySelector("#support-model").addEventListener("change",(event)=>{
      device.model=event.target.value === "cardputerzero-lite" ? "cardputerzero-lite" : "cardputerzero";
      if(report) {
        const modelLabel=device.model === "cardputerzero-lite" ? c.modelLite : c.modelFull;
        report.value=report.value.split("\n").map((line)=>line.startsWith(`${c.hardware}: `)?`${c.hardware}: ${modelLabel}`:line).join("\n");
      }
    });
    root.querySelector("#support-version").addEventListener("input",(event)=>{
      const previous=device.osVersion||c.unknown;
      device.osVersion=event.target.value.slice(0,80).replace(/[\r\n]/g," ");
      if(report) report.value=report.value.replace(`${c.version}: ${previous}`,`${c.version}: ${device.osVersion||c.unknown}`);
    });
  }
  window.CardputerSupport={render,cancel(){epoch++;}};
})();
