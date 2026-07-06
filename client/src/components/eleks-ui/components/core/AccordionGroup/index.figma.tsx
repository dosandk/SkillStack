import figma from '@figma/code-connect';

figma.connect('<FIGMA_ACCORDION_GROUP>', {
  props: {
    children: figma.children('<Accordion>')
  },
  example: props => <div>{props.children}</div>
});
