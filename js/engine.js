/* ============================================================
 * engine.js — Money Quest ゲームエンジン
 *   area1.js（AREA1）に依存する。
 * ============================================================ */

(function () {
  'use strict';

  const state = {
    phase: 'title',   // title | story | boss | clear
    sceneIndex: 0,
    gold: AREA1.startGold,
    bossIndex: 0,
    bossCorrect: 0,
    lastGoldChange: 0,
  };

  const $app = document.getElementById('app');
  const TOTAL_SCENES = AREA1.scenes.length;
  const TOTAL_BOSS   = AREA1.quiz.length;

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

  function render() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    switch (state.phase) {
      case 'title': renderTitle(); break;
      case 'story': renderScene(); break;
      case 'boss':  renderBoss();  break;
      case 'clear': renderClear(); break;
    }
  }

  // ---- タイトル画面 ----

  function renderTitle() {
    $app.innerHTML = `
      <div class="screen title-screen">
        <div class="game-logo">💰 Money Quest</div>
        <div class="game-tagline">
          RPG形式でお金の知識を冒険しながら学ぼう。<br>
          <span>子どもも大人も一緒にプレイできます。</span>
        </div>
        <div class="area-badge">
          <div class="label">今回の冒険</div>
          <div class="name">${esc(AREA1.areaName)}</div>
          <div class="boss">ラスボス：${esc(AREA1.bossName)}</div>
        </div>
        <div class="start-note">
          選択肢によって所持金が変わる。<br>
          ボス戦の知識クイズを制して魔王を倒せ！<br>
          <span>所持金：${state.gold}コイン でスタート</span>
        </div>
        <button class="btn btn-primary" id="startBtn">冒険を始める ▶</button>
      </div>`;

    document.getElementById('startBtn').addEventListener('click', () => {
      state.phase = 'story';
      render();
    });
  }

  // ---- シナリオ画面 ----

  function renderScene() {
    const scene = AREA1.scenes[state.sceneIndex];
    const isLast = state.sceneIndex === TOTAL_SCENES - 1;
    const pct    = Math.round((state.sceneIndex / TOTAL_SCENES) * 100);
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
          <div class="scene-count">${state.sceneIndex + 1}/${TOTAL_SCENES}</div>
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
        if (isLast) {
          state.phase = 'boss';
        } else {
          state.sceneIndex++;
        }
        render();
      });
    }
  }

  // ---- ボス戦 ----

  function renderBoss() {
    if (state.bossIndex >= TOTAL_BOSS) {
      state.phase = 'clear';
      render();
      return;
    }

    const q      = AREA1.quiz[state.bossIndex];
    const hpPct  = Math.round(((TOTAL_BOSS - state.bossIndex) / TOTAL_BOSS) * 100);
    const isLast = state.bossIndex === TOTAL_BOSS - 1;

    $app.innerHTML = `
      <div class="screen">
        <div class="boss-header">
          <div class="boss-name">👹 ${esc(AREA1.bossName)}</div>
          <div class="boss-hp-track">
            <div class="boss-hp-fill" style="width:${hpPct}%"></div>
          </div>
          <div class="boss-hp-label">体力 ${hpPct}%</div>
        </div>
        <div class="q-counter">第 ${state.bossIndex + 1} 問 ／ 全 ${TOTAL_BOSS} 問</div>
        <div class="question-box">${esc(q.question)}</div>
        <div class="choices" id="choices">
          ${q.choices.map((c, i) =>
            `<button class="btn btn-choice" data-idx="${i}" data-correct="${c.correct}">${esc(c.text)}</button>`
          ).join('')}
        </div>
      </div>`;

    $app.querySelectorAll('.btn-choice').forEach((btn) => {
      btn.addEventListener('click', () => {
        const isCorrect = btn.dataset.correct === 'true';
        if (isCorrect) state.bossCorrect++;

        $app.querySelectorAll('.btn-choice').forEach((b) => {
          b.disabled = true;
          if (b.dataset.correct === 'true') {
            b.style.background = 'rgba(74,222,128,0.18)';
            b.style.borderColor = 'var(--success)';
            b.style.color = 'var(--success)';
          }
        });

        const resultText = isCorrect
          ? '✅ 正解！魔王にダメージ！'
          : '❌ 不正解…でも学びがある！';
        const resultCls = isCorrect ? 'correct' : 'wrong';
        const nextLabel = isLast ? '⚔️ 魔王を倒す！' : '次の攻撃へ →';

        const resultBlock = document.createElement('div');
        resultBlock.className = 'result-block';
        resultBlock.innerHTML = `
          <div class="choice-result ${resultCls}">${resultText}</div>
          <div class="explanation">📖 ${esc(q.explanation)}</div>
          <button class="btn btn-next" id="nextQBtn">${nextLabel}</button>`;

        document.getElementById('choices').after(resultBlock);

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
    const total   = TOTAL_BOSS;
    const perfect = score === total;
    const scoreColor = score === total ? 'var(--success)' : 'var(--accent)';

    $app.innerHTML = `
      <div class="screen clear-screen">
        <div class="clear-title">${perfect ? '🏆 完全勝利！' : '⚔️ 討伐完了！'}</div>
        <div class="clear-sub">${esc(AREA1.bossName)}を倒した！</div>

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
          ${AREA1.knowledge.map(k => `<div class="knowledge-item">${esc(k)}</div>`).join('')}
        </div>

        <div class="adult-card">
          <div class="label">📊 大人の方へ：あなたの投資スタイルは？</div>
          <a href="${encodeURI(AREA1.links.quiz)}" target="_blank" rel="noopener">
            投資スタイル診断をやってみる →
          </a>
        </div>

        <a class="btn btn-ghost" href="https://x.com/intent/tweet?text=${encodeURIComponent('Money Quest「貯める王国」クリア！ボス戦 ' + score + '/' + total + '正解 💰')}" target="_blank" rel="noopener">
          X でシェアする
        </a>

        <button class="btn btn-ghost" id="retryBtn">もう一度プレイする</button>
      </div>`;

    document.getElementById('retryBtn').addEventListener('click', () => {
      state.phase      = 'title';
      state.sceneIndex = 0;
      state.gold       = AREA1.startGold;
      state.bossIndex  = 0;
      state.bossCorrect = 0;
      state.lastGoldChange = 0;
      render();
    });
  }

  // ---- 起動 ----
  document.addEventListener('DOMContentLoaded', render);

})();
