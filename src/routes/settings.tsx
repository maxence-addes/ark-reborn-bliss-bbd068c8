import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  Loader2,
  Save,
  Sun,
  Moon,
  LogOut,
  Mail,
  Calendar,
  Shield,
  Hash,
  Briefcase,
  Trash2,
  GraduationCap,
  Target,
  BookOpen,
  Users,
  Baby,
  ListChecks,
  User as UserIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteMyAccount } from "@/lib/account.functions";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Paramètres — Daily Rhythms" },
      { name: "description", content: "Gérez votre compte et vos préférences." },
    ],
  }),
  component: SettingsPage,
});

type ProfileMetadata = {
  grade?: string;
  studentGoal?: string;
  subjects?: string[];
  childCount?: string;
  childLevels?: string[];
  expectations?: string[];
};

type ProfileInfo = {
  display_name: string | null;
  profession: string | null;
  onboarded_at: string | null;
  created_at: string | null;
  invite_code: string | null;
  invite_codes: string[] | null;
  metadata: ProfileMetadata | null;
};

type ChildLink = { id: string; display_name: string | null };

const STUDENT_GOAL_LABELS: Record<string, string> = {
  organize: "Mieux organiser devoirs et révisions",
  habits: "Ancrer de bonnes habitudes",
  procrastinate: "Arrêter de procrastiner",
  reassure: "Rassurer mes parents",
};

