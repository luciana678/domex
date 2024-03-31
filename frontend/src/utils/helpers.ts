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

export const mergeStrings = (str1: string, str2: string) => {
  str1 = str1
  str2 = str2.trim()

  let newString = ''

  for (let i = 0; i < str1.length; i++) {
    if (str2.startsWith(str1.substring(i))) {
      newString = str2.substring(str1.length - i)
      break
    }
  }

  let mergedString
  if (newString) {
    mergedString = str1 + newString
  } else {
    mergedString = str1 + str1 ? '\n' : '' + str2
    newString = str2
  }

  return {
    mergedString,
    newString,
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

export const resetPythonFiles = `
import os

for filename in os.listdir("/"):
  try:
    filepath = os.path.join("/", filename)
    if os.path.isfile(filepath):
        os.unlink(filepath)
  except Exception:
    pass
`
