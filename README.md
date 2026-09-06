# habit-tracker-site

習慣トラッカーのプライバシーポリシーとサポートページ。GitHub Pages で公開している。

- https://s-kuma-11.github.io/habit-tracker-site/privacy.html
- https://s-kuma-11.github.io/habit-tracker-site/support.html

## なぜアプリ本体と別のリポジトリか

アプリ本体（`habit-tracker`）は private のまま置いておきたい。GitHub Pages は無料プランでは public リポジトリでしか出せず、サポートページの連絡先に private リポジトリの Issues を書くと匿名の訪問者（ストアの審査担当）には 404 に見える。公開する必要があるページと連絡先だけをここに切り出している。

不具合の報告と要望はこのリポジトリの [Issues](https://github.com/s-kuma-11/habit-tracker-site/issues) で受ける。

## 構成

| ファイル | 役割 |
|---|---|
| `index.html` | 入口。2 枚のページへのリンク |
| `privacy.html` | プライバシーポリシー（ja / en） |
| `support.html` | サポート（ja / en）。連絡先とよくある質問 |
| `check-pages.mjs` | deploy 前の検査。canonical・3 点・連絡先の有無を見る |
| `.github/workflows/pages.yml` | PR で検査、main への push で Pages に出す |

ビルドは無い。素の HTML をそのまま出す。

Pages の Source は GitHub Actions。リポジトリを作ったときに API で有効にしてある（`gh api --method POST repos/s-kuma-11/habit-tracker-site/pages -f build_type=workflow`）。workflow の `GITHUB_TOKEN` では有効化できないので、作り直すときは同じ手順を踏む。

## 検査

```bash
node check-pages.mjs
```

ページの URL を変えるときは、`check-pages.mjs` の `REQUIRED_URLS` と、アプリ本体（`habit-tracker`）の `store/check-listing.mjs` の `REQUIRED_URLS` と `docs/store/listing.*.md` に貼ってある URL を一緒に直す。
