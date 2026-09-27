/**
 * 公開するページの形を確かめる。
 *
 * ストアの審査は、プライバシーポリシーと連絡先を開けることを要件にする。3 点や連絡先が
 * 欠けたまま公開されると、審査で落ちるまで気づけない。deploy の前にここで見る。
 *
 * 使い方:
 *   node check-pages.mjs
 *
 * 掲載文（habit-tracker の docs/store/listing.*.md）に貼る URL は、この一覧と同じでなければ
 * ならない。片方だけ直すと、申請フォームには死んだ URL を貼ることになる。
 */

import { readFileSync } from 'node:fs'
import { basename } from 'node:path'
import { exit } from 'node:process'

/** 申請フォームに貼る URL。ページの canonical はこれと一致させる。 */
const REQUIRED_URLS = [
  'https://s-kuma-11.github.io/habit-tracker-site/privacy.html',
  'https://s-kuma-11.github.io/habit-tracker-site/support.html',
]

/**
 * 連絡先。独自ドメインのアドレス（habit-tracker の docs/store/contact-email.md）で、匿名の訪問者
 * （ストアの審査担当）でも使える。以前はこのリポジトリの Issues を指していた（HT-149 で差し替え）。
 */
const CONTACT_URL = 'mailto:hello@habitgrass.com'

/** 以前の連絡先。残っていると、どちらに連絡すればよいか読み手が迷う。 */
const RETIRED_CONTACT = 'https://github.com/s-kuma-11/habit-tracker-site/issues'

/**
 * プライバシーポリシーが ja / en の両方で述べる 3 点。記録をサーバに保管する・メールアドレスは
 * 記録の結び付けにだけ使う・いつでも JSON で全件書き出せる（HT-149。habit-tracker の
 * store/privacy-points.mjs と同じ名前）。
 */
const PRIVACY_POINTS = ['server-storage', 'email-linking-only', 'export-anytime']

/** 記録を端末の中だけに置いていた時点の 3 点。残っていれば古い約束が載ったまま。 */
const RETIRED_POINTS = ['no-collection', 'local-only', 'export-user-initiated']

const LANGS = ['ja', 'en']

const problems = []

function fail(message) {
  problems.push(message)
}

function read(path) {
  try {
    return readFileSync(path, 'utf8')
  } catch {
    fail(`${path} が無い`)
    return null
  }
}

/** `<section lang="..">` の中身。無ければ null。 */
function langSection(html, lang) {
  const after = html.split(`<section lang="${lang}">`)[1]
  if (after === undefined) return null
  return after.split('</section>')[0]
}

/** 言語の節ごとに fn を呼ぶ。節が無ければそれを報告して飛ばす。 */
function eachLang(path, html, fn) {
  for (const lang of LANGS) {
    const body = langSection(html, lang)
    if (body === null) {
      fail(`${path}: lang="${lang}" の節が無い`)
      continue
    }
    fn(body, lang)
  }
}

/**
 * 連絡先へのリンクがあるか。href だけを見る。属性の並びや改行には依存させない
 * （整形で並びが変わっただけで落ちると、直す人が理由を探すことになる）。
 */
function hasContact(fragment) {
  return fragment.includes(`href="${CONTACT_URL}"`)
}

/**
 * ページが、掲載文に貼るのと同じ URL を自分の場所として名乗っていることを見る。
 *
 * habit-tracker 側の受け入れ条件（HT-68）の `curl ... | grep -q <slug>` は、これで満たす。
 * canonical の URL は小文字のファイル名で終わるので、一致が取れていれば小文字の slug は本文にある。
 */
function checkCanonical(path, html) {
  const file = basename(path)
  const url = REQUIRED_URLS.find((candidate) => candidate.endsWith(`/${file}`))
  if (url === undefined) {
    fail(`${path}: 申請フォームに貼る URL の一覧に ${file} が無い`)
    return
  }

  if (!html.includes(`<link rel="canonical" href="${url}" />`)) {
    fail(`${path}: canonical が「${url}」になっていない`)
  }
}

/** 入口のページ。ここから 2 枚に行けないと、公開しても人が辿り着けない。 */
function checkIndex(path) {
  const html = read(path)
  if (html === null) return

  for (const url of REQUIRED_URLS) {
    const href = `./${basename(url)}`
    if (!html.includes(`href="${href}"`)) {
      fail(`${path}: ${href} へのリンクが無い`)
    }
  }

  eachLang(path, html, () => {})
}

function checkPrivacy(path) {
  const html = read(path)
  if (html === null) return

  checkCanonical(path, html)

  eachLang(path, html, (body, lang) => {
    for (const point of PRIVACY_POINTS) {
      if (!body.includes(`data-point="${point}"`)) {
        fail(`${path}: lang="${lang}" に ${point} の記述が無い`)
      }
    }
    for (const point of RETIRED_POINTS) {
      if (body.includes(`data-point="${point}"`)) {
        fail(`${path}: lang="${lang}" に以前の記述（${point}）が残っている`)
      }
    }
  })

  // 連絡先は言語をまたいだ footer にある。
  if (!hasContact(html)) {
    fail(`${path}: 連絡先（${CONTACT_URL}）が無い`)
  }
}

function checkSupport(path) {
  const html = read(path)
  if (html === null) return

  checkCanonical(path, html)

  eachLang(path, html, (body, lang) => {
    if (!hasContact(body)) {
      fail(`${path}: lang="${lang}" に連絡先（${CONTACT_URL}）が無い`)
    }
  })
}

/** 以前の連絡先が残っていないか。 */
function checkRetiredContact(path) {
  const html = read(path)
  if (html === null) return
  if (html.includes(RETIRED_CONTACT)) fail(`${path}: 以前の連絡先（${RETIRED_CONTACT}）が残っている`)
}

checkIndex('index.html')
checkPrivacy('privacy.html')
checkSupport('support.html')
for (const path of ['index.html', 'privacy.html', 'support.html']) checkRetiredContact(path)

if (problems.length > 0) {
  for (const problem of problems) console.error(`NG  ${problem}`)
  exit(1)
}

console.log('OK  公開するページは形が揃っている')
