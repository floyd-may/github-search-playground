import React, { useState } from 'react'
import './App.scss'
import {Cell, Grid, Row} from '@material/react-layout-grid';
import ComposedSearchProvider from './ComposedSearchProvider';
import TopBar from './TopBar';
import Loader from './Loader';
import 'material-components-web/material-components-web.scss';


function App () {
  const [tmpQueryText, setTmpQueryText] = useState('');
  const [queryText, setQueryText] = useState('');
  function onSubmitForm(e) {
    setQueryText(tmpQueryText);
    e.preventDefault();
    return false;
  }
  return (
    <div className='backdrop'>
      <TopBar onSearch={setQueryText} />
      <ComposedSearchProvider>
        <Grid className='results'>
          <Row>
            <Cell columns={3} />
            <Cell columns={6}>
              <Loader query={queryText} />
            </Cell>
          </Row>
        </Grid>
      </ComposedSearchProvider>
      <link href='https://fonts.googleapis.com/icon?family=Material+Icons' rel='stylesheet' />
    </div>
  )
}

export default App
