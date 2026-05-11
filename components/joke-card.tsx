"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Share2, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface JokeCardProps {
  question: string;
  answer: string;
  index: number;
}

export function JokeCard({ question, answer, index }: JokeCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 50) + 10);
  const [guess, setGuess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReveal = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
    setIsRevealed(true);
  };

  const handleLike = () => {
    if (!isLiked) {
      setLikeCount(likeCount + 1);
    } else {
      setLikeCount(likeCount - 1);
    }
    setIsLiked(!isLiked);
  };

  const handleShare = async () => {
    const text = `Q: ${question}\nA: ${answer}\n\n오늘의 아재개그에서 더 많은 개그를 만나보세요!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "오늘의 아재개그",
          text: text,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {/* Question Section */}
        <div className="p-5">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
              {index + 1}
            </span>
            <p className="text-foreground text-base leading-relaxed pt-0.5 font-medium">
              {question}
            </p>
          </div>
        </div>

        {/* Reveal Button / Answer Section */}
        <AnimatePresence mode="wait">
          {!isRevealed ? (
            <motion.div
              key="button"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-5 pb-5 flex flex-col gap-3"
            >
              <Input
                placeholder="정답을 예상해 보세요"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                className="w-full h-11 bg-muted/30 border-dashed focus-visible:border-solid focus-visible:border-primary/50 focus-visible:ring-0 shadow-none transition-all placeholder:text-muted-foreground/50"
              />
              <Button
                onClick={handleReveal}
                disabled={isLoading}
                variant="secondary"
                className="w-full h-11 text-sm font-medium group hover:bg-muted transition-colors relative"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    정답 확인 중...
                  </span>
                ) : (
                  <>
                    <span>정답 보기</span>
                    <ChevronDown className="w-4 h-4 ml-2 transition-transform group-hover:translate-y-0.5" />
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="answer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Answer */}
              <div className="bg-muted/50 border-t border-border px-5 py-4">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                  className="text-foreground text-base leading-relaxed"
                >
                  {answer}
                </motion.p>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.3 }}
                className="flex items-center justify-end gap-1 px-4 py-3 bg-muted/30"
              >
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                    isLiked
                      ? "text-accent bg-accent/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-all ${
                      isLiked ? "fill-accent scale-110" : ""
                    }`}
                  />
                  <span className="font-medium">{likeCount}</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
