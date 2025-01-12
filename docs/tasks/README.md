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