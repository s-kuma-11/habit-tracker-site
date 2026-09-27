# habit-tracker-site

習慣トラッカーのプライバシーポリシーとサポートページ。GitHub Pages で公開している。

- https://s-kuma-11.github.io/habit-tracker-site/privacy.html
- https://s-kuma-11.github.io/habit-tracker-site/support.html

## なぜアプリ本体と別のリポジトリか

アプリ本体（`habit-tracker`）は private のまま置いておきたい。GitHub Pages は無料プランでは public リポジトリでしか出せず、サポートページの連絡先に private リポジトリの Issues を書くと匿名の訪問者（ストアの審査担当）には 404 に見える。公開する必要があるページと連絡先だけをここに切り出している。

不具合の報告・要望・記録の削除の依頼は hello@habitgrass.com で受ける（ページの連絡先と同じ）。以前はこのリポジトリの Issues で受けていたが、記録をサーバに置くようになったのに合わせて独自ドメインのアドレスに差し替えた（habit-tracker の HT-149）。

## 構成

| ファイル | 役割 |
|---|---|
| `index.html` | 入口。2 枚のページへのリンク |
| `privacy.html` | プライバシーポリシー（ja / en）。記録をサーバに保管する・メールアドレスは記録の結び付けにだけ使う・いつでも書き出せる、の 3 点 |
| `support.html` | サポート（ja / en）。連絡先とよくある質問 |
| `check-pages.mjs` | deploy 前の検査。canonical・3 点・連絡先の有無と、以前の 3 点・連絡先が残っていないことを見る |
| `.github/workflows/pages.yml` | PR で検査、main への push で Pages に出す |

ビルドは無い。素の HTML をそのまま出す。

Pages の Source は GitHub Actions。リポジトリを作ったときに API で有効にしてある（`gh api --method POST repos/s-kuma-11/habit-tracker-site/pages -f build_type=workflow`）。workflow の `GITHUB_TOKEN` では有効化できないので、作り直すときは同じ手順を踏む。

## 検査

```bash
node check-pages.mjs
```

ページの URL を変えるときは、`check-pages.mjs` の `REQUIRED_URLS` と、アプリ本体（`habit-tracker`）の `store/check-listing.mjs` の `REQUIRED_URLS` と `docs/store/listing.*.md` に貼ってある URL を一緒に直す。
