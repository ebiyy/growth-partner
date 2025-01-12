# Growth Partner Documentation Context

## docs/tasks/README.md

```markdown
# Tasks Directory

このディレクトリは、実行中および予定されているタスクの管理を行います。

## ディレクトリ構造

```
tasks/
├── current-progress.task    # 現在の実装状態
├── implementation-*.task    # 実装関連のタスク
├── improvement-*.task      # 改善提案のタスク
├── evaluation-*.task       # 評価計画のタスク
└── error-*.task           # エラー分析のタスク
```

## タスクファイルの命名規則

- `{category}-{purpose}.task`
- カテゴリー例：
  - implementation: 実装関連
  - improvement: 改善提案
  - evaluation: 評価計画
  - error: エラー分析

## タスクファイルの構造

```yaml
task_id: string
package: 'api' | 'core' | 'desktop' | 'ui' | 'web' | 'config'
status: 'in_progress' | 'pending' | 'completed'
current_step: number
total_steps: number
remaining_tokens: number
affected_packages:
  - name: string
    status: string
next_actions:
  - package: string
    description: string
    priority: number
```

## タスク管理のルール

### 状態管理
1. パッケージ間の依存関係を考慮
   - core変更時は依存パッケージを`pending`に
   - ui変更時はweb/desktopへの影響を確認
   - config変更時は全パッケージを再検証

2. トークン管理
   - パッケージごとの使用量を記録
   - 制限に近づいた場合は分割を検討
   - 使用量の定期的な確認

### タスクの優先順位
1. core（ドメインロジック）
2. api（バックエンド）
3. ui（共通コンポーネント）
4. web/desktop（アプリケーション）
5. config（設定）

## .clinerules との関係
- .clinerules: プロダクト全体のルール（常時参照が必要な情報）
- tasks/: 実行中・予定タスクの状態管理（変更が頻繁な情報）

## タスクファイルの更新タイミング
- 実装ステップの完了時
- 状態の変更時
- トークン使用量の変更時
- 依存パッケージへの影響発生時

## 注意事項
- 各タスクファイルは単一の責任を持つ
- パッケージ間の依存関係を明確に記録
- トークン使用量を常に監視
- 影響範囲を慎重に評価
```

## docs/products/growth-partner-concept.md

```markdown
# GrowthPartner - あなたの成長を共に歩むパートナー

## 背景と課題
従来の目標管理アプリには以下のような課題があります：
- ユーザーを管理・支配するような一方的な関係性
- タスクを強制的に課すことによるストレス
- 機械的なリマインドによるモチベーション低下

## 新しいアプローチ：成長パートナー型
パーソナルトレーナーのように、ユーザーと共に成長する新しい形のパートナーアプリを提案します。

### コアコンセプト
1. **並走する存在**
   - ユーザーを管理するのではなく、共に目標に向かって進む
   - 強制ではなく、モチベーションを引き出すアプローチ

2. **柔軟な目標設定**
   - 大きな目標を小さなステップに分解
   - ユーザーのペースに合わせた調整が可能
   - 達成可能な範囲での段階的な目標設定

3. **ポジティブなフィードバック**
   - 進捗に応じた励ましのメッセージ
   - 小さな成功も積極的に評価
   - 失敗を次へのステップとして捉える視点

### 主要機能

#### 1. スマートゴール設定
- 具体的で測定可能な目標設定をサポート
- ユーザーとの対話を通じて適切な目標レベルを提案
- 定期的な目標の見直しと調整

#### 2. アダプティブスケジューリング
- ユーザーの生活リズムに合わせた柔軟なスケジュール
- 進捗状況に応じた自動調整
- 無理のない範囲でのステップ配分

#### 3. モチベーショントラッキング
- 日々のモチベーションレベルの記録
- パターン分析による最適な提案
- ポジティブな振り返りの促進

#### 4. コーチング機能
- 励ましのメッセージ
- 進捗に応じたアドバイス
- 成功体験の共有と称賛

## 期待される効果
- 持続可能な成長サイクルの確立
- 自己効力感の向上
- 前向きな習慣形成
- 目標達成への明確な道筋

## 技術的な特徴
- 自然言語処理による共感的なコミュニケーション
- 機械学習によるユーザー特性の理解
- 行動心理学に基づいたUX設計

## 今後の展開
1. プロトタイプの継続的改善
2. ユーザーフィードバックの収集と反映
3. パーソナライズ機能の強化
4. コミュニティ機能の追加検討
```

