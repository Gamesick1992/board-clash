import React from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, Sword, Users, Trophy } from 'lucide-react';
import { getLeaderboard } from '../firebase';

export function Menu() {
  const [leaderboard, setLeaderboard] = React.useState<any[]>([]);
  const [showLeaderboard, setShowLeaderboard] = React.useState(false);

  React.useEffect(() => {
    const fetchLeaderboard = async () => {
      const data = await getLeaderboard();
      setLeaderboard(data);
    };
    fetchLeaderboard();
  }, []);

  return (
    <div 
      className="min-h-screen relative overflow-hidden bg-black flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.1) 0%, rgba(0, 0, 0, 0.8) 100%)',
      }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          >
            <Hexagon size={30 + Math.random() * 20} className="text-blue-500" />
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
            BOARD CLASH
          </h1>
          <p className="text-blue-400 text-lg">The Future of Strategy</p>
        </div>
        
        <div className="flex flex-col gap-6 w-full max-w-md">
          <Link
            to="/local"
            className="group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-lg flex items-center justify-center gap-3 transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <Sword size={24} className="text-white" />
              <span className="text-xl font-bold text-white">LOCAL GAME</span>
            </div>
          </Link>

          <Link
            to="/online"
            className="group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-lg flex items-center justify-center gap-3 transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <Users size={24} className="text-white" />
              <span className="text-xl font-bold text-white">ONLINE MATCH</span>
            </div>
          </Link>

          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className="group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-lg flex items-center justify-center gap-3 transform transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]">
              <Trophy size={24} className="text-white" />
              <span className="text-xl font-bold text-white">LEADERBOARD</span>
            </div>
          </button>
        </div>

        {showLeaderboard && (
          <div className="mt-8 w-full max-w-md bg-gray-900/80 backdrop-blur-sm rounded-lg p-6 border border-blue-500/30">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
              Recent Matches
            </h2>
            <div className="space-y-4">
              {leaderboard.map((match, index) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400">#{index + 1}</span>
                    <div>
                      <div className="text-white font-semibold">
                        {match.winner} Won
                      </div>
                      <div className="text-sm text-gray-400">
                        Red: {match.redPieces} • Blue: {match.bluePieces}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(match.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}