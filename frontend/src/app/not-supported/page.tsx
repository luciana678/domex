/* eslint-disable @next/next/no-img-element */
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'

const NotSupportedPage: React.FC = () => {
  return (
    <div className='h-full flex flex-col md:flex-row items-center justify-center p-14 text-center'>
      <aside>
        <ErrorOutlineIcon style={{ fontSize: 300 }} />
      </aside>
      <section className='max-w-lg'>
        <h1 className='font-bold text-5xl m-4'>Tecnologías no soportadas</h1>
        <p className='from-neutral-400'>
          Este navegador no soporta las siguientes tecnologías necesarias para el correcto
          funcionamiento:
        </p>
        <ul className='list-disc text-left text-lg '>
          <li> WebRTC</li>
        </ul>
      </section>
    </div>
  )
}

export default NotSupportedPage
