import { useState } from 'react'
import { PawPrint } from 'lucide-react'

const slides = [
  {
    src: '/Carousel/carousel1.jpeg',
    alt: 'Cat cafe carousel image one',
    label: 'Cat café rescue day',
    caption: 'A warm first look at the cats you can foster nearby.',
  },
  {
    src: '/Carousel/carousel2.jpg',
    alt: 'Cat cafe carousel image two',
    label: 'Meet nearby strays',
    caption: 'Browse available cats with city radius and care filters.',
  },
  {
    src: '/Carousel/carousel3.jpg',
    alt: 'Cat cafe carousel image three',
    label: 'Foster with confidence',
    caption: 'Track feeding, meds, and recovery updates from one place.',
  },
]

const faqItems = [
  {
    question: 'How does the city matching work?',
    answer:
      'The feed uses your selected city radius and shows only cats within your travel range so fosters can respond quickly.',
  },
  {
    question: 'What if I can only foster for a weekend?',
    answer:
      'Use the availability filter to match short respite fosters, then the platform will prioritize cats that fit your time window.',
  },
  {
    question: 'How do disability tags help me?',
    answer:
      'Non-disabled, physical disability, and mental disability tags are connected to care actions so you can understand the commitment before you accept a foster.',
  },
  {
    question: 'Can I post and update cat status later?',
    answer:
      'Yes. The same workflow is meant to support posting, editing, and updating foster records as cats move through care.',
  },
]

const careTags = ['Non-disabled', 'Physical disability', 'Mental disability']
const fosterTasks = ['Daily feeding times', 'Physical treatment', 'Medicine schedule', 'Notes / updates']

