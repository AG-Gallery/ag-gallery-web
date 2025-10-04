import { Link, useLocation } from '@tanstack/react-router'

export default function Footer() {
  const location = useLocation()
  const isMagazineRoute = location.pathname.startsWith('/magazine')

  const navLinks = [
    { title: 'Home', path: '/' },
    { title: 'Artists', path: '/artists' },
    { title: 'Artworks', path: '/artworks' },
    { title: 'Exhibitions & Fairs', path: '/events?filter=current' },
    { title: 'Magazine', path: '/magazine' },
    { title: 'About', path: '/about' },
  ]

  const socialMediaLinks = [
    { title: 'Instagram', link: 'https://instagram.com' },
    { title: 'Facebook', link: 'https://facebook.com' },
  ]

  const footerBgClass = isMagazineRoute ? 'bg-black text-white' : 'bg-neutral-100/60'

  return (
    <footer className={`-mx-4 mt-10 p-4 md:-mx-10 md:p-6 transition-colors duration-200 ${footerBgClass}`}>
      <div className="mt-5 flex flex-col items-start justify-between gap-6 md:flex-row md:gap-0 lg:mx-32 xl:mx-56">
        <div>
          <h4 className="font-playfair text-2xl font-medium">AG Gallery</h4>
          <p className="mt-1 text-sm">
            418 E Colorado Blvd, Glendale, CA 91205
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h5 className="font-lora font-semibold tracking-wide">The Gallery</h5>
          <nav>
            <ul className="space-y-2">
              {navLinks.map((navLink) => (
                <li key={navLink.path} className="text-sm tracking-wide">
                  <Link
                    to={navLink.path}
                    className="hover:text-accent transition-colors duration-150 ease-in-out"
                  >
                    {navLink.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <section className="flex flex-col gap-3">
          <h5 className="font-lora font-semibold tracking-wide">
            Social Media
          </h5>
          <ul className="space-y-2">
            {socialMediaLinks.map((socialMedia) => (
              <li key={socialMedia.link} className="text-sm tracking-wide">
                <a
                  href={socialMedia.link}
                  target="_blank"
                  className="hover:text-accent transition-colors duration-150 ease-in-out"
                >
                  {socialMedia.title}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h5 className="font-lora font-semibold tracking-wide">Legal</h5>
          <ul className="space-y-2">
            <li className="text-sm tracking-wide">
              <a
                href="/"
                className="hover:text-accent transition-colors duration-150 ease-in-out"
              >
                Privacy Policy
              </a>
            </li>
            <li className="text-sm tracking-wide">
              <a
                href="/"
                className="hover:text-accent transition-colors duration-150 ease-in-out"
              >
                {'Terms & Conditions'}
              </a>
            </li>
          </ul>
        </section>
      </div>

      <p className="mt-10 text-center text-sm md:mt-12">
        Copyright © 2025 AG Gallery. All Rights Reserved
      </p>
    </footer>
  )
}
