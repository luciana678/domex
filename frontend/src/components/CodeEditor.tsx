'use client'

import { Editor, type EditorProps } from '@monaco-editor/react'
import { Box, CircularProgress, Typography } from '@mui/material'

export type CodeEditorProps = EditorProps & {
  readOnly?: boolean
}

export default function CodeEditor({
  height = '100%',
  defaultLanguage = 'python',
  defaultValue = '// write your code here',
  theme = 'vs-dark',
  readOnly = false,
  ...editorProps
}: CodeEditorProps) {
  return (
    <Editor
      height={height}
      defaultLanguage={defaultLanguage}
      language={defaultLanguage}
      defaultValue={defaultValue}
      theme={theme}
      loading={
        <Box display='flex' flexDirection='column' alignItems='center' gap={3}>
          <Typography>Inicializando editor de código...</Typography>
          <CircularProgress size={25} />
        </Box>
      }
      options={{
        scrollBeyondLastLine: false,
        readOnly,
        readOnlyMessage: {
          value: 'Solo el nodo master puede editar el código',
        },
        language: defaultLanguage,
      }}
      {...editorProps}
      className='rounded-b-xl overflow-hidden'
    />
  )
}
