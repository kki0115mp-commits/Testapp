"use client";

import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { JokeCard } from "@/components/joke-card";
import { Button } from "@/components/ui/button";

const jokes = [
  {
    question: "아몬드가 죽으면 뭐가 될까요?",
    answer: "다이아몬드 (die + 아몬드) 💎",
  },
  {
    question: "세상에서 가장 추운 바다는 어디일까요?",
    answer: "썰렁해 🥶",
  },
  {
    question: "소금의 유통기한은 언제까지일까요?",
    answer: "소금이 천일염이니까 천 일 동안! 📅",
  },
];

function getFormattedDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[today.getDay()];
  
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

export default function Home() {
  const handleShareAll = async () => {
    const allJokes = jokes
      .map((joke, i) => `${i + 1}. Q: ${joke.question}\n   A: ${joke.answer}`)
      .join("\n\n");
    
    const text = `오늘의 아재개그 3가지 🤣\n\n${allJokes}\n\n오늘의 아재개그에서 더 많은 개그를 만나보세요!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "오늘의 아재개그 3가지",
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
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Mobile Container */}
      <div className="w-full max-w-[400px] min-h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center pt-8 pb-6"
        >
          <h1 className="font-serif text-3xl font-bold text-foreground tracking-tight">
            오늘의 아재개그 3가지
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {getFormattedDate()}
          </p>
        </motion.header>

        {/* Joke Cards */}
        <div className="flex-1 flex flex-col gap-4 pb-24">
          {jokes.map((joke, index) => (
            <JokeCard
              key={index}
              question={joke.question}
              answer={joke.answer}
              index={index}
            />
          ))}
        </div>

        {/* Sticky Bottom Share Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent"
        >
          <div className="max-w-[400px] mx-auto">
            <Button
              onClick={handleShareAll}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-lg text-base font-semibold transition-all hover:shadow-xl active:scale-[0.98]"
            >
              <Share2 className="w-5 h-5 mr-2" />
              오늘의 개그 공유하기
            </Button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
