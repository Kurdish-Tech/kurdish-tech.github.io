// src/Download.jsx
import RojDisc from "./components/RojDisc";
import BackHomeButton from "./components/BackHomeButton";
import { useDesktopReleases } from "./hooks/useDesktopReleases";
import { detectDesktopOS } from "./lib/platform";
import { PLATFORMS, formatAssetSize } from "./lib/platforms";

export default function Download({ navigate }) {
  const { status, data } = useDesktopReleases();
  const recommended = detectDesktopOS();

  return (
    <main className="mx-auto max-w-2xl px-6 pb-20 pt-10 sm:pt-16">
      <BackHomeButton navigate={navigate} />

      <div className="mb-8 flex justify-center animate-rise-in">
        <RojDisc size={48} rayCount={12} className="text-roj" />
      </div>

      <h1 className="mb-2 text-center animate-rise-in font-display text-4xl font-medium tracking-tight text-ink dark:text-paper">
        Li ser Desktopê ferhengê daxe
      </h1>
      <p
        className="mb-12 text-center animate-rise-in text-base text-slate-light dark:text-slate-dark"
        style={{ animationDelay: "60ms" }}>
        Ferheng, rasterast li ser kompîtura te.
      </p>

      {status === "loading" && (
        <p className="text-center text-sm text-slate-light dark:text-slate-dark">
          Tê barkirin…
        </p>
      )}

      {status === "unavailable" && (
        <p className="rounded-2xl border border-paper-border bg-paper-raised/60 p-6 text-center text-sm text-slate-light dark:border-ink-border dark:bg-ink-raised/60 dark:text-slate-dark">
          Guhertoyên Desktopê hê nehatine weşandin — di demek nêz de amade
          dibe.
        </p>
      )}

      {status === "ready" && (
        <div
          className="animate-rise-in space-y-3"
          style={{ animationDelay: "100ms" }}>
          {PLATFORMS.map(({ key, label, icon: Icon, installerNote }) => {
            const asset = data[key];
            const isRecommended = key === recommended;
            return (
              <div
                key={key}
                className={`flex items-center gap-4 rounded-2xl border p-4 ${
                  isRecommended
                    ? "border-roj/40 bg-roj/[0.07] dark:border-roj/30 dark:bg-roj/[0.05]"
                    : "border-paper-border bg-paper-raised/60 dark:border-ink-border dark:bg-ink-raised/60"
                }`}>
                <Icon
                  width={28}
                  height={28}
                  className="shrink-0 text-ink dark:text-paper"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-medium text-ink dark:text-paper">
                      {label}
                    </h2>
                    {isRecommended && (
                      <span className="rounded-full bg-roj/15 px-2 py-0.5 text-[11px] font-semibold text-roj-deep dark:bg-roj/10 dark:text-roj-soft">
                        pêşniyar kirin
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-light dark:text-slate-dark">
                    {asset
                      ? installerNote
                      : "Ev guhertoya sermaseyê hê nehatiye weşandin."}
                  </p>
                </div>
                {asset ? (
                  <a
                    href={asset.url}
                    className="shrink-0 rounded-full bg-roj px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-roj-soft">
                    Daxistin ({formatAssetSize(asset.size)})
                  </a>
                ) : (
                  <span className="shrink-0 rounded-full border border-paper-border px-4 py-2 text-sm text-slate-light dark:border-ink-border dark:text-slate-dark">
                    Hê tune
                  </span>
                )}
              </div>
            );
          })}

          <p className="pt-2 text-center text-xs text-slate-light dark:text-slate-dark">
            Guhertoya {data.version}
          </p>
        </div>
      )}
    </main>
  );
}
