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
