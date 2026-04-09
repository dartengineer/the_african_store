import Head from 'next/head'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi'

export default function Contact() {
  return (
    <>
      <Head>
        <title>Contact Us — The African Store</title>
        <meta name="description" content="Get in touch with The African Store. We're here to help!" />
      </Head>
      <Layout>
        <div className="min-h-screen">
          {/* Header */}
          <section className="bg-gradient-to-r from-brown-deep/50 to-transparent py-16 px-6 mb-12 border-b border-gold/10">
            <div className="max-w-4xl mx-auto">
              <div className="section-eyebrow">Get In Touch</div>
              <h1 className="font-serif text-5xl text-cream mb-4">
                Contact <em className="text-gold italic">Us</em>
              </h1>
              <p className="text-lg text-[#A89060]">
                Have questions? We'd love to hear from you. Our team is here to help.
              </p>
            </div>
          </section>

          <div className="max-w-4xl mx-auto px-6 pb-16">
            <div className="grid md:grid-cols-2 gap-12 mb-16">
              {/* Contact Info */}
              <div>
                <h2 className="font-serif text-2xl text-cream mb-8">Reach Us</h2>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gold/20">
                        <FiMail className="text-gold" size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-cream font-medium mb-1">Email</h3>
                      <p className="text-[#A89060]">hello@theafricanstore.com</p>
                      <p className="text-xs text-[#A89060] mt-1">We respond within 24 hours</p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gold/20">
                        <FiPhone className="text-gold" size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-cream font-medium mb-1">Phone</h3>
                      <p className="text-[#A89060]">+234 (0) 801 234 5678</p>
                      <p className="text-xs text-[#A89060] mt-1">Mon-Fri · 9 AM - 6 PM WAT</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gold/20">
                        <FiMapPin className="text-gold" size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-cream font-medium mb-1">Office</h3>
                      <p className="text-[#A89060]">Lagos, Nigeria</p>
                      <p className="text-xs text-[#A89060] mt-1">Serving all 36 states + FCT</p>
                    </div>
                  </div>

                  {/* Business Hours */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-md bg-gold/20">
                        <FiClock className="text-gold" size={20} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-cream font-medium mb-1">Business Hours</h3>
                      <div className="space-y-1 text-xs text-[#A89060]">
                        <p>Monday - Friday: 9 AM - 6 PM</p>
                        <p>Saturday: 10 AM - 4 PM</p>
                        <p>Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="card p-8">
                <h2 className="font-serif text-2xl text-cream mb-6">Send us a Message</h2>
                <form className="space-y-4">
                  <div>
                    <label className="block text-xs text-[#A89060] mb-2 uppercase tracking-wide">Name</label>
                    <input
                      type="text"
                      className="w-full bg-brown-warm/50 border border-gold/20 rounded-sm px-4 py-3 text-cream placeholder-cream/30 focus:outline-none focus:border-gold"
                      placeholder="Your name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#A89060] mb-2 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      className="w-full bg-brown-warm/50 border border-gold/20 rounded-sm px-4 py-3 text-cream placeholder-cream/30 focus:outline-none focus:border-gold"
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#A89060] mb-2 uppercase tracking-wide">Subject</label>
                    <input
                      type="text"
                      className="w-full bg-brown-warm/50 border border-gold/20 rounded-sm px-4 py-3 text-cream placeholder-cream/30 focus:outline-none focus:border-gold"
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[#A89060] mb-2 uppercase tracking-wide">Message</label>
                    <textarea
                      className="w-full bg-brown-warm/50 border border-gold/20 rounded-sm px-4 py-3 text-cream placeholder-cream/30 focus:outline-none focus:border-gold resize-none"
                      rows={5}
                      placeholder="Tell us more..."
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full"
                    disabled
                    title="Contact form integration coming soon"
                  >
                    Send Message
                  </button>
                  <p className="text-xs text-[#A89060] text-center">
                    Contact form integration coming soon. Please use email or phone above.
                  </p>
                </form>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid md:grid-cols-3 gap-6 pt-12 border-t border-gold/10">
              <div className="card p-8 text-center">
                <h3 className="font-serif text-lg text-cream mb-3">Vendor Support</h3>
                <p className="text-sm text-[#A89060] mb-4">
                  Questions about selling on our platform?
                </p>
                <a href="mailto:vendors@theafricanstore.com" className="text-gold hover:text-cream transition-colors text-sm">
                  vendors@theafricanstore.com
                </a>
              </div>

              <div className="card p-8 text-center">
                <h3 className="font-serif text-lg text-cream mb-3">Buyer Support</h3>
                <p className="text-sm text-[#A89060] mb-4">
                  Need help with an order?
                </p>
                <a href="mailto:support@theafricanstore.com" className="text-gold hover:text-cream transition-colors text-sm">
                  support@theafricanstore.com
                </a>
              </div>

              <div className="card p-8 text-center">
                <h3 className="font-serif text-lg text-cream mb-3">General Enquiries</h3>
                <p className="text-sm text-[#A89060] mb-4">
                  Other questions or feedback?
                </p>
                <a href="mailto:hello@theafricanstore.com" className="text-gold hover:text-cream transition-colors text-sm">
                  hello@theafricanstore.com
                </a>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-16 bg-gold/10 border border-gold/20 rounded-sm p-8 text-center">
              <h3 className="font-serif text-2xl text-cream mb-3">Want to join our marketplace?</h3>
              <p className="text-[#A89060] mb-6">
                Start your vendor journey with The African Store today
              </p>
              <Link href="/auth/register?role=vendor" className="btn-primary inline-block">
                Become a Vendor
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