const PARENT_EXPECTATION_LABELS: Record<string, string> = {
  notify: "Notification quand un devoir est terminé",
  planning: "Vue d'ensemble du planning",
  validate: "Valider le travail avant validation",
  habits: "Suivre la régularité des habitudes",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function professionLabel(p: string | null): string {
  if (!p) return "Non renseigné";
  if (p === "parent") return "Parent";
  if (p === "student") return "Étudiant";
  return p.charAt(0).toUpperCase() + p.slice(1);
}

function SettingsPage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const deleteAccount = useServerFn(deleteMyAccount);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [children, setChildren] = useState<ChildLink[]>([]);
  const [habitsCount, setHabitsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    let cancelled = false;
    (async () => {
      const [{ data: prof }, { count }, { data: kids }] = await Promise.all([
        supabase
          .from("profiles")
          .select("display_name, profession, onboarded_at, created_at, invite_code, invite_codes, metadata")
          .eq("id", user.id)
          .maybeSingle(),
        supabase
          .from("habits")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase.rpc("get_my_children"),
      ]);
      if (cancelled) return;
      setDisplayName(prof?.display_name ?? "");
      setEmail(user.email ?? "");
      setProfile(
        prof
          ? { ...prof, metadata: (prof.metadata as ProfileMetadata | null) ?? null }
          : null,
      );
      setChildren((kids as ChildLink[] | null) ?? []);
      setHabitsCount(count ?? 0);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() || null })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Impossible d'enregistrer");
      return;
    }
    toast.success("Paramètres enregistrés");
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount({});
      await supabase.auth.signOut();
      toast.success("Compte supprimé");
      navigate({ to: "/login" });
    } catch (e) {
      console.error(e);
      toast.error("Impossible de supprimer le compte");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const provider =
    (user?.app_metadata?.provider as string | undefined) ?? "email";
  const providerLabel = provider === "google" ? "Google" : "Email";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate({ to: "/" })}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Retour
        </button>

        <h1 className="text-3xl font-bold mb-1">Paramètres</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Gérez votre profil et vos préférences.
        </p>

        <section className="space-y-6">
          {/* Vue d'ensemble du compte */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Informations du compte
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <InfoRow icon={Mail} label="Email" value={email || "—"} />
              <InfoRow
                icon={Shield}
                label="Méthode de connexion"
                value={providerLabel}
              />
              <InfoRow
                icon={Briefcase}
                label="Profil"
                value={professionLabel(profile?.profession ?? null)}
              />
              <InfoRow
                icon={Calendar}
                label="Membre depuis"
                value={formatDate(profile?.created_at ?? user?.created_at ?? null)}
              />
              <InfoRow
                icon={Calendar}
                label="Quiz complété le"
                value={formatDate(profile?.onboarded_at ?? null)}
              />
              <InfoRow
                icon={Hash}
                label="Code d'invitation"
                value={profile?.invite_code ?? "—"}
                mono
              />
              {/* Student-specific */}
              {profile?.profession === "student" && profile?.metadata?.grade && (
                <InfoRow
                  icon={GraduationCap}
                  label="Niveau"
                  value={profile.metadata.grade}
                />
              )}
              {profile?.profession === "student" && profile?.metadata?.studentGoal && (
                <InfoRow
                  icon={Target}
                  label="Objectif principal"
                  value={
                    STUDENT_GOAL_LABELS[profile.metadata.studentGoal] ??
                    profile.metadata.studentGoal
                  }
                />
              )}
              {/* Parent-specific */}
              {profile?.profession === "parent" && profile?.metadata?.childCount && (
                <InfoRow
                  icon={Users}
                  label="Nombre d'enfants"
                  value={profile.metadata.childCount}
                />
              )}
            </div>

            {/* Subjects (student) */}
            {profile?.profession === "student" &&
              profile?.metadata?.subjects &&
              profile.metadata.subjects.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> Matières prioritaires
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.metadata.subjects.map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-sm text-foreground border border-border"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Child levels (parent) */}
            {profile?.profession === "parent" &&
              profile?.metadata?.childLevels &&
              profile.metadata.childLevels.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                    <Baby className="w-3 h-3" /> Niveaux scolaires des enfants
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.metadata.childLevels.map((lvl, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-sm text-foreground border border-border"
                      >
                        {lvl}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Children names (parent) */}
            {profile?.profession === "parent" && children.length > 0 && (
              <div className="pt-3 border-t border-border">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3" /> Mes enfants liés
                </p>
                <div className="flex flex-wrap gap-2">
                  {children.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-sm font-medium text-foreground border border-border"
                    >
                      <UserIcon className="w-3 h-3 text-muted-foreground" />
                      {c.display_name ?? "Sans nom"}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Parent expectations */}
            {profile?.profession === "parent" &&
              profile?.metadata?.expectations &&
              profile.metadata.expectations.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5">
                    <ListChecks className="w-3 h-3" /> Mes attentes
                  </p>
                  <ul className="space-y-1">
                    {profile.metadata.expectations.map((e, i) => (
                      <li
                        key={i}
                        className="text-sm text-foreground flex items-start gap-2"
                      >
                        <span className="text-muted-foreground">•</span>
                        {PARENT_EXPECTATION_LABELS[e] ?? e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Tous les codes d'invitations */}
            {profile?.invite_codes && profile.invite_codes.length > 0 && (
              <div className="pt-3 border-t border-border">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
                  Tous les codes d'invitations
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.invite_codes.map((code, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-sm font-mono font-medium text-foreground border border-border"
                      title="Code d'invitation"
                    >
                      <Hash className="w-3 h-3 text-muted-foreground" />
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Habitudes actives :{" "}
                <span className="font-semibold text-foreground">{habitsCount}</span>
              </p>
            </div>
          </div>

          {/* Profil éditable */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Profil
            </h2>
            <div className="space-y-2">
              <Label htmlFor="name">Nom affiché</Label>
              <Input
                id="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Votre nom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={email} disabled />
              <p className="text-xs text-muted-foreground">
                L'email ne peut pas être modifié ici.
              </p>
            </div>
            <Button onClick={save} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Enregistrer
            </Button>
          </div>

          {/* Apparence */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Apparence
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Thème</p>
                <p className="text-xs text-muted-foreground">
                  {theme === "dark" ? "Sombre" : "Clair"}
                </p>
              </div>
              <Button variant="outline" onClick={toggle} className="gap-2">
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                Basculer
              </Button>
            </div>
          </div>

          {/* Quiz */}
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Quiz
            </h2>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">Refaire le quiz d'introduction</p>
                <p className="text-xs text-muted-foreground">
                  Ajustez votre profil et vos préférences.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  navigate({ to: "/onboarding", search: { retake: 1 } })
                }
              >
                Refaire
              </Button>
            </div>
          </div>

          {/* Zone dangereuse */}
          <div className="rounded-2xl border border-destructive/30 bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-destructive">
              Zone dangereuse
            </h2>
            <Button
              variant="outline"
              onClick={() => signOut()}
              className="gap-2 w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4" /> Se déconnecter
            </Button>

            <div className="pt-4 border-t border-destructive/20 space-y-3">
              <div>
                <p className="font-medium text-foreground">
                  Supprimer le compte
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Cette action est définitive. Toutes vos habitudes, votre
                  historique et votre profil seront supprimés sans possibilité
                  de récupération.
                </p>
              </div>
              <AlertDialog
                onOpenChange={(open) => {
                  if (!open) setConfirmText("");
                }}
              >
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="w-4 h-4" /> Supprimer mon compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Supprimer définitivement votre compte ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Toutes vos données seront effacées immédiatement. Pour
                      confirmer, tapez{" "}
                      <span className="font-mono font-semibold text-foreground">
                        SUPPRIMER
                      </span>{" "}
                      ci-dessous.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="SUPPRIMER"
                    autoFocus
                  />
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deleting}>
                      Annuler
                    </AlertDialogCancel>
                    <AlertDialogAction
                      disabled={confirmText !== "SUPPRIMER" || deleting}
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete();
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Supprimer"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
      <Icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={
            "text-sm font-medium truncate " + (mono ? "font-mono" : "")
          }
          title={value}
        >
          {value}
        </p>
      </div>
    </div>
  );
}
