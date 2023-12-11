'use client'

import { Editor, EditorProps } from '@monaco-editor/react'

interface Props extends EditorProps {}

export default function CodeEditor({
  height = '100%',
  defaultLanguage = 'python',
  defaultValue = '// write your code here',
  theme = 'vs-dark',
  ...editorProps
}: Props) {
  return (
    <Editor
      height={height}
      defaultLanguage={defaultLanguage}
      defaultValue={defaultValue}
      theme={theme}
      {...editorProps}
    />
  )
}
