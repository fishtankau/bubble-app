// Client-side Omni embed SSO URL signing.
//
// Static hosting (GitHub Pages) has no server to call Omni's
// /embed/sso/generate-url endpoint, so we sign the embed URL in the browser
// with the Web Crypto API. The algorithm below was verified byte-for-byte
// against Omni's own generate-url API (identical signatures for identical
// inputs) — see Omni docs: /embed/setup/standard-sso#manual-generation.
//
// Security note: this exposes the embed secret in the client bundle. That is
// acceptable here only because these are throwaway trial/demo credentials.

function randomNonce() {
  const a = new Uint8Array(16)
  crypto.getRandomValues(a)
  return Array.from(a, b => b.toString(16).padStart(2, '0')).join('')
}

function base64url(buffer) {
  const bytes = new Uint8Array(buffer)
  let str = ''
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i])
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hmacSha256Base64Url(secret, data) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return base64url(sig)
}

// Mirrors the param handling of the former /api/omni-embed-url server route,
// then signs locally instead of round-tripping to Omni. Returns a fully-signed
// embed login URL.
export async function signEmbedUrl(body = {}) {
  const { secret, contentPath } = body
  if (!secret || !contentPath) throw new Error('secret and contentPath are required')

  // trial.omniapp.co -> https://trial.embed-omniapp.co/embed/login
  const vanity = body.vanityDomain || 'trial.omniapp.co'
  const org = vanity.split('.')[0]
  const loginUrl = `https://${org}.embed-omniapp.co/embed/login`

  const externalId = body.externalId || 'fishtank-user-1'
  const name = body.name || 'Fishtank User'
  const nonce = randomNonce()

  // Optional params — RAW string values (no URL-encoding) go into both the
  // signed blob and the query string. They are signed in alphabetical order.
  const opt = {}
  if (body.email) opt.email = body.email
  const ua = body.userAttributes
  if (ua && typeof ua === 'object' && Object.keys(ua).length > 0) opt.userAttributes = JSON.stringify(ua)
  else if (typeof ua === 'string' && ua) opt.userAttributes = ua
  if (body.customThemeId) opt.customThemeId = body.customThemeId
  else if (body.customTheme) opt.customTheme = typeof body.customTheme === 'string' ? body.customTheme : JSON.stringify(body.customTheme)
  if (body.theme) opt.theme = body.theme
  if (body.prefersDark) opt.prefersDark = String(body.prefersDark)
  if (body.connectionRoles) opt.connectionRoles = typeof body.connectionRoles === 'string' ? body.connectionRoles : JSON.stringify(body.connectionRoles)
  if (body.mode) opt.mode = body.mode
  if (body.linkAccess) opt.linkAccess = typeof body.linkAccess === 'string' ? body.linkAccess : JSON.stringify(body.linkAccess)
  if (body.filterSearchParam) opt.filterSearchParam = body.filterSearchParam
  if (body.entity) opt.entity = body.entity
  if (body.entityFolderContentRole) opt.entityFolderContentRole = body.entityFolderContentRole
  if (body.groups) {
    if (Array.isArray(body.groups)) opt.groups = JSON.stringify(body.groups)
    else if (typeof body.groups === 'string' && body.groups.trim()) {
      const arr = body.groups.split(',').map(s => s.trim()).filter(Boolean)
      if (arr.length > 0) opt.groups = JSON.stringify(arr)
    }
  }

  const required = [loginUrl, contentPath, externalId, name, nonce]
  const optKeys = Object.keys(opt).sort()
  const blob = [...required, ...optKeys.map(k => opt[k])].join('\n')
  const signature = await hmacSha256Base64Url(secret, blob)

  const params = new URLSearchParams()
  params.set('contentPath', contentPath)
  params.set('externalId', externalId)
  params.set('name', name)
  params.set('nonce', nonce)
  params.set('signature', signature)
  for (const k of optKeys) params.set(k, opt[k])

  return `${loginUrl}?${params.toString()}`
}
