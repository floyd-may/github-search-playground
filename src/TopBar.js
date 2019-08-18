import React, { useState } from 'react'
import {Cell, Grid, Row} from '@material/react-layout-grid';
import TextField, {Input} from '@material/react-text-field';
import MaterialIcon from '@material/react-material-icon';
import './TopBar.scss';

export default function TopBar({ onSearch }) {
  const [queryText, setQueryText] = useState('');

  function onSubmitForm(e) {
    onSearch(queryText);
    e.preventDefault();
    return false;
  }
  return (
    <Grid className='top-bar'>
      <Row>
        <Cell columns={4} />
        <Cell columns={4}>
          <form onSubmit={onSubmitForm}>
            <TextField
              label='Enter search text here'
              leadingIcon={<MaterialIcon role='button' icon='search'/>}
            ><Input
                autoFocus
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onBlur={(e) => onSearch(queryText)} />
            </TextField>
          </form>
        </Cell>
      </Row>
    </Grid>
  );
}

