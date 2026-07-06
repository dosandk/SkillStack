import * as React from 'react';
import figma from '@figma/code-connect';
import { useCallback } from 'react';
import { Grid } from '../../core/BoxSet/index';
import { Paper } from '../../core/Paper/index';
import { Divider } from '../../core/Divider/index';
import { Button } from '../../core/Button/index';
import { Checkbox } from '../../core/Checkbox/index';
import { List } from '../../core/List/index';
import { ListItemIcon } from '../../core/List/ListItemIcon/index';
import { ListItemText } from '../../core/List/ListItemText/index';
import { ListItemButton } from '../../core/List/api/index';

import { Card, CardHeader } from '../../core/Card/index';

import { StarOutlined as StarIcon } from '../../../icons/Favorite/StarOutlined';

figma.connect('<FIGMA_TRANSFER_LIST>', {
  variant: {
    Variant: 'Simpled'
  },
  example: () => {
    /**
     *
     * Warning: this component is hardcoded!
     *
     **/

    const [checked, setChecked] = React.useState<readonly number[]>([]);
    const [left, setLeft] = React.useState<readonly number[]>([0, 1, 2, 3]);
    const [right, setRight] = React.useState<readonly number[]>([4, 5, 6, 7]);

    const not = useCallback((a: readonly number[], b: readonly number[]) => {
      return a.filter(value => !b.includes(value));
    }, []);

    const intersection = useCallback(
      (a: readonly number[], b: readonly number[]) => {
        return a.filter(value => b.includes(value));
      },
      []
    );

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const handleToggle = useCallback(
      (value: number) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
      },
      [checked]
    );

    const handleAllRight = useCallback(() => {
      setRight(right.concat(left));
      setLeft([]);
    }, [left, right]);

    const handleCheckedRight = useCallback(() => {
      setRight(right.concat(leftChecked));
      setLeft(not(left, leftChecked));
      setChecked(not(checked, leftChecked));
    }, [left, right, leftChecked, checked, not]);

    const handleCheckedLeft = useCallback(() => {
      setLeft(left.concat(rightChecked));
      setRight(not(right, rightChecked));
      setChecked(not(checked, rightChecked));
    }, [left, right, rightChecked, checked, not]);

    const handleAllLeft = useCallback(() => {
      setLeft(left.concat(right));
      setRight([]);
    }, [left, right]);

    const customList = useCallback(
      (items: readonly number[]) => (
        <Paper sx={{ width: 200, height: 230, overflow: 'auto' }}>
          <List dense component="div" role="list">
            {items.map((value: number) => {
              const labelId = 'transfer-list-item-' + value + '-label';

              return (
                <ListItemButton
                  key={value}
                  role="listitem"
                  onClick={handleToggle(value)}
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={checked.includes(value)}
                      tabIndex={-1}
                      disableRipple
                      icon={<StarIcon />}
                      checkedIcon={<StarIcon />}
                      slotProps={{
                        input: {
                          'aria-labelledby': labelId
                        }
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    id={labelId}
                    primary={'List item ' + (value + 1)}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Paper>
      ),
      [checked, handleToggle]
    );

    return (
      <Grid
        container
        spacing={2}
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <Grid>{customList(left)}</Grid>
        <Grid>
          <Grid container direction="column" sx={{ alignItems: 'center' }}>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleAllRight}
              disabled={left.length === 0}
              aria-label="move all right"
            >
              ≫
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label="move selected left"
            >
              &lt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleAllLeft}
              disabled={right.length === 0}
              aria-label="move all left"
            >
              ≪
            </Button>
          </Grid>
        </Grid>
        <Grid>{customList(right)}</Grid>
      </Grid>
    );
  }
});

figma.connect('<FIGMA_TRANSFER_LIST>', {
  variant: {
    Variant: 'Enhanced'
  },
  example: () => {
    /**
     *
     * Warning: this component is hardcoded!
     *
     **/

    const [checked, setChecked] = React.useState<readonly number[]>([]);
    const [left, setLeft] = React.useState<readonly number[]>([0, 1, 2, 3]);
    const [right, setRight] = React.useState<readonly number[]>([4, 5, 6, 7]);

    // Memoized utility functions
    const not = useCallback((a: readonly number[], b: readonly number[]) => {
      return a.filter(value => !b.includes(value));
    }, []);

    const intersection = useCallback(
      (a: readonly number[], b: readonly number[]) => {
        return a.filter(value => b.includes(value));
      },
      []
    );

    const union = useCallback(
      (a: readonly number[], b: readonly number[]) => {
        return [...a, ...not(b, a)];
      },
      [not]
    );

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const numberOfChecked = useCallback(
      (items: readonly number[]) => intersection(checked, items).length,
      [checked, intersection]
    );

    const handleToggle = useCallback(
      (value: number) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
          newChecked.push(value);
        } else {
          newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
      },
      [checked]
    );

    const handleToggleAll = useCallback(
      (items: readonly number[]) => () => {
        if (numberOfChecked(items) === items.length) {
          setChecked(not(checked, items));
        } else {
          setChecked(union(checked, items));
        }
      },
      [checked, numberOfChecked, not, union]
    );

    const handleCheckedRight = useCallback(() => {
      setRight(right.concat(leftChecked));
      setLeft(not(left, leftChecked));
      setChecked(not(checked, leftChecked));
    }, [right, leftChecked, left, checked, not]);

    const handleCheckedLeft = useCallback(() => {
      setLeft(left.concat(rightChecked));
      setRight(not(right, rightChecked));
      setChecked(not(checked, rightChecked));
    }, [left, rightChecked, right, checked, not]);

    const customList = useCallback(
      (title: React.ReactNode, items: readonly number[]) => (
        <Card>
          <CardHeader
            sx={{ px: 2, py: 1 }}
            avatar={
              <Checkbox
                onClick={handleToggleAll(items)}
                checked={
                  numberOfChecked(items) === items.length && items.length !== 0
                }
                indeterminate={
                  numberOfChecked(items) !== items.length &&
                  numberOfChecked(items) !== 0
                }
                disabled={items.length === 0}
                slotProps={{
                  input: {
                    'aria-label': 'all items selected'
                  }
                }}
                icon={<StarIcon />}
                checkedIcon={<StarIcon />}
              />
            }
            title={title}
            subheader={
              numberOfChecked(items) + '/' + items.length + ' selected'
            }
          />
          <Divider />
          <List
            sx={{
              width: 200,
              height: 230,
              bgcolor: 'background.paper',
              overflow: 'auto'
            }}
            dense
            component="div"
            role="list"
          >
            {items.map((value: number) => {
              const labelId = 'transfer-list-all-item-' + value + '-label';

              return (
                <ListItemButton
                  key={value}
                  role="listitem"
                  onClick={handleToggle(value)}
                >
                  <ListItemIcon>
                    <Checkbox
                      checked={checked.includes(value)}
                      tabIndex={-1}
                      disableRipple
                      slotProps={{
                        input: {
                          'aria-labelledby': labelId
                        }
                      }}
                      icon={<StarIcon />}
                      checkedIcon={<StarIcon />}
                    />
                  </ListItemIcon>
                  <ListItemText
                    id={labelId}
                    primary={'List item ' + (value + 1)}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Card>
      ),
      [checked, handleToggle, handleToggleAll, numberOfChecked]
    );

    return (
      <Grid
        container
        spacing={2}
        sx={{ justifyContent: 'center', alignItems: 'center' }}
      >
        <Grid>{customList('Choices', left)}</Grid>
        <Grid>
          <Grid container direction="column" sx={{ alignItems: 'center' }}>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleCheckedRight}
              disabled={leftChecked.length === 0}
              aria-label="move selected right"
            >
              &gt;
            </Button>
            <Button
              sx={{ my: 0.5 }}
              variant="outlined"
              size="small"
              onClick={handleCheckedLeft}
              disabled={rightChecked.length === 0}
              aria-label="move selected left"
            >
              &lt;
            </Button>
          </Grid>
        </Grid>
        <Grid>{customList('Chosen', right)}</Grid>
      </Grid>
    );
  }
});
