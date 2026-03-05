import { Link } from "react-router-dom";
import { Compass, Sparkles, Users, MapPin, Wallet, Globe, MessageCircle, Calendar, ChevronRight, Star, Zap, Shield } from "lucide-react";
import { WeatherWidget } from "../components/landing/WeatherWidget";
import { PlacesSuggestions } from "../components/landing/PlacesSuggestions";
import { FoodSuggestions } from "../components/landing/FoodSuggestions";
import { Button } from "../components/ui/button";

export default function LandingPage() {

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 via-white to-purple-50">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-20 bg-transparent">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Compass className="w-8 h-8" />
              <span className="text-xl font-semibold">Beyondly</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/auth/signin">
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth/signup">
                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1692685820393-fcf174d59b2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBhZHZlbnR1cmUlMjBzY2VuaWMlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzcyNDIyMDgwfDA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Travel landscape"
            className="w-full h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        <div className="relative z-10 container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Compass className="w-12 h-12" />
              <h1 className="text-5xl md:text-6xl font-semibold">Beyondly</h1>
            </div>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your AI-powered guide to discover, explore, and enjoy the best of every destination
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/auth/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Exploring
                </Button>
              </Link>
              <Link to="/auth/signin">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 text-white border-white hover:bg-white/20"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Weather Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-3xl font-medium mb-2">Live Weather</h2>
              <p className="text-gray-600">Real-time weather conditions at your location</p>
            </div>
            <WeatherWidget />
          </section>

          {/* Places Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-3xl font-medium mb-2">Places to Visit</h2>
              <p className="text-gray-600">AI-curated attractions and experiences just for you</p>
            </div>
            <PlacesSuggestions />
          </section>

          {/* Food Section */}
          <section>
            <div className="mb-6">
              <h2 className="text-3xl font-medium mb-2">Food &amp; Dining</h2>
              <p className="text-gray-600">Discover local flavors and culinary delights</p>
            </div>
            <FoodSuggestions />
          </section>

          {/* Features Grid */}
          <section className="py-16">
            <div className="text-center mb-16">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Powerful Features
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Beyondly?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to plan, explore, and share your travel adventures
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Sparkles,
                  title: "AI-Powered Itineraries",
                  description: "Get personalized day-by-day travel plans with budget-optimized activities, food spots, and experiences tailored to your preferences",
                  color: "purple",
                  gradient: "from-purple-500 to-indigo-500"
                },
                {
                  icon: Users,
                  title: "Connect with Travelers",
                  description: "See where your friends are exploring on a live map, share your location, and chat in real-time with fellow adventurers",
                  color: "pink",
                  gradient: "from-pink-500 to-rose-500"
                },
                {
                  icon: MapPin,
                  title: "Real-Time Location",
                  description: "Get weather updates, local recommendations, and discover hidden gems based on your exact location",
                  color: "blue",
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  icon: Wallet,
                  title: "Smart Budget Tracking",
                  description: "Plan your expenses by category - food, transport, activities, shopping - and stay on budget with AI cost estimates",
                  color: "emerald",
                  gradient: "from-emerald-500 to-teal-500"
                },
                {
                  icon: Globe,
                  title: "Instant Translation",
                  description: "Break language barriers with built-in translation tools supporting 100+ languages for seamless communication",
                  color: "amber",
                  gradient: "from-amber-500 to-orange-500"
                },
                {
                  icon: Calendar,
                  title: "Trip Organization",
                  description: "Keep all your trips organized with dates, destinations, and detailed itineraries - past and upcoming",
                  color: "indigo",
                  gradient: "from-indigo-500 to-blue-500"
                }
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  className="group relative bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Social Feature Highlight */}
          <section className="py-16">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 md:p-12">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] pointer-events-none" />
              <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                    <Users className="w-4 h-4" />
                    Social Features
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Travel Together, Even When Apart
                  </h2>
                  <p className="text-lg text-white/80 mb-6 leading-relaxed">
                    Connect with friends and fellow travelers from around the world. Share your adventures, 
                    see where everyone is exploring on a live map, and chat in real-time.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "See friends' locations on an interactive world map",
                      "Real-time chat with travelers you connect with",
                      "Unique Beyondly ID to easily find and add friends",
                      "Online/offline status and location sharing controls"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-white/90">
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <ChevronRight className="w-3 h-3" />
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/auth/signup">
                    <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90">
                      Join the Community
                      <ChevronRight className="w-5 h-5 ml-1" />
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="relative">
                    {/* Mock Social Card */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                          A
                        </div>
                        <div>
                          <p className="text-white font-semibold">Alex Explorer</p>
                          <p className="text-white/60 text-sm flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-400"></span>
                            Online • Paris, France
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4 mb-4">
                        <p className="text-white/80 text-sm">
                          "Just visited the Eiffel Tower at sunset! The view is absolutely breathtaking 🗼✨"
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-white/10 rounded-lg px-4 py-2 text-white/60 text-sm">
                          Send a message...
                        </div>
                        <button className="p-2 bg-white/20 rounded-lg">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                    {/* Floating badges */}
                    <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                      2 friends online
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-white text-gray-900 text-xs font-medium px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-600" />
                      5 locations shared
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Badges */}
          <section className="py-12">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {[
                { icon: Shield, label: "Privacy First", desc: "Your data stays yours" },
                { icon: Zap, label: "Lightning Fast", desc: "Instant AI responses" },
                { icon: Star, label: "Highly Rated", desc: "Loved by travelers" },
                { icon: Globe, label: "100+ Languages", desc: "Global support" }
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-3 text-gray-600">
                  <badge.icon className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{badge.label}</p>
                    <p className="text-sm">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Join thousands of travelers using Beyondly to discover, plan, and explore the world smarter.
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <Link to="/auth/signup">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Started Free
                  </Button>
                </Link>
                <Link to="/auth/signin">
                  <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="w-8 h-8 text-blue-400" />
                  <span className="text-2xl font-semibold">Beyondly</span>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  Your AI-powered travel companion. Plan smarter, explore further, and connect with travelers worldwide.
                </p>
                <div className="flex items-center gap-4">
                  <Link to="/auth/signup">
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Start Free
                    </Button>
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-white transition-colors cursor-pointer">AI Itineraries</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Social Connect</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Budget Tracking</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Translation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
                  <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center">
              <p className="text-sm text-gray-500">© 2026 Beyondly. All rights reserved. Made with ❤️ for travelers everywhere.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

