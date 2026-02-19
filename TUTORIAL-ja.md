# チュートリアル

Cosense (Scrapbox)の UserScript の開発環境を構築し、ブラウザ上で動かすまでの手順。

## 前提

- [Bun](https://bun.sh/) がインストール済み
  <!-- npmにしよう -->
- Chrome / Firefox に [Tampermonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) がインストール済み

### Tampermonkey とは

ブラウザ拡張機能の一つで、指定したページでカスタムスクリプトを実行できる。本ツールでは、Cosense の CSP を迂回してローカルサーバーからスクリプトを取得するための**配送役**として使う。開発対象のスクリプト自体は Tampermonkey 用ではなく Cosense UserScriptのこと。

## 1. プロジェクトを作成する

```bash
mkdir my-userscripts && cd my-userscripts
npm init -y
```

## 2. Tampermonkey 用のブートストラップを生成する

ターミナルで以下を実行:

```bash
npx cosense-userscript-dev loader
```

プロジェクトルートに `loader.user.js` が生成される。

## 3. Tampermonkey にブートストラップをインストールする

1. `loader.user.js` の内容をコピー
2. ブラウザの Tampermonkey アイコンをクリック → 「新規スクリプトを作成」
3. コピーした内容を貼り付け
4. `Ctrl+S`（`Cmd+S`）で保存

この登録は**初回のみ**。スクリプトの追加やライブラリの更新で Tampermonkey を触る必要はない。

## 4. Cosense UserScript を書く

`scripts/` ディレクトリを作り、TypeScript ファイルを置く。cosense` グローバルオブジェクトなど Cosense の API が使える。

```bash
mkdir scripts
```

```ts
// scripts/hello.ts — ページメニューにアイコンを追加する
cosense.PageMenu.addMenu({
  title: 'hello',
  image: 'https://i.gyazo.com/f5de23fe2d7effce0c158e5046e72927.png',
  onClick: () => alert('hello'),
});
```

## 5. 開発サーバーを起動する

```bash
npx cosense-userscript-dev
```

以下のように表示されれば成功:

```
Built 1 file(s) → dist/
Serving dist/ at http://localhost:3456
Watching scripts/ for changes...
```

この状態で `scripts/` 内のファイルを編集すると自動で再ビルドされ、ブラウザが自動でリロードされる。

## 6. 動作確認

1. Cosense（`https://scrapbox.io/`）にて任意のページを開く
2. 右側のページメニューに「hello」が追加されていれば成功

## 7. スクリプトを編集してみる

開発サーバーが動いたまま `scripts/hello.ts` を編集して保存する。

```ts
// scripts/hello.ts
cosense.PageMenu.addMenu({
  title: 'hello',
  image: 'https://i.gyazo.com/f5de23fe2d7effce0c158e5046e72927.png',
  onClick: () => alert('hello updated!!!!!!!!'),
});
```

**ブラウザが自動でリロードされ**、変更が反映される。

## 8. 完成したスクリプトを Cosense にデプロイする

開発が完了したら、ビルド済みの JavaScriptコード を Cosense のページに貼り付ける。

1. ビルドする（開発サーバー起動中ならすでにビルド済み）
   ```bash
   npx cosense-userscript-dev build
   ```
2. `dist/hello.js` の内容をコピー
3. Cosense 上で 自分のページを開き、以下のようにコードブロックを書く:

   ```
   code:hello.js
    // ここに dist/hello.js の内容を貼り付ける
   ```

## 9. クリーンアップ

開発サーバを停止する（`Ctrl+C`）。
開発中のスクリプトがクリーンアップされ、以降は Cosense に貼り付けたコードのみが実行される。

## 設定のカスタマイズ（任意）

デフォルト設定を変更したい場合は `cosense-dev.config.ts` をプロジェクトルートに作成:

```ts
// cosense-dev.config.ts
import { defineConfig } from 'cosense-userscript-dev';

export default defineConfig({
  port: 4000, // ポートを変更
  match: [
    'https://scrapbox.io/my-project/*', // 特定のプロジェクトだけに適用
  ],
});
```

設定を変更したら、開発サーバーの再起動が必要。ポートや `@match` を変更した場合のみ `loader` の再生成も必要。

## 最終的なプロジェクト構成

```
my-userscripts/
  scripts/             ← Cosense UserScript（TypeScript で記述）
    hello.ts
  dist/                ← 自動生成（.gitignore 推奨）
    hello.js
  loader.user.js       ← Tampermonkey ブートストラップ（初回のみ生成）
  cosense-dev.config.ts  ← 任意
  package.json
```

## Tips

- **`dist/` と `loader.user.js` は `.gitignore` に追加**する。いつでも再生成できる。
