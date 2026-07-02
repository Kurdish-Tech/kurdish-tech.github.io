// src/components/Footer.jsx
import RojDisc from './RojDisc';

export default function Footer({ navigate }) {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-paper-border bg-paper-raised/40 dark:border-ink-border dark:bg-ink-raised/40">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <RojDisc size={22} rayCount={10} className="text-roj" />
              <span className="font-display text-base font-semibold text-ink dark:text-paper">
                Ferheng
              </span>
            </div>
            <p className="text-sm text-slate-light dark:text-slate-dark">
              Bi eşq ji bo zimanê Kurdî hatîye afirandin.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-light dark:text-slate-dark">
              Rêber
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="text-ink/80 transition-colors hover:text-roj-deep dark:text-paper/80 dark:hover:text-roj"
                >
                  Malper
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="text-ink/80 transition-colors hover:text-roj-deep dark:text-paper/80 dark:hover:text-roj"
                >
                  Derbarê Me
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/Kurdish-Tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink/80 transition-colors hover:text-roj-deep dark:text-paper/80 dark:hover:text-roj"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-light dark:text-slate-dark">
              Çavkanî
            </h3>
            <p className="text-sm leading-relaxed text-slate-light dark:text-slate-dark">
              Peyv ji{' '}
              <a
                href="https://ku.wiktionary.org"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-ink underline decoration-roj decoration-2 underline-offset-2 hover:text-roj-deep dark:text-paper dark:hover:text-roj"
              >
                Wîkîferheng
              </a>
              , derxistina avahîyî ya{' '}
              <a
                href="https://kaikki.org/kuwiktionary/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-slate-light/40 underline-offset-2 hover:text-ink dark:hover:text-paper"
              >
                kaikki.org
              </a>
              . Lîsansa{' '}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-slate-light/40 underline-offset-2 hover:text-ink dark:hover:text-paper"
              >
                CC BY-SA 4.0
              </a>{' '}
              + GFDL.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 border-t border-paper-border pt-6 text-center text-xs text-slate-light dark:border-ink-border dark:text-slate-dark sm:flex-row sm:justify-between sm:text-left">
          <p>© {year} Kurdish-Tech. Hemû maf parastî ne.</p>
          <p>Çavkaniya vekirî, belaş, ji bo her kesî.</p>
        </div>
      </div>
    </footer>
  );
}
