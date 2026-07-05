import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import {
  Bell, AlertCircle, Package, BookOpen,
  ChevronDown, Menu, X, ArrowRight,
  Users, Building, Award, Wifi
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const lastScrollY = useRef(0);
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  // Fetch latest announcements
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await API.get('/announcements');
        setAnnouncements(res.data.announcements.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnnouncements();
  }, []);

  // Smart navbar - hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      if (currentScrollY < lastScrollY.current || currentScrollY < 100) {
        setNavVisible(true);
      } else {
        setNavVisible(false);
        setMenuOpen(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const features = [
    {
      icon: <AlertCircle size={28} />,
      title: 'Complaint Management',
      desc: 'Report WiFi issues, classroom problems, hostel maintenance and more. Track your complaint status in real time.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: <Bell size={28} />,
      title: 'Campus Announcements',
      desc: 'Stay updated with exam schedules, events, seminars and placement drives posted by administration.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: <Package size={28} />,
      title: 'Lost & Found',
      desc: 'Lost something on campus? Post it here. Found something? Help a fellow student get it back.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: <BookOpen size={28} />,
      title: 'Classroom Availability',
      desc: 'Check which classrooms and labs are free before heading over. View full schedules at a glance.',
      color: 'from-green-500 to-green-600'
    },
  ];

  const stats = [
    { icon: <Users size={24} />, value: '500+', label: 'Students' },
    { icon: <Building size={24} />, value: '4', label: 'Core Modules' },
    { icon: <Award size={24} />, value: '24/7', label: 'Available' },
    { icon: <Wifi size={24} />, value: '100%', label: 'Digital' },
  ];

  return (
    <div className="bg-gray-950 text-white overflow-x-hidden">

      {/* ── SMART NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        navVisible ? 'translate-y-0' : '-translate-y-full'
      } ${scrolled ? 'bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-gray-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">Smart Campus</p>
              <p className="text-gray-400 text-xs">FET, MGCGV</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-gray-300 hover:text-white text-sm transition">Home</button>
            <button onClick={() => scrollTo(featuresRef)}
              className="text-gray-300 hover:text-white text-sm transition">Features</button>
            <button onClick={() => scrollTo(aboutRef)}
              className="text-gray-300 hover:text-white text-sm transition">About</button>
            <button onClick={() => scrollTo(contactRef)}
              className="text-gray-300 hover:text-white text-sm transition">Contact</button>
          </div>

          {/* Login Button */}
          <div className="hidden md:flex items-center space-x-3">
            <button onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition duration-200 flex items-center space-x-2">
              <span>Login</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-gray-300" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-gray-900/98 backdrop-blur-md border-t border-gray-800 px-6 py-4 space-y-4">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="block text-gray-300 hover:text-white text-sm">Home</button>
            <button onClick={() => scrollTo(featuresRef)} className="block text-gray-300 hover:text-white text-sm">Features</button>
            <button onClick={() => scrollTo(aboutRef)} className="block text-gray-300 hover:text-white text-sm">About</button>
            <button onClick={() => scrollTo(contactRef)} className="block text-gray-300 hover:text-white text-sm">Contact</button>
            <button onClick={() => navigate('/login')} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
              Login to Smart Campus
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">

        {/* Animated gradient background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-blue-950 to-gray-950 animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div key={i}
              className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-8">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-blue-300 text-sm font-medium">Faculty of Engineering & Technology, MGCGV</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Smart</span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent"> Campus</span>
            <br />
            <span className="text-white text-4xl md:text-5xl">Assistant</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-4 max-w-2xl mx-auto leading-relaxed">
            Your all-in-one digital platform for campus life. Report issues, stay updated,
            find lost items and check classroom availability — all in one place.
          </p>

          <p className="text-gray-500 text-sm italic mb-10">
            "{`The village is the universe in miniature`}" — MGCGV
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition duration-200 flex items-center space-x-2 shadow-lg shadow-blue-600/25">
              <span>Get Started</span>
              <ArrowRight size={20} />
            </button>
            <button onClick={() => scrollTo(featuresRef)}
              className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-4 rounded-2xl font-semibold text-lg transition duration-200">
              Explore Features
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown size={28} className="text-gray-500" />
        </div>
      </section>

      {/* ── ANNOUNCEMENTS TICKER ── */}
      {announcements.length > 0 && (
        <section className="bg-blue-600/10 border-y border-blue-500/20 py-3 overflow-hidden">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-600 px-4 py-1 text-white text-xs font-bold uppercase tracking-wider mr-4">
              📢 Latest
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex animate-marquee whitespace-nowrap">
                {[...announcements, ...announcements].map((a, i) => (
                  <span key={i} className="text-gray-300 text-sm mx-8">
                    <span className="text-blue-400 font-medium">{a.title}</span>
                    <span className="text-gray-500 mx-2">•</span>
                    {a.content?.substring(0, 60)}{a.content?.length > 60 ? '...' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── STATS ── */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center hover:border-blue-500/50 transition duration-300">
              <div className="text-blue-400 flex justify-center mb-3">{s.icon}</div>
              <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-gray-400 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section ref={featuresRef} className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Four powerful modules designed to make campus life smoother for students and administration alike.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <div key={i}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-gray-600 transition duration-300 group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section ref={aboutRef} className="py-20 px-6 bg-gray-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">About Smart Campus</h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Smart Campus Assistant is a digital platform built exclusively for the students and staff of
            <span className="text-blue-400 font-medium"> Faculty of Engineering & Technology, MGCGV</span>,
            Chitrakoot. It bridges the communication gap between students and administration,
            making campus management efficient, transparent and accessible to all.
          </p>
          <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-8">
            <p className="text-2xl text-blue-300 font-medium italic mb-3">
              "The village is the universe in miniature."
            </p>
            <p className="text-gray-500 text-sm">— Mahatma Gandhi Chitrakoot Gramodaya Vishwavidyalaya</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-12">
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-gray-400 mb-8">Join 500+ students already using Smart Campus Assistant.</p>
            <button onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-semibold text-lg transition duration-200 flex items-center space-x-2 mx-auto shadow-lg shadow-blue-600/25">
              <span>Login to Smart Campus</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section ref={contactRef} className="py-16 px-6 bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Contact Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Institution', value: 'Faculty of Engineering & Technology' },
              { label: 'University', value: 'MGCGV, Chitrakoot' },
              { label: 'Location', value: 'Chitrakoot, Satna, MP' },
            ].map((c, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <p className="text-gray-500 text-sm mb-1">{c.label}</p>
                <p className="text-white font-medium">{c.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">SC</span>
            </div>
            <span className="text-gray-400 text-sm">Smart Campus Assistant — FET, MGCGV</span>
          </div>
          <p className="text-gray-600 text-sm">© 2026 Smart Campus. All rights reserved.</p>
        </div>
      </footer>

      {/* Marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;