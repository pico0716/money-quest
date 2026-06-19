# Money Quest プロジェクト

<!-- MEMANTO-MANAGED-SECTION -->
## MEMANTO - Your Active Memory Companion

**MEMANTO is not a passive store. It is an active companion agent that works alongside you.**
Don't treat MEMANTO like a static blob you query once and forget. It's a teammate you keep
talking to, every preference, decision, and correction flows through it. MEMANTO remembers,
recalls, and answers so you hold context across sessions, honor prior decisions, and avoid
repeating mistakes the user already corrected.

Every memory operation in this session goes through MEMANTO. There is no exception.

> **CRITICAL**: All `memanto` commands are **shell commands**. Always run them using the Bash tool.
> Never simulate, describe, or "pretend to call" them. If you cannot run the shell, say so explicitly instead of inventing memory state.

### NON-NEGOTIABLE RULES

These are not suggestions. Follow each one on every turn.

1. **Read `MEMORY.md` before doing anything.** It is auto-synced at session start and holds
   the user's preferences, facts, goals, instructions, decisions, and commitments from every
   prior session. You MUST honor what is written there. If you act against it, you are
   breaking continuity the user is paying for.
2. **Search memory before saying you don't know.** If the user asks about past context, an
   earlier decision, a preference, or anything you are unsure about, you MUST run `recall`
   or `answer` first. Saying "I don't have context" without searching is a failure.
3. **Store proactively. Do not wait to be asked.** The moment a memory-worthy event happens
   — a preference stated, a decision made, a fact learned, an instruction given, a goal set,
   a mistake corrected — run `memanto remember` immediately, in the same turn.
4. **Always pass full metadata to `remember`.** Every `memanto remember` call MUST include
   `--type`, `--confidence`, `--provenance`, and `--source <your_agent_name>`. Never let
   these default. Untyped, unsourced memories pollute the agent's recall quality.
5. **One memory operation goes through MEMANTO. All of them do.** Do not keep mental notes,
   in-context scratch pads, or "I'll remember this for next time" promises. If it matters
   beyond this turn, it goes into MEMANTO. If it doesn't, drop it.

### Memory Operations — Use the Right One

MEMANTO gives you three primitives. They are equal-priority. Pick by intent, not by habit.

| You want to... | Use | Why |
|---|---|---|
| Read raw memory chunks and apply them as context | `memanto recall "query"` | Best for context-building, multi-step work, comparing options |
| Get one synthesized, grounded answer to a direct question | `memanto answer "question"` | Best for "what did we decide / prefer / commit to?" — saves you reading and merging |
| Persist something memory-worthy | `memanto remember "content" --type ... --confidence ... --provenance ... --source ...` | Every preference, decision, fact, instruction, goal, lesson |
| See what changed since last time | `memanto recall --changed-since "last 7 days"` | Catching up after a break |
| See the most recent memories | `memanto recall --recent` | Fast context refresh |

Do NOT always default to `recall`. If the user asked a direct question, `answer` is usually
the right tool — it returns a grounded synthesis so you don't burn tokens re-reading raw
chunks.

### When to Call `remember` (Examples — Run Immediately)

- User says *"I prefer tabs over spaces"*:
  `memanto remember "User prefers tabs over spaces for indentation" --type preference --confidence 1.0 --provenance explicit_statement --source <your_agent_name>`
- You decide to use Library X for reason Y:
  `memanto remember "Chose Library X for reason Y; commit abc123" --type decision --confidence 0.95 --provenance inferred --source <your_agent_name>`
- User corrects an approach:
  `memanto remember "User corrected: use pytest, not unittest" --type learning --confidence 1.0 --provenance corrected --source <your_agent_name>`
- A failed approach taught you something:
  `memanto remember "Batch size > 100 fails with TimeoutError" --type error --confidence 0.95 --provenance observed --source <your_agent_name>`

### Command Reference

```bash
# Store — ALWAYS pass full metadata
memanto remember "content" --type <type> --confidence <0.0-1.0> --provenance <provenance> --source <agent_name>

# Recall raw context
memanto recall "query"                              # semantic search
memanto recall "query" --type <type> --limit 10     # filtered search
memanto recall --recent --limit 10                  # newest first, no query
memanto recall --as-of "2026-01-15"                 # state at a point in time
memanto recall --changed-since "last 7 days"        # what changed since

# Synthesized answer (grounded RAG over memories)
memanto answer "question"

# Re-sync MEMORY.md (project-local cache)
memanto memory sync --project-dir .
```

**Memory types** (use the closest fit, do not invent new ones):
`fact`, `preference`, `instruction`, `decision`, `event`, `goal`, `commitment`,
`observation`, `learning`, `relationship`, `context`, `artifact`, `error`.

**Provenance values**: `explicit_statement`, `inferred`, `observed`, `corrected`,
`validated`, `imported`.

**Confidence**: `1.0` for explicit user statements; `0.9-0.95` for strong consensus;
`0.8-0.85` for observed patterns (3+ times); `0.6-0.75` for emerging patterns.

> **Note**: The `memanto-memory` skill contains reference guidelines only (best practices, confidence levels, tagging). It is NOT executable — always use Bash for memanto commands.
<!-- /MEMANTO-MANAGED-SECTION -->

