import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import useStore, { PHASE } from '../../store/appStore'
import { askCopilot } from '../../services/anthropicService'
import { searchPlaces } from '../../services/mapboxService'
import styles from './AICopilot.module.css'

const QUICK_PROMPTS = [
  'Find me a gas station',
  'Best route to avoid traffic',
  'Add a coffee stop',
  'How long until I arrive?',
]

export default function AICopilot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I\\'m your AI co-pilot. Where would you like to go?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  const setPhase       = useStore(s => s.setPhase)
  const destination    = useStore(s => s.destination)
  const setDestination = useStore(s => s.setDestination)
  const addWaypoint    = useStore(s => s.addWaypoint)
  const userLocation   = useStore(s => s.userLocation)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    if (!text?.trim() || loading) return
    const userMsg = text.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setLoading(true)

    const context = {
      destination: destination?.name,
      hasActiveRoute: !!destination,
    }

    const reply = await askCopilot(userMsg, context)

    if (reply) {
      const destinationMatches = [...reply.matchAll(/\[DESTINATION:\s*([^\]]+)\]/gi)]
      const waypointMatches    = [...reply.matchAll(/\[WAYPOINT:\s*([^\]]+)\]/gi)]

      if (destinationMatches[0]) {
        const places = await searchPlaces(destinationMatches[0][1], userLocation)
        if (places[0]) {
          setDestination(places[0])
          setPhase(PHASE.ROUTE_PREVIEW)
        }
      }

      for (const match of waypointMatches) {
        const places = await searchPlaces(match[1], userLocation)
        if (places[0]) {
          addWaypoint({
            ...places[0],
            id: `${places[0].id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          })
        }
      }

      const cleanReply = reply
        .replace(/\[DESTINATION:[^\]]+\]/gi, '')
        .replace(/\[WAYPOINT:[^\]]+\]/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim()

      if (cleanReply) {
        setMessages(prev => [...prev, { role: 'assistant', text: cleanReply }])
      } else if (destinationMatches.length || waypointMatches.length) {
        const statusBits = []
        if (destinationMatches.length) statusBits.push('destination updated')
        if (waypointMatches.length) statusBits.push(`${waypointMatches.length} stop${waypointMatches.length > 1 ? 's' : ''} added`)
        setMessages(prev => [...prev, { role: 'assistant', text: `Done — ${statusBits.join(', ')}.` }])
      }
    } else {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I couldn\\'t process that. Try asking again.' }])
    }

    setLoading(false)
  }

  function close() {
    setPhase(PHASE.IDLE)
  }

  return (
    <>
      <motion.div
        className={styles.backdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
      />
      <motion.div
        className={styles.panel}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 380, damping: 40 }}
      >
        <div className={styles.handle} />
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.aiOrb} />
            <div className={styles.headerTitle}>AI Co-Pilot</div>
          </div>
          <button className={styles.closeBtn} onClick={close}>✕</button>
        </div>

        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div key={i} className={`${styles.bubble} ${msg.role === 'user' ? styles.userBubble : styles.aiBubble}`}>
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className={`${styles.bubble} ${styles.aiBubble} ${styles.loadingBubble}`}>
              <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className={styles.quickPrompts}>
          {QUICK_PROMPTS.map(p => (
            <button key={p} className={styles.quickChip} onClick={() => send(p)}>{p}</button>
          ))}
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send(input)}
            placeholder="Ask anything…"
            autoComplete="off"
          />
          <button
            className={styles.sendBtn}
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
          >
            ▶
          </button>
        </div>
      </motion.div>
    </>
  )
}