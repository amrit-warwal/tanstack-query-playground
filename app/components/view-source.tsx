'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Token } from '../lib/highlight'

export interface SourceFile {
  name: string
  /** Pre-tokenized on the server. Concatenating the text reproduces the file. */
  tokens: Token[]
  /** One-line "what this file is" shown above the code. */
  note?: string
  /** A repo-wide file rather than one of this example's own. */
  shared?: boolean
}

async function fetchSource(example: string): Promise<SourceFile[]> {
  const res = await fetch(`/api/source?example=${encodeURIComponent(example)}`)
  if (!res.ok) throw new Error('Could not load the source for this example')
  const data = (await res.json()) as { files: SourceFile[] }
  return data.files
}

// The VS Code "code" icon, inlined rather than fetched. currentColor (instead of
// the original hardcoded #C5C5C5) lets it pick up the link colour and hover
// state instead of being stuck grey on the dark theme.
function CodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M4.708 5.578L2.061 8.224L4.708 10.87L4 11.578L1 8.578V7.87L4 4.87L4.708 5.578ZM11.708 4.87L11 5.578L13.647 8.224L11 10.87L11.708 11.578L14.708 8.578V7.87L11.708 4.87ZM4.908 13L5.802 13.448L10.802 3.448L9.908 3L4.908 13Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Shows an example's own source in a modal overlay.
//
// Two things worth reading here:
//
// 1. This component is itself a small TanStack Query example. `enabled: open`
//    makes it a LAZY query — nothing is fetched until you actually click, and
//    once fetched it's cached under ['source', example], so reopening the same
//    overlay costs no request. Watch it appear in the Devtools.
//
// 2. It uses the native <dialog> element, which hands us the focus trap,
//    Esc-to-close, top-layer stacking (no z-index fights) and focus restoration
//    for free. The catch is that you must open it IMPERATIVELY with
//    showModal() — rendering <dialog open> gives a NON-modal dialog with no
//    backdrop and no focus trap, which looks fine and is quietly broken for
//    screen readers.
export default function ViewSource({ example }: { example: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const titleId = useId()

  const { data: files, isPending, isError, error } = useQuery({
    queryKey: ['source', example],
    queryFn: () => fetchSource(example),
    enabled: open,
    staleTime: Infinity, // source only changes on a rebuild
    // A failure here is deterministic (bad slug, unreadable file), so the
    // default 3 retries just hold the overlay on "Loading source…" through
    // ~7s of backoff before admitting anything is wrong.
    retry: false,
  })

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && !el.open) el.showModal()
    else if (!open && el.open) el.close()
  }, [open])

  // Switching tabs shouldn't inherit the previous file's scroll offset — you'd
  // land halfway down a file you just opened.
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [active])

  const hasTabs = (files?.length ?? 0) > 1
  const current = files?.[active]

  // Where the example's own files end and the shared ones begin, so the tab row
  // can draw a divider there. -1 (none shared) and 0 (all shared) both mean
  // "no divider", which the `> 0` check below covers.
  const sharedStart = files ? files.findIndex((file) => file.shared) : -1

  return (
    <>
      <button
        type="button"
        className="src-link"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        <CodeIcon />
        View Source Code
      </button>

      <dialog
        ref={dialogRef}
        className="src-dialog"
        aria-labelledby={titleId}
        // Esc fires `cancel`, not `close`. Route it through our own state so
        // there is exactly one way the dialog closes.
        onCancel={(e) => {
          e.preventDefault()
          setOpen(false)
        }}
        // Catches any close() we didn't initiate, so `open` can't desync (a
        // desync would make the next setOpen(true) a silent no-op).
        onClose={() => setOpen(false)}
        // ::backdrop is a pseudo-element OF the dialog, so a backdrop click
        // targets the dialog itself. mousedown rather than click: with click,
        // selecting code and releasing outside the panel would close it.
        onMouseDown={(e) => {
          if (e.target === dialogRef.current) setOpen(false)
        }}
      >
        {open && (
          <div className="src-panel">
            <header className="src-head">
              <h2 id={titleId} className="src-title">
                {hasTabs || !current ? 'Source' : current.name}
              </h2>
              <button
                type="button"
                className="src-close"
                onClick={() => setOpen(false)}
                aria-label="Close source viewer"
                autoFocus
              >
                ✕
              </button>
            </header>

            {hasTabs && files && (
              <div className="src-tabs" role="tablist" aria-label="Source files">
                {files.map((file, i) => (
                  <button
                    // Keyed by position, not name: two registered files can
                    // share a basename (page.tsx in different folders).
                    key={i}
                    type="button"
                    role="tab"
                    id={`${titleId}-tab-${i}`}
                    className={
                      i === sharedStart && i > 0
                        ? 'src-tab src-tab--shared-start'
                        : 'src-tab'
                    }
                    aria-selected={i === active}
                    aria-controls={`${titleId}-panel`}
                    // Roving tabindex: only the active tab is in the tab order,
                    // arrows move between them.
                    tabIndex={i === active ? 0 : -1}
                    onClick={() => setActive(i)}
                    onKeyDown={(e) => {
                      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
                      e.preventDefault()
                      const step = e.key === 'ArrowRight' ? 1 : files.length - 1
                      const next = (active + step) % files.length
                      setActive(next)
                      document.getElementById(`${titleId}-tab-${next}`)?.focus()
                    }}
                  >
                    {file.name}
                  </button>
                ))}
              </div>
            )}

            <div
              ref={bodyRef}
              className="src-body"
              id={`${titleId}-panel`}
              role={hasTabs ? 'tabpanel' : undefined}
              aria-labelledby={hasTabs ? `${titleId}-tab-${active}` : undefined}
              // Scrollable regions need to be focusable to be keyboard-scrollable.
              tabIndex={0}
            >
              {isPending && <p className="src-note">Loading source…</p>}
              {isError && <p className="src-note">Error: {error.message}</p>}
              {current && (
                <>
                  {current.note && <p className="src-note">{current.note}</p>}
                  <pre className="src-pre">
                    <code>
                      {/* Each token is a text node, so React escapes it for
                          us — a source file containing <script> shows up as
                          visible text, not live DOM. That's why the server
                          sends tokens rather than an HTML string: no
                          dangerouslySetInnerHTML anywhere. */}
                      {current.tokens.map(([kind, text], i) =>
                        kind === 'plain' ? (
                          text
                        ) : (
                          <span key={i} className={`tok-${kind}`}>
                            {text}
                          </span>
                        ),
                      )}
                    </code>
                  </pre>
                </>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  )
}
