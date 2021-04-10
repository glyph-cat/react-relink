import React, { useLayoutEffect } from 'react'
import GenericButton from './generic-button'
import { useEditorState, useResetEditorState } from './editor-source'
import './root-a.css'

const AUTO_VALUE = [
  '# Hello world',
  '',
  '* This is a simple Markdown editor made with [markdown-to-jsx](https://www.npmjs.com/package/markdown-to-jsx).',
  '',
  "* Check out this [Markdown Cheat Sheet](https://www.markdownguide.org/cheat-sheet) if you're new to Markdown.",
  '',
  'In `src/index.js`, you can see that the **Markdown Editor** and **Preview Area** are rendered in 2 separate roots without any providers but the code and output stays in sync.',
].join('\n')

export default function RootA() {
  const [editorState, setEditorState] = useEditorState()
  const resetEditorState = useResetEditorState()

  // Auto-fills the editor
  useLayoutEffect(() => {
    let length = 0
    const intervalRef = setInterval(() => {
      length += 2 + Math.ceil(Math.random() * 10)
      setEditorState(AUTO_VALUE.substr(0, Math.min(AUTO_VALUE.length, length)))
      if (length >= AUTO_VALUE.length) {
        clearInterval(intervalRef)
      }
    }, 25)
    return () => {
      clearInterval(intervalRef)
    }
  }, [setEditorState])

  return (
    <div className='root-a-container'>
      <div className='root-a-subcontainer'>
        <header className='root-a-header'>
          <h1>Markdown Editor</h1>
          <GenericButton label='Clear' onClick={resetEditorState} />
        </header>
        <textarea
          autoCapitalize='false'
          autoComplete='false'
          autoCorrect='false'
          autoFocus={true}
          className='root-a-md-editor code'
          onChange={(e) => {
            setEditorState(e.target.value)
          }}
          value={editorState}
          placeholder='Type something here'
          spellCheck='false'
        />
      </div>
    </div>
  )
}
