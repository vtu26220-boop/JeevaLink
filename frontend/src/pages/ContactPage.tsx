import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(200),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      const res = await api.post<{ success: boolean; message: string; id: string }>('/contact', data);
      if (res.success) {
        setSubmittedId(res.id);
        toast.success('Your message has been sent successfully!');
        reset();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit contact message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#155EEF] px-3 py-1 bg-blue-50 rounded-full">
          Get in Touch
        </span>
        <h1 className="text-4xl font-extrabold text-[#101828] tracking-tight">Contact JeevaLink</h1>
        <p className="text-sm text-[#667085]">
          Have questions about donor registration, verified transplant resources, or partnership
          guidance? Reach out to our community support team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Contact Info Cards */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-[#101828]">Official Support Channels</h3>

            <div className="space-y-4 text-xs text-[#667085]">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-[#155EEF] shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#101828]">Email Support</p>
                  <p className="text-slate-500">support@jeevalink.org</p>
                  <p className="text-[11px] text-slate-400">Response within 24–48 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-teal-50 text-[#0D9488] shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#101828]">National Organ Helpline (NOTTO)</p>
                  <p className="text-slate-500 font-semibold">1800-11-4770 (Toll Free)</p>
                  <p className="text-[11px] text-slate-400">Government of India 24/7 Helpline</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#101828]">Support Hours</p>
                  <p className="text-slate-500">Monday – Saturday: 9:00 AM – 6:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-[#101828]">Headquarters</p>
                  <p className="text-slate-500">New Delhi, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Medical Emergency Notice</span>
            </h4>
            <p>
              JeevaLink is not an emergency hospital dispatcher. For acute medical emergencies, active
              cardiac events, or critical blood transfusion needs, please contact nearest hospital
              emergency departments directly.
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#101828]">Send Us a Message</h2>
              <p className="text-xs text-[#667085] mt-1">
                Fill in the details below. Our team reviews all incoming inquiries promptly.
              </p>
            </div>

            {submittedId ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-emerald-900">Message Received</h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Thank you! Your message has been saved in our database with reference ID{' '}
                  <span className="font-mono font-bold">{submittedId}</span>. A support coordinator
                  will review your query.
                </p>
                <button
                  onClick={() => setSubmittedId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-700 bg-white border border-emerald-300 hover:bg-emerald-50 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('fullName')}
                      placeholder="e.g. Ramesh Chandra"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#101828] mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      {...register('email')}
                      placeholder="e.g. ramesh@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                    />
                    {errors.email && (
                      <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('subject')}
                    placeholder="e.g. Inquiry regarding blood donor registration in Bengaluru"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF]"
                  />
                  {errors.subject && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#101828] mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    {...register('message')}
                    placeholder="Please describe how we can assist you..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#155EEF]/20 focus:border-[#155EEF] resize-none"
                  />
                  {errors.message && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.message.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-xs font-bold text-white bg-[#155EEF] hover:bg-[#1148B8] shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending Message...' : 'Submit Message'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
