import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Send, CheckCircle } from 'lucide-react';

export default function AdvertisePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from('contact_submissions')
      .insert([{
        ...formData,
        type: 'advertising'
      }]);

    setIsSubmitting(false);

    if (!error) {
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      setTimeout(() => setIsSubmitted(false), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white py-12 sm:py-16 md:py-20 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
            Advertise With Us
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 dark:text-blue-200 max-w-2xl mx-auto">
            Reach thousands of engaged readers across our diverse content categories
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 sm:mb-12 lg:mb-16">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 transition-colors">Why Advertise With Mayobe Bros?</h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg sm:text-xl transition-colors">
                  1
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 transition-colors">Targeted Audience</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 transition-colors leading-relaxed">
                    Connect with readers interested in education, business, technology, gaming, and more.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg sm:text-xl transition-colors">
                  2
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 transition-colors">Multiple Ad Formats</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 transition-colors leading-relaxed">
                    Choose from banner ads, sponsored content, native advertising, and more.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg sm:text-xl transition-colors">
                  3
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 transition-colors">Measurable Results</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 transition-colors leading-relaxed">
                    Track your campaign performance with detailed analytics and reporting.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 sm:gap-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-lg sm:text-xl transition-colors">
                  4
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-1 sm:mb-2 transition-colors">Flexible Packages</h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 transition-colors leading-relaxed">
                    Custom advertising solutions to fit any budget and marketing goals.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 md:p-8 transition-colors">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 transition-colors">Get in Touch</h2>
            {isSubmitted ? (
              <div className="text-center py-6 sm:py-8">
                <CheckCircle size={48} className="sm:w-16 sm:h-16 text-green-500 dark:text-green-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Thank You!</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 transition-colors">
                  We've received your inquiry and will get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors min-h-[44px]"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors min-h-[44px]"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors min-h-[44px]"
                    placeholder="Advertising Inquiry"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm sm:text-base text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent resize-none transition-colors"
                    placeholder="Tell us about your advertising needs..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 sm:py-3.5 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 transition-colors font-semibold text-sm sm:text-base flex items-center justify-center gap-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 min-h-[44px]"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={18} className="sm:w-5 sm:h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-gray-800 rounded-xl p-4 sm:p-6 md:p-8 text-center transition-colors">
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 transition-colors">Contact Information</h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 sm:mb-4 transition-colors">
            For advertising inquiries, you can also reach us directly at:
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <a href="mailto:info@mayobebros.com" className="text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors break-all">
              info@mayobebros.com
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
