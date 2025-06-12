"use client";

import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

interface SocialIconProps {
  icon: React.ElementType;
}

function SocialIcon({ icon: Icon }: SocialIconProps) {
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-gray-400 hover:text-white hover:bg-white/10"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
}

function FooterSection({ title, children }: FooterSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-white">{title}</h3>
      {children}
    </div>
  );
}

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
}

function FooterLink({ href, children }: FooterLinkProps) {
  return (
    <Link
      href={href}
      className="text-gray-400 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}

function FooterCompanyInfo() {
  return (
    <div className="space-y-4">
      <Logo variant="light" isLink={false} />
      <p className="text-gray-400 text-sm leading-relaxed">
        Master English with interactive lessons, pronunciation practice, and
        personalized feedback. Join thousands of learners worldwide on their
        English learning journey.
      </p>
      <div className="flex space-x-4">
        <SocialIcon icon={Facebook} />
        <SocialIcon icon={Twitter} />
        <SocialIcon icon={Instagram} />
        <SocialIcon icon={Youtube} />
      </div>
    </div>
  );
}

function FooterQuickLinks() {
  return (
    <FooterSection title="Quick Links">
      <ul className="space-y-2 text-sm">
        <li>
          <FooterLink href="/">Home</FooterLink>
        </li>
        <li>
          <FooterLink href="/create">Create Quiz</FooterLink>
        </li>
        <li>
          <FooterLink href="/library">My Content</FooterLink>
        </li>
        <li>
          <FooterLink href="/profile">Profile</FooterLink>
        </li>
      </ul>
    </FooterSection>
  );
}

function FooterLearningResources() {
  return (
    <FooterSection title="Learning">
      <ul className="space-y-2 text-sm">
        <li>
          <FooterLink href="#">Grammar Lessons</FooterLink>
        </li>
        <li>
          <FooterLink href="#">Vocabulary Builder</FooterLink>
        </li>
        <li>
          <FooterLink href="#">Pronunciation Guide</FooterLink>
        </li>
        <li>
          <FooterLink href="#">Listening Practice</FooterLink>
        </li>
        <li>
          <FooterLink href="#">Speaking Exercises</FooterLink>
        </li>
      </ul>
    </FooterSection>
  );
}

function NewsletterSignup() {
  return (
    <FooterSection title="Stay Updated">
      <p className="text-gray-400 text-sm">
        Subscribe to our newsletter for the latest lessons and learning tips.
      </p>
      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Enter your email"
          className="modern-input"
        />
        <Button className="w-full gradient-button">Subscribe</Button>
      </div>
    </FooterSection>
  );
}

interface ContactItemProps {
  icon: React.ElementType;
  text: string;
}

function ContactItem({ icon: Icon, text }: ContactItemProps) {
  return (
    <div className="flex items-center space-x-2 text-gray-400">
      <Icon className="h-4 w-4" />
      <span>{text}</span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-white/10">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FooterCompanyInfo />
          <FooterQuickLinks />
          <FooterLearningResources />
          <NewsletterSignup />
        </div>
      </div>

      {/* Contact Info */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <ContactItem icon={Mail} text="support@onestudy.com" />
            <ContactItem icon={Phone} text="+1 (555) 123-4567" />
            <ContactItem icon={MapPin} text="San Francisco, CA" />
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div>© 2024 OneStudy. All rights reserved.</div>
            <div className="flex space-x-6 mt-2 md:mt-0">
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Cookie Policy</FooterLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
