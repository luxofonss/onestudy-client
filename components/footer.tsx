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
  Github,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

interface SocialIconProps {
  icon: React.ElementType;
  href: string;
}

function SocialIcon({ icon: Icon, href }: SocialIconProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      <Button
        size="icon"
        variant="ghost"
        className="h-9 w-9 rounded-full bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/80 border border-gray-700/50 backdrop-blur-sm"
      >
        <Icon className="h-4 w-4" />
        <span className="sr-only">Social media</span>
      </Button>
    </a>
  );
}

interface FooterSectionProps {
  title: string;
  children: React.ReactNode;
}

function FooterSection({ title, children }: FooterSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-base text-white bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{title}</h3>
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
      className="text-gray-400 hover:text-white transition-colors hover:underline decoration-gray-500 underline-offset-2"
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
      <div className="flex space-x-3">
        <SocialIcon icon={Facebook} href="https://facebook.com" />
        <SocialIcon icon={Twitter} href="https://twitter.com" />
        <SocialIcon icon={Instagram} href="https://instagram.com" />
        <SocialIcon icon={Linkedin} href="https://linkedin.com" />
        <SocialIcon icon={Github} href="https://github.com" />
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
        <li>
          <FooterLink href="/pronunciation-test">Pronunciation Test</FooterLink>
        </li>
      </ul>
    </FooterSection>
  );
}

function FooterLearningResources() {
  return (
    <FooterSection title="Learning Resources">
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
          className="bg-gray-800/50 border-gray-700/50 text-gray-200 placeholder:text-gray-500 h-10 backdrop-blur-sm"
        />
        <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white border-0">
          Subscribe
        </Button>
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
      <Icon className="h-4 w-4 text-gray-500" />
      <span>{text}</span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gradient-to-b from-gray-900 to-black">
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
      <div className="border-t border-gray-800/80 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <ContactItem icon={Mail} text="support@onestudy.com" />
            <ContactItem icon={Phone} text="+1 (555) 123-4567" />
            <ContactItem icon={MapPin} text="San Francisco, CA" />
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800/80 bg-black/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
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
