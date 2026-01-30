'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Zap, Share2, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="text-2xl font-bold">📝 Short Notes</div>
        <div className="flex gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">
              Login
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-purple-600 hover:bg-purple-700">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold leading-tight">
            Convert Documents into
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Smart Note Summaries
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload PDFs, Word documents, or paste text. Our AI-powered app instantly converts them into organized bullet-point notes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Start Free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<FileText className="w-8 h-8" />}
            title="Multi-Format Support"
            description="Upload PDF, Word documents, or paste text directly"
          />
          <FeatureCard
            icon={<Zap className="w-8 h-8" />}
            title="AI-Powered Summarization"
            description="Get instant bullet-point summaries with GPT-4"
          />
          <FeatureCard
            icon={<Share2 className="w-8 h-8" />}
            title="Easy Sharing"
            description="Share your notes with customizable permissions"
          />
          <FeatureCard
            icon={<Clock className="w-8 h-8" />}
            title="Version History"
            description="Track changes and restore previous versions"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 space-y-6">
          <h2 className="text-4xl font-bold">Ready to take smarter notes?</h2>
          <p className="text-lg opacity-90">Join thousands of users saving time with AI-powered note summarization</p>
          <Link href="/auth/register">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:border-purple-400/50 transition">
      <div className="text-purple-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );
}
