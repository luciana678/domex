'use client'

import { Code, UserID } from '@/types'
import { validatePythonCode, isValidFunctionHeader } from '@/utils/helpers'
import { usePython } from 'react-py'
import useMapReduce from '@/hooks/useMapReduce'
import { Action, initialOutput } from '@/context/MapReduceContext'
import usePeers from '@/hooks/usePeers'
import useRoom from '@/hooks/useRoom'
import { useEffect, useState } from 'react'
import useFiles from '@/hooks/useFiles'

export const usePythonCodeValidator = () => {
  const { runPython, stdout, stderr, isReady, readFile, writeFile } = usePython({
    packages: { micropip: ['pyodide-http'] },
  })

  const { dispatchMapReduce, mapReduceState } = useMapReduce()

  const { sendDirectMessage } = usePeers()

  const { roomOwner } = useRoom()

  const [stdoutHistory, setStdoutHistory] = useState('')

  const { nodeHasFiles } = useFiles()

  const resetStdoutHistory = () => setStdoutHistory('')

  useEffect(() => {
    const lines = stdout.split(/\n/)
    const lastLine = lines[lines.length - 1]
    if (!lastLine) return

    if (
      (lastLine === 'MAP EJECUTADO SATISFACTORIAMENTE' ||
        lastLine === 'COMBINE EJECUTADO SATISFACTORIAMENTE') &&
      !nodeHasFiles
    ) {
      dispatchMapReduce({ type: 'MAP_EXECUTED' })
      return
    }

    if (
      lastLine === 'REDUCE EJECUTADO SATISFACTORIAMENTE' &&
      !Object.keys(mapReduceState.reduceKeys).length
    )
      return

    setStdoutHistory((prev) => prev + lastLine + '\n')

    const action: Action = {
      type: 'SET_STDOUT',
      payload: lastLine,
    }

    dispatchMapReduce(action)

    sendDirectMessage(roomOwner?.userID as UserID, action)
  }, [stdout])

  const runPythonCodeValidator = async (code: string) => {
    await writeFile('/code.py', code)
    await runPython(validatePythonCode)
    const result = (await readFile('/is_valid')) || ('' as string)
    return result
  }

  const readErrors = async () => {
    let stderr
    try {
      stderr = JSON.parse((await readFile('/stderr.json')) || '')
    } catch (e) {
      stderr = initialOutput.stderr
    }
    dispatchStderr({ ...initialOutput.stderr, ...stderr })
    return hasErrors(stderr)
  }

  const dispatchStderr = (stderr: Code) => {
    const action: Action = {
      type: 'SET_STDERR',
      payload: stderr,
    }

    dispatchMapReduce(action)

    sendDirectMessage(roomOwner?.userID as UserID, action)
  }

  const hasErrors = (stderr: Code) => Object.values(stderr).some((error) => !!error)

  const isValidPythonCode = async (code: Code) => {
    const stderr = {
      mapCode: !isValidFunctionHeader(code.mapCode, 'fmap', 1)
        ? "La función debe llamarse 'fmap' y recibir un argumento (value)"
        : await runPythonCodeValidator(code.mapCode),
      combinerCode: !code.combinerCode
        ? ''
        : !isValidFunctionHeader(code.combinerCode, 'fcomb', 2)
          ? "La función debe llamarse 'fcomb' y recibir dos argumentos (key, values)"
          : await runPythonCodeValidator(code.combinerCode),
      reduceCode: !isValidFunctionHeader(code.reduceCode, 'fred', 2)
        ? "La función debe llamarse 'fred' y recibir dos argumentos (key, values)"
        : await runPythonCodeValidator(code.reduceCode),
    }

    dispatchStderr(stderr)

    return !hasErrors(stderr)
  }

  return {
    isValidPythonCode,
    readErrors,
    runPython,
    stdoutHistory,
    stderr,
    isReady,
    readFile,
    writeFile,
    resetStdoutHistory,
  }
}
