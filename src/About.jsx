// src/About.jsx
import RojDisc from './components/RojDisc';
import LinkButton from './components/LinkButton';
import BackHomeButton from './components/BackHomeButton';

const GITHUB_ORG_URL = 'https://github.com/Kurdish-Tech';

function Section({ title, children }) {
  return (
    <div className="border-t border-paper-border py-8 dark:border-ink-border first:border-t-0 first:pt-0">
      <h2 className="mb-3 font-display text-xl font-semibold text-ink dark:text-paper">
        {title}
      </h2>
      <div className="space-y-4 text-[15px] leading-relaxed text-ink/85 dark:text-paper/85">
        {children}
      </div>
    </div>
  );
}

export default function About({ navigate }) {
  return (
    <main className="mx-auto max-w-2xl px-6 pb-20 pt-10 sm:pt-16">
      <BackHomeButton navigate={navigate} />

      <div className="mb-8 flex justify-center animate-rise-in">
        <RojDisc size={48} rayCount={12} className="text-roj" />
      </div>

      <h1 className="mb-2 text-center animate-rise-in font-display text-4xl font-medium tracking-tight text-ink dark:text-paper">
        Derbarê Me de
      </h1>
      <p
        className="mb-12 text-center animate-rise-in text-base text-slate-light dark:text-slate-dark"
        style={{ animationDelay: '60ms' }}
      >
        Ji bo zimanê Kurdî, ji hêla civakê ve.
      </p>

      <div className="animate-rise-in" style={{ animationDelay: '100ms' }}>
        <Section title="Em kî ne?">
          <p>
            Kurdish-Tech komeleyeke çavkaniya-vekirî û civakî ye. Em bawer
            dikin ku ziman bingeha nasnameyekê ye, û ji ber vê yekê em xwe
            terxan kirine avakirina amûrên dîjîtal ên ji bo zimanê Kurdî.
          </p>
        </Section>

        <Section title="Em çi dikin?">
          <p>
            Ji ferhengên serhêl ên mîna vê, heta pergalên klavyeyê, alfabesazî,
            û amûrên nermalava pêşketî — em bingehên dîjîtal ên zimanê Kurdî
            ava dikin. Armanca me sê alî ne: parastina zimanê Kurdî, nûjenkirina
            wê ji bo teknolojiya îro, û avakirina asteke sağlam a
            binesaziya dîjîtal ji bo zimanê me.
          </p>
        </Section>

        <Section title="Çima çavkaniya vekirî?">
          <p>
            Her projeya ku em çêdikin, çavkaniya vekirî ye: belaş e, ji bo her
            kesî vekirî ye, û bi hevkariya civakê tê pêşxistin. Em bawer nakin
            ku divê zimanê me li pişt dîwarê pereyan bimîne — divê her kesê ku
            bixwaze bi kurdî bixebite, bikaribe wisa bike, bêyî astengî.
          </p>
        </Section>

        <Section title="Tu jî beşdar bibe">
          <p>
            Kurdish-Tech ne pargîdaniyek e — komeleyeke dilxwazan e. Ger tu bi
            zimanê Kurdî, bernamesaziyê, an jî parastina çandê eleqedar î, em
            bi germî vedixwînin ku tu li ser GitHub tevlî me bibe.
          </p>
          <div className="pt-2">
            <LinkButton href={GITHUB_ORG_URL} icon="code" variant="primary">
              Rêxistina Me li GitHub
            </LinkButton>
          </div>
        </Section>
      </div>
    </main>
  );
}
