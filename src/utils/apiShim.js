// Static-hosting API shim.
//
// The original app called server routes under /api/* (Vercel/Express). GitHub
// Pages is static-only, so we intercept window.fetch and fulfil those two
// runtime calls in the browser instead:
//   - /api/omni-embed-url   -> sign the embed URL locally (Web Crypto HMAC)
//   - /api/omni-query-distinct -> return pre-baked filter values
// Every other request passes through untouched. Importing this module once
// (from main.jsx, before React renders) installs the shim.

import { signEmbedUrl } from './omniEmbed'
import { DISTINCT_VALUES } from './distinctValues'

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const realFetch = window.fetch.bind(window)

window.fetch = async (input, init) => {
  const url = typeof input === 'string' ? input : (input && input.url) || ''

  if (url.startsWith('/api/omni-embed-url')) {
    try {
      const body = JSON.parse((init && init.body) || '{}')
      const signed = await signEmbedUrl(body)
      return json({ url: signed })
    } catch (err) {
      return json({ error: err.message || 'Failed to sign embed URL' }, 500)
    }
  }

  if (url.startsWith('/api/omni-query-distinct')) {
    try {
      const body = JSON.parse((init && init.body) || '{}')
      return json({ values: DISTINCT_VALUES[body.field] || [] })
    } catch {
      return json({ values: [] })
    }
  }

  return realFetch(input, init)
}
