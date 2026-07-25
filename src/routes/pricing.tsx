import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Mise à niveau — Choisissez votre offre" },
      { name: "description", content: "Débloquez les tâches illimitées et l'espace élève avec nos offres Motivation, Travail et Premium." },
    ],
  }),
  component: PricingPage,
});

type Billing = "monthly" | "yearly";

type Plan = {
  id: "motivation" | "travail" | "premium";
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  features: string[];
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "motivation",
    name: "Motivation",
    tagline: "Tâches illimitées sur la version classique",
    monthly: 1.99,
    yearly: 0.99,
    features: ["Tâches illimitées", "Suivi quotidien", "Sans publicité"],
  },
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
    features: ["Tâches illimitées", "Espace élève complet", "Toutes les fonctionnalités", "Support prioritaire"],
    highlight: true,
  },
];

function PricingPage() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight">Choisissez votre offre</h1>
          <p className="mt-3 text-muted-foreground">
            Débloquez plus de fonctionnalités et soutenez le développement de l'app.
          </p>

          <div className="inline-flex mt-6 rounded-lg border p-1 bg-card">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-4 py-2 text-sm rounded-md transition ${
                billing === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-4 py-2 text-sm rounded-md transition ${
                billing === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              Annuel <span className="ml-1 text-xs opacity-80">(-50%)</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const price = billing === "monthly" ? plan.monthly : plan.yearly;
            return (
              <Card
                key={plan.id}
                className={plan.highlight ? "border-primary shadow-lg relative" : "relative"}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">
                    Recommandé
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-4xl font-bold">{price.toFixed(2)} €</span>
                    <span className="text-muted-foreground"> / mois</span>
                    {billing === "yearly" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Facturé annuellement ({(price * 12).toFixed(2)} € / an)
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    onClick={() => alert("Paiement bientôt disponible")}
                  >
                    Choisir {plan.name}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
