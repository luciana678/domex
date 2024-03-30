import { KeyValuesCount } from '@/types'

export const sumValues = (dict: KeyValuesCount) =>
  Object.values(dict).reduce((total, value) => total + value, 0)

export async function concatenateFiles(files: File[]) {
  try {
    const readPromises = files.map((file) => file.text())
    const contents = await Promise.all(readPromises)
    const concatenatedContent = contents.join('\n')
    return concatenatedContent
  } catch (error) {
    console.error('Error concatenando archivos:', error)
    throw error
  }
}

export const isValidFunctionHeader = (
  code: string,
  functionName: string,
  argCount: number,
): boolean => {
  let argsRegexPart = '\\s*\\w+\\s*'
  argsRegexPart = argsRegexPart + `,${argsRegexPart}`.repeat(argCount - 1)
  const regex = new RegExp(`^\\s*def\\s+${functionName}\\(\\s*${argsRegexPart}\\s*\\)\\s*:`)

  return regex.test(code)
}

export const validatePythonCode = `
try:
  with open('/code.py') as code:
    exec(code.read())
except Exception as e:
  message = str(e)
else:
  message = ''
finally:
  with open('/is_valid', 'w') as f:
    f.write(message)
`
