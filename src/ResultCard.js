import React from 'react'
import Card, { CardPrimaryContent } from '@material/react-card';
import Button from '@material/react-button';
import { Headline4, Subtitle2 } from '@material/react-typography';
import Counter from './Counter';

import './ResultCard.scss';

function StatCounter({ title, className, stat }) {
  const actualClassName = [ className, 'stat-counter' ]
    .filter(x => x !== null)
    .join(' ');
  return (
    <div className={actualClassName}>
      <div className='stat'>
        <Counter end={stat} duration={1.5} />
      </div>
      <label>{title}</label>
    </div>
  );
}

export default function ResultCard ({ 
  login,
  name,
  node_id,
  avatar_url,
  html_url,
  repos_url,
  followers,
  public_repos,
}) {
  return (
    <Card className='result-card'>
      <CardPrimaryContent onClick={() => { window.location = html_url; }}>
        <div className='ident'>
          <img src={avatar_url} width='80' height='80' alt={`avatar for ${login}`} />
          <div className='name'>
            <Headline4>{login}</Headline4>
            <Subtitle2>{name}</Subtitle2>
          </div>
        </div>
        <div className='stats'>
          <StatCounter title='Repos' className='repos' stat={public_repos} />
          <StatCounter title='Followers' className='followers' stat={followers} />
        </div>
      </CardPrimaryContent>
    </Card>
  );
}

