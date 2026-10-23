# 大人向け投資診断CTA（一時撤去・2026-10-23）

## 撤去の理由

各エリアのクリア画面にあった「大人の方へ：あなたの投資スタイルは？」→investment-quiz（`https://pico0716.github.io/investment-quiz/`）への診断リンクを撤去した。

理由：investment-quiz側の「診断のあと、どこに行けばいいか」という出口がまだ作り込めていないため。出口ができたら、この機能を復活させる想定。

## 元の実装（復活させるときはここに貼り戻す）

### js/engine.js（`primaryBtn` の直後、X シェアボタンの手前）

```js
        <div class="adult-card">
          <div class="label">📊 大人の方へ：あなたの投資スタイルは？</div>
          <a href="${encodeURI(currentArea.links.quiz)}" target="_blank" rel="noopener">
            投資スタイル診断をやってみる →
          </a>
        </div>
```

### css/style.css（`.knowledge-item::before` の後ろ）

```css
.adult-card {
  background: var(--surface);
  border: 1px solid var(--accent);
  border-radius: var(--radius);
  padding: 18px;
  width: 100%;
}

.adult-card .label { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; }

.adult-card a {
  color: var(--accent);
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  display: block;
}
```

## 補足

- 各エリアの `js/data/area*.js` にある `links.quiz`（investment-quiz のURL）はそのまま残してある（CTAの実装を貼り戻すだけで復活できるように）。
- 復活させるときは、investment-quiz側の出口（診断結果から次に何をすればいいか）が先にできていることを確認する。
