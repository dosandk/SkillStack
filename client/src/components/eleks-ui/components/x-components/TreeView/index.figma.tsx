import figma from '@figma/code-connect';

import { SimpleTreeView } from './index';
import { TreeItem } from '../TreeViewItem';

figma.connect(SimpleTreeView, '<FIGMA_TREE_VIEW>', {
  props: {},
  example: props => (
    /**
     *
     * Warning: this component is hardcoded because of the impossibility to generate unique IDs for each TreeItem2.
     *
     **/

    <SimpleTreeView {...props}>
      <TreeItem itemId="grid" label="Data Grid">
        <TreeItem itemId="grid-community" label="@mui/x-data-grid" />
        <TreeItem itemId="grid-pro" label="@mui/x-data-grid-pro" />
        <TreeItem itemId="grid-premium" label="@mui/x-data-grid-premium" />
      </TreeItem>
      <TreeItem itemId="pickers" label="Date and Time Pickers">
        <TreeItem itemId="pickers-community" label="@mui/x-date-pickers" />
        <TreeItem itemId="pickers-pro" label="@mui/x-date-pickers-pro" />
      </TreeItem>
      <TreeItem itemId="charts" label="Charts">
        <TreeItem itemId="charts-community" label="@mui/x-charts" disabled />
      </TreeItem>
      <TreeItem itemId="tree-view" label="Tree View" disabled>
        <TreeItem itemId="tree-view-community" label="@mui/x-tree-view" />
      </TreeItem>
    </SimpleTreeView>
  )
});
