import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { useFormikContext } from 'formik';
import FormError from './message_system/FormError';

//Return a / b (elements in a that are not in b)
function notBy(a, b, key = 'id') {
  const bKeys = new Set(b.map(x => x[key]));
  return a.filter(x => !bKeys.has(x[key]));
}

//Return intersection of list a and b
function intersectionBy(a, b, key = 'id') {
  const bKeys = new Set(b.map(x => x[key]));
  return a.filter(x => bKeys.has(x[key]));
}

//Return union of list a and b
function unionBy(a, b, key = 'id') {
  const aKeys = new Set(a.map(x => x[key]));
  return [...a, ...b.filter(x => !aKeys.has(x[key]))];
}

export default function TransferList({
  formikAtrributeName,
  leftList=[],
  itemIdentifyName, 
  itemTextLabelName }) {

    const { values, setFieldValue, errors, touched } = useFormikContext();

    const [checked, setChecked] = useState([]);
    const [left, setLeft] = useState(leftList);

    let right = values[formikAtrributeName]
    const setRight = (new_list) => {
      setFieldValue(formikAtrributeName, new_list);
    }

    const leftChecked = intersectionBy(checked, left, itemIdentifyName);
    const rightChecked = intersectionBy(checked, right, itemIdentifyName);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) 
          newChecked.push(value);
        else 
          newChecked.splice(currentIndex, 1);
        

        setChecked(newChecked);
    };

    const numberOfChecked = (items) => intersectionBy(checked, items, itemIdentifyName).length;

    const handleToggleAll = (items) => () => {
        if (numberOfChecked(items) === items.length) 
          setChecked(notBy(checked, items, itemIdentifyName));
        else 
          setChecked(unionBy(checked, items, itemIdentifyName));
    };

    const handleCheckedRight = () => {

      let leftListUpdated = notBy(left, leftChecked, itemIdentifyName)
      leftListUpdated.sort( (a,b) => a[itemTextLabelName].localeCompare(b[itemTextLabelName]))

      let rightListUpdated = right.concat(leftChecked)
      rightListUpdated.sort( (a,b) => a[itemTextLabelName].localeCompare(b[itemTextLabelName]))

      setRight(rightListUpdated);
      setLeft(leftListUpdated);
      setChecked(unionBy(checked, leftChecked, itemIdentifyName));
    };

    const handleCheckedLeft = () => {

      let leftListUpdated = left.concat(rightChecked)
      leftListUpdated.sort( (a,b) => a[itemTextLabelName].localeCompare(b[itemTextLabelName]))

      let rightListUpdated = notBy(right, rightChecked, itemIdentifyName)
      rightListUpdated.sort( (a,b) => a[itemTextLabelName].localeCompare(b[itemTextLabelName]))

      setLeft(leftListUpdated);
      setRight(rightListUpdated);
      setChecked(notBy(checked, rightChecked, itemIdentifyName));
    };

    const customList = (title, items) => (
        <Card>
          <CardHeader
            sx={{ px: 2, py: 1, bgcolor:"#8E7756" }}
            avatar={
              <Checkbox
                onClick={handleToggleAll(items)}
                checked={numberOfChecked(items) === items.length && items.length !== 0}
                indeterminate={
                  numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0
                }
                disabled={items.length === 0}
                inputProps={{
                  'aria-label': 'all items selected',
                }}
              />
            }
            title={title}
            subheader={`${numberOfChecked(items)}/${items.length} selected`}
          />
          <Divider />
          <List
            sx={{
              width: 350,
              height: 250,
              bgcolor: '#B39283',
              overflow: 'auto',
            }}
            dense
            component="div"
            role="list"
          >
            {items.map((item) => {
              const labelId = `item-${item[itemIdentifyName]}-label`;
    
              return (
                <>
                  <ListItemButton
                    key={item[itemIdentifyName]}
                    role="listitem"
                    onClick={handleToggle(item)}
                  >
                    <ListItemIcon>
                      <Checkbox
                        checked={checked.includes(item)}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{
                          'aria-labelledby': labelId,
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={item[itemTextLabelName]} />
                  </ListItemButton>
                  <Divider />
                </>
              );
            })}
          </List>
        </Card>
      );

    return (
      <Grid
          container
          spacing={1}
          sx={{ justifyContent: 'center', alignItems: 'center', mb:3 }}
      >
        <Grid item sx={{mr:1}}>{customList('Universes choices', left)}</Grid>
        <Grid item>
            <Grid container direction="column" sx={{alignItems: 'center' }}>
                <Button
                  sx={{ my: 0.5 }}
                  variant="contained"
                  size="small"
                  onClick={handleCheckedRight}
                  disabled={leftChecked.length === 0}
                  aria-label="move selected right"
                >
                  &gt;
                </Button>
                <Button
                  sx={{ my: 0.5 }}
                  variant="contained"
                  size="small"
                  onClick={handleCheckedLeft}
                  disabled={rightChecked.length === 0}
                  aria-label="move selected left"
                >
                  &lt;
                </Button>
            </Grid>
        </Grid>
        <Grid item sx={{ml:1}}>{customList('Universes chosen', right)}</Grid>
        <Grid item sx={{ml:1}}>
          <FormError inputName="universeList" errorsList={errors} touchedList={touched}/>
        </Grid>
      </Grid>
    )
}