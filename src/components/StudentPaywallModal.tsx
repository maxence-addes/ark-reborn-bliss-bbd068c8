import { useNavigate } from "@tanstack/react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Plan = {
  id: "travail" | "premium";
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  features: string[];
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "travail",
    name: "Travail",
    tagline: "Accès à l'espace élève",
    monthly: 2.99,
    yearly: 1.99,
    features: ["Espace élève complet", "Validation parent / enfant", "Suivi des progrès"],
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Le meilleur des deux offres",
    monthly: 3.99,
    yearly: 2.49,
    features: ["Tâches illimitées", "Espace élève complet", "Support prioritaire"],
    highlight: true,
  },
];

export function StudentPaywallModal({ open, onClose }: Props) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Accès réservé aux abonnés
          </DialogTitle>
          <DialogDescription>
            L'espace élève est disponible avec les offres ci-dessous. Choisissez
            une formule pour débloquer cette fonctionnalité.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2 pt-2">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg border p-4 relative ${
                plan.highlight ? "border-primary shadow-md" : ""
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  Recommandé
                </div>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.tagline}</p>
              <div className="mt-3">
                <span className="text-2xl font-bold">{plan.monthly.toFixed(2)} €</span>
                <span className="text-sm text-muted-foreground"> / mois</span>
                <p className="text-xs text-muted-foreground">
                  ou {plan.yearly.toFixed(2)} € / mois en annuel
                </p>
              </div>
              <ul className="mt-3 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={() => {
              onClose();
              void navigate({ to: "/pricing" });
            }}
          >
            Voir toutes les offres
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
