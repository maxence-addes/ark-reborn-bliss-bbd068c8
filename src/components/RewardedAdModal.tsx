import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { showAd, SIMULATED_AD_DURATION_SECONDS } from "@/lib/admob";


type Props = {
  open: boolean;
  onClose: () => void;
  onRewarded: () => void;
};

export function RewardedAdModal({ open, onClose, onRewarded }: Props) {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [remaining, setRemaining] = useState(SIMULATED_AD_DURATION_SECONDS);

  useEffect(() => {
    if (!open) {
      setPlaying(false);
      setRemaining(SIMULATED_AD_DURATION_SECONDS);
    }
  }, [open]);

  const handleWatch = async () => {
    setPlaying(true);
    setRemaining(SIMULATED_AD_DURATION_SECONDS);
    await showAd({ onTick: (s) => setRemaining(Math.max(s, 0)) });
    onRewarded();
    onClose();
  };

  const progress =
    ((SIMULATED_AD_DURATION_SECONDS - remaining) / SIMULATED_AD_DURATION_SECONDS) * 100;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && !playing && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Limite gratuite atteinte</DialogTitle>
          <DialogDescription>
            Vous avez déjà 2 tâches actives. Regardez une courte vidéo pour
            débloquer la création d'une tâche supplémentaire.
          </DialogDescription>
        </DialogHeader>

        {!playing ? (
          <div className="flex flex-col gap-3 pt-2">
            <Button onClick={handleWatch} className="w-full">
              Regarder la vidéo (5 s)
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onClose();
                void navigate({ to: "/pricing" });
              }}
            >
              <Sparkles className="h-4 w-4" />
              Mise à niveau
            </Button>
            <Button variant="ghost" onClick={onClose} className="w-full">
              Annuler
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="text-5xl font-bold tabular-nums">{remaining}</div>
            <p className="text-sm text-muted-foreground">
              Publicité en cours… merci de patienter
            </p>
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
