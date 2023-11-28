import express, { type Request, type Response } from 'express'

const app = express()
const PORT = 3000
let a = 1

console.log(a)

a = 'a'

app.get('/', (req: Request, res: Response) => {
  res.send('Helloo, TypeScript with Express!')
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`)
})
