import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from '@remix-run/react';

import type { Player } from '~/types/global.d';

import socket from '../services/io';

export default function Play() {
  const navigate = useNavigate();

  const [toggle, setToggle] = useState(Math.random());
  const [initialized, setInitialized] = useState(false);

  const [swapping, setSwapping] = useState(false);

  const [viewing, setViewing] = useState(false);
  const [showCards, setShowCards] = useState(false);

  const [showLogs, setShowLogs] = useState(false);

  const [gameOver, setGameOver] = useState(false);

  const [activeCard, setActiveCard] = useState(0);

  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);

  useEffect(() => {
    if (!socket.player) {
      navigate('/');
    }
  }, [socket.player]);

  useEffect(() => {
    if (!initialized) {
      socket.onSwapComplete(data => {
        setToggle(Math.random());
        setSwapping(false);
      });

      socket.onLog();

      socket.onNextPlayer(() => {
        setToggle(Math.random());
        setActiveCard(0);
      });

      socket.onRemainingPlayers(() => {
        setToggle(Math.random());
      });

      socket.onGameOver(() => {
        setToggle(Math.random());
        setShowLogs(true);
        setGameOver(true);
      });

      socket.onStartingGame(() => {
        setSwapping(false);
        setViewing(false);
        setShowCards(false);
        setShowLogs(false);
        setGameOver(false);
        setActiveCard(0);
        setSelectedPlayers([]);
      });

      setInitialized(true);
    }
  }, [initialized, toggle]);

  function openSwapDialog() {
    setSelectedPlayers([]);
    setSwapping(true);
  }

  function openViewDialog() {
    setSelectedPlayers([]);
    setViewing(true);
  }

  const handleSelect = useCallback(
    (player: Player) => {
      const isSelected = selectedPlayers.find(p => p.id === player.id);

      if (isSelected) {
        setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
      } else {
        if (selectedPlayers.length >= 2) {
          return;
        }

        setSelectedPlayers([...selectedPlayers, player]);
      }
    },
    [selectedPlayers]
  );

  function handleSwap() {
    if (selectedPlayers.length < 2) {
      return;
    }

    const playerOneCards = selectedPlayers[0].cards;
    const playerTwoCards = selectedPlayers[1].cards;

    let playerOneCard = playerOneCards[0];
    let playerTwoCard = playerTwoCards[0];

    if (playerOneCards.length >= 2) {
      playerOneCard = playerOneCards[activeCard ? 0 : 1];
    }

    if (playerTwoCards.length >= 2) {
      playerTwoCard = playerTwoCards[activeCard ? 0 : 1];
    }

    socket.swap({
      playerOne: {
        ...selectedPlayers[0],
        cards: [playerOneCard],
      },
      playerTwo: {
        ...selectedPlayers[1],
        cards: [playerTwoCard],
      },
    });
  }

  function handleView() {
    if (!selectedPlayers.length) {
      return;
    }

    setShowCards(true);

    socket.view({ players: selectedPlayers });
  }

  function endTurn() {
    const card = socket.player?.cards[activeCard];

    if (card) {
      socket.play({ card: card });
    }
  }

  function handleKnockOut() {
    socket.knockOut();
  }

  function handleNewRound() {
    socket.startNewRound();
  }

  return (
    <div className='app'>
      <header>
        <h1>Love Letter Game</h1>

        <div className='menu' onClick={() => setShowLogs(true)}>
          <span className='hamburger' />
        </div>
      </header>

      <ul className='card-tabs'>
        {socket.player?.cards.map((card, index, cards) => {
          return (
            <li
              key={card.name}
              className={[
                'card',
                cards[activeCard]?.name === card.name ? 'card--active' : '',
              ].join(' ')}
              onClick={() => setActiveCard(index)}
            >
              <div className='card-value'>{card.value}</div>

              <p className='card-name'>{card.name}</p>
            </li>
          );
        })}
      </ul>

      <main className='play-view'>
        <section className='card-info'>
          <div className='card-meta'>
            <div className='card-value'>
              {socket.player?.cards[activeCard]?.value}
            </div>
            <div className='card-name'>
              {socket.player?.cards[activeCard]?.name}
            </div>
          </div>

          <div className='card-ability'>
            {socket.player?.cards[activeCard]?.ability}
          </div>
        </section>

        <section className='actions'>
          <button
            onClick={openSwapDialog}
            disabled={socket.player?.cards.length !== 2}
          >
            Swap Cards
          </button>
          <button
            onClick={openViewDialog}
            disabled={socket.player?.cards.length !== 2}
          >
            View Card
          </button>
          <button
            onClick={endTurn}
            disabled={socket.player?.cards.length !== 2}
            className='end-turn'
          >
            Play {socket.player?.cards[activeCard]?.name}
          </button>
        </section>
      </main>

      {swapping ? (
        <main className='swap-view'>
          <div
            className='close'
            onClick={() => {
              setSwapping(false);
            }}
          >
            <span className='hamburger' />
          </div>

          <section className='players'>
            {socket.room?.players.map(player => {
              return (
                <div
                  className={[
                    'player',
                    selectedPlayers.find(p => {
                      return p.id === player.id;
                    })
                      ? 'player--selected'
                      : '',
                  ].join(' ')}
                  key={player.id}
                  onClick={() => handleSelect(player)}
                >
                  <div className='player-name'>{player.name}</div>
                </div>
              );
            })}
          </section>

          <section className='actions'>
            <button onClick={handleSwap}>Select Player(s)</button>
          </section>
        </main>
      ) : null}

      {viewing ? (
        <main className='swap-view'>
          <div
            className='close'
            onClick={() => {
              setViewing(false);
            }}
          >
            <span className='hamburger' />
          </div>

          {!showCards ? (
            <section className='players'>
              {socket.room?.players
                .filter(p => p.id !== socket.player?.id)
                .map(player => {
                  return (
                    <div
                      className={[
                        'player',
                        selectedPlayers.find(p => {
                          return p.id === player.id;
                        })
                          ? 'player--selected'
                          : '',
                      ].join(' ')}
                      key={player.id}
                      onClick={() => handleSelect(player)}
                    >
                      <div className='player-name'>{player.name}</div>
                    </div>
                  );
                })}
            </section>
          ) : (
            <section className='cards'>
              {selectedPlayers.map(player => {
                const card = player.cards[0] || {};

                return (
                  <React.Fragment key={player.id}>
                    <p className='player-name'>{player.name}</p>
                    <div className='card'>
                      <div className='card-header'>
                        <div className='card-meta'>
                          <p className='card-value'>{card.value}</p>
                          <p className='card-name'>{card.name}</p>
                        </div>
                      </div>

                      <p className='card-ability'>{card.ability}</p>
                    </div>
                  </React.Fragment>
                );
              })}
            </section>
          )}

          {!showCards ? (
            <section className='actions'>
              <button onClick={handleView}>View Card(s)</button>
            </section>
          ) : (
            <section className='actions'>
              <button
                onClick={() => {
                  setShowCards(false);
                  setViewing(false);
                }}
              >
                Close Dialog
              </button>
            </section>
          )}
        </main>
      ) : null}

      {showLogs ? (
        <main className='swap-view'>
          <div
            className='close'
            onClick={() => {
              setShowLogs(false);
            }}
          >
            <span className='hamburger' />
          </div>

          {gameOver ? <p className='game-over'>Game Over</p> : null}

          <section
            className={['logs', gameOver ? 'logs--marginless' : ''].join(' ')}
          >
            {socket.logs.map(log => {
              const time = new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
              }).format(new Date(log.timestamp));

              return (
                <div className='log' key={log.timestamp}>
                  <p className='log-name'>
                    {time} {log.message}
                  </p>
                </div>
              );
            })}
          </section>

          <section className='actions'>
            <button onClick={handleKnockOut} disabled={gameOver}>
              I suck at this game (K.O)
            </button>
            <button onClick={handleNewRound} className='start-new-round'>
              Start New Round
            </button>
          </section>
        </main>
      ) : null}
    </div>
  );
}
