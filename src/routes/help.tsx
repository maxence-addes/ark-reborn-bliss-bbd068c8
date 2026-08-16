import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, MessageCircle, Mail, Sparkles } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Aide — Daily Rhythms" },
      { name: "description", content: "Centre d'aide et FAQ Daily Rhythms." },
    ],
  }),
  component: HelpPage,
});

const FAQ = [
  {
    q: "Comment créer une habitude ?",
    a: "Depuis l'accueil, cliquez sur le bouton « + » pour ajouter une nouvelle habitude. Vous pouvez choisir une fréquence quotidienne, hebdomadaire, à des dates précises ou une échéance.",
  },
  {
    q: "Comment fonctionne le suivi de série ?",
    a: "Votre série augmente chaque jour où vous validez toutes vos habitudes prévues. Si vous manquez un jour planifié, la série recommence à zéro.",
  },
  {
    q: "Puis-je modifier la planification d'une habitude ?",
    a: "Pour le moment, vous pouvez supprimer une habitude et en créer une nouvelle avec la planification souhaitée.",
  },
  {
    q: "Comment lier un compte parent et un compte enfant ?",
    a: "Depuis le menu de votre compte, ouvrez « Lier un compte » et utilisez le code d'invitation partagé entre les deux comptes.",
  },
  {
    q: "Mes données sont-elles privées ?",
    a: "Oui. Vos habitudes et votre profil ne sont visibles que par vous. Les comptes liés (parent/enfant) ne partagent que les informations strictement nécessaires.",
  },
];

function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <h1 className="text-3xl font-bold mb-1">Centre d'aide</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Trouvez des réponses ou contactez-nous.
        </p>

        <section className="grid sm:grid-cols-2 gap-3 mb-8">
          <div className="rounded-2xl border border-border bg-card p-5">
            <BookOpen className="w-5 h-5 mb-3 text-primary" />
            <p className="font-medium">Guide de démarrage</p>
            <p className="text-xs text-muted-foreground mt-1">
              Apprenez à créer vos premières habitudes en quelques minutes.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <Sparkles className="w-5 h-5 mb-3 text-primary" />
            <p className="font-medium">Astuces de constance</p>
            <p className="text-xs text-muted-foreground mt-1">
              Concentrez-vous sur la fréquence avant l'intensité.
            </p>
          </div>
        </section>

        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
          Questions fréquentes
        </h2>
        <div className="rounded-2xl border border-border bg-card px-5">
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mt-8 mb-3">
          Nous contacter
        </h2>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <a
            href="mailto:maxence.addes@laposte.net"
            className="flex items-center gap-3 text-sm hover:text-primary transition-colors break-all"
          >
            <Mail className="w-4 h-4 shrink-0" /> maxence.addes@laposte.net
          </a>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MessageCircle className="w-4 h-4 shrink-0" /> Réponse sous 1 semaine
          </div>
        </div>
      </div>
    </div>
  );
}
