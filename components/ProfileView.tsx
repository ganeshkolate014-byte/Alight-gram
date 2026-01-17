import React, { useMemo } from 'react';
import { UserProfile, Project } from '../types';
import ProjectCard from './ProjectCard';
import { LogOut, Edit3, Grid, User } from 'lucide-react';
import { auth } from '../services/firebase';

interface ProfileViewProps {
  user: UserProfile;
  projects: Project[];
  onEditProfile: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, projects, onEditProfile }) => {
  const totalLikes = useMemo(() => projects.reduce((acc, curr) => acc + (curr.likes || 0), 0), [projects]);

  return (
    <div className="pb-20 animate-fade-in">
        {/* Profile Header */}
        <div className="flex flex-col items-center pt-2 pb-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent -mx-4 px-4 sm:mx-0 sm:rounded-b-2xl mb-6">
            <div className="w-24 h-24 rounded-full border-2 border-white/10 p-1 mb-4 shadow-xl shadow-black/50">
                {user.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName} className="w-full h-full rounded-full object-cover bg-zinc-900" />
                ) : (
                    <div className="w-full h-full rounded-full bg-zinc-800 flex items-center justify-center">
                        <User size={40} className="text-zinc-500" />
                    </div>
                )}
            </div>
            
            <h2 className="text-xl font-bold text-white mb-1">{user.displayName}</h2>
            <p className="text-sm text-zinc-500 mb-6">{user.email}</p>

            <div className="flex items-center gap-12 mb-8 bg-black/40 px-6 py-3 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="text-center">
                    <div className="text-xl font-bold text-white">{projects.length}</div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Projects</div>
                </div>
                <div className="w-px h-8 bg-white/10"></div>
                <div className="text-center">
                    <div className="text-xl font-bold text-white">{totalLikes}</div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-zinc-500">Likes</div>
                </div>
            </div>

            <div className="flex items-center gap-3 w-full max-w-xs">
                <button 
                    onClick={onEditProfile}
                    className="flex-1 bg-white text-black font-semibold text-sm py-2.5 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 active:scale-95"
                >
                    <Edit3 size={16} />
                    Edit Profile
                </button>
                <button 
                    onClick={() => auth.signOut()}
                    className="w-12 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-colors active:scale-95"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="max-w-xl mx-auto">
            <div className="flex items-center gap-2 mb-6 px-2">
                <Grid size={18} className="text-white" />
                <h3 className="font-bold text-white">My Projects</h3>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-16 text-zinc-500 bg-white/5 rounded-2xl border border-white/5 border-dashed mx-2">
                    <p className="mb-2">You haven't uploaded any projects yet.</p>
                    <p className="text-xs text-zinc-600">Your uploads will appear here.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {projects.map(p => (
                        <ProjectCard key={p.id} project={p} currentUser={user} />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default ProfileView;