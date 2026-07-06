import { ListSubheader } from './index';
import figma from '@figma/code-connect';

figma.connect(ListSubheader, '<FIGMA_LIST_SUBHEADER>', {
  props: {},
  example: props => <ListSubheader {...props}>List Subheader</ListSubheader>
});
