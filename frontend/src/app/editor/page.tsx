'use client'

import CodeEditor from '@/components/CodeEditor'
import useCodeEditor from '@/hooks/useCodeEditor'
import { editor } from 'monaco-editor'
import { useRef } from 'react'

export default function EditorPage() {
  const { handleMount, getValue } = useCodeEditor()

  const showValue = (): void => {
    console.log(getValue())
  }

  return (
    <>
      <button onClick={showValue}>Show value</button>
      <div className='h-[500px] w-[500px]'>
        <CodeEditor onMount={handleMount} />
      </div>
    </>
  )
}
