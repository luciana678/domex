'use client'

export const dynamic = 'force-dynamic'

function test() {
  fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/health`)
    .then((res) => res.json())
    .then((res) => console.log(res, 'res'))
    .catch(console.error)

  console.log('server url', process.env.NEXT_PUBLIC_SERVER_URL)

  return <div>test</div>
}

export default test