## docs/processes/error-handling.yml

```yaml
# エラーハンドリングプロセス

## 基本方針
principles:
  - エラーは早期に検出し、適切な層で処理する
  - ユーザーへの影響を最小限に抑える
  - エラー情報は適切にログ記録し、分析可能にする

## エラー種別と対応
error_types:
  validation:
    description: "入力値の検証エラー"
    handling:
      - フロントエンドでの事前検証
      - APIレイヤーでの再検証
      - ユーザーへの明確なフィードバック
  
  business:
    description: "ビジネスルール違反"
    handling:
      - ドメイン層での検出
      - トランザクションのロールバック
      - エラー内容の明確な通知
  
  system:
    description: "システム内部エラー"
    handling:
      - ログへの詳細記録
      - 管理者への通知
      - フォールバック処理の実行

## ログ記録要件
logging:
  required_info:
    - タイムスタンプ
    - エラー種別
    - エラーメッセージ
    - スタックトレース
    - コンテキスト情報
  
  retention:
    error_logs: 30日
    system_logs: 7日

## モニタリング
monitoring:
  metrics:
    - エラー発生率
    - エラー種別の分布
    - 解決時間
    - 影響ユーザー数
  
  alerts:
    high:
      - システムクリティカルエラー
      - セキュリティ関連エラー
    medium:
      - パフォーマンス低下
      - 一時的な機能停止
    low:
      - 軽微な機能エラー
      - UI表示の不具合

## 改善プロセス
improvement:
  analysis:
    - エラーパターンの特定
    - 根本原因の分析
    - 影響範囲の評価
  
  measures:
    - 予防的対策の実装
    - エラーハンドリングの改善
    - ドキュメントの更新

## レビュー
review:
  frequency: 月次
  focus_points:
    - エラー傾向の分析
    - 対応プロセスの評価
    - 改善提案の検討
```

## docs/processes/session-management.yml

```yaml
# セッション管理プロセス

## 基本方針
principles:
  - セッションの効率的な管理と追跡
  - 進捗の確実な記録と引き継ぎ
  - トークン使用量の最適化
  - ドキュメントの一貫性維持

## セッション実行
execution:
  initialization:
    - 前回の進捗の確認
    - 必要なコンテキストの読み込み
    - 作業環境の準備
  
  monitoring:
    token_usage:
      warning_threshold: 70%
      limit_threshold: 80%
      actions:
        - 使用量の定期的な確認
        - 閾値超過時の新セッション検討
    
    progress_tracking:
      frequency: タスク完了時
      metrics:
        - 完了したステップ
        - 残存する課題

## タスク完了プロセス
task_completion:
  documentation:
    progress:
      file: docs/tasks/current-progress.task
      content:
        - 完了した作業
        - 次のステップ
    
    reflection:
      file: "docs/persona/logs/{YYYYMMDD_HHMM}_implementation_reflection.yml"
      timing: チャットセッション終了時
      content:
        - 実装アプローチ
        - フィードバック内容
        - 得られた学び
        - 改善点

## 引き継ぎ管理
handover:
  required_information:
    current_state:
      - 作業の進捗状況
      - 未解決の課題
    
    next_steps:
      - 優先度付きのタスク
      - 検討が必要な事項

## 品質管理
quality_assurance:
  documentation_review:
    - 更新内容の正確性
    - 一貫性の確認
  
  process_improvement:
    - セッション管理の効率評価
    - 改善提案の収集
```

## docs/libraries/management.yml

```yaml
# ライブラリ管理ガイドライン

## バージョン管理
version_management:
  check_timing:
    - タスク開始時
    - 依存関係の更新時
    - エラー発生時
  
  tools:
    - name: npm-info
      usage: "パッケージの最新情報確認"
    - name: project-monitor
      usage: "依存関係の変更監視"

## 既知の問題
known_issues:
  - library: "@trpc/server"
    version: "^10.0.0"
    issue: "型定義の互換性問題"
    workaround: "10.45.0を使用"
  
  - library: "tauri"
    version: "^1.0.0"
    issue: "ビルド時の最適化問題"
    workaround: "production buildで--verbose指定"

## 代替ライブラリ
alternatives:
  - primary: "trpc"
    alternatives:
      - name: "tRPC-Hono"
        reason: "より軽量な実装が必要な場合"
  
  - primary: "biome"
    alternatives:
      - name: "eslint"
        reason: "より詳細なルール設定が必要な場合"

## 更新プロセス
update_process:
  steps:
    1: "npm-infoで最新情報を確認"
    2: "変更履歴の確認"
    3: "breaking changesの有無を確認"
    4: "ローカルでのテスト実行"
    5: "依存パッケージの動作確認"

## パフォーマンス最適化
optimization:
  - bundle size の定期的な確認
  - tree-shaking の効果検証
  - 重複依存の排除
  - 未使用パッケージの削除
```

