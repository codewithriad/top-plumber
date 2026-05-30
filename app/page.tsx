"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  Droplets,
  Flame,
  Hammer,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  PlayCircle,
  ShieldCheck,
  Star,
  Timer,
  Wrench,
  X,
} from "lucide-react";

const phoneNumber = "(212) 555-0198";
const phoneHref = "tel:+12125550198";
const heroVideoSrc =
  "https://videos.pexels.com/video-files/7584762/7584762-uhd_3840_2160_25fps.mp4";

const services = [
  {
    title: "Drain Cleaning",
    description: "Clear stubborn clogs, backups, and slow drains with careful diagnostic service.",
    icon: Droplets,
  },
  {
    title: "Leak Repair",
    description: "Stop hidden leaks, ceiling drips, and burst lines before damage spreads.",
    icon: Wrench,
  },
  {
    title: "Water Heater Repair",
    description: "Restore hot water fast with repairs for tanks, tankless units, and valves.",
    icon: Flame,
  },
  {
    title: "Pipe Installation",
    description: "Clean pipe replacement and fixture installs for homes, apartments, and shops.",
    icon: Hammer,
  },
  {
    title: "Emergency Plumbing",
    description: "Rapid response for leaks, overflows, no-water calls, and urgent plumbing failures.",
    icon: Timer,
  },
];

const reasons = [
  "Licensed & insured NYC plumbers",
  "Fast response across all boroughs",
  "Clear pricing before work begins",
  "Trusted by homeowners and property managers",
  "Local experts who know NYC buildings",
];

const testimonials = [
  {
    name: "Maya R.",
    location: "Upper West Side",
    review:
      "They answered right away, found the leak behind our sink, and had it fixed before the cabinet was ruined.",
  },
  {
    name: "Daniel K.",
    location: "Brooklyn Heights",
    review:
      "Clean work, fair estimate, and no pressure. The plumber explained every option before starting.",
  },
  {
    name: "Priya S.",
    location: "Astoria",
    review:
      "Our water heater failed at night. They arrived quickly and got hot water back the same evening.",
  },
];

type ServiceAreaName = "Manhattan" | "Brooklyn" | "Queens" | "Bronx" | "Staten Island";

type ServiceArea = {
  name: ServiceAreaName;
  coordinates: [number, number];
  response: string;
  description: string;
};

const serviceAreas: ServiceArea[] = [
  {
    name: "Manhattan",
    coordinates: [40.7831, -73.9712],
    response: "15-35 min response",
    description: "High-rise apartments, brownstones, condos, and commercial calls.",
  },
  {
    name: "Brooklyn",
    coordinates: [40.6782, -73.9442],
    response: "20-45 min response",
    description: "Emergency leaks, drain backups, and water heater service.",
  },
  {
    name: "Queens",
    coordinates: [40.7282, -73.7949],
    response: "20-45 min response",
    description: "Fast plumbing help for homes, co-ops, and local businesses.",
  },
  {
    name: "Bronx",
    coordinates: [40.8448, -73.8648],
    response: "25-50 min response",
    description: "Prepared technicians for urgent repairs and fixture issues.",
  },
  {
    name: "Staten Island",
    coordinates: [40.5795, -74.1502],
    response: "30-60 min response",
    description: "Scheduled service and emergency response across the island.",
  },
];

function CallButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={phoneHref}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-signal px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-[#df5e18] focus:outline-none focus:ring-4 focus:ring-orange-200 ${className}`}
      aria-label={`Call F&E NYC Plumbing at ${phoneNumber}`}
    >
      <Phone className="h-4 w-4" aria-hidden="true" />
      Call Now
    </a>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  inverse = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  inverse?: boolean;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-signal">{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${inverse ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
      <p className={`mt-4 text-base leading-7 sm:text-lg ${inverse ? "text-slate-300" : "text-slate-600"}`}>
        {description}
      </p>
    </div>
  );
}

