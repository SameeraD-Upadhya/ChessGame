import React from 'react';
import { useGameStore } from '../store/gameStore';
import { ScrollText, ChevronRight, History } from 'lucide-react';

export const MoveHistory: React.FC = () => {
  const { history, jumpToMove } = useGameStore();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new move
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Group history into pairs (White, Black)
  const movePairs = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1] || null,
      whiteIdx: i,
      blackIdx: i + 1,
    });
  }

  return (
    <div className="flex flex-col h-full glass rounded-2xl overflow-hidden border border-white/5">
      <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={16} className="text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-300">Move History</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-800 rounded-full text-zinc-500">
          {history.length} PLIES
        </span>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar"
      >
        {movePairs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
            <ScrollText size={32} className="mb-2" />
            <p className="text-[10px] uppercase tracking-tighter">No moves played</p>
          </div>
        ) : (
          movePairs.map((pair) => (
            <div key={pair.num} className="grid grid-cols-[30px_1fr_1fr] gap-2 items-center">
              <span className="text-[10px] font-mono text-zinc-600 text-center">{pair.num}.</span>
              
              <button 
                onClick={() => jumpToMove(pair.whiteIdx)}
                className="text-left px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm font-mono text-zinc-300 transition-colors group flex items-center justify-between"
              >
                {pair.white}
                <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 text-cyan-500" />
              </button>

              {pair.black && (
                <button 
                  onClick={() => jumpToMove(pair.blackIdx)}
                  className="text-left px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm font-mono text-zinc-400 transition-colors group flex items-center justify-between"
                >
                  {pair.black}
                  <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 text-cyan-500" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-zinc-900/50 border-t border-white/5">
        <p className="text-[10px] text-zinc-500 italic text-center">
          Click on any move to replay the position
        </p>
      </div>
    </div>
  );
};
