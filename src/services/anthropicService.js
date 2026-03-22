// ── Anthropic Claude Service ──────────────────────────────────────────────
// All AI calls are proxied through /api/ai (Vercel serverless function)
// so the Anthropic API key is never exposed in the browser bundle.
//
// Action map:
//  copilot           → navigation co-pilot chat
//  parseDestination  → natural language destination extraction
//  interpretSketch   → sketch-a-route description
//  refinePOI         → POI query refinement
//  tripSummary       → friendly trip opener line
//  routeSuggestions  → 2-3 route option suggestions

const PROXY_URL = '/api/ai'

let lastClaudeError = ''

export function getLastClaudeError() {
  return lastClaudeError
}

// Core proxy wrapper — POSTs {action, payload} to the serverless function
async function callProxy(action, payload, timeoutMs = 29000) {
  lastClaudeError = ''
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(PROXY_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      lastClaudeError = data.error || `Server error (${res.status}). Check Vercel function logs.`
      console.error('[anthropicService]', lastClaudeError)
      return null
    }

    return data.text ?? null
  } catch (err) {
    if (err?.name === 'AbortError') {
      lastClaudeError = 'AI request timed out. Please try again.'
    } else {
      lastClaudeError = `Network error reaching AI server: ${err?.message || 'unknown'}`
    }
    console.error('[anthropicService]', err)
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ── 1. Navigation Co-pilot ────────────────────────────────────────────────
export async function sendCopilotMessage({ history, userMessage, context }) {
  return callProxy('copilot', { history, userMessage, context })
}

// ── 2. Parse Destination from Natural Language ────────────────────────────
export async function parseDestination(query, userLocation) {
  const text = await callProxy('parseDestination', { query, userLocation })
  try {
    return JSON.parse(text?.replace(/```json|```/g, '').trim())
  } catch {
    return null
  }
}

// ── 3. Sketch Route Interpretation ───────────────────────────────────────
export async function interpretSketch({ startCoord, endCoord, pointCount, corridorMiles }) {
  return callProxy('interpretSketch', { startCoord, endCoord, pointCount, corridorMiles })
}

// ── 4. POI Query Refinement ───────────────────────────────────────────────
export async function refinePOISearch(userQuery, currentContext) {
  const text = await callProxy('refinePOI', { userQuery, context: currentContext })
  try {
    return JSON.parse(text?.replace(/```json|```/g, '').trim())
  } catch {
    return null
  }
}

// ── 5. Trip Summary ───────────────────────────────────────────────────────
export async function generateTripSummary({ distance, duration, destination }) {
  return callProxy('tripSummary', { distance, duration, destination })
}

// ── 6. Smart Route Suggestions ────────────────────────────────────────────
export async function getRouteSuggestions({ origin, destination, preferences }) {
  return callProxy('routeSuggestions', { origin, destination, preferences })
}
