/* ============================================================
 * engine.js — Money Quest ゲームエンジン（複数エリア対応）
 *   area1.js（AREA1）/ area2.js（AREA2）に依存する。
 * ============================================================ */

(function () {
  'use strict';

  const AREAS = [
    { data: AREA1, unlocked: true },
    { data: AREA2, unlocked: true },
    { data: AREA3, unlocked: true },
    { data: AREA4, unlocked: true },
  ];

  let currentArea = null;

  const state = {
    phase: 'select',  // select | story | boss | clear
    sceneIndex: 0,
    gold: 100,
    bossIndex: 0,
    bossCorrect: 0,
    lastGoldChange: 0,
  };

  const $app = document.getElementById('app');

  // ---- ユーティリティ ----

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function goldChangeHtml(change) {
    if (!change) return '';
    const cls  = change > 0 ? 'plus' : 'minus';
    const sign = change > 0 ? '+' : '';
    return `<div class="gold-change ${cls}">${sign}${change}コイン</div>`;
  }

  function resetState(area) {
    currentArea          = area;
    state.phase          = 'story';
    state.sceneIndex     = 0;
    state.gold           = area.startGold;
    state.bossIndex      = 0;
    state.bossCorrect    = 0;
    state.lastGoldChange = 0;
  }

  function render() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    switch (state.phase) {
      case 'select': renderSelect(); break;
      case 'story':  renderScene();  break;
      case 'boss':   renderBoss();   break;
      case 'clear':  renderClear();  break;
    }
  }

  // ---- エリア選択画面 ----

  function renderSelect() {
    const areaCards = AREAS.map((a, i) => {
      if (a.unlocked) {
        return `
          <button class="area-card" data-idx="${i}">
            <div class="area-card-num">エリア ${i + 1}</div>
            <div class="area-card-name">${esc(a.data.areaName.replace(/^エリア\d+：/, ''))}</div>
            <div class="area-card-boss">ラスボス：${esc(a.data.bossName)}</div>
          </button>`;
      } else {
        return `
          <div class="area-card area-card--locked">
            <div class="area-card-num">🔒</div>
            <div class="area-card-name">${esc(a.comingSoon.replace(/^エリア\d+：/, ''))}</div>
            <div class="area-card-boss">Coming Soon</div>
          </div>`;
      }
    }).join('');

    $app.innerHTML = `
      <div class="screen title-screen">
        <div class="game-logo">💰 Money Quest</div>
        <div class="game-tagline">
          RPG形式でお金の知識を冒険しながら学ぼう。<br>
          <span>子どもも大人も一緒にプレイできます。</span>
        </div>
        <div class="area-select-grid">${areaCards}</div>
        <div class="start-note">
          エリアを選んで冒険を始めよう。<br>
          <span>金融庁・J-FLECの公式データに基づいた内容です。</span>
        </div>
      </div>`;

    $app.querySelectorAll('.area-card[data-idx]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const area = AREAS[Number(btn.dataset.idx)];
        if (area.unlocked) {
          resetState(area.data);
          render();
        }
      });
    });
  }

  // ---- シナリオ画面 ----

  function renderScene() {
    const scene  = currentArea.scenes[state.sceneIndex];
    const total  = currentArea.scenes.length;
    const isLast = scene.next === 'boss';
    const pct    = Math.round((state.sceneIndex / total) * 100);
    const isSpeakerNarrator = scene.speaker === 'ナレーター';

    const infoHtml = scene.info
      ? `<div class="info-box">📚 ${esc(scene.info)}</div>`
      : '';

    const gcHtml = state.lastGoldChange !== 0
      ? goldChangeHtml(state.lastGoldChange)
      : '';

    let actionHtml;
    if (scene.choices) {
      actionHtml = `
        <div class="choices">
          ${scene.choices.map((c, i) =>
            `<button class="btn btn-choice" data-idx="${i}">${esc(c.text)}</button>`
          ).join('')}
        </div>`;
    } else {
      const label = isLast ? '⚔️ ボス戦へ！' : '次へ →';
      actionHtml = `<button class="btn btn-next" id="nextBtn">${label}</button>`;
    }

    $app.innerHTML = `
      <div class="screen">
        <div class="story-header">
          <div class="gold-display">💰 ${state.gold}</div>
          <div class="progress-wrap">
            <div class="progress-track">
              <div class="progress-fill" style="width:${pct}%"></div>
            </div>
          </div>
          <div class="scene-count">${state.sceneIndex + 1}/${total}</div>
        </div>
        <div class="dialogue-box">
          <div class="speaker-name ${isSpeakerNarrator ? 'narrator' : ''}">${esc(scene.speaker)}</div>
          ${gcHtml}
          <div class="dialogue-text">${esc(scene.text)}</div>
          ${infoHtml}
        </div>
        ${actionHtml}
      </div>`;

    state.lastGoldChange = 0;

    if (scene.choices) {
      $app.querySelectorAll('.btn-choice').forEach((btn) => {
        btn.addEventListener('click', () => {
          const c = scene.choices[Number(btn.dataset.idx)];
          if (c.goldChange) {
            state.gold += c.goldChange;
            state.lastGoldChange = c.goldChange;
          }
          state.sceneIndex = c.next;
          render();
        });
      });
    } else {
      document.getElementById('nextBtn').addEventListener('click', () => {
        if (scene.next === 'boss') {
          state.phase = 'boss';
        } else if (scene.next !== undefined) {
          state.sceneIndex = scene.next;
        } else {
          state.sceneIndex++;
        }
        // scene.goldChange（選択肢なしの場面での自動加算）
        if (scene.goldChange && !scene.choices) {
          state.gold += scene.goldChange;
          state.lastGoldChange = scene.goldChange;
        }
        render();
      });
    }
  }

  // ---- ボス戦 ----

  function renderBoss() {
    const quiz = currentArea.quiz;
    if (state.bossIndex >= quiz.length) {
      state.phase = 'clear';
      render();
      return;
    }

    const q      = quiz[state.bossIndex];
    const total  = quiz.length;
    const hpPct  = Math.round(((total - state.bossIndex) / total) * 100);
    const isLast = state.bossIndex === total - 1;

    $app.innerHTML = `
      <div class="screen">
        <div class="boss-header">
          <div class="boss-name">👹 ${esc(currentArea.bossName)}</div>
          <div class="boss-hp-track">
            <div class="boss-hp-fill" style="width:${hpPct}%"></div>
          </div>
          <div class="boss-hp-label">体力 ${hpPct}%</div>
        </div>
        <div class="q-counter">第 ${state.bossIndex + 1} 問 ／ 全 ${total} 問</div>
        <div class="question-box">${esc(q.question)}</div>
        <div class="choices" id="choices">
          ${q.choices.map((c, i) =>
            `<button class="btn btn-choice" data-idx="${i}" data-correct="${c.correct}">${esc(c.text)}</button>`
          ).join('')}
        </div>
      </div>`;

    $app.querySelectorAll('.btn-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        const isCorrect     = btn.dataset.correct === 'true';
        if (isCorrect) state.bossCorrect++;

        const selectedText  = btn.textContent.trim();
        const correctChoice = q.choices.find(c => c.correct);
        const resultCls     = isCorrect ? 'correct' : 'wrong';
        const resultText    = isCorrect ? '✅ 正解！ボスにダメージ！' : '❌ 不正解…でも学びがある！';
        const nextLabel     = isLast ? '⚔️ ボスを倒す！' : '次の攻撃へ →';

        document.getElementById('choices').outerHTML = `
          <div class="result-block">
            <div class="choice-result ${resultCls}">
              ${resultText}<br>
              <span style="font-weight:400;font-size:0.82rem;">${esc(selectedText)}</span>
            </div>
            ${!isCorrect ? `<div class="choice-result correct">✅ 正解：${esc(correctChoice.text)}</div>` : ''}
            <div class="explanation">📖 ${esc(q.explanation)}</div>
            <button class="btn btn-next" id="nextQBtn">${nextLabel}</button>
          </div>`;

        document.getElementById('nextQBtn').addEventListener('click', () => {
          state.bossIndex++;
          render();
        });
      });
    });
  }

  // ---- クリア画面 ----

  function renderClear() {
    const score   = state.bossCorrect;
    const total   = currentArea.quiz.length;
    const perfect = score === total;
    const scoreColor = perfect ? 'var(--success)' : 'var(--accent)';

    const currentIdx = AREAS.findIndex(a => a.data === currentArea);
    const nextAreaEntry = AREAS[currentIdx + 1];
    const hasNext = nextAreaEntry && nextAreaEntry.unlocked;

    const primaryBtn = hasNext
      ? `<button class="btn btn-primary" id="nextAreaBtn">次のエリアへ → ${esc(nextAreaEntry.data.areaName.replace(/^エリア\d+：/, ''))}</button>`
      : `<button class="btn btn-primary" id="mapBtn">エリア選択に戻る</button>`;

    $app.innerHTML = `
      <div class="screen clear-screen">
        <div class="clear-title">${perfect ? '🏆 完全勝利！' : '⚔️ 討伐完了！'}</div>
        <div class="clear-sub">${esc(currentArea.bossName)}を倒した！</div>

        <div class="stat-card">
          <div class="label">最終所持金</div>
          <div class="value">💰 ${state.gold}コイン</div>
        </div>

        <div class="stat-card">
          <div class="label">ボス戦スコア</div>
          <div class="value" style="color:${scoreColor}">${score} / ${total} 正解</div>
        </div>

        <div class="knowledge-list">
          <h3>今回学んだこと</h3>
          ${currentArea.knowledge.map(k => `<div class="knowledge-item">${esc(k)}</div>`).join('')}
        </div>

        ${primaryBtn}

        <div class="adult-card">
          <div class="label">📊 大人の方へ：あなたの投資スタイルは？</div>
          <a href="${encodeURI(currentArea.links.quiz)}" target="_blank" rel="noopener">
            投資スタイル診断をやってみる →
          </a>
        </div>

        <a class="btn btn-ghost" href="https://x.com/intent/tweet?text=${encodeURIComponent('Money Quest「' + currentArea.areaName + '」クリア！ボス戦 ' + score + '/' + total + '正解 💰 #MoneyQuest')}" target="_blank" rel="noopener">
          X でシェアする
        </a>

        <button class="btn btn-ghost" id="retryBtn">もう一度プレイする</button>
        ${hasNext ? `<button class="btn btn-ghost" id="mapBtn">エリア選択に戻る</button>` : ''}
      </div>`;

    if (hasNext) {
      document.getElementById('nextAreaBtn').addEventListener('click', () => {
        resetState(nextAreaEntry.data);
        render();
      });
    }

    document.getElementById('mapBtn').addEventListener('click', () => {
      state.phase = 'select';
      render();
    });

    document.getElementById('retryBtn').addEventListener('click', () => {
      resetState(currentArea);
      render();
    });
  }

  // ---- 起動 ----
  document.addEventListener('DOMContentLoaded', render);

})();
