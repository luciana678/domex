'use client'

import { Code } from '@/types'
import { validatePythonCode, isValidFunctionHeader } from '@/utils/helpers'
import { usePython } from 'react-py'

export const usePythonCodeValidator = (code: Code, setCodeErrors: React.Dispatch<Code>) => {
  const { runPython, readFile, writeFile } = usePython({
    packages: { micropip: ['pyodide-http'] },
  })

  const runPythonCodeValidator = async (code: string) => {
    await writeFile('/code.py', code)
    await runPython(validatePythonCode)
    const result = (await readFile('/is_valid')) || ('' as string)
    return result === 'False' ? 'Revisar la sintaxis del código' : ''
  }

  const isValidPythonCode = async () => {
    const result = {
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
    setCodeErrors(result)

    return !Object.values(result).some((error) => !!error)
  }

  return { isValidPythonCode }
}