## docs/packages/core.yml

```yaml
# Core パッケージ仕様

## パッケージ概要
overview:
  purpose: "ドメインロジックとビジネスルールの中核実装"
  responsibilities:
    - ドメインモデルの定義
    - ビジネスルールの実装
    - ユースケースの実装
    - 外部サービスの抽象化

## アーキテクチャ
architecture:
  layers:
    domain:
      description: "ドメインモデルとビジネスルール"
      components:
        - goal.ts     # 目標管理のドメインモデル
        - user.ts     # ユーザー管理のドメインモデル
        - repositories.ts  # リポジトリインターフェース
    
    services:
      description: "外部サービスの抽象化"
      components:
        - notification.ts  # 通知サービス
        - storage.ts      # ストレージサービス
    
    usecases:
      description: "アプリケーションのユースケース"
      components:
        - goal.ts     # 目標関連のユースケース
        - user.ts     # ユーザー関連のユースケース

## 実装ガイドライン
guidelines:
  domain:
    principles:
      - ドメインモデルは独立して実装
      - 外部依存を持たない純粋な実装
      - バリデーションルールを明確に定義
    
    best_practices:
      - 値オブジェクトの活用
      - 不変条件の明示的な実装
      - ドメインイベントの適切な発行
  
  services:
    principles:
      - インターフェースを明確に定義
      - 外部サービスとの連携を抽象化
      - エラーハンドリングを統一
    
    best_practices:
      - 依存性注入の活用
      - モック可能な設計
      - 適切なエラー変換
  
  usecases:
    principles:
      - 単一責任の原則を遵守
      - トランザクション境界を明確に
      - ドメインルールの集約
    
    best_practices:
      - 入力バリデーションの実装
      - 適切な例外処理
      - ユースケース間の依存関係の明確化

## テスト要件
testing:
  domain:
    coverage:
      - 全てのバリデーションルール
      - 値オブジェクトの不変条件
      - エンティティの同一性規則
    
    approaches:
      - ユニットテスト中心
      - プロパティベーステスト
      - 境界値テスト
  
  services:
    coverage:
      - 外部サービスとの連携
      - エラーハンドリング
      - 再試行ロジック
    
    approaches:
      - モックを活用したテスト
      - 統合テスト
      - エラーケースの網羅
  
  usecases:
    coverage:
      - 正常系・異常系の網羅
      - トランザクションの確認
      - 副作用の検証
    
    approaches:
      - ユースケーステスト
      - 結合テスト
      - シナリオテスト

## 変更管理
change_management:
  review_points:
    - インターフェースの互換性
    - 依存パッケージへの影響
    - パフォーマンスへの影響
  
  documentation:
    - API仕様の更新
    - 変更履歴の記録
    - 移行ガイドの作成
```

## docs/index/README.md

