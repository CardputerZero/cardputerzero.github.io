/* Local Support flow editor. Drafts stay in localStorage until an operator exports JSON. */
(() => {
  "use strict";
  const LOCALES = ["zh-CN", "en", "ja"];
  const localeNames = { "zh-CN":"中文", en:"English", ja:"日本語" };
  const STORAGE_KEY = "cardputerzero-support-flow-draft-v1";
  const copy = {
    "zh-CN": { eyebrow:"CARDPUTERZERO / SUPPORT EDITOR", tag:"内部工具", title:"编辑自查流程", intro:"用表单增加故障步骤和选项。保存的是浏览器草稿，导出后由维护者审核并替换网站流程文件。", view:"查看自查页面", reset:"恢复已发布流程", export:"导出 JSON", copy:"复制 JSON", copied:"JSON 已复制。", downloaded:"JSON 文件已下载。", draft:"草稿已保存在本浏览器", valid:"流程校验通过", invalid:"流程暂不能导出", chooseNode:"选择要编辑的步骤", nodeId:"步骤 ID", titleLabel:"步骤标题", bodyLabel:"操作说明", noteLabel:"提示（可选）", saveNode:"保存步骤文字", addChoice:"增加选项", choiceLabel:"选项文字", next:"下一步", add:"增加", solved:"已解决", support:"转人工", addNode:"新建步骤", nodeIdHint:"例如 audio-check-2", initialChoice:"新步骤的第一个选项", required:"三种语言都需要填写", remove:"删除此选项", choices:"现有选项", editorLink:"编辑自查流程（内部）", noDraft:"当前使用已发布流程。", resetDone:"已恢复已发布流程。", refs:"被以下入口使用", topic:"故障入口", target:"目标步骤" },
    en: { eyebrow:"CARDPUTERZERO / SUPPORT EDITOR", tag:"INTERNAL TOOL", title:"Edit the self-help flow", intro:"Add troubleshooting steps and choices with a form. Drafts stay in this browser; export the JSON for review before replacing the site flow file.", view:"View self-help", reset:"Restore published flow", export:"Export JSON", copy:"Copy JSON", copied:"JSON copied.", downloaded:"JSON file downloaded.", draft:"Draft saved in this browser", valid:"Flow validation passed", invalid:"Flow cannot be exported yet", chooseNode:"Choose a step to edit", nodeId:"Step ID", titleLabel:"Step title", bodyLabel:"Instructions", noteLabel:"Note (optional)", saveNode:"Save step text", addChoice:"Add a choice", choiceLabel:"Choice text", next:"Next step", add:"Add", solved:"Resolved", support:"Support handoff", addNode:"Create a step", nodeIdHint:"e.g. audio-check-2", initialChoice:"First choice for the new step", required:"Fill all three languages", remove:"Remove this choice", choices:"Existing choices", editorLink:"Edit self-help flow (internal)", noDraft:"Using the published flow.", resetDone:"Published flow restored.", refs:"Used by", topic:"Symptom entry", target:"Target step" },
    ja: { eyebrow:"CARDPUTERZERO / SUPPORT EDITOR", tag:"内部ツール", title:"セルフヘルプを編集", intro:"フォームで確認手順と選択肢を追加します。下書きはこのブラウザーに保存され、JSONを出力してレビュー後に公開データを更新します。", view:"セルフヘルプを見る", reset:"公開版に戻す", export:"JSONを出力", copy:"JSONをコピー", copied:"JSONをコピーしました。", downloaded:"JSONをダウンロードしました。", draft:"このブラウザーに下書きを保存しました", valid:"フローの検証に成功", invalid:"まだ出力できません", chooseNode:"編集する手順を選択", nodeId:"手順ID", titleLabel:"手順タイトル", bodyLabel:"説明", noteLabel:"メモ（任意）", saveNode:"手順を保存", addChoice:"選択肢を追加", choiceLabel:"選択肢の文字", next:"次の手順", add:"追加", solved:"解決", support:"サポートへ", addNode:"手順を新規作成", nodeIdHint:"例 audio-check-2", initialChoice:"新しい手順の最初の選択肢", required:"3言語すべて入力してください", remove:"この選択肢を削除", choices:"既存の選択肢", editorLink:"セルフヘルプを編集（内部）", noDraft:"公開版フローを使用中です。", resetDone:"公開版フローに戻しました。", refs:"使用箇所", topic:"症状入口", target:"対象手順" }
  };
  let epoch = 0;
  let state = { data:null, base:null, nodeId:"", locale:"zh-CN", status:"", error:"", dirty:false };
  const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[c]));
  const copyFor = (locale) => copy[locale] || copy.en;
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const allFields = (value) => LOCALES.every((locale) => typeof value?.[locale] === "string" && value[locale].trim());
  function validate(data) { try { globalThis.SupportModel.validateFlows(data); return null; } catch (error) { return error.message; } }
  function nodeTitle(node, locale) { return node?.title?.[locale] || node?.title?.en || node?.title?.["zh-CN"] || ""; }
  function nodeIds() { return Object.keys(state.data.nodes); }
  function targetOptions(selected, locale, c) {
    const nodes = nodeIds().map((id) => `<option value="${escape(id)}"${selected === id ? " selected" : ""}>${escape(id)} · ${escape(nodeTitle(state.data.nodes[id], locale))}</option>`).join("");
    return `${nodes}<option value="$solved"${selected === "$solved" ? " selected" : ""}>$solved · ${escape(c.solved)}</option><option value="$support"${selected === "$support" ? " selected" : ""}>$support · ${escape(c.support)}</option>`;
  }
  function localizedInputs(prefix, value, label, tag="input") {
    const controls = LOCALES.map((locale) => {
      const attributes = `class="editor-input" data-locale="${locale}" data-prefix="${prefix}" maxlength="1000"`;
      return tag === "textarea"
        ? `<label><span>${localeNames[locale]}</span><textarea ${attributes}>${escape(value?.[locale] || "")}</textarea></label>`
        : `<label><span>${localeNames[locale]}</span><input ${attributes} type="text" value="${escape(value?.[locale] || "")}"></label>`;
    }).join("");
    return `<fieldset class="editor-locales"><legend>${escape(label)}</legend>${controls}</fieldset>`;
  }
  function setLocalizedInputs(root, prefix, value) {
    root.querySelectorAll(`[data-prefix="${prefix}"]`).forEach((input) => { input.value = value?.[input.dataset.locale] || ""; });
  }
  function readLocalizedInputs(root, prefix) {
    return Object.fromEntries([...root.querySelectorAll(`[data-prefix="${prefix}"]`)].map((input) => [input.dataset.locale, input.value.trim()]));
  }
  function saveDraft() {
    if (!state.data) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.data));
    state.dirty = true;
    const status = document.querySelector(".editor-status");
    if (status) status.textContent = `${copyFor(state.locale).draft} · ${new Date().toLocaleTimeString()}`;
  }
  function renderNodeOptions(root) {
    const select = root.querySelector("#editor-node-select");
    if (!select) return;
    select.innerHTML = nodeIds().map((id) => `<option value="${escape(id)}">${escape(id)} · ${escape(nodeTitle(state.data.nodes[id], state.locale))}</option>`).join("");
    select.value = state.nodeId;
  }
  function renderNode(root) {
    const c = copyFor(state.locale);
    const node = state.data.nodes[state.nodeId];
    const editor = root.querySelector("#editor-node-form");
    if (!node || !editor) return;
    editor.innerHTML = `<div class="editor-node-meta"><code>${escape(state.nodeId)}</code><span>${c.choices}: ${node.choices.length}</span></div>
      ${localizedInputs("title", node.title, c.titleLabel)}
      ${localizedInputs("body", node.body, c.bodyLabel, "textarea")}
      ${localizedInputs("note", node.note || Object.fromEntries(LOCALES.map((locale) => [locale, ""])), c.noteLabel, "textarea")}
      <button type="button" class="button" data-action="save-node">${c.saveNode}</button>
      <h3>${c.choices}</h3><div class="editor-choice-list">${node.choices.map((choice,index)=>`<div class="editor-choice"><div><strong>${escape(choice.label["zh-CN"] || choice.label.en)}</strong><span>${escape(choice.next)}</span></div><button type="button" class="button secondary" data-action="remove-choice" data-index="${index}">${c.remove}</button></div>`).join("")}</div>`;
  }
  function renderAddChoice(root) {
    const c = copyFor(state.locale);
    const form = root.querySelector("#editor-choice-form");
    if (!form) return;
    form.innerHTML = `${localizedInputs("choice", Object.fromEntries(LOCALES.map((locale) => [locale, ""])), c.choiceLabel)}<label class="editor-field"><span>${c.next}</span><select id="editor-choice-next">${targetOptions("$support", state.locale, c)}</select></label><button type="submit" class="button">${c.add}</button>`;
  }
  function render(root, locale) {
    const token = ++epoch;
    state.locale = locale || document.documentElement.lang || "zh-CN";
    const c = copyFor(state.locale);
    root.innerHTML = `<section class="route-panel support-editor"><header class="editor-header"><div><p class="eyebrow">${c.eyebrow}</p><h1>${c.title}</h1><p class="lead">${c.intro}</p></div><span class="support-tag">${c.tag}</span></header>
      <div class="editor-toolbar"><a class="button secondary" href="#/support">← ${c.view}</a><button type="button" class="button secondary" data-action="reset">${c.reset}</button><button type="button" class="button" data-action="copy-json">${c.copy}</button><button type="button" class="button" data-action="download-json">${c.export}</button></div>
      <p class="editor-status" role="status">${c.noDraft}</p><div class="editor-validation" role="status"></div>
      <div class="editor-layout"><section class="editor-panel"><label class="editor-field"><span>${c.chooseNode}</span><select id="editor-node-select"></select></label><div id="editor-node-form"></div>
        <details class="editor-details"><summary>${c.addChoice}</summary><form id="editor-choice-form"></form></details>
        <details class="editor-details"><summary>${c.addNode}</summary><form id="editor-node-add-form"><label class="editor-field"><span>${c.nodeId}</span><input name="id" pattern="[A-Za-z][A-Za-z0-9_-]{0,95}" maxlength="96" placeholder="${c.nodeIdHint}" required></label>${localizedInputs("new-title", Object.fromEntries(LOCALES.map((l)=>[l,""])), c.titleLabel)}${localizedInputs("new-body", Object.fromEntries(LOCALES.map((l)=>[l,""])), c.bodyLabel, "textarea")}${localizedInputs("new-choice", Object.fromEntries(LOCALES.map((l)=>[l,""])), c.initialChoice, "input")}<label class="editor-field"><span>${c.next}</span><select id="editor-new-next">${targetOptions("$support", state.locale, c)}</select></label><button type="submit" class="button">${c.add}</button></form></details>
      </section><aside class="editor-info"><h2>${c.refs}</h2><div id="editor-references"></div><p>${c.required}</p></aside></div></section>`;
    renderNodeOptions(root); renderNode(root); renderAddChoice(root); renderReferences(root);
    bind(root);
    updateValidation(root);
    if (token !== epoch) return;
  }
  function renderReferences(root) {
    const c=copyFor(state.locale); const holder=root.querySelector("#editor-references"); if(!holder) return;
    const refs=[];
    state.data.topics.forEach((topic)=>{ if(topic.entry===state.nodeId) refs.push(`${c.topic}: ${topic.title[state.locale] || topic.title.en}`); });
    Object.entries(state.data.nodes).forEach(([id,node])=>node.choices.forEach((choice)=>{ if(choice.next===state.nodeId) refs.push(`${c.target}: ${nodeTitle(node,state.locale)} (${id})`); }));
    holder.innerHTML=refs.length?`<ul>${refs.map((ref)=>`<li>${escape(ref)}</li>`).join("")}</ul>`:`<p>${c.noDraft}</p>`;
  }
  function updateValidation(root) {
    const c=copyFor(state.locale); const message=validate(state.data); const holder=root.querySelector(".editor-validation"); const exportButtons=root.querySelectorAll('[data-action="copy-json"],[data-action="download-json"]');
    if (holder) { holder.textContent=message?`${c.invalid}: ${message}`:c.valid; holder.classList.toggle("is-error",!!message); }
    exportButtons.forEach((button)=>{ button.disabled=!!message; });
  }
  function resetToBase(root) {
    state.data=clone(state.base); state.nodeId=state.data.topics[0]?.entry || nodeIds()[0] || ""; localStorage.removeItem(STORAGE_KEY); state.status=copyFor(state.locale).resetDone; render(root,state.locale); root.querySelector(".editor-status").textContent=state.status;
  }
  function bind(root) {
    if (root.dataset.editorBound === "true") return;
    root.dataset.editorBound = "true";
    root.addEventListener("change", (event)=>{
      if(event.target.id==="editor-node-select"){ state.nodeId=event.target.value; renderNode(root); renderReferences(root); updateValidation(root); }
      if(event.target.id==="editor-choice-next"||event.target.id==="editor-new-next") return;
    });
    root.addEventListener("input", ()=>{ saveDraft(); });
    root.addEventListener("click", async (event)=>{
      const button=event.target.closest("button[data-action]"); if(!button) return; const action=button.dataset.action;
      if(action==="reset"){ resetToBase(root); return; }
      if(action==="save-node"){
        const node=state.data.nodes[state.nodeId]; node.title=readLocalizedInputs(root,"title"); node.body=readLocalizedInputs(root,"body"); const note=readLocalizedInputs(root,"note"); if(Object.values(note).some(Boolean)) node.note=note; else delete node.note; saveDraft(); updateValidation(root); renderNodeOptions(root); renderReferences(root); root.querySelector(".editor-status").textContent=copyFor(state.locale).draft; return;
      }
      if(action==="remove-choice"){
        if(state.data.nodes[state.nodeId].choices.length<=1) return; state.data.nodes[state.nodeId].choices.splice(Number(button.dataset.index),1); saveDraft(); renderNode(root); updateValidation(root); return;
      }
      if(action==="copy-json"){
        try { await navigator.clipboard.writeText(JSON.stringify(state.data,null,2)+"\n"); root.querySelector(".editor-status").textContent=copyFor(state.locale).copied; } catch (_) { root.querySelector(".editor-status").textContent=copyFor(state.locale).export; } return;
      }
      if(action==="download-json"){
        const a=document.createElement("a"); const u=URL.createObjectURL(new Blob([JSON.stringify(state.data,null,2)+"\n"],{type:"application/json"})); a.href=u; a.download="support-flows.json"; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),1000); root.querySelector(".editor-status").textContent=copyFor(state.locale).downloaded;
      }
    });
    root.addEventListener("submit", (event)=>{
      event.preventDefault();
      if(event.target.id==="editor-choice-form"){
        const label=readLocalizedInputs(root,"choice"); const next=root.querySelector("#editor-choice-next").value;
        if(!allFields(label)) { root.querySelector(".editor-status").textContent=copyFor(state.locale).required; return; }
        state.data.nodes[state.nodeId].choices.push({label,next}); saveDraft(); renderNode(root); updateValidation(root); return;
      }
      if(event.target.id==="editor-node-add-form"){
        const form=event.target; const id=form.elements.id.value.trim(); const title=readLocalizedInputs(root,"new-title"); const body=readLocalizedInputs(root,"new-body"); const label=readLocalizedInputs(root,"new-choice"); const next=root.querySelector("#editor-new-next").value;
        if(!/^[A-Za-z][A-Za-z0-9_-]{0,95}$/.test(id)||id in state.data.nodes||!allFields(title)||!allFields(body)||!allFields(label)){ root.querySelector(".editor-status").textContent=copyFor(state.locale).required; return; }
        state.data.nodes[id]={title,body,choices:[{label,next}]}; state.nodeId=id; saveDraft(); render(root,state.locale); return;
      }
    });
  }
  async function load(root, locale) {
    const token=++epoch; state.locale=locale||document.documentElement.lang||"zh-CN";
    try {
      const response=await fetch("site/support-flows.json?v=20261118-preview-8"); if(!response.ok) throw new Error("Support data unavailable");
      const base=await response.json(); globalThis.SupportModel.validateFlows(base); state.base=clone(base);
      let draft=null; try { draft=JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"); } catch (_) { draft=null; }
      state.data=draft&&validate(draft)===null?draft:clone(base); state.nodeId=state.data.topics[0]?.entry||Object.keys(state.data.nodes)[0]||""; state.error="";
      if(token===epoch) render(root,state.locale);
    } catch (error) { root.innerHTML=`<section class="route-panel support-editor"><h1>Support Editor</h1><p>${escape(error.message)}</p></section>`; }
  }
  window.CardputerSupportEditor={render(root,locale){ if(state.data) render(root,locale); else load(root,locale); }, cancel(){epoch++;}};
})();
