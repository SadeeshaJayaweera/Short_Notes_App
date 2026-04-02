'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Zap, Share2, Clock } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 inset-x-0 h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-40 -left-40 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="text-2xl font-extrabold tracking-tight text-slate-900">📝 Short Notes</div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium">
              Log in
            </Button>
          </Link>
          <Link href="/register">
            <Button className="bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all font-medium rounded-full px-6">
              Start Free
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 text-center">
        <div className="max-w-4xl mx-auto space-y-10">
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-tight text-slate-900">
            Intelligent Document <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">
              Summaries in Seconds
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            AI Powered Your Short Note Assistance. Upload vast PDFs, Word documents, or text. Our enterprise-grade AI instantly extracts key insights, generates bullet points, and provides sentiment analysis.
          </p>
          <div className="flex gap-4 justify-center items-center pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:opacity-90 transition-all rounded-full px-8 h-14 text-lg">
                Start for Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full px-8 h-14 text-lg transition-all">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Built for pristine organization</h2>
          <p className="text-lg text-slate-500 mt-4">Everything you need to digest content 10x faster.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Multi-Format Support"
            description="Seamless upload of large PDF, Docs, and unstructured text directly to your vault."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Instant Summarization"
            description="Obtain actionable insights immediately with our precision GPT-4 integration."
          />
          <FeatureCard
            icon={<Share2 className="w-6 h-6" />}
            title="Collaborative Access"
            description="Effortlessly share notes securely with teammates and maintain full structural control."
          />
          <FeatureCard
            icon={<Clock className="w-6 h-6" />}
            title="Version Integrity"
            description="Infinite tracking ensures that your original documents and variations are preserved fundamentally."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="bg-slate-900 rounded-3xl p-16 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-500/10" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Ready to reclaim your time?</h2>
            <p className="text-lg text-slate-300 max-w-xl mx-auto">
              Join thousands of professionals saving hours each day with AI-powered note taking. Start building your smart vault today.
            </p>
            <div className="pt-4">
              <Link href="/register">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-50 shadow-md transition-all rounded-full px-8 h-12">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed text-sm">{description}</p>
    </div>
  );
}
