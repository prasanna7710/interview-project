import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';
import { Profile } from '../types';
import {
  User,
  Phone,
  MapPin,
  Award,
  Globe,
  Github,
  Linkedin,
  Save,
  Loader2,
  Plus,
  Trash2,
  Camera,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [headline, setHeadline] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(user?.photoUrl || null);
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  
  const [skills, setSkills] = useState<string[]>(['JavaScript', 'React', 'Node.js', 'Python', 'SQL']);
  const [newSkill, setNewSkill] = useState('');

  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get('/profile');
        if (res.data.profile) {
          const p: Profile = res.data.profile;
          setHeadline(p.headline || 'Full Stack Engineer');
          setPhone(p.phone || '');
          setLocation(p.location || '');
          setBio(p.bio || '');
          if (p.photoUrl) {
            setPhotoUrl(p.photoUrl);
            updateUser({ photoUrl: p.photoUrl });
          }
          setLinkedinUrl(p.linkedinUrl || '');
          setGithubUrl(p.githubUrl || '');
          setPortfolioUrl(p.portfolioUrl || '');

          if (p.skills) {
            try {
              const parsed = JSON.parse(p.skills);
              if (Array.isArray(parsed)) setSkills(parsed);
            } catch (e) {}
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handlePhotoSelect = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validTypes = ['jpg', 'jpeg', 'png', 'webp'];

    if (!ext || !validTypes.includes(ext)) {
      showToast('Invalid image format. Only JPG, JPEG, PNG, and WEBP are supported.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large. Maximum image size is 5 MB.', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newPhotoUrl = res.data.photoUrl;
      setPhotoUrl(newPhotoUrl);
      updateUser({ photoUrl: newPhotoUrl });
      showToast('Profile picture updated successfully!', 'success');
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      const msg = err.response?.data?.error || 'Failed to upload profile picture.';
      showToast(msg, 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!photoUrl) return;
    setIsUploadingPhoto(true);
    try {
      await api.delete('/profile/avatar');
      setPhotoUrl(null);
      updateUser({ photoUrl: undefined });
      showToast('Profile picture removed.', 'info');
    } catch (err: any) {
      console.error('Remove avatar error:', err);
      showToast('Failed to remove profile picture.', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await api.put('/profile', {
        fullName,
        headline,
        phone,
        location,
        bio,
        photoUrl,
        linkedinUrl,
        githubUrl,
        portfolioUrl,
        skills,
      });

      updateUser({ fullName, photoUrl: photoUrl || undefined });
      showToast('Profile updated successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Candidate Profile">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Candidate Profile" subtitle="Manage your professional background and interview context">
      <form onSubmit={handleSave} className="space-y-6">
        {/* Hidden File Input for Avatar */}
        <input
          type="file"
          ref={photoInputRef}
          onChange={(e) => e.target.files?.[0] && handlePhotoSelect(e.target.files[0])}
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
        />

        {/* Top Header Card with Circular Avatar */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Circular Profile Avatar */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-brand-200 bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-3xl shadow-sm overflow-hidden flex-shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span>{fullName ? fullName.charAt(0).toUpperCase() : 'C'}</span>
                )}
              </div>

              {/* Edit overlay icon */}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center shadow-md transition border-2 border-white"
                title="Upload Profile Picture"
              >
                {isUploadingPhoto ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900">{fullName || 'Candidate Name'}</h2>
              <p className="text-xs text-brand-600 font-semibold">{headline || 'Add Headline'}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span>{user?.email}</span>
                {location && <span>• {location}</span>}
              </p>

              {/* Avatar Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="inline-flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-xs transition"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {photoUrl ? 'Change Picture' : 'Upload Picture'}
                </button>

                {photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isUploadingPhoto}
                    className="inline-flex items-center gap-1 text-red-600 hover:bg-red-50 font-semibold px-2.5 py-1.5 rounded-lg border border-red-200/60 text-xs transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition text-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Info Left */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-600" /> Basic Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Professional Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Software Engineer / Frontend Developer"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Professional Summary / Bio</label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Brief summary of your technical background, goals, and core strengths..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-brand-600" /> Technical & Soft Skills
              </h3>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Add skill (e.g., React, Python, System Design)..."
                  className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="inline-flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold px-4 py-2 rounded-xl border border-brand-200 text-sm transition"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Social Links Right */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-600" /> Online Profiles & Links
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">LinkedIn URL</label>
                  <div className="relative">
                    <Linkedin className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">GitHub URL</label>
                  <div className="relative">
                    <Github className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Portfolio / Website</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-300 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-50/60 p-5 rounded-2xl border border-brand-100 space-y-2">
              <h4 className="text-xs font-bold text-brand-700 uppercase tracking-wider">AI Context Note</h4>
              <p className="text-xs text-brand-900 leading-relaxed">
                Your profile picture and background information automatically sync across all your interview sessions and user dashboard.
              </p>
            </div>
          </div>
        </div>
      </form>
    </AppLayout>
  );
};
