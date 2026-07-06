import figma from '@figma/code-connect';
import { Button } from '../Button';
import { Snackbar } from './index';

figma.connect(Snackbar, '<FIGMA_SNACKBAR>', {
  props: {},
  example: () => {
    // NOTE: this is hardcoded example
    return (
      <Snackbar
        open
        message="Message"
        action={
          <Button color="inherit" size="small">
            Action
          </Button>
        }
      />
    );
  }
});
