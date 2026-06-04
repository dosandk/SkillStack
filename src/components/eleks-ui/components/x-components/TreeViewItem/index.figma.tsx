import { TreeItem } from './index';
import figma from '@figma/code-connect';

/**
 *
 * Warning: this component is not connected because of the impossibility to generate unique IDs for each TreeItem.
 *
 **/

figma.connect(TreeItem, '<FIGMA_TREE_VIEW_ITEM>', {
  props: {
    // These props were automatically mapped based on your linked code:
    disabled: figma.boolean('Disabled'),
    children: figma.children('<TreeItem>')
    // No matching props could be found for these Figma properties:
    // "spacing": figma.boolean('Spacing'),
    // "selected": figma.boolean('Selected'),
    // "state": figma.enum('State', {
    //   "Default": "default",
    //   "Expandable": "expandable",
    //   "Expanded": "expanded"
    // })
  },
  example: ({ children, ...props }) => (
    <TreeItem {...props}>{children}</TreeItem>
  )
});
