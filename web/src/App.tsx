import { useState } from 'react';
import { GameShell, GameTopbar, GameAuth, GameButton, useRooms } from '@progamestore/games';

type ServerMsg =
  | { type: 'welcome'; peerId: string; peers: string[] }
  | { type: 'peer_joined'; peerId: string }
  | { type: 'peer_left'; peerId: string }
  | { type: 'update'; from: string; [key: string]: unknown };

type ClientMsg = { type: 'update'; [key: string]: unknown };

export default function App() {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [peerId, setPeerId] = useState('');
  const [peers, setPeers] = useState<string[]>([]);

  const room = useRooms<ServerMsg, ClientMsg>({
    gameId: 'APPNAME',
    roomId,
    onMessage(msg) {
      if (msg.type === 'welcome') {
        setPeerId(msg.peerId);
        setPeers(msg.peers);
      }
      if (msg.type === 'peer_joined') setPeers((p) => [...p, msg.peerId]);
      if (msg.type === 'peer_left') setPeers((p) => p.filter((id) => id !== msg.peerId));
      if (msg.type === 'update') {
        // TODO: Handle real-time state from other players
      }
    },
  });

  async function handleCreate() {
    const id = await room.create();
    setRoomId(id);
  }

  return (
    <GameShell topbar={<GameTopbar title="APPNAME" stats={[{ label: 'Players', value: peers.length }]} />}>
      <GameAuth />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', padding: '2rem' }}>
        {!roomId ? (
          <Lobby onCreate={handleCreate} onJoin={setRoomId} />
        ) : (
          <>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
              Room: <strong>{roomId}</strong> | You: <strong>{peerId}</strong> | Players: {peers.length}
            </p>
            <div style={{ width: '100%', maxWidth: '500px', aspectRatio: '16/9', border: '2px solid var(--border)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: 'var(--muted)', textAlign: 'center' }}>
                Your game canvas goes here.<br />
                Use <code>room.send()</code> to broadcast at 60fps.
              </p>
            </div>
            <GameButton variant="primary" onClick={() => room.send({ type: 'update', x: Math.random() * 100, y: Math.random() * 100 })}>
              Send Update (placeholder)
            </GameButton>
          </>
        )}
      </div>
    </GameShell>
  );
}

function Lobby({ onCreate, onJoin }: { onCreate: () => void; onJoin: (id: string) => void }) {
  const [joinId, setJoinId] = useState('');
  return (
    <>
      <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>APPNAME</h1>
      <p style={{ color: 'var(--muted)' }}>Real-time multiplayer game on ProGameStore</p>
      <GameButton variant="primary" size="lg" onClick={onCreate}>Create Room</GameButton>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          value={joinId}
          onChange={(e) => setJoinId(e.target.value)}
          placeholder="Room code"
          style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--ink)' }}
        />
        <GameButton variant="secondary" onClick={() => joinId && onJoin(joinId)}>Join</GameButton>
      </div>
    </>
  );
}
