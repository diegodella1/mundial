import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("common");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">
          {t("appName")}
        </h1>
        <p className="mt-4 text-xl text-zinc-400">
          {t("tagline")}
        </p>
        <div className="mt-8 rounded-full bg-zinc-800/50 px-6 py-3 text-sm text-zinc-500">
          {t("comingSoon")}
        </div>
      </div>
    </main>
  );
}