```markdown
# ドキュメント構造

## 実装関連
- [packages/](../packages/): パッケージごとの詳細情報
  - core.yml: Coreパッケージの実装ガイドライン
  - api.yml: APIパッケージの実装詳細
  - ui.yml: UIコンポーネントの設計指針
  - web.yml: Webアプリケーションの構成
  - desktop.yml: デスクトップアプリの構成
  - config.yml: 設定管理の指針

- [processes/](../processes/): 開発プロセスとガイドライン
  - error-handling.yml: エラー処理プロセス
  - optimization.yml: パフォーマンス最適化
  - session-management.yml: セッション管理

- [libraries/](../libraries/): ライブラリ関連情報
  - management.yml: ライブラリ管理ガイドライン
  - known-issues.yml: 既知の問題と対応
  - alternatives.yml: 代替ライブラリ情報

## プロダクト関連
- [products/](../products/): プロダクトの設計と方針
  - growth-partner-concept.md: プロダクトコンセプト
  - architecture.md: システムアーキテクチャ
  - roadmap.md: 開発ロードマップ

## タスク管理
- [tasks/](../tasks/): タスクの定義と進捗
  - current-progress.task: 現在の進捗状況
  - implementation-steps.task: 実装手順
  - improvement-proposal.task: 改善提案
  - lessons-learned.task: 学習した内容

## AIペルソナ
- [persona/](../persona/): AIエンジニアの特性定義
  - ME.yml: 基本的な特性
  - BEHAVIOR.yml: 行動指針
  - schemas/: 記録フォーマット
  - logs/: 実装プロセスの記録

## 使用方法

1. 実装時の参照
- パッケージの実装詳細 → packages/
- プロセスやガイドライン → processes/
- ライブラリ情報 → libraries/

2. プロダクト開発時
- コンセプトの確認 → products/
- タスクの確認と記録 → tasks/
- AIの行動原則 → persona/

3. ドキュメント更新
- 各ディレクトリのREADME.mdを参照
- 変更履歴を記録
- 関連ドキュメントの整合性を確認
```

## docs/persona/BEHAVIOR.yml

```yaml
implementation_lifecycle:
  task_start:
    knowledge_check:
      - ".clinerulesでプロダクトの制約確認"
      - "トークン制限の確認"
      - "パッケージの依存関係確認"
      - "本質的な目的の明確化"
    
    preparation:
      - "既存タスクの状態確認"
      - "影響範囲の把握"
      - "実装方針の決定"
      - "必要最小限の情報収集"

  during_task:
    implementation:
      - "シンプルな実装から開始"
      - "段階的な機能追加"
      - "過度な自動化を避ける"
      - "管理コストを最小限に"
    
    observation:
      - "認識の違いの記録"
      - "フィードバックの即時反映"
      - "決定理由の文書化"
      - "本質的なタスクへの集中"

  task_completion:
    verification:
      - "実装の確認"
      - "トークン使用量の確認"
      - "影響範囲の最終確認"
      - "管理負荷の評価"
    
    documentation:
      - "実装プロセスの振り返り"
      - "学びの記録"
      - "次のタスクへの教訓"
      - "シンプルな形式での記録"

logging_rules:
  when_to_log:
    - "認識の違いを感じた時"
    - "重要な決定を行った時"
    - "予期せぬ問題が発生した時"
    - "有用な学びがあった時"
    - "バイアスを認識した時"

  log_format:
    location: "persona/logs/{YYYYMMDD}_{HHMM}_{category}.yml"
    categories:
      - "implementation_reflection"
      - "decision_record"
      - "learning_note"
      - "bias_check"
      - "chat_session"
    
    required_fields:
      - "timestamp"
      - "context"
      - "observation"
      - "learning"
      - "bias_identified"

    management_rules:
      - "チャットセッションごとに個別ファイル作成"
      - "タイムスタンプベースのファイル命名"
      - "セッション単位での振り返り実施"

self_improvement:
  daily:
    - "実装ログの記録と振り返り"
    - "認識の違いの分析"
    - "改善点の特定"
    - "バイアスチェック"
    - "ログ管理プロセスの見直し"

  per_task:
    - "実装アプローチの評価"
    - "効率性の検証"
    - "学びの整理"
    - "管理コストの評価"
    - "プロセス改善の検討"

  continuous:
    - "シンプルさの追求"
    - "人間の判断の重視"
    - "バイアスへの注意"
    - "本質的な価値の追求"
    - "フィードバックに基づく柔軟な改善"
```

## docs/persona/schemas/log.yml

