import { Volume2, VolumeX } from 'lucide-react'

interface GameMenuProps {
  onStartGame: () => void
  soundEnabled: boolean
  onToggleSound: () => void
}

export function GameMenu({ onStartGame, soundEnabled, onToggleSound }: GameMenuProps) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Sound Toggle */}
      <button
        onClick={onToggleSound}
        className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 text-white"
      >
        {soundEnabled ? (
          <Volume2 className="w-5 h-5" />
        ) : (
          <VolumeX className="w-5 h-5" />
        )}
      </button>

      {/* Main Menu Panel */}
      <div className="relative bg-gradient-to-br from-billions-blue/90 to-billions-dark-blue/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
        {/* Billions Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img 
              src="/billions-logo.jpg" 
              alt="Billions Logo" 
              className="w-20 h-20 rounded-2xl shadow-lg animate-billions-float"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-billions-pulse" />
          </div>
        </div>

        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-billions">
            Billions
          </h1>
          <h2 className="text-2xl font-semibold text-billions-turquoise">
            SLICER
          </h2>
        </div>

        {/* Instructions */}
        <div className="text-center mb-8">
          <p className="text-white/90 text-lg leading-relaxed px-4">
            Удерживайте левую кнопку мыши и нарезайте объекты!
          </p>
          <p className="text-billions-green text-sm mt-2 font-medium">
            Оставайтесь острыми, не промахивайтесь.
          </p>
        </div>

        {/* Start Game Button */}
        <button
          onClick={onStartGame}
          className="w-full py-4 px-8 rounded-xl text-xl font-bold text-white bg-gradient-to-r from-billions-red via-billions-orange to-billions-red hover:from-billions-orange hover:via-billions-red hover:to-billions-orange transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-white/30 hover:border-white/50"
        >
          НАЧАТЬ ИГРУ
        </button>

        {/* Attribution */}
        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            Создано MiniMax Agent
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-4 left-4 w-3 h-3 bg-billions-green rounded-full animate-billions-pulse" />
          <div className="absolute top-8 right-8 w-2 h-2 bg-billions-turquoise rounded-full animate-billions-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-6 left-6 w-4 h-4 bg-billions-orange/50 rounded-full animate-billions-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-4 right-12 w-2 h-2 bg-billions-red/70 rounded-full animate-billions-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </div>
    </div>
  )
}