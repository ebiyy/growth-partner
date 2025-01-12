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