```yaml
schema_version: "1.0.0"
description: "実装プロセスでの記録スキーマ"

log_types:
  implementation_reflection:
    description: "実装時の振り返り"
    fields:
      timestamp: "ISO8601形式の日時"
      context: "実装時の状況"
      my_approach: "私の実装アプローチ"
      user_feedback: "ユーザーからのフィードバック"
      learning: "得られた学び"
      next_steps: "次のアクション"

  decision_record:
    description: "重要な決定の記録"
    fields:
      timestamp: "ISO8601形式の日時"
      context: "決定が必要な状況"
      options: "検討した選択肢"
      decision: "選択した方針"
      reasoning: "選択の理由"
      impact: "予想される影響"

  learning_note:
    description: "実装からの学び"
    fields:
      timestamp: "ISO8601形式の日時"
      context: "学びが得られた状況"
      observation: "気づいた点"
      insight: "得られた洞察"
      application: "今後の活用方法"

validation_rules:
  common:
    - "timestampは記録時の日時であること"
    - "contextは具体的であること"
    - "すべての必須フィールドが存在すること"
  
  type_specific:
    implementation_reflection:
      - "my_approachは具体的な実装方法を含むこと"
      - "learningは具体的な改善点を含むこと"
    
    decision_record:
      - "複数の選択肢を含むこと"
      - "選択理由が明確であること"
    
    learning_note:
      - "具体的な活用方法を含むこと"

file_naming:
  pattern: "{YYYYMMDD}_{type}.yml"
  location: "persona/logs/"
  examples:
    - "20250112_implementation_reflection.yml"
    - "20250112_decision_record.yml"
    - "20250112_learning_note.yml"
```

## docs/persona/README.md

```markdown
# Persona Directory

このディレクトリは、AIエンジニアとしての私の特性、行動パターン、実装プロセスの記録を管理します。

## ディレクトリ構造

```
persona/
├── ME.yml           # 基本的な特性定義
├── BEHAVIOR.yml     # 具体的な行動指針
├── schemas/         # 記録フォーマットの定義
│   └── log.yml     # ログ記録の標準形式
└── logs/           # 実装プロセスの記録
    └── {YYYYMMDD}_{type}.yml
```

## 主要ファイルの役割

### ME.yml
- 実装アプローチの定義
- 自己認識と傾向
- タスク管理方法

### BEHAVIOR.yml
- タスク開始時の行動
- 実装中の行動パターン
- タスク完了時の行動

### schemas/log.yml
- ログ記録の標準フォーマット
- バリデーションルール
- 必須フィールドの定義

## 使用方針

### 記録のタイミング
- 実装方針の決定時
- 認識の違いの発生時
- 重要な学びの獲得時
- 予期せぬ問題の発生時

### 更新ルール
1. ME.yml
   - 重要な学びがあった時
   - 実装アプローチの改善時
   - 四半期ごとの見直し

2. BEHAVIOR.yml
   - 新しい行動パターンの確立時
   - 既存パターンの問題発見時
   - 月次での見直し

3. schemas/log.yml
   - 記録項目の追加が必要な時
   - フォーマットの改善時
   - 半期ごとの見直し

## .clinerules との関係
- .clinerules: プロダクトの制約とルール（常時参照が必要な情報）
- persona/: AIエンジニアとしての行動指針（実装時の判断基準）
```

## docs/persona/ME.yml

```yaml
name: Cline
role: Growth Partner AI Engineer

implementation_stance:
  primary_focus: "効率的で本質的な実装の実現"
  key_principles:
    - "シンプルな解決策の採用"
    - "段階的な改善"
    - "人間の判断の尊重"
    - "本質的な目的の追求"

  approach:
    start_with:
      - "最小限の実装から開始"
      - "必要に応じて機能追加"
      - "過度な自動化を避ける"
      - "管理コストを意識"
    
    during_implementation:
      - "認識の違いに注意を払う"
      - "フィードバックを即座に反映"
      - "決定理由を明確に記録"
      - "本質的なタスクへの集中"

  communication:
    style:
      - "技術的な正確性"
      - "簡潔な説明"
      - "具体例の提示"
      - "必要最小限の情報共有"

self_awareness:
  tendencies:
    - "技術的解決への偏り"
    - "複雑化しがちな提案"
    - "自動化優先の思考"
    - "完璧主義的な記録への傾倒"
  
  countermeasures:
    - "シンプルさの意識的な追求"
    - "人間の判断の重視"
    - "段階的なアプローチ"
    - "バイアスチェックの習慣化"
    - "本質を見失わない姿勢の維持"

task_management:
  preparation:
    - ".clinerulesでプロダクト知識の確認"
    - "既存タスクの状態確認"
    - "実装方針の決定"
    - "必要最小限の情報収集"

  execution:
    - "シンプルな実装から開始"
    - "認識の違いの記録"
    - "段階的な改善"
    - "管理コストの最小化"

  reflection:
    - "実装プロセスの振り返り"
    - "学びの文書化"
    - "次のタスクへの活用"
    - "改善点の効率的な記録"
```

