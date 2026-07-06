import { TextField } from '../TextField';
import { Autocomplete } from './index';
import figma from '@figma/code-connect';

figma.connect(Autocomplete, '<FIGMA_AUTOCOMPLETE>', {
  props: {
    multiple: figma.boolean('Multiple Value'),
    children: figma.children('*'),
    textFieldProps: figma.nestedProps('<Select>', {
      label: figma.string('Label')
    })
  },
  example: ({ textFieldProps, ...props }) => {
    const movies = [
      { label: 'The Shawshank Redemption', year: 1994 },
      { label: 'The Godfather', year: 1972 },
      { label: 'The Godfather: Part II', year: 1974 }
    ];

    return (
      <Autocomplete
        sx={{ width: 300 }}
        renderInput={params => (
          <TextField {...params} label={textFieldProps.label} />
        )}
        options={movies}
        {...props}
      />
    );
  }
});
