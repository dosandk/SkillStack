import { AccordionSummary, AccordionDetails } from './api';
import { ExpandOutlined as ExpandMoreIcon } from '../../../icons/Arrows/ExpandOutlined';
import { Typography } from '../Typography';
import { Accordion } from './index';
import figma from '@figma/code-connect';

figma.connect(Accordion, '<FIGMA_ACCORDION>', {
  props: {
    disabled: figma.boolean('Disabled'),
    defaultExpanded: figma.boolean('Expanded?'),
    details: figma.boolean('Expanded?', {
      true: figma.instance('↳ Instance'),
      false: undefined
    })
  },
  example: ({ details, ...props }) => (
    <Accordion {...props}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography component="span" sx={{ width: '33%', flexShrink: 0 }}>
          Foo
        </Typography>
        <Typography component="span" sx={{ color: 'text.secondary' }}>
          Bar
        </Typography>
      </AccordionSummary>
      <AccordionDetails>{details}</AccordionDetails>
    </Accordion>
  )
});
