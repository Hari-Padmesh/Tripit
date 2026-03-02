import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

const passwordHint =
  "At least 8 characters, with lowercase, uppercase, number and special character.";

export default function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      setLoading(true);
      await signup(form.name, form.email, form.password);
      navigate("/dashboard/overview");
    } catch (err) {
      setError(
        err?.response?.data?.error || "Unable to create account. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = () => {
    window.location.href = `${
      import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"
    }/auth/google`;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 via-white to-purple-50 flex flex-col justify-center">
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row gap-10 items-center justify-center">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader className="flex flex-col items-center gap-2 pb-0">
            <span className="inline-flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 via-green-400 to-sky-400" />
              <span>
                <span className="font-bold text-base">Beyondly</span>
                <span className="block text-xs text-muted-foreground">Smart travel companion</span>
              </span>
            </span>
          </CardHeader>
          <CardContent className="pt-0">
            <h2 className="text-2xl font-semibold mb-1">Create your Beyondly account</h2>
            <p className="text-sm text-muted-foreground mb-6">One space for your trips, wallets, itineraries, translations, and history.</p>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={onChange}
                  placeholder="How should we call you?"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Create a strong password"
                  required
                />
                <div className="text-xs text-muted-foreground mt-1">{passwordHint}</div>
              </div>
              {error && (
                <div className="rounded-md px-3 py-2 text-sm text-destructive bg-destructive/10 border border-destructive/40">{error}</div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <div className="text-center text-xs text-muted-foreground mt-4">
              <span>Already using Beyondly? </span>
              <Link to="/auth/signin" className="text-accent font-medium hover:underline">Sign in instead</Link>
            </div>
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <Button type="button" variant="outline" className="w-full justify-center" onClick={onGoogle}>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
        <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-indigo-100/60 via-white/80 to-purple-100/60 border-0 shadow-none">
          <CardHeader>
            <Badge variant="secondary" className="mb-2">Why Beyondly</Badge>
            <CardTitle className="text-lg">Beyondly brings several ideas together:</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-muted-foreground space-y-2 text-sm">
              <li>React routing and hooks to keep your UI responsive and focused.</li>
              <li>Weather and FX data combined with your wallet to shape each day.</li>
              <li>Gemini to design itineraries and food suggestions that fit your budget.</li>
              <li>Translation and previous-trip insights so you always feel prepared.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