function Stars() {
  return (
    <div className="flex gap-1 text-signal" aria-label="5 star rating">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
      ))}
    </div>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeArea, setActiveArea] = useState<ServiceAreaName>("Manhattan");
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRefs = useRef<Record<ServiceAreaName, LeafletMarker | null>>({
    Manhattan: null,
    Brooklyn: null,
    Queens: null,
    Bronx: null,
    "Staten Island": null,
  });
  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    heroVideoRef.current?.play().catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      const L = await import("leaflet");

      if (cancelled || !mapContainerRef.current || mapInstanceRef.current) {
        return;
      }

      const map = L.map(mapContainerRef.current, {
        attributionControl: false,
        scrollWheelZoom: false,
        zoomControl: false,
      }).setView([40.7128, -74.006], 10);

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.control
        .attribution({
          prefix: false,
          position: "bottomleft",
        })
        .addAttribution("&copy; OpenStreetMap")
        .addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      serviceAreas.forEach((area, index) => {
        const marker = L.marker(area.coordinates, {
          icon: L.divIcon({
            className: "",
            html: `<span class="area-marker">${index + 1}</span>`,
            iconAnchor: [17, 17],
            popupAnchor: [0, -18],
          }),
        })
          .addTo(map)
          .bindPopup(
            `<strong>${area.name}</strong><br>${area.response}<br>${area.description}`,
          );

        marker.on("click", () => setActiveArea(area.name));
        markerRefs.current[area.name] = marker;
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      cancelled = true;
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      markerRefs.current = {
        Manhattan: null,
        Brooklyn: null,
        Queens: null,
        Bronx: null,
        "Staten Island": null,
      };
    };
  }, []);

  useEffect(() => {
    const area = serviceAreas.find((item) => item.name === activeArea);
    const map = mapInstanceRef.current;
    const marker = markerRefs.current[activeArea];

    if (!area || !map || !marker) {
      return;
    }

    map.flyTo(area.coordinates, 11, { duration: 0.7 });
    marker.openPopup();
  }, [activeArea]);

  return (
    <main className="min-h-screen bg-white pb-20 text-ink md:pb-0">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <a href="#" className="flex items-center" aria-label="F&E NYC Plumbing home" onClick={closeMenu}>
            <Image
              src="/plumbing-logo.png"
              alt="F&E NYC Plumbing"
              width={260}
              height={68}
              priority
              className="h-11 w-auto sm:h-12"
            />
          </a>

          <div className="hidden items-center gap-8 text-sm font-semibold text-slate-700 lg:flex">
            <a className="transition hover:text-navy" href="#services">
              Services
            </a>
            <a className="transition hover:text-navy" href="#reviews">
              Reviews
            </a>
            <a className="transition hover:text-navy" href="#areas">
              Areas
            </a>
            <a className="transition hover:text-navy" href="#contact">
              Contact
            </a>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">24/7 Dispatch</p>
              <a href={phoneHref} className="text-base font-black text-navy hover:text-signal">
                {phoneNumber}
              </a>
            </div>
            <CallButton />
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-navy transition hover:border-navy/30 hover:bg-mist sm:hidden"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </nav>

        <div
          id="mobile-menu"
          className={`border-t border-slate-200 bg-white px-4 pb-4 shadow-lg sm:hidden ${
            isMenuOpen ? "block" : "hidden"
          }`}
        >
          <div className="grid gap-2 pt-3 text-base font-bold text-ink">
            {[
              ["Services", "#services"],
              ["Reviews", "#reviews"],
              ["Areas", "#areas"],
              ["Contact", "#contact"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={closeMenu}
                className="rounded-xl px-3 py-3 transition hover:bg-mist hover:text-navy"
              >
                {label}
              </a>
            ))}
          </div>
          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
            <a
              href={phoneHref}
              onClick={closeMenu}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-signal px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/25"
              aria-label={`Call F&E NYC Plumbing at ${phoneNumber}`}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call Now
            </a>
            <a
              href="#contact"
              onClick={closeMenu}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-navy/20 bg-white px-6 py-3 text-sm font-black text-navy"
            >
              Get Free Estimate
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      <section className="relative min-h-[760px] overflow-hidden bg-ink text-white">
        <video
          ref={heroVideoRef}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        >
          <source src={heroVideoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,32,51,0.92)_0%,rgba(16,32,51,0.78)_42%,rgba(16,32,51,0.42)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(243,107,33,0.34),transparent_32%),linear-gradient(180deg,rgba(18,60,124,0.22),rgba(16,32,51,0.2))]" />
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-navy via-signal to-navy" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:min-h-[760px] lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white shadow-sm backdrop-blur">
              <Clock className="h-4 w-4 text-signal" aria-hidden="true" />
              NYC emergency plumbers on call now
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-6xl">
              24/7 Emergency Plumbing Services in NYC
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-blue-50 sm:text-xl">
              Fast, licensed, and reliable plumbers at your doorstep in minutes.
              Clear estimates, respectful technicians, and urgent help when water
              cannot wait.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CallButton className="w-full sm:w-auto" />
              <a
                href="#contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-6 py-3 text-sm font-bold text-navy shadow-sm transition hover:-translate-y-0.5 hover:bg-mist focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                Get Free Estimate
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-8 grid gap-3 text-sm font-bold text-white sm:grid-cols-3">
              {["Licensed", "Insured", "10+ Years Experience"].map((badge) => (
                <div
                  key={badge}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 shadow-sm backdrop-blur"
                >
                  <ShieldCheck className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-[1.75rem] bg-white/10 p-4 shadow-2xl shadow-blue-950/30 backdrop-blur-md">
              <div className="overflow-hidden rounded-2xl bg-navy text-white">
                <div className="bg-[linear-gradient(135deg,rgba(18,60,124,0.96)_0%,rgba(29,90,178,0.92)_55%,rgba(243,107,33,0.92)_100%)] p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-100">
                        Live Dispatch
                      </p>
                      <p className="mt-2 text-3xl font-black">15-45 min</p>
                      <p className="mt-1 text-sm text-blue-100">typical NYC arrival window</p>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                      <Phone className="h-8 w-8" aria-hidden="true" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-1 bg-white/95 p-6 text-ink sm:grid-cols-3">
                  {[
                    ["4.9/5", "review rating"],
                    ["24/7", "emergency calls"],
                    ["5", "NYC boroughs"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-xl bg-mist p-4">
                      <p className="text-2xl font-black text-navy">{value}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/20 bg-white/95 p-4 shadow-xl sm:ml-auto sm:w-72">
              <div className="flex items-start gap-3">
                <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                <div>
                  <p className="font-black text-ink">Problem fixed today</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Emergency leaks, clogged drains, water heaters, and repairs handled cleanly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sticky top-[73px] z-40 border-y border-orange-200 bg-signal px-4 py-3 text-center text-sm font-black text-white shadow-md sm:text-base">
        <a href={phoneHref} className="inline-flex items-center justify-center gap-2">
          <Timer className="h-5 w-5" aria-hidden="true" />
          Available 24/7 - Call Now for Immediate Help
        </a>
      </section>

      <section id="services" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Plumbing Services"
            title="Urgent repairs and everyday plumbing, handled by pros"
            description="Every service is built around speed, clean workmanship, and a clear next step so you are never left guessing."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article
                  key={service.title}
                  className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-service"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-navy transition group-hover:bg-navy group-hover:text-white">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 text-lg font-black text-ink">{service.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{service.description}</p>
                  <a
                    href="#contact"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-black text-signal hover:text-navy"
                  >
                    Learn More
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[linear-gradient(135deg,#102033_0%,#123c7c_62%,#f36b21_140%)] px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-center">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl shadow-blue-950/30">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/YHu8Qmqg8y8?rel=0&modestbranding=1"
                title="F&E NYC Plumbing service video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold text-blue-50">
              <PlayCircle className="h-4 w-4 text-signal" aria-hidden="true" />
              See our work before you call
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
              Know who is coming before there is water on the floor.
            </h2>
            <p className="mt-4 text-lg leading-8 text-blue-50">
              Watch a quick look at the kind of clean, professional plumbing service
              NYC homeowners expect: clear communication, prepared technicians, and
              repairs done with care.
            </p>
            <div className="mt-7 grid gap-3 text-sm font-bold sm:grid-cols-2">
              {["Fast dispatch", "Licensed techs", "Clean repairs", "Clear estimates"].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-3">
                  <BadgeCheck className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <CallButton className="w-full sm:w-auto" />
              <a
                href="#contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white px-6 py-3 text-sm font-bold text-navy shadow-sm transition hover:-translate-y-0.5 hover:bg-mist focus:outline-none focus:ring-4 focus:ring-white/20"
              >
                Request Service
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-signal">Why Choose Us</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
              The calm, capable call to make when plumbing gets stressful.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              We designed the service around what matters in an emergency: answer fast,
              arrive prepared, explain clearly, and leave the space clean.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map((reason) => (
              <div key={reason} className="flex items-start gap-3 rounded-xl bg-white p-5 shadow-sm">
                <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" />
                <p className="font-bold text-ink">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Customer Reviews"
            title="NYC homeowners trust us when the pressure is on"
            description="Short response times and honest communication are why customers call again and refer neighbors."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <Stars />
                <p className="mt-5 leading-7 text-slate-700">&ldquo;{testimonial.review}&rdquo;</p>
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <p className="font-black text-ink">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.location}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-ink px-4 py-20 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Simple Process"
            title="From panic to fixed in three clear steps"
            description="No confusing handoff. No vague timing. Just a direct path to getting your plumbing working again."
            inverse
          />
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["1", "Call or Request Service", "Tell us what happened and where you are in NYC."],
              ["2", "We Arrive Fast", "A licensed plumber heads over with the right tools."],
              ["3", "Problem Fixed", "Approve the estimate and we repair it cleanly."],
            ].map(([step, title, text]) => (
              <div key={step} className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-signal text-xl font-black">
                  {step}
                </div>
                <h3 className="mt-5 text-xl font-black">{title}</h3>
                <p className="mt-3 leading-7 text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="areas" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-signal">Service Areas</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
              Emergency plumbing coverage across New York City
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
              Select a borough to see where our NYC dispatch team is ready for urgent leaks,
              clogged drains, water heaters, and same-day plumbing repairs.
            </p>
          </div>

          <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white shadow-service lg:grid-cols-[0.92fr_1.08fr]">
            <div className="bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] p-5 sm:p-7 lg:p-8">
              <div className="rounded-xl bg-ink p-5 text-white shadow-xl shadow-blue-950/15">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-signal">
                    <MapPin className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                      Live NYC Coverage
                    </p>
                    <p className="mt-1 text-2xl font-black">5 borough dispatch</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Tap an area below to center the map and view response details for that location.
                </p>
              </div>

              <div className="mt-5 grid gap-3">
                {serviceAreas.map((area, index) => {
                  const isActive = activeArea === area.name;

                  return (
                    <button
                      key={area.name}
                      type="button"
                      onClick={() => setActiveArea(area.name)}
                      className={`group rounded-xl border p-4 text-left transition ${
                        isActive
                          ? "border-navy bg-white shadow-lg shadow-blue-900/10"
                          : "border-slate-200 bg-white/70 hover:border-blue-200 hover:bg-white"
                      }`}
                      aria-pressed={isActive}
                    >
                      <span className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
                            isActive ? "bg-signal text-white" : "bg-blue-50 text-navy"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <span>
                          <span className="block text-base font-black text-ink">{area.name}</span>
                          <span className="mt-1 block text-sm font-bold text-signal">{area.response}</span>
                          <span className="mt-2 block text-sm leading-6 text-slate-600">
                            {area.description}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative min-h-[430px] bg-slate-100 lg:min-h-[650px]">
              <div ref={mapContainerRef} className="absolute inset-0" aria-label="NYC service areas map" />
              <div className="pointer-events-none absolute left-4 right-4 top-4 rounded-xl border border-white/40 bg-white/90 p-4 shadow-xl backdrop-blur sm:left-auto sm:w-80">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-signal">
                  Selected Area
                </p>
                <p className="mt-1 text-2xl font-black text-ink">{activeArea}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {serviceAreas.find((area) => area.name === activeArea)?.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[linear-gradient(180deg,#ffffff_0%,#f3f8fd_100%)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-signal">Request Service</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-ink sm:text-4xl">
              Get a fast estimate from a local NYC plumber.
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              For urgent leaks or backups, call now. For quotes and scheduling, send the form and
              our dispatch team will follow up quickly.
            </p>
            <div className="mt-8 rounded-xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-signal" aria-hidden="true" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Immediate help</p>
                  <a href={phoneHref} className="text-2xl font-black text-navy hover:text-signal">
                    {phoneNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <form className="rounded-xl border border-slate-200 bg-white p-5 shadow-service sm:p-8" aria-label="Request immediate plumbing service">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-ink">Name</span>
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-ink outline-none transition focus:border-navy focus:ring-4 focus:ring-blue-100"
                  placeholder="Your name"
                />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-ink">Phone</span>
                <input
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 text-ink outline-none transition focus:border-navy focus:ring-4 focus:ring-blue-100"
                  placeholder="(555) 000-0000"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-bold text-ink">Service Type</span>
                <select
                  name="service"
                  className="mt-2 h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-ink outline-none transition focus:border-navy focus:ring-4 focus:ring-blue-100"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  {services.map((service) => (
                    <option key={service.title}>{service.title}</option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-sm font-bold text-ink">Message</span>
                <textarea
                  name="message"
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-ink outline-none transition focus:border-navy focus:ring-4 focus:ring-blue-100"
                  placeholder="Tell us what is happening and your address or neighborhood."
                />
              </label>
            </div>
            <button
              type="submit"
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-[#0e3168] focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              Request Immediate Service
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <p className="mt-4 text-center text-sm text-slate-500">
              Submitting this form does not replace calling for active flooding or major leaks.
            </p>
          </form>
        </div>
      </section>

      <footer className="bg-ink px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Image
              src="/plumbing-logo.png"
              alt="F&E NYC Plumbing"
              width={230}
              height={60}
              className="h-12 w-auto rounded bg-white p-1"
            />
            <p className="mt-4 max-w-md leading-7 text-slate-300">
              Licensed and insured plumbing help for urgent repairs, clean installs,
              and fast service across New York City.
            </p>
          </div>
          <div>
            <h3 className="font-black">Quick Links</h3>
            <div className="mt-4 grid gap-2 text-slate-300">
              <a href="#services" className="hover:text-white">Services</a>
              <a href="#reviews" className="hover:text-white">Reviews</a>
              <a href="#areas" className="hover:text-white">Service Areas</a>
              <a href="#contact" className="hover:text-white">Contact</a>
            </div>
          </div>
          <div>
            <h3 className="font-black">Contact</h3>
            <div className="mt-4 grid gap-2 text-slate-300">
              <a href={phoneHref} className="hover:text-white">{phoneNumber}</a>
              <p>NYC emergency plumbing</p>
              <div className="flex gap-3 pt-2">
                {["Facebook", "Instagram", "Google"].map((social) => (
                  <a key={social} href="#" className="text-sm font-bold hover:text-white">
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-sm text-slate-400">
          © 2026 F&E NYC Plumbing. All rights reserved.
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-orange-200 bg-white p-3 shadow-2xl md:hidden">
        <a
          href={phoneHref}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-signal px-5 py-3 text-sm font-black text-white"
          aria-label={`Call F&E NYC Plumbing at ${phoneNumber}`}
        >
          <Phone className="h-5 w-5" aria-hidden="true" />
          Call Now
        </a>
      </div>
    </main>
  );
}