function App() {
  const [activeSlide, setActiveSlide] = useState(0)

  const currentSlide = slides[activeSlide]

  const topSurface =
    'rounded-3xl border border-[rgba(118,127,81,0.2)] bg-[rgba(255,247,225,0.65)] animate-[fadeLift_320ms_cubic-bezier(0.16,1,0.3,1)]'

  return (
    <div className="mx-auto my-2 w-[min(1320px,calc(100%-0.75rem))] overflow-hidden rounded-4xl border border-[rgba(118,127,81,0.26)] bg-[rgba(247,238,214,0.68)] shadow-[0_24px_60px_rgba(84,72,35,0.12)] transition-all duration-500 ease-out">
      <header className="flex flex-wrap items-center justify-between gap-6 bg-[#74824f] px-8 py-7 text-[#f9f1dc] max-[720px]:justify-center max-[720px]:text-center">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f9f1dc]/15 text-[#f9f1dc] shadow-[0_0_0_6px_rgba(249,241,220,0.08)]">
            <PawPrint className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="m-0 font-display text-[1.55rem] leading-none text-[#f9f1dc]">Purr Haven</p>
            <p className="m-0 text-[0.92rem] opacity-90">Cat-cafe warmth for foster matching</p>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-5 text-[1rem] text-[#f9f1dc]">
          <a className="opacity-90 no-underline transition duration-300 ease-out hover:opacity-100" href="#home">
            Home
          </a>
          <a className="opacity-90 no-underline transition duration-300 ease-out hover:opacity-100" href="#faq">
            Foster Care FAQs
          </a>
          <a className="opacity-90 no-underline transition duration-300 ease-out hover:opacity-100" href="#about-us">
            About Us
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border border-transparent bg-[linear-gradient(180deg,#fff6e0,#f0e0b7)] px-6 py-3 font-display text-[#46522d] shadow-[0_10px_24px_rgba(83,74,34,0.2)] transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_14px_28px_rgba(83,74,34,0.24)]"
          >
            Login
          </button>
        </div>
      </header>

      <main className="grid gap-4 p-4 max-[720px]:p-3">
        <section id="home" className="grid min-h-128 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className={`${topSurface} grid gap-4 p-4`} aria-label="Carousel area">
            <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,2fr)_0.95fr]">
              <div className="overflow-hidden rounded-2xl border border-dashed border-[rgba(104,111,69,0.34)] bg-[linear-gradient(180deg,rgba(252,248,236,0.94),rgba(237,230,208,0.92))]">
                <div key={activeSlide} className="grid min-h-92 animate-[fadeLift_420ms_cubic-bezier(0.16,1,0.3,1)]">
                  <img src={currentSlide.src} alt={currentSlide.alt} className="h-full w-full object-cover" />
                </div>
                <div className="grid gap-2 border-t border-[rgba(104,111,69,0.18)] bg-[rgba(247,238,214,0.86)] p-4">
                  <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#eb8543]">
                    {currentSlide.label}
                  </p>
                  <p className="m-0 text-[#5f654e]">{currentSlide.caption}</p>
                </div>
              </div>

              <div className="grid gap-3">
                {slides.map((slide, index) => (
                  <button
                    key={slide.src}
                    type="button"
                    className={`overflow-hidden rounded-2xl border border-dashed border-[rgba(104,111,69,0.34)] text-left transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(84,72,35,0.15)] ${
                      index === activeSlide ? 'shadow-[0_12px_24px_rgba(84,72,35,0.12)]' : ''
                    }`}
                    onClick={() => setActiveSlide(index)}
                  >
                    <img src={slide.src} alt={slide.alt} className="h-28 w-full object-cover" />
                    <div className="bg-[rgba(247,238,214,0.9)] px-3 py-2">
                      <p className="m-0 font-display text-[0.9rem] text-[#46522d]">{slide.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-2" aria-hidden="true">
              {slides.map((slide, index) => (
                <button
                  key={slide.src}
                  type="button"
                  className={`h-4 w-4 rounded-full border border-[rgba(118,127,81,0.38)] transition duration-300 ease-out ${
                    index === activeSlide ? 'bg-[#74824f]' : 'bg-[rgba(255,250,236,0.8)]'
                  }`}
                  onClick={() => setActiveSlide(index)}
                />
              ))}
            </div>
          </div>

          <aside className={`${topSurface} grid gap-4 p-6 lg:content-center`}>
            <p className="m-0 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#eb8543]">Hackathon concept</p>
            <h1 className="m-0 max-w-[12ch] font-display text-[clamp(2rem,3vw,3.45rem)] leading-[1.05] tracking-[-0.02em] text-[#46522d]">
              Find cats near you, foster them with care, and help them get home safely.
            </h1>
            <p className="m-0 max-w-[60ch] text-[#5f654e]">
              This is a city-focused foster and adoption platform for strays and shelter cats. It keeps the
              experience friendly like a cat cafe while still making the important rescue workflow easy to use.
            </p>

            <div className="grid gap-3 sm:grid-cols-3" aria-label="Quick highlights">
              <div className="rounded-2xl bg-[rgba(116,130,79,0.08)] p-4">
                <strong className="block font-display text-[#46522d]">Geo-local</strong>
                <span className="mt-1 block text-[0.86rem] text-[#5f654e]">Match by city radius</span>
              </div>
              <div className="rounded-2xl bg-[rgba(116,130,79,0.08)] p-4">
                <strong className="block font-display text-[#46522d]">Care-aware</strong>
                <span className="mt-1 block text-[0.86rem] text-[#5f654e]">Filter by disability level</span>
              </div>
              <div className="rounded-2xl bg-[rgba(116,130,79,0.08)] p-4">
                <strong className="block font-display text-[#46522d]">Foster-ready</strong>
                <span className="mt-1 block text-[0.86rem] text-[#5f654e]">Track updates and needs</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full border border-transparent bg-[linear-gradient(180deg,#fff6e0,#f0e0b7)] px-5 py-3 font-display text-[#46522d] shadow-[0_10px_24px_rgba(83,74,34,0.2)] transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_14px_28px_rgba(83,74,34,0.24)]"
              >
                Create Account
              </button>
              <button
                type="button"
                className="rounded-full border border-[rgba(118,127,81,0.3)] bg-transparent px-5 py-3 font-display text-[#46522d] shadow-[0_8px_20px_rgba(84,72,35,0.08)] transition duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] hover:bg-[rgba(118,127,81,0.08)] hover:shadow-[0_12px_24px_rgba(84,72,35,0.12)]"
              >
                I Already Foster
              </button>
            </div>
          </aside>
        </section>

        <section id="faq" className={`${topSurface} grid gap-4 p-4`}>
          <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-start">
            <p className="m-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#74824f] font-display text-[#f9f1dc]">
              1.
            </p>
            <div>
              <h2 className="m-0 font-display text-[clamp(1.5rem,2.2vw,2.2rem)] leading-[1.05] tracking-[-0.02em] text-[#46522d]">
                Foster Care FAQs
              </h2>
              <p className="m-0 mt-2 text-[#5f654e]">
                Quick answers for people who want to foster cats nearby and need to understand the workflow fast.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-4 rounded-2xl border border-[rgba(118,127,81,0.18)] bg-[rgba(255,250,238,0.78)] p-4">
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-4 text-[0.92rem]">
                  <span>Travel radius</span>
                  <strong className="font-display text-[#46522d]">10 miles THIS SLIDER DOESN'T WORK FOR NOW</strong>
                </div>
                <div className="relative h-[0.9rem] rounded-full bg-[rgba(116,130,79,0.14)]">
                  <span className="absolute inset-y-0 left-0 w-[60%] rounded-full bg-[linear-gradient(90deg,rgba(116,130,79,0.35),rgba(116,130,79,0.68))]" />
                  <span className="absolute left-[58%] top-1/2 h-[1.3rem] w-[1.3rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#74824f] bg-[#f9f1dc] shadow-[0_4px_12px_rgba(60,72,31,0.18)]" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {['5 miles', '10 miles', '20 miles'].map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      className="rounded-full bg-[rgba(116,130,79,0.08)] px-4 py-2 font-display text-[#46522d] transition duration-300 ease-out hover:-translate-y-1 hover:bg-[rgba(116,130,79,0.12)]"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3">
                <span className="font-display text-[#46522d]">Shelter Type</span>
                <div className="grid grid-cols-5 gap-2">
                  Put image of shelters here mamaya na yan
                </div>
                <p className="m-0 text-[0.9rem] text-[#5f654e]">
                  Use this to match shelter schedule, available cats, and foster care needs.
                </p>
              </div>

              <div className="grid gap-3">
                <span className="font-display text-[#46522d]">Quick category filter</span>
                <p className="m-0 text-[0.9rem] text-[#5f654e]">
                  Check the type of cats currently in the shelter
                </p>
                <div className="flex flex-wrap gap-2">
                  {careTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center justify-center rounded-full bg-[rgba(116,130,79,0.08)] px-4 py-2 font-display text-[#46522d]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-2xl border border-[rgba(118,127,81,0.18)] bg-[rgba(255,250,238,0.78)] p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="m-0 font-display text-[1.15rem] text-[#46522d]">Frequently asked questions</h3>
                <span className="text-[0.9rem] text-[#5f654e]">Simple preview layout</span>
              </div>

              <div className="grid gap-3">
                {faqItems.map((item) => (
                  <details
                    key={item.question}
                    className="group rounded-2xl border border-[rgba(118,127,81,0.16)] bg-[rgba(116,130,79,0.06)] p-4 transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(84,72,35,0.08)]"
                  >
                    <summary className="cursor-pointer list-none font-display text-[#46522d]">
                      {item.question}
                    </summary>
                    <p className="m-0 mt-3 text-[#5f654e]">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="feature-two" className={`${topSurface} grid gap-4 p-4`}>
          <div className="grid gap-4 md:grid-cols-[auto_1fr] md:items-start">
            <p className="m-0 flex h-8 w-8 items-center justify-center rounded-full bg-[#74824f] font-display text-[#f9f1dc]">
              2.
            </p>
            <div>
              <h2 className="m-0 font-display text-[clamp(1.5rem,2.2vw,2.2rem)] leading-[1.05] tracking-[-0.02em] text-[#46522d]">
                Foster care status updates
              </h2>
              <p className="m-0 mt-2 text-[#5f654e]">
                Track the cat you are fostering with feeding, medicine, physical treatment, and update notes.
              </p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-4 rounded-2xl border border-[rgba(118,127,81,0.18)] bg-[rgba(255,250,238,0.78)] p-4">
                <h3 className="m-0 font-display text-[1.15rem] text-[#46522d]">Daily checklist</h3>
                <ul className="m-0 grid list-none gap-3 p-0">
                  {fosterTasks.map((task) => (
                    <li key={task} className="flex items-center gap-3 font-display text-[#46522d]">
                      <span className="h-3.5 w-3.5 rounded-full border border-[rgba(118,127,81,0.5)] bg-[rgba(118,127,81,0.16)]" />
                      {task}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-4 rounded-2xl border border-[rgba(118,127,81,0.18)] bg-[rgba(255,250,238,0.78)] p-4">
                <h3 className="m-0 font-display text-[1.15rem] text-[#46522d]">Condition log</h3>
                <div className="grid gap-3">
                  {[
                    ['Weight', '+120g this week'],
                    ['Mobility', 'Improving after treatment'],
                    ['Medication', 'Morning and night doses tracked'],
                  ].map(([label, value]) => (
                    <div key={label} className="grid gap-1 rounded-xl bg-[rgba(116,130,79,0.08)] px-4 py-3">
                      <strong className="font-display text-[#46522d]">{label}</strong>
                      <span className="text-[0.88rem] text-[#5f654e]">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-2xl border border-[rgba(118,127,81,0.18)] bg-[rgba(255,250,238,0.78)] p-4">
              <div className="grid gap-2">
                <h3 className="m-0 font-display text-[1.15rem] text-[#46522d]">
                  Notes, updates, and emergency rescue chat
                </h3>
                <p className="m-0 text-[#5f654e]">
                  Fosters can log progress, tell the shelter what changed, and message the rescue coordinator if
                  they need help right away.
                </p>
              </div>

              <div className="grid gap-3 rounded-2xl bg-[rgba(116,130,79,0.06)] p-4">
                <div className="w-fit max-w-[90%] rounded-2xl bg-[#f9f1dc] px-4 py-3 font-display text-[0.92rem] text-[#46522d]">
                  Need advice on feeding schedule.
                </div>
                <div className="ml-auto w-fit max-w-[90%] rounded-2xl bg-[#74824f] px-4 py-3 font-display text-[0.92rem] text-[#f9f1dc]">
                  Use the med timer and send photos daily.
                </div>
                <div className="w-fit max-w-[90%] rounded-2xl bg-[#f9f1dc] px-4 py-3 font-display text-[0.92rem] text-[#46522d]">
                  Mobility looks better today.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about-us" className={`${topSurface} flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between`}>
          <div>
            <h2 className="m-0 font-display text-[clamp(1.5rem,2.2vw,2.2rem)] leading-[1.05] tracking-[-0.02em] text-[#46522d]">
              About Us
            </h2>
            <p className="m-0 mt-2 max-w-[75ch] text-[#5f654e]">
              mga alagad kami ni doc pati
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App