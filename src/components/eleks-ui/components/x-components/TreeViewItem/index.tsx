import {
  TreeItem as MuiTreeItem,
  type TreeItemProps as MuiTreeItemProps
} from '@mui/x-tree-view';

export interface TreeItemProps extends MuiTreeItemProps {
  children?: React.ReactNode;
}

export const TreeItem = ({ children, ...props }: TreeItemProps) => {
  return <MuiTreeItem {...props}>{children}</MuiTreeItem>;
};
