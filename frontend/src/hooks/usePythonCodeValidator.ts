'use client'

import { Code, UserID } from '@/types'
import { validatePythonCode, isValidFunctionHeader } from '@/utils/helpers'
import { usePython } from 'react-py'
import useMapReduce from '@/hooks/useMapReduce'
import { Action, initialOutput } from '@/context/MapReduceContext'
import usePeers from '@/hooks/usePeers'
import useRoom from '@/hooks/useRoom'

export const usePythonCodeValidator = () => {
  const { runPython, stdout, stderr, isReady, readFile, writeFile } = usePython({
    packages: { micropip: ['pyodide-http'] },
  })

  const { dispatchMapReduce } = useMapReduce()

  const { sendDirectMessage } = usePeers()

  const { roomOwner } = useRoom()

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
    dispatchOutput({ ...initialOutput.stderr, ...stderr })
    return hasErrors(stderr)
  }

  const dispatchOutput = (stderr: Code) => {
    const action: Action = {
      type: 'SET_OUTPUT',
      payload: {
        stderr,
        stdout: stdout,
      },
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

    dispatchOutput(stderr)

    return !hasErrors(stderr)
  }

  return { isValidPythonCode, readErrors, runPython, stdout, stderr, isReady, readFile, writeFile }
}
