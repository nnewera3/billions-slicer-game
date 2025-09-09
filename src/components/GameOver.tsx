import { RotateCcw, Home } from 'lucide-react'

interface GameOverProps {
  score: number
  time: number
  onPlayAgain: () => void
  onMainMenu: () => void
}

export function GameOver({ score, time, onPlayAgain, onMainMenu }: GameOverProps) {
  const formatTime = (seconds: number) => {
    return `${seconds.toFixed(1)}с`
  }

  const getScoreRating = (score: number) => {
    if (score >= 200) return { text: 'НЕВЕРОЯТНО!', color: 'text-billions-green', emoji: '🏆' }
    if (score >= 150) return { text: 'ОТЛИЧНО!', color: 'text-billions-turquoise', emoji: '🌟' }
    if (score >= 100) return { text: 'ХОРОШО!', color: 'text-billions-orange', emoji: '👍' }
    if (score >= 50) return { text: 'НЕПЛОХО', color: 'text-white', emoji: '👌' }
    return { text: 'ПОПРОБУЙТЕ ЕЩЁ', color: 'text-billions-red', emoji: '💪' }
  }

  const rating = getScoreRating(score)

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Game Over Panel */}
      <div className="relative bg-gradient-to-br from-billions-blue/95 to-billions-dark-blue/95 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
        {/* Game Over Title */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 font-billions animate-billions-pulse">
            ИГРА
          </h1>
          <h2 className="text-4xl font-bold text-billions-red mb-6">
            ОКОНЧЕНА
          </h2>
        </div>

        {/* Score Display */}
        <div className="text-center mb-8">
          <div className="bg-white/10 rounded-2xl p-6 mb-4 border border-white/20">
            <div className="text-6xl font-bold text-billions-green mb-2 animate-billions-float">
              {score}
            </div>
            <div className="text-white/80 text-lg">
              Финальный счёт
            </div>
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
            <div className="text-2xl font-semibold text-billions-turquoise mb-1">
              {formatTime(time)}
            </div>
            <div className="text-white/70 text-sm">
              Время игры
            </div>
          </div>

          {/* Rating */}
          <div className="mb-6">
            <div className={`text-3xl font-bold ${rating.color} mb-2`}>
              {rating.emoji} {rating.text}
            </div>
            <div className="text-white/60 text-sm">
              {score > 0 ? `Средний счёт: ${(score / time).toFixed(1)} очков/сек` : 'Удачи в следующий раз!'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onPlayAgain}
            className="w-full py-4 px-8 rounded-xl text-xl font-bold text-white bg-gradient-to-r from-billions-green via-billions-turquoise to-billions-green hover:from-billions-turquoise hover:via-billions-green hover:to-billions-turquoise transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-white/30 hover:border-white/50 flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-6 h-6" />
            ИГРАТЬ СНОВА
          </button>
          
          <button
            onClick={onMainMenu}
            className="w-full py-3 px-8 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-billions-blue/60 to-billions-dark-blue/60 hover:from-billions-blue/80 hover:to-billions-dark-blue/80 transition-all duration-200 border border-white/30 hover:border-white/50 flex items-center justify-center gap-3"
          >
            <Home className="w-5 h-5" />
            ГЛАВНОЕ МЕНЮ
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden rounded-2xl">
          {/* Floating particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-billions-green/60 rounded-full animate-billions-float" style={{ animationDelay: '0s', animationDuration: '4s' }} />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-billions-turquoise/40 rounded-full animate-billions-float" style={{ animationDelay: '1s', animationDuration: '3s' }} />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-billions-orange/50 rounded-full animate-billions-float" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          <div className="absolute bottom-1/4 right-1/3 w-4 h-4 bg-billions-red/30 rounded-full animate-billions-float" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }} />
          <div className="absolute top-1/2 left-1/6 w-2 h-2 bg-billions-green/40 rounded-full animate-billions-float" style={{ animationDelay: '3s', animationDuration: '4.5s' }} />
        </div>
        
        {/* Achievement badges for high scores */}
        {score >= 100 && (
          <div className="absolute -top-4 -right-4 bg-gradient-to-r from-billions-orange to-billions-red text-white font-bold px-4 py-2 rounded-full text-sm shadow-lg animate-billions-pulse">
            🎯 МАСТЕР
          </div>
        )}
        
        {score >= 200 && (
          <div className="absolute -top-4 -left-4 bg-gradient-to-r from-billions-green to-billions-turquoise text-white font-bold px-4 py-2 rounded-full text-sm shadow-lg animate-billions-pulse" style={{ animationDelay: '0.5s' }}>
            👑 ЛЕГЕНДА
          </div>
        )}
      </div>
    </div>
  )
}