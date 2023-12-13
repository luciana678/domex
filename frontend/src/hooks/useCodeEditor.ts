import { editor } from 'monaco-editor'
import { useRef } from 'react'

const useCodeEditor = () => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const handleMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor
  }

  const getValue = (): string | undefined => {
    return editorRef.current?.getValue()
  }

  return {
    getValue,
    handleMount,
  }
}

export default useCodeEditor
