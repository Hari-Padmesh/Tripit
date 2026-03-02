import { Link } from "react-router-dom";
import { Compass, Sparkles } from "lucide-react";
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
          <section className="py-12">
            <h2 className="text-3xl font-medium text-center mb-12">Why Choose Beyondly?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Real-Time Updates</h3>
                <p className="text-gray-600">
                  Get instant weather updates and location-based recommendations wherever you go
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">AI-Powered</h3>
                <p className="text-gray-600">
                  Smart algorithms learn your preferences to suggest the perfect places and experiences
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Compass className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-medium mb-2">Local Insights</h3>
                <p className="text-gray-600">
                  Discover hidden gems and authentic local cuisine that tourists usually miss
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Compass className="w-6 h-6" />
              <span className="text-xl font-semibold">Beyondly</span>
            </div>
            <p className="text-gray-400 mb-6">
              Your intelligent guide to unforgettable travel experiences
            </p>
            <p className="text-sm text-gray-500">© 2026 Beyondly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

