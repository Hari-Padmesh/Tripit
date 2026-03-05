import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Compass, Sparkles, Users, MapPin, Wallet, Globe, 
  MessageCircle, Calendar, ChevronRight, Star, ChevronLeft,
  Plane, Camera, Utensils, Shield, ArrowRight, Quote
} from "lucide-react";
import { Button } from "../components/ui/button";

// Testimonials data
const testimonials = [
  {
    text: "Beyondly completely transformed how I plan my trips. The AI itineraries are incredibly detailed and the budget tracking saved me hundreds!",
    author: "Sarah K.",
    location: "San Francisco, USA",
    rating: 5
  },
  {
    text: "I love being able to see where my travel friends are on the map. We coordinated a surprise meetup in Tokyo thanks to the location sharing feature!",
    author: "Marcus L.",
    location: "London, UK",
    rating: 5
  },
  {
    text: "As a solo traveler, the social features make me feel connected to a community. The real-time chat is perfect for getting local tips.",
    author: "Priya M.",
    location: "Mumbai, India",
    rating: 5
  },
  {
    text: "The translation tool has been a lifesaver in countries where I don't speak the language. Beyondly thinks of everything!",
    author: "Chen W.",
    location: "Toronto, Canada",
    rating: 5
  },
  {
    text: "Finally, a travel app that doesn't just suggest places but actually helps you plan, budget, and connect. Worth every minute spent on it.",
    author: "Emma R.",
    location: "Sydney, Australia",
    rating: 5
  }
];

export default function LandingPage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen w-full bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-900">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Beyondly</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#testimonials" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Testimonials</a>
              <a href="#services" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Services</a>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth/signin">
                <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-6">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Clean & Minimal */}
      <header className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-30" />
        
        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Your AI Travel Companion
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              A travel roadmap<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                for everyone.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Your journey to every destination is unique. Beyondly helps you plan, explore, 
              and connect with travelers worldwide. It's ok to stop and ask for directions.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white rounded-full px-8 py-6 text-lg">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth/signin">
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg border-gray-300">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80"
              alt="Travel adventure"
              className="w-full max-w-5xl mx-auto rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </header>

      {/* Testimonials Section - "Journeys from the Past" style */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-[0.3em] text-gray-500 uppercase mb-4">
              J o u r n e y s &nbsp; f r o m &nbsp; T r a v e l e r s
            </p>
            <h2 className="text-4xl font-bold text-gray-900">People are talking</h2>
          </div>
          
          <div className="max-w-4xl mx-auto relative">
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl relative">
              <Quote className="absolute top-6 left-6 w-12 h-12 text-blue-100" />
              <div className="relative z-10">
                <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8 italic">
                  "{testimonials[currentTestimonial].text}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonials[currentTestimonial].author}</p>
                    <p className="text-sm text-gray-500">{testimonials[currentTestimonial].location}</p>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Five Pathways style */}
      <section id="services" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium tracking-[0.3em] text-gray-500 uppercase mb-4">
              O u r &nbsp; S e r v i c e s
            </p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Beyondly is here to simplify your travel planning.
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We'll work with you to create a personalized journey that incorporates all aspects of travel:
              <span className="text-blue-600 font-medium"> Planning</span>,
              <span className="text-purple-600 font-medium"> Budget</span>,
              <span className="text-emerald-600 font-medium"> Social</span>,
              <span className="text-amber-600 font-medium"> Discovery</span>, and
              <span className="text-pink-600 font-medium"> Translation</span>.
            </p>
          </div>

          {/* Service Cards - Horizontal scroll on mobile */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "AI Itinerary Planning",
                description: "You've got destinations. But destinations need plans. Make sure you have an itinerary that works for you. We'll show you how to get the most out of your budget with AI-generated day-by-day activities.",
                color: "blue",
                image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&q=80"
              },
              {
                icon: Wallet,
                title: "Budget Tracking",
                description: "Your travel plans may not include overspending. Let's work together to make sure you stay on track. We'll help you categorize expenses and maximize your travel experience.",
                color: "emerald",
                image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80"
              },
              {
                icon: Users,
                title: "Social Connection",
                description: "Travel is better together. Connect with friends and fellow travelers, see where everyone is on a live map, and chat in real-time. Your journey, shared.",
                color: "purple",
                image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&q=80"
              },
              {
                icon: Globe,
                title: "Translation Tools",
                description: "It's not always easy to communicate abroad. We'll help you break language barriers with instant translation supporting 100+ languages wherever you go.",
                color: "amber",
                image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80"
              },
              {
                icon: MapPin,
                title: "Location Discovery",
                description: "Get real-time weather, local food recommendations, and discover hidden gems based on your exact location. We know all the clever side streets.",
                color: "pink",
                image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80"
              },
              {
                icon: Calendar,
                title: "Trip Organization",
                description: "You've traveled far. Keep all your adventures organized with dates, destinations, and detailed itineraries - past and upcoming. Your travel legacy.",
                color: "indigo",
                image: "https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=400&q=80"
              }
            ].map((service, idx) => (
              <div 
                key={idx}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              >
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className={`absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-${service.color}-500 flex items-center justify-center shadow-lg`}>
                    <service.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
                  <button className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 group/btn">
                    Learn more
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-900 text-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-medium tracking-[0.3em] text-blue-400 uppercase mb-4">
                O u r &nbsp; M i s s i o n
              </p>
              <h2 className="text-4xl font-bold mb-6">
                Here to help you make sense of it all.
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Don't just travel. Travel with purpose. Our mission is to make your journeys better, 
                plain and simple. We're real people with families and goals, just like you. 
                So we understand how personal travel is. We'll be with you every step of the way, 
                making sure you're always on the right path.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: Plane, label: "AI Planning", value: "Smart" },
                  { icon: Users, label: "Community", value: "Global" },
                  { icon: Shield, label: "Privacy", value: "Secure" },
                  { icon: Globe, label: "Languages", value: "100+" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4">
                    <stat.icon className="w-6 h-6 text-blue-400 mb-2" />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-gray-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80"
                alt="Travel adventure"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold">Beyondly</p>
                    <p className="text-sm text-gray-500">Your travel companion</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">Trusted by thousands worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            A travel roadmap for everyone.
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Travel is a journey. Take it with confidence.
          </p>
          <Link to="/auth/signup">
            <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 rounded-full px-10 py-6 text-lg font-semibold">
              Start Your Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="md:col-span-1">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                    <Compass className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xl font-bold">Beyondly</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your AI-powered travel companion for smarter adventures.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm tracking-wider uppercase">Services</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="hover:text-white transition-colors cursor-pointer">AI Itineraries</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Budget Tracking</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Social Connect</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Translation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm tracking-wider uppercase">Company</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Our Team</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Testimonials</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-sm tracking-wider uppercase">Legal</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Terms of Use</li>
                  <li className="hover:text-white transition-colors cursor-pointer">FAQs</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500">© 2026 Beyondly. All rights reserved.</p>
              <p className="text-sm text-gray-500">Made with ❤️ for travelers everywhere</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

