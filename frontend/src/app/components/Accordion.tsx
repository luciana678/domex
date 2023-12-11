import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Button } from "@mui/material";

export default function BasicAccordion({ titulo }) {
  return (
    <Accordion
      sx={{
        width: "100%",
        mb: 2.5,
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <div className="flex w-full">
          <Typography
            sx={{
              flexGrow: 1,
            }}
          >
            {titulo}
          </Typography>
          <Button
            sx={{
              ml: 5,
            }}
            variant="outlined"
          >
            Cargar archivo
          </Button>
        </div>
      </AccordionSummary>
      <AccordionDetails className="w-full">
        <textarea></textarea>
      </AccordionDetails>
    </Accordion>
  );
}
