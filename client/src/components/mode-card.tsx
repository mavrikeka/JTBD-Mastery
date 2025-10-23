import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface ModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  completed: boolean;
  progress?: string;
  onClick: () => void;
  testId: string;
}

export function ModeCard({ icon: Icon, title, description, completed, progress, onClick, testId }: ModeCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Card className="relative overflow-hidden p-8 hover-elevate active-elevate-2 cursor-pointer h-full" onClick={onClick} data-testid={testId}>
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Icon className="w-8 h-8 text-primary" />
            </div>
            {completed && (
              <div className="px-3 py-1 rounded-full bg-chart-3/10 border border-chart-3/20 text-chart-3 text-xs font-medium">
                ✓ Completed
              </div>
            )}
          </div>
          
          <h3 className="text-2xl font-bold mb-3 text-foreground">{title}</h3>
          <p className="text-muted-foreground mb-6 flex-grow leading-relaxed">{description}</p>
          
          {progress && (
            <p className="text-sm text-muted-foreground mb-4">{progress}</p>
          )}
          
          <Button 
            variant="primary" 
            className="w-full" 
            size="lg"
            data-testid={`${testId}-start`}
          >
            {completed ? 'Play Again' : 'Start'}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