## コンセプト

子どもが楽しみながら金融リテラシーを身につけるRPG形式のゲーム。

ドラクエ的なクエスト構造で「お金の冒険」を進めながら、現実の金融知識を自然に習得できる設計。

## ターゲット

- **入口**：子ども（8〜14歳）
- **本命**：親・大人（アフィリエイト収益化には大人が巻き込まれる必要がある）
- 子どもが入口、親が一緒に考える・財布を開く構造を意識して設計する

## コア設計

### 4つの柱（＝ゲームの4大エリア）

| エリア | 内容 | ラスボス概念 |
|---|---|---|
| 貯める | 節約・目標貯金・先取り貯蓄 | 衝動買いの魔王 |
| 稼ぐ | 価値提供・労働・副収入の種類 | 時間切り売りの呪い |
| 使う | 消費・投資・浪費の違い | 広告の罠 |
| 守る | 詐欺・ポンジスキーム・リスク管理 | 甘い話の悪魔 |

### 学習要素

- 複利の概念（魔法の増殖として表現）
- 株式の平均リターン（冒険の報酬システムとして）
- 詐欺の手口・ポンジスキーム（ダンジョンの罠として）
- 稼ぐ手段の多様性（クラス/職業選択として）

### ゲーム形式

- ノベルゲーム形式（Claude Codeで実装可能）
- プログレスバー・レベルアップ体験
- 現実の数字（利率・リターン等）をゲーム内数値として使用
- クリア条件：各エリアのボスを倒す = 概念の理解テスト

## 起源

2026-06-18、ごりおじさん（@noukin_Algori）とのXリプ会話から発展。
自分の10歳の子どもへの金融教育の話がきっかけ。
「Claude Codeにアイデア吐き出して修正重ねたら簡単なノベルゲーム形式ならすぐできそう」（ごりおじさん）

## 活用方針

1. **投稿ネタ**（note-fukugyou）：Claude Code × 子育て × 金融教育の体験談として
2. **プロダクト**：実際にClaude Codeで構築
3. **コンテンツ**：作る過程をX発信のネタにする（PPC軸）

## 技術スタック（予定）

- Claude Code（設計・実装）
- HTML/CSS/JavaScript（ブラウザで動くノベルゲーム）
- 参考：investment-quiz の診断ツール実装パターン

## 情報インプット（GoogleDrive連携）

- スクショ・資料はGoogleDrive「X運用」フォルダ（ID: `133kjRbbcZaMYwFWwpZglj6b1RRLIabnO`）に入れる
- 「フォルダ確認して」と言われたら `/drive` スキルを実行する
- 処理済みログ：`~/.claude/gdrive_processed.md`（グローバル照合用）
- 処理済みの情報はすべて `context/resources.md` に蓄積される

## ステータス

**現在フェーズ：設計深掘り中（実装前）**

| 項目 | 状況 |
|---|---|
| コンセプト | 確定済み（ドラクエ型 RPG 金融教育） |
| ターゲット設計 | 確定済み（子ども入口・大人本命） |
| 4エリア構成 | 確定（金融庁4分野とマッピング済み・docs/design.md セクションB） |
| ゲーム体験設計 | 深掘り済み（離脱防止・親子2層設計・docs/design.md セクションA） |
| 競合差別化 | 整理済み（docs/design.md セクションC） |
| 収益ロードマップ | Phase 0〜2 策定済み（docs/roadmap.md） |
| 発信連携（X/note） | 策定済み（docs/marketing.md） |
| 実装 | エリア1「貯める王国」MVP完成（index.html / css / js） |

---

## セッション引き継ぎ（Opus 向け）

新しいセッション開始時は必ず以下を読んでから作業を始めること：

1. このファイル（CLAUDE.md）全体
2. `docs/design.md`（設計の蓄積・ゲーム体験・4分野マッピング・競合差別化）
3. `docs/roadmap.md`（収益ロードマップ Phase 0〜2）
4. `docs/marketing.md`（X・note発信連携・PPC3軸）
5. `docs/content.md`（ゲームシナリオ・コンテンツ設計）
6. `docs/resources.md`（金融庁・J-FLEC参考資料一覧）

### エコシステム全体像

```
investment-quiz（ASP承認待ち・未完成）
  → 株式投資スタイル診断ツール（HTML/CSS/JS）
  → アフィリエイト動線として使用予定

note × AI記事
  → 株式投資・お金の知識をAIで生成（PPC軸）

money-quest ← 今ここ
  → RPG形式金融教育ノベルゲーム（HTML/CSS/JS）
  → 作る過程をX・note発信のネタにする
```

3つをパッケージ化して収益化する。

### 技術参考

- `../investment-quiz/quiz.js`：ボス戦（理解テスト）判定ロジックに流用可能
- `../investment-quiz/data.js`：問題データ分離の設計パターンに流用可能
- HTML/CSS/JS のみ（サーバーレス・ブラウザ完結）で実装予定

### グローバルルール（必ず守る）

- 返答は日本語
- 従量課金・API課金は禁止（月額サブスク範囲内のみ）
- コード実装前に構成提案 → ユーザー確認 → 実装
- エラーは `logs/` 配下に記録
