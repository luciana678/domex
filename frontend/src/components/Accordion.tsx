import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Button } from '@mui/material'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import CodeEditor from './CodeEditor'

export default function BasicAccordion({ title }: { title: string }) {
  return (
    <Accordion
      sx={{
        width: '100%',
        mb: 2.5,
      }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className='flex w-full'>
          <Typography
            sx={{
              flexGrow: 1,
            }}>
            {title}
          </Typography>
          <Button
            sx={{
              ml: 5,
            }}
            variant='outlined'>
            Cargar archivo
          </Button>
        </div>
      </AccordionSummary>
      <AccordionDetails className='w-full h-[200px] p-0'>
        <CodeEditor readOnly defaultValue={title} />
      </AccordionDetails>
    </Accordion>
  )
}
