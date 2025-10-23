import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Lightbulb, Hammer, Search } from "lucide-react";
import { ModeCard } from "@/components/mode-card";
import { UserProgress } from "@shared/schema";
import { getProgress } from "@/lib/storage";

export default function Home() {
  const [, setLocation] = useLocation();
  const [progress, setProgress] = useState<UserProgress>({
    learnMode: { completed: false, examplesViewed: 0 },
    buildMode: { completed: false, jtbdsCreated: 0 },
    critiqueMode: { completed: false, jtbdsCritiqued: 0 },
  });

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-foreground">
            JTBD Mastery Studio
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master the art of writing excellent Jobs-to-be-Done statements through interactive learning
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ModeCard
              icon={Lightbulb}
              title="LEARN"
              description="Train your eye to recognize excellent vs terrible JTBDs through 10 real examples and pattern recognition"
              completed={progress.learnMode.completed}
              progress={progress.learnMode.examplesViewed > 0 
                ? `${progress.learnMode.examplesViewed}/10 examples viewed`
                : undefined
              }
              onClick={() => setLocation('/learn')}
              testId="mode-learn"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ModeCard
              icon={Hammer}
              title="BUILD"
              description="Create your first JTBD with step-by-step guidance and AI-powered suggestions for each component"
              completed={progress.buildMode.completed}
              progress={progress.buildMode.jtbdsCreated > 0
                ? `${progress.buildMode.jtbdsCreated} JTBD${progress.buildMode.jtbdsCreated > 1 ? 's' : ''} created`
                : undefined
              }
              onClick={() => setLocation('/build')}
              testId="mode-build"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ModeCard
              icon={Search}
              title="CRITIQUE"
              description="Get instant AI analysis and detailed feedback on existing JTBD statements with component-by-component scoring"
              completed={progress.critiqueMode.completed}
              progress={progress.critiqueMode.jtbdsCritiqued > 0
                ? `${progress.critiqueMode.jtbdsCritiqued} JTBD${progress.critiqueMode.jtbdsCritiqued > 1 ? 's' : ''} critiqued`
                : undefined
              }
              onClick={() => setLocation('/critique')}
              testId="mode-critique"
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="inline-block px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <p className="text-sm font-medium text-primary">
              💡 Tip: Start with LEARN to build pattern recognition, then BUILD your own
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
