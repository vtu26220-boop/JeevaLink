import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { ShieldCheck, Heart, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#101828] text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="brightness-125">
              <Logo showTagline={true} size="md" />
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm pt-2">
              JeevaLink is a secure healthcare and community assistance platform connecting blood
              donors with individuals in urgent need, and providing verified organ donation
              information, official government registration guidance, and transplant resource assistance.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
              <span>Dedicated to privacy, consent, and official healthcare protocols.</span>
            </div>
          </div>

          {/* Four Core Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Healthcare Services
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link
                  to="/services/blood-donation"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Blood Donation</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/services/blood-requirement"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>Blood Requirement</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/services/organ-donation"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Organ Donation Info & Guidance</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/services/organ-requirement"
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                  <span>Organ Requirement & Assistance</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Platform & Info
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About JeevaLink
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  All Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link to="/about#privacy" className="hover:text-white transition-colors">
                  Privacy & Safety Principles
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Helplines & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Helplines & Support
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[#155EEF] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">National Organ Helpline (NOTTO)</p>
                  <p className="text-[11px]">1800-11-4770 (Toll-Free)</p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <Mail className="w-4 h-4 text-[#0D9488] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-300">JeevaLink Support</p>
                  <p className="text-[11px]">support@jeevalink.org</p>
                </div>
              </div>
              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[11px]">New Delhi, India</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mandatory Medical & Legal Disclaimer Banner */}
        <div className="my-8 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed space-y-1">
          <p className="font-bold text-slate-300 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span>Important Medical & Legal Notice:</span>
          </p>
          <p>
            JeevaLink is an independent community and educational support initiative. The application
            does NOT operate as an organ marketplace, determine medical eligibility, allocate organs, or
            replace licensed hospitals, blood banks, or official healthcare systems. In emergencies,
            always contact nearest hospitals, authorized blood transfusion centers, or official
            helplines immediately.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} JeevaLink. Connecting Lives. Inspiring Hope. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-400 transition-colors">
              Terms & Privacy
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-400 transition-colors">
              Help Desk
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
