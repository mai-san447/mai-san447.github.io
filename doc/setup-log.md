# セットアップ作業記録

## 日付: 2026-03-06

## 環境確認

### 既にインストール済みのツール
| ツール | バージョン | パス |
|--------|-----------|------|
| Git | 2.47.1 | /c/Program Files/nodejs/git |
| Node.js | v22.17.0 | /c/Program Files/nodejs/node |
| npm | 11.1.0 | /c/Program Files/nodejs/npm |
| npx | - | /c/Program Files/nodejs/npx |
| Python | 3.13.5 | /c/Python313/python |
| VS Code | - | /c/Users/mn547/AppData/Local/Programs/Microsoft VS Code/bin/code |
| Chocolatey | 2.4.1 | /c/ProgramData/chocolatey/bin |

| gh (GitHub CLI) | 2.87.3 | C:\Program Files\GitHub CLI\gh.exe |
| Claude CLI | VS Code拡張経由で使用中 | claude-code |

## 作業履歴

### 1. PATH確認
- 現在のPATHにはNode.js, Python, Git, VS Code等が含まれている
- NVM関連のパスあり（%NVM_HOME%, %NVM_SYMLINK%）

### 2. gh (GitHub CLI) セットアップ
- `choco install gh -y` → 管理者権限なしで実行したため失敗
- `winget install --id GitHub.cli` → 既にインストール済みと判明
- PATHに `C:\Program Files\GitHub CLI` を追加（ユーザー環境変数に永続化済み）
- `gh auth login` でGitHubにログイン完了
  - アカウント: mai-san447
  - プロトコル: HTTPS
  - スコープ: gist, read:org, repo, workflow

### 3. 動作確認
- `gh --version` → v2.87.3 OK
- `gh auth status` → mai-san447 でログイン済み OK
- `gh repo view` → mai-san447/maisan-447.github.io にアクセス OK

## セットアップ完了状況
- [x] gh のインストール・PATH追加
- [x] `gh auth login` でGitHubにログイン
- [x] 動作確認（`gh repo view` 等）
