import { useEffect, useState } from 'react';

import { useLoaderData, useNavigate } from '@remix-run/react';

import { json } from '@remix-run/node'; // or cloudflare/deno
import type { LoaderFunction } from '@remix-run/node'; // or cloudflare/deno

import type { Player } from '../types/global.d';

import socket from '../services/io';

import InputField from '~/components/InputField';

export const loader: LoaderFunction = async () => {
  return json({ generatedRoomCode: generateCode() });
};

export default function Index() {
  const loaderData = useLoaderData();

  const navigate = useNavigate();

  const [initialized, setInitialized] = useState(false);
  const [waiting, setWaiting] = useState(false);

  const [playerName, setPlayerName] = useState('');

  const [roomCode, setRoomCode] = useState(loaderData.generatedRoomCode);

  const [players, setPlayers] = useState<Player[]>([]);

  function handleJoin() {
    if (!playerName) {
      return;
    }

    setWaiting(true);

    socket.joinGame({ name: playerName, roomId: roomCode });
  }

  function handleStart() {
    socket.startGame({ roomId: roomCode });
  }

  useEffect(() => {
    if (!initialized) {
      socket.onJoinedRoom(data => {
        setPlayers(data.room.players);
      });

      socket.onPlayerJoined(data => {
        setPlayers(data.room.players);
      });

      socket.onDeckDealt(data => {
        navigate('/play');
      });

      setInitialized(true);
    }
  }, [initialized, players, navigate]);

  return (
    <div className='app'>
      <header>
        <h1>Love Letter Game</h1>
      </header>

      <main className='join-view'>
        <section className='inputs'>
          <InputField
            label='Player Name'
            value={playerName}
            onChange={setPlayerName}
            disabled={waiting}
          />

          <br />

          <InputField
            label='Room Code'
            value={roomCode}
            onChange={value => setRoomCode(value.toUpperCase())}
            disabled={waiting}
          />
        </section>

        {waiting ? (
          <section className='waiting'>
            <h2>Waiting to start game...</h2>

            <ul>
              {players.map(player => {
                return <li key={player.id}>{player.name}</li>;
              })}
            </ul>
          </section>
        ) : null}

        <section className='actions'>
          {waiting ? (
            <button onClick={handleStart}>Start Game</button>
          ) : (
            <button onClick={handleJoin}>Join Game</button>
          )}
        </section>
      </main>
    </div>
  );
}

const generateCode = () => {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return code.toUpperCase();
};
