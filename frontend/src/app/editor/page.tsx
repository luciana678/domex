'use client'

import CodeEditor from '@/components/CodeEditor'
import { editor } from 'monaco-editor'
import { useRef } from 'react'

export default function EditorPage() {
  const editorRef = useRef<any>(null)

  const showValue = () => {
    if (editorRef.current) {
      const value = editorRef.current.getValue()

      console.log(value)
    }
  }

  const handleMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor // Assign editor to editorRef.current
  }

  return (
    <>
      <button onClick={showValue}>Show value</button>
      <div className='h-10 min-h-screen'>
        <CodeEditor onMount={handleMount} />
      </div>
    </>
  )
}
