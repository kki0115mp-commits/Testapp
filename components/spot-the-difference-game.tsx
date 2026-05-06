"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Heart, Trophy, Frown, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface FoundSpot {
  id: string
  x: number
  y: number
}

// Predefined difference spots (percentage-based coordinates)
const DIFFERENCE_SPOTS = [
  { id: "1", x: 25, y: 30, radius: 8 },
  { id: "2", x: 70, y: 45, radius: 8 },
  { id: "3", x: 45, y: 75, radius: 8 },
  { id: "4", x: 15, y: 60, radius: 8 },
  { id: "5", x: 80, y: 20, radius: 8 },
]

const GAME_DURATION = 60 // seconds
const INITIAL_LIVES = 3

export function SpotTheDifferenceGame() {
  const [lives, setLives] = useState(INITIAL_LIVES)
  const [foundSpots, setFoundSpots] = useState<FoundSpot[]>([])
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [isShaking, setIsShaking] = useState(false)
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing")
  const [breakingHeart, setBreakingHeart] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const totalDifferences = DIFFERENCE_SPOTS.length

  // Timer effect
  useEffect(() => {
    if (gameState !== "playing" || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameState("lost")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameState, timeLeft])

  // Check win condition
  useEffect(() => {
    if (foundSpots.length === totalDifferences && gameState === "playing") {
      setGameState("won")
    }
  }, [foundSpots.length, totalDifferences, gameState])

  // Check lose condition (lives)
  useEffect(() => {
    if (lives <= 0 && gameState === "playing") {
      setGameState("lost")
    }
  }, [lives, gameState])

  const handleImageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (gameState !== "playing") return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      // Check if click is on a difference spot
      const clickedSpot = DIFFERENCE_SPOTS.find((spot) => {
        const distance = Math.sqrt(Math.pow(x - spot.x, 2) + Math.pow(y - spot.y, 2))
        return distance <= spot.radius && !foundSpots.some((f) => f.id === spot.id)
      })

      if (clickedSpot) {
        // Correct tap - add to found spots
        setFoundSpots((prev) => [...prev, { id: clickedSpot.id, x: clickedSpot.x, y: clickedSpot.y }])
      } else {
        // Check if clicking on already found spot (ignore)
        const alreadyFound = foundSpots.some((spot) => {
          const distance = Math.sqrt(Math.pow(x - spot.x, 2) + Math.pow(y - spot.y, 2))
          return distance <= 8
        })

        if (!alreadyFound) {
          // Incorrect tap
          setIsShaking(true)
          setBreakingHeart(lives - 1)
          setLives((prev) => prev - 1)
          setTimeout(() => {
            setIsShaking(false)
            setBreakingHeart(null)
          }, 500)
        }
      }
    },
    [gameState, foundSpots, lives]
  )

  const resetGame = () => {
    setLives(INITIAL_LIVES)
    setFoundSpots([])
    setTimeLeft(GAME_DURATION)
    setGameState("playing")
    setIsShaking(false)
    setBreakingHeart(null)
  }

  const timerProgress = (timeLeft / GAME_DURATION) * 100

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div
        ref={containerRef}
        className={cn(
          "w-full max-w-[430px] flex flex-col gap-4 transition-transform",
          isShaking && "animate-shake"
        )}
      >
        {/* HUD - Heads Up Display */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-4 space-y-3">
          {/* Top row: Lives and Found counter */}
          <div className="flex items-center justify-between">
            {/* Lives */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-muted-foreground mr-1">Lives:</span>
              {Array.from({ length: INITIAL_LIVES }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "transition-all duration-300",
                    breakingHeart === i && "animate-heart-break"
                  )}
                >
                  <Heart
                    className={cn(
                      "w-6 h-6 transition-all duration-300",
                      i < lives
                        ? "fill-game-heart text-game-heart"
                        : "fill-muted text-muted"
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Found counter */}
            <div className="flex items-center gap-2 bg-secondary px-3 py-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-secondary-foreground">
                Found: {foundSpots.length}/{totalDifferences}
              </span>
            </div>
          </div>

          {/* Timer progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-medium">Time Remaining</span>
              <span className="font-mono font-semibold text-foreground">{timeLeft}s</span>
            </div>
            <Progress
              value={timerProgress}
              className={cn(
                "h-3 transition-all",
                timeLeft <= 10 && "bg-destructive/20 [&>div]:bg-destructive"
              )}
            />
          </div>
        </div>

        {/* Game Images */}
        <div className="space-y-3">
          {/* Original Image (Top) */}
          <ImageContainer
            label="Original"
            onClick={handleImageClick}
            foundSpots={foundSpots}
            isTop
          />

          {/* Modified Image (Bottom) */}
          <ImageContainer
            label="Modified"
            onClick={handleImageClick}
            foundSpots={foundSpots}
          />
        </div>

        {/* Hint text */}
        <p className="text-center text-sm text-muted-foreground">
          Tap on the differences you spot in either image!
        </p>
      </div>

      {/* Success Modal */}
      <Dialog open={gameState === "won"} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="max-w-[380px]">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Congratulations!</DialogTitle>
            <DialogDescription className="text-base">
              You found all the differences!
            </DialogDescription>
          </DialogHeader>

          <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Differences Found</span>
              <span className="font-semibold">{totalDifferences}/{totalDifferences}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time Remaining</span>
              <span className="font-semibold">{timeLeft}s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lives Remaining</span>
              <span className="font-semibold flex items-center gap-1">
                {lives}
                <Heart className="w-4 h-4 fill-game-heart text-game-heart" />
              </span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between text-base">
              <span className="font-medium">Final Score</span>
              <span className="font-bold text-primary">
                {Math.round((timeLeft * 10) + (lives * 50))} pts
              </span>
            </div>
          </div>

          <Button onClick={resetGame} size="lg" className="w-full mt-2">
            <RotateCcw className="w-4 h-4 mr-2" />
            Play Again
          </Button>
        </DialogContent>
      </Dialog>

      {/* Game Over Modal */}
      <Dialog open={gameState === "lost"} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="max-w-[380px]">
          <DialogHeader className="items-center text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-2">
              <Frown className="w-8 h-8 text-destructive" />
            </div>
            <DialogTitle className="text-2xl">Game Over</DialogTitle>
            <DialogDescription className="text-base">
              {lives <= 0 ? "You ran out of lives!" : "Time's up!"}
            </DialogDescription>
          </DialogHeader>

          <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Differences Found</span>
              <span className="font-semibold">{foundSpots.length}/{totalDifferences}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Time Remaining</span>
              <span className="font-semibold">{timeLeft}s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Lives Remaining</span>
              <span className="font-semibold flex items-center gap-1">
                {lives}
                <Heart className="w-4 h-4 fill-game-heart text-game-heart" />
              </span>
            </div>
          </div>

          <Button onClick={resetGame} size="lg" className="w-full mt-2">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Image Container Component
interface ImageContainerProps {
  label: string
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void
  foundSpots: FoundSpot[]
  isTop?: boolean
}

function ImageContainer({ label, onClick, foundSpots, isTop }: ImageContainerProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div
        onClick={onClick}
        className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border-2 border-border bg-secondary cursor-crosshair transition-all hover:shadow-xl hover:border-primary/30 active:scale-[0.99]"
      >
        {/* Placeholder pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-6 grid-rows-4 gap-2 w-full h-full p-4 opacity-20">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-lg",
                  isTop ? "bg-primary/30" : "bg-accent/30"
                )}
              />
            ))}
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-muted-foreground/50 text-sm font-medium">
              {isTop ? "Original Image" : "Modified Image"}
            </span>
          </div>
        </div>

        {/* Found spot markers */}
        {foundSpots.map((spot) => (
          <div
            key={spot.id}
            className="absolute w-10 h-10 pointer-events-none"
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
            }}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-[3px] border-game-success bg-game-success/20 animate-pulse-ring" />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-game-success" />
          </div>
        ))}
      </div>
    </div>
  )
}
