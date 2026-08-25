'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Input from '@/components/shared/Input';
import Button from '@/components/shared/Button';
import RichTextEditor from './RichTextEditor';
import { User, Lock, Shield, FileText } from 'lucide-react';

const TABS = [
  { key: 'profile', label: 'Edit Profile', icon: User },
  { key: 'password', label: 'Change Password', icon: Lock },
  { key: 'privacy', label: 'Privacy Policy', icon: Shield },
  { key: 'terms', label: 'Terms & Conditions', icon: FileText },
];

export default function SettingsPanel() {
  const [activeTab, setActiveTab] = useState('profile');

  const [username, setUsername] = useState('firoz_alam');
  const [email, setEmail] = useState('firoz@example.com');
  const [contact, setContact] = useState('+971 50 123 4567');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [privacyContent, setPrivacyContent] = useState(
    'This Privacy Policy outlines how we collect, use, and protect your personal information when you use our platform. We are committed to ensuring that your privacy is protected. Any information you provide will be used strictly in accordance with applicable data protection laws.',
  );
  const [termsContent, setTermsContent] = useState(
    'By accessing and using this platform, you agree to comply with and be bound by the following terms and conditions. All content, materials, and services provided on this platform are for informational purposes only. We reserve the right to modify these terms at any time without prior notice.',
  );

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-[18px] h-[100px]">
        <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold font-[family-name:var(--font-poppins)] shrink-0">
          FA
        </div>
        <div>
          <h2 className="text-xl font-semibold text-text-primary font-[family-name:var(--font-poppins)]">
            Firoz Alam
          </h2>
          <p className="text-sm text-text-secondary font-[family-name:var(--font-manrope)]">
            Administrator
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border-soft/50 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-semibold font-[family-name:var(--font-manrope)] transition-colors border-b-2 shrink-0 cursor-pointer',
                isActive
                  ? 'text-primary border-primary'
                  : 'text-text-secondary border-transparent hover:text-text-primary',
              )}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-6">
        {activeTab === 'profile' && (
          <>
            <Input label="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Contact Number" value={contact} onChange={(e) => setContact(e.target.value)} />
            <div className="flex justify-start">
              <Button variant="primary">Save Changes</Button>
            </div>
          </>
        )}

        {activeTab === 'password' && (
          <>
            <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
            <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
            <Input label="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
            <div className="flex justify-start">
              <Button variant="primary">Update Password</Button>
            </div>
          </>
        )}

        {activeTab === 'privacy' && (
          <>
            <RichTextEditor label="Privacy Policy" value={privacyContent} onChange={setPrivacyContent} />
            <div className="flex justify-start">
              <Button variant="primary">Save Privacy Policy</Button>
            </div>
          </>
        )}

        {activeTab === 'terms' && (
          <>
            <RichTextEditor label="Terms & Conditions" value={termsContent} onChange={setTermsContent} />
            <div className="flex justify-start">
              <Button variant="primary">Save Terms & Conditions</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
