import {
  SimpleTreeView as MuiSimpleTreeView,
  type SimpleTreeViewProps as MuiSimpleTreeViewProps,
  RichTreeView as MuiRichTreeView,
  type RichTreeViewProps as MuiRichTreeViewProps
} from '@mui/x-tree-view';

export interface SimpleTreeViewProps extends MuiSimpleTreeViewProps<false> {
  children: React.ReactNode;
}

export const SimpleTreeView = ({ children, ...props }: SimpleTreeViewProps) => {
  return <MuiSimpleTreeView {...props}>{children}</MuiSimpleTreeView>;
};

export interface RichTreeViewProps extends MuiRichTreeViewProps<any, false> {
  items: any[];
}

export const RichTreeView = ({ items, ...props }: RichTreeViewProps) => {
  return <MuiRichTreeView items={items} {...props} />;
};
