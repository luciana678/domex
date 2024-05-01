'use client'

import { Editor, type EditorProps } from '@monaco-editor/react'

type Props = EditorProps & {
  readOnly?: boolean
}

export default function CodeEditor({
  height = '100%',
  defaultLanguage = 'python',
  defaultValue = '// write your code here',
  theme = 'vs-dark',
  readOnly = false,
  ...editorProps
}: Props) {
  return (
    <Editor
      height={height}
      defaultLanguage={defaultLanguage}
      defaultValue={defaultValue}
      theme={theme}
      options={{
        readOnly,
      }}
      className={`${readOnly ? 'pointer-events-none' : ''}`}
      {...editorProps}
    />
  )
}
