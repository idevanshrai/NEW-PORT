import { AWARDS, PROFILE } from '../data';
import { Reveal } from './Reveal';

export const About = () => (
  <section id="about" className="relative px-5 py-28 md:px-10 md:py-40">
    <div className="mx-auto grid max-w-page lg:pr-[22vw] gap-12 md:grid-cols-12">
      <div className="md:col-span-3">
        <figure>
          <img
            src="/about-me.jpg"
            alt="Devansh at a laptop in his school robotics lab"
            width={841}
            height={864}
            loading="lazy"
            // phones have no hover, so the photo stays in colour there
            className="w-full max-w-[200px] contrast-[1.1] transition duration-700 md:max-w-[240px] md:grayscale md:hover:grayscale-0"
          />
          <figcaption className="label mt-3">School robotics lab</figcaption>
        </figure>
      </div>

      <div className="md:col-span-9">
        <Reveal>
          <p className="max-w-3xl font-serif text-4xl leading-[1.08] text-paper md:text-5xl">
            I like software that <em>works in the real world</em> — on a
            robot, on a laptop with no internet, or in a tool someone opens every single day.
          </p>
        </Reveal>

        <div className="mt-12 grid max-w-3xl gap-8 lg:grid-cols-2">
          {PROFILE.about.map((p, i) => (
            <Reveal key={i} delay={0.08 * i}>
              <p className="leading-relaxed text-mute">{p}</p>
            </Reveal>
          ))}
        </div>


        <div className="mt-20">
          <h3 className="label mb-4">Recognition</h3>
          <ul className="grid md:grid-cols-2 md:gap-x-10">
            {AWARDS.map((a) => (
              <li key={a.what + a.where} className="border-t border-line py-4">
                <div className="flex justify-between gap-4 text-paper">
                  <span>{a.what}</span>
                  <span className="font-mono text-xs text-mute">{a.year}</span>
                </div>
                <p className="mt-1 text-sm text-mute">{a.where}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);
