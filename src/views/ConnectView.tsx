import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { submitInquiry } from '../services/api';
import { ContactFormData, ContactResponse } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';

export const ConnectView: React.FC = () => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { t } = useLanguage();
  const { theme } = useTheme();
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    company: '',
    scope: 'System Architecture Audit',
    message: '',
  });

  const directEmailHref =
    'mailto:itsmeskm99@gmail.com?subject=Strategic%20collaboration%20inquiry&body=Hi%20Suresh%2C%0A%0AI%27d%20like%20to%20discuss%20a%20strategic%20collaboration.%0A%0A';

  const mutation = useMutation<ContactResponse, Error, ContactFormData>({
    mutationFn: submitInquiry,
    onSuccess: () => {
      setSubmitError(null);
      setFormData({
        name: '',
        email: '',
        company: '',
        scope: 'System Architecture Audit',
        message: '',
      });
    },
  });

  const getRecaptchaToken = () => {
    if (!recaptchaSiteKey) {
      return Promise.resolve(undefined);
    }

    return new Promise<string>((resolve, reject) => {
      if (!window.grecaptcha) {
        reject(new Error('reCAPTCHA is still loading. Please try again in a moment.'));
        return;
      }

      window.grecaptcha.ready(() => {
        window.grecaptcha
          ?.execute(recaptchaSiteKey, { action: 'submit' })
          .then(resolve)
          .catch(() => reject(new Error('reCAPTCHA verification failed. Please try again.')));
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      const recaptchaToken = await getRecaptchaToken();
      mutation.mutate({ ...formData, recaptchaToken });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'reCAPTCHA verification failed. Please try again.';
      setSubmitError(message);
    }
  };

  return (
    <div className="pt-[100px] pb-16 px-6 max-w-[1120px] mx-auto w-full min-h-[calc(100vh-80px)]">
      {/* Hero Section */}
      <section className={`mb-12 border-b pb-8 ${
        theme === 'light' ? 'border-slate-300' : 'border-white/10'
      }`}>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end justify-between">
          <div>
            <span className={`font-mono text-xs uppercase tracking-[0.25em] font-bold block mb-1 ${
              theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
            }`}>
              {t.connect.tag}
            </span>
            <h1 className={`font-black text-4xl md:text-6xl uppercase tracking-tighter ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}>
              {t.connect.title}
            </h1>
            <p className={`font-body-lg text-lg max-w-2xl leading-relaxed mt-2 font-light ${
              theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/70'
            }`}>
              {t.connect.subtitle}
            </p>
          </div>
          <div className={`font-code text-xs border px-3 py-1.5 whitespace-nowrap mb-2 font-bold tracking-wider uppercase ${
            theme === 'light'
              ? 'bg-[#008822]/10 border-[#008822]/30 text-[#007A1E]'
              : 'bg-[#00FF41]/10 border-[#00FF41]/30 text-[#00FF41]'
          }`}>
            {t.connect.startupArchitect}
          </div>
        </div>
      </section>

      {/* Strategic Blocks */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
        {/* Left Column: Core Focus */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className={`border p-6 relative overflow-hidden group transition-colors duration-300 shadow-xl ${
            theme === 'light'
              ? 'bg-white border-slate-200 hover:border-[#008822] text-slate-900'
              : 'bg-[#141414] border-white/10 hover:border-[#00FF41] text-[#F5F5F5]'
          }`}>
            <div className={`absolute top-0 left-0 w-1 h-full transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ${
              theme === 'light' ? 'bg-[#008822]' : 'bg-[#00FF41]'
            }`}></div>
            <h3 className={`font-black text-xl mb-2 marker-line pl-6 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}>
              {t.connect.techDebtTitle}
            </h3>
            <p className={`font-body-md text-sm leading-relaxed font-light ${
              theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/70'
            }`}>
              {t.connect.techDebtDesc}
            </p>
          </div>

          <div className={`border p-6 relative overflow-hidden group transition-colors duration-300 shadow-xl ${
            theme === 'light'
              ? 'bg-white border-slate-200 hover:border-[#008822] text-slate-900'
              : 'bg-[#141414] border-white/10 hover:border-[#00FF41] text-[#F5F5F5]'
          }`}>
            <div className={`absolute top-0 left-0 w-1 h-full transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ${
              theme === 'light' ? 'bg-[#008822]' : 'bg-[#00FF41]'
            }`}></div>
            <h3 className={`font-black text-xl mb-2 marker-line pl-6 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}>
              {t.connect.scalingTitle}
            </h3>
            <p className={`font-body-md text-sm leading-relaxed font-light ${
              theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/70'
            }`}>
              {t.connect.scalingDesc}
            </p>
          </div>

          <div className={`border p-6 relative overflow-hidden group transition-colors duration-300 shadow-xl ${
            theme === 'light'
              ? 'bg-white border-slate-200 hover:border-[#008822] text-slate-900'
              : 'bg-[#141414] border-white/10 hover:border-[#00FF41] text-[#F5F5F5]'
          }`}>
            <div className={`absolute top-0 left-0 w-1 h-full transform origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ${
              theme === 'light' ? 'bg-[#008822]' : 'bg-[#00FF41]'
            }`}></div>
            <h3 className={`font-black text-xl mb-2 marker-line pl-6 tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}>
              {t.connect.cultureTitle}
            </h3>
            <p className={`font-body-md text-sm leading-relaxed font-light ${
              theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/70'
            }`}>
              {t.connect.cultureDesc}
            </p>
          </div>
        </div>

        {/* Right Column: Visual Anchor & CTA */}
        <div className="md:col-span-7 flex flex-col justify-between">
          {/* Atmospheric Blueprint Image */}
          <div className={`h-64 md:h-[280px] border mb-6 relative overflow-hidden group ${
            theme === 'light' ? 'border-slate-300 bg-slate-200' : 'border-white/10 bg-[#141414]'
          }`}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfL2LQkthg98MF1PGzsnjnE1XMKhPd1i99bjloo5Ngjh8V3f6ZJdMyKyW1cvaJfDzZ5t-32retRGy7zSvp36qvpeW2_IVytYP4LePIajfFuVvNgOBpv4zCXMWn98IPzZXy_EYj-F_G-3_Qi1Wg6gpfJjHMuRKmdJ84uLY5FyKn0h6C7boWX-kStQrB5EJCB65Pa2q2sBaYb2J2MwYdtwKV3PibJ6gQvMlQYv5xWt0FupRCjHRNnCRqXA"
              alt="Architectural Blueprint"
              className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale group-hover:scale-105 transition-transform duration-700"
            />
            <div className={`absolute inset-0 bg-gradient-to-t opacity-80 ${
              theme === 'light' ? 'from-slate-100 to-transparent' : 'from-[#0C0C0C] to-transparent'
            }`}></div>
          </div>

          {/* Call to Action Block */}
          <div className={`border p-8 flex flex-col items-start gap-6 shadow-2xl ${
            theme === 'light'
              ? 'bg-white border-[#008822]/40 text-slate-900'
              : 'bg-[#141414] border-[#00FF41]/40 text-[#F5F5F5]'
          }`}>
            <h2 className={`font-black text-2xl md:text-3xl leading-tight uppercase tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}>
              {t.connect.readyTitle}
            </h2>
            <p className={`font-body-md text-sm max-w-md leading-relaxed font-light ${
              theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
            }`}>
              {t.connect.readyDesc}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFormModal(true)}
                className={`inline-flex items-center gap-2 px-6 py-3 font-code text-xs uppercase tracking-widest transition-colors cursor-pointer font-bold ${
                  theme === 'light'
                    ? 'bg-[#008822] text-white hover:bg-slate-900'
                    : 'bg-[#00FF41] text-[#0C0C0C] hover:bg-[#F5F5F5]'
                }`}
              >
                <span>{t.connect.initiateBtn}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
              <a
                href={directEmailHref}
                className={`inline-flex items-center gap-2 border px-6 py-3 font-code text-xs uppercase tracking-widest transition-colors ${
                  theme === 'light'
                    ? 'border-slate-300 text-slate-800 hover:border-[#008822] hover:text-[#008822]'
                    : 'border-white/20 text-[#F5F5F5] hover:border-[#00FF41] hover:text-[#00FF41]'
                }`}
              >
                {t.connect.directEmail}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Details Footer Section */}
      <section className={`border-t pt-6 flex flex-wrap gap-8 justify-start md:justify-end text-right ${
        theme === 'light' ? 'border-slate-300' : 'border-white/10'
      }`}>
        <div className="flex flex-col items-start md:items-end">
          <span className={`font-code text-xs uppercase tracking-widest mb-1 font-bold ${
            theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
          }`}>
            {t.connect.location}
          </span>
          <span className={`font-code text-sm ${
            theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
          }`}>
            {t.connect.locationVal}
          </span>
        </div>
        <div className="flex flex-col items-start md:items-end">
          <span className={`font-code text-xs uppercase tracking-widest mb-1 font-bold ${
            theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
          }`}>
            {t.connect.directLine}
          </span>
          <a
            href={directEmailHref}
            className={`font-code text-sm hover:underline underline-offset-4 ${
              theme === 'light' ? 'text-slate-900 hover:text-[#008822]' : 'text-[#F5F5F5] hover:text-[#00FF41]'
            }`}
          >
            itsmeskm99@gmail.com
          </a>
        </div>
      </section>

      {/* Contact Inquiry Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className={`border w-full max-w-lg p-6 md:p-8 relative shadow-2xl ${
            theme === 'light'
              ? 'bg-white border-slate-300 text-slate-900'
              : 'bg-[#141414] border-[#00FF41]/40 text-[#F5F5F5]'
          }`}>
            <button
              onClick={() => {
                setShowFormModal(false);
                setSubmitError(null);
                mutation.reset();
              }}
              className={`absolute top-4 right-4 p-1 cursor-pointer ${
                theme === 'light' ? 'text-slate-500 hover:text-[#008822]' : 'text-[#F5F5F5]/60 hover:text-[#00FF41]'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>

            <span className={`font-code text-xs uppercase tracking-widest font-bold block mb-1 ${
              theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
            }`}>
              {t.connect.modalTag}
            </span>
            <h3 className={`font-black text-2xl mb-4 tracking-tight uppercase ${
              theme === 'light' ? 'text-slate-900' : 'text-[#F5F5F5]'
            }`}>
              {t.connect.modalTitle}
            </h3>

            {mutation.isSuccess ? (
              <div className={`border p-6 space-y-3 my-4 ${
                theme === 'light' ? 'bg-slate-50 border-[#008822]' : 'bg-[#0C0C0C] border-[#00FF41]'
              }`}>
                <div className={`flex items-center gap-2 font-code text-xs font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'
                }`}>
                  <span className="material-symbols-outlined">check_circle</span>
                  <span>DISPATCH CONFIRMED</span>
                </div>
                <p className={`font-body-md text-sm ${
                  theme === 'light' ? 'text-slate-800' : 'text-[#F5F5F5]'
                }`}>
                  {mutation.data?.message}
                </p>
                <p className={`font-code text-xs ${
                  theme === 'light' ? 'text-slate-600' : 'text-[#F5F5F5]/60'
                }`}>
                  Reference Code: <strong className={theme === 'light' ? 'text-[#008822]' : 'text-[#00FF41]'}>{mutation.data?.referenceId}</strong>
                </p>
                <button
                  onClick={() => {
                    setShowFormModal(false);
                    setSubmitError(null);
                    mutation.reset();
                  }}
                  className={`mt-4 w-full py-2.5 font-code text-xs font-bold uppercase tracking-widest cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[#008822] text-white hover:bg-slate-900'
                      : 'bg-[#00FF41] text-[#0C0C0C] hover:bg-[#F5F5F5]'
                  }`}
                >
                  {t.connect.closeBtn}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {(submitError || mutation.isError) && (
                  <div className="bg-red-500/10 border border-red-500/40 text-red-500 p-3 text-xs font-code">
                    {submitError || mutation.error?.message || 'Failed to submit inquiry.'}
                  </div>
                )}
                <div>
                  <label className={`block font-code text-xs uppercase mb-1 font-bold ${
                    theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
                  }`}>
                    {t.connect.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full border px-3 py-2 font-body-md text-sm outline-none transition-colors ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#008822]'
                        : 'bg-[#0C0C0C] border-white/20 text-[#F5F5F5] focus:border-[#00FF41]'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-code text-xs uppercase mb-1 font-bold ${
                    theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
                  }`}>
                    {t.connect.emailAddr}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full border px-3 py-2 font-body-md text-sm outline-none transition-colors ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#008822]'
                        : 'bg-[#0C0C0C] border-white/20 text-[#F5F5F5] focus:border-[#00FF41]'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-code text-xs uppercase mb-1 font-bold ${
                    theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
                  }`}>
                    {t.connect.company}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className={`w-full border px-3 py-2 font-body-md text-sm outline-none transition-colors ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#008822]'
                        : 'bg-[#0C0C0C] border-white/20 text-[#F5F5F5] focus:border-[#00FF41]'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block font-code text-xs uppercase mb-1 font-bold ${
                    theme === 'light' ? 'text-slate-700' : 'text-[#F5F5F5]/80'
                  }`}>
                    {t.connect.reqSummary}
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className={`w-full border px-3 py-2 font-body-md text-sm outline-none transition-colors ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-[#008822]'
                        : 'bg-[#0C0C0C] border-white/20 text-[#F5F5F5] focus:border-[#00FF41]'
                    }`}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className={`w-full py-3 font-code text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[#008822] text-white hover:bg-slate-900'
                      : 'bg-[#00FF41] text-[#0C0C0C] hover:bg-[#F5F5F5]'
                  }`}
                >
                  {mutation.isPending ? t.connect.transmitting : t.connect.transmitBtn}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
