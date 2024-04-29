import { KeyValuesCount } from '@/types'

/**
 * Sums up the values of a dictionary object.
 *
 * @param dict - The dictionary object containing key-value pairs.
 * @returns The sum of all the values in the dictionary.
 */
export const sumValues = (dict: KeyValuesCount) =>
  Object.values(dict).reduce((total, value) => total + value, 0)

/**
 * Concatenates the contents of multiple files into a single string.
 * @param files - An array of File objects representing the files to be concatenated.
 * @returns A Promise that resolves to the concatenated content of the files.
 * @throws If an error occurs while reading or concatenating the files.
 */
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

/**
 * Checks if the provided code contains a valid function header.
 * @param code The code to check.
 * @param functionName The name of the function to validate.
 * @param argCount The expected number of arguments for the function.
 * @returns A boolean indicating whether the function header is valid or not.
 */
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
except:
  is_valid = False
else:
  is_valid = True
finally:
  with open('/is_valid', 'w') as f:
    f.write(str(is_valid))
`
