import { useEffect } from 'react';
import { Hero } from '@/components/home/Hero';
import { Intro } from '@/components/home/Intro';
import { Services } from '@/components/home/Services';
import { Principles } from '@/components/home/Principles';
import { BeforeAfter } from '@/components/home/BeforeAfter';
import { Team } from '@/components/home/Team';
import { Pricing } from '@/components/home/Pricing';
import { Booking } from '@/components/home/Booking';
import { Testimonials } from '@/components/home/Testimonials';
import { Faq } from '@/components/home/Faq';
import { Journal } from '@/components/home/Journal';
import { InstagramStrip } from '@/components/home/InstagramStrip';
import { Contacts } from '@/components/home/Contacts';

const TITLE = 'Paw Studio — салон груминга для собак и кошек в Москве';

export function HomePage() {
  useEffect(() => {
    document.title = TITLE;
  }, []);

  return (
    <>
      <Hero />
      <Intro />
      <Services />
      <Principles />
      <BeforeAfter />
      <Team />
      <Pricing />
      <Booking />
      <Testimonials />
      <Faq />
      <Journal />
      <InstagramStrip />
      <Contacts />
    </>
  );
}
