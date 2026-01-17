import React, { useState } from 'react';
import { Project, UserProfile } from '../types';
import { Download, Heart, MessageCircle, Lock, Globe, User, Share2, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import { doc, updateDoc, arrayUnion, arrayRemove, increment, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Comments from './Comments';
import VideoPlayer from './VideoPlayer';
import EditProjectModal from './EditProjectModal';

interface ProjectCardProps {
  project: Project;
  currentUser: UserProfile;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, currentUser }) => {
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(project.likedBy?.includes(currentUser.uid) || false);
  const [likesCount, setLikesCount] = useState(project.likes || 0);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleDownload = () => {
    const blob = new Blob([project.xmlContent], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleLike = async () => {
    const previousLiked = isLiked;
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      const projectRef = doc(db, 'projects', project.id);
      if (previousLiked) {
        await updateDoc(projectRef, {
          likes: increment(-1),
          likedBy: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(projectRef, {
          likes: increment(1),
          likedBy: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
      setIsLiked(previousLiked);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteDoc(doc(db, 'projects', project.id));
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project");
    }
  };

  const canDownload = project.visibility === 'public' || project.ownerId === currentUser.uid;
  const isOwner = project.ownerId === currentUser.uid;

  return (
    <>
    <div className="bg-ios-card rounded-ios overflow-hidden mb-8 border border-white/[0.05] shadow-2xl flex flex-col transform transition-all duration-300">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between relative">
        <div className="flex items-center space-x-3">
          {project.ownerPhoto ? (
            <img src={project.ownerPhoto} alt={project.ownerName} className="w-10 h-10 rounded-full object-cover border border-white/10" />
          ) : (
             <div className="w-10 h-10 rounded-full bg-ios-cardHigh flex items-center justify-center border border-white/10">
                <User size={20} className="text-ios-labelSecondary" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-ios-label text-sm leading-tight">{project.ownerName}</h3>
            <div className="flex items-center space-x-2 mt-0.5">
               <span className="text-[11px] text-ios-labelSecondary">
                  {new Date(project.createdAt).toLocaleDateString()}
               </span>
               {project.visibility === 'private' && (
                 <div className="flex items-center space-x-1 bg-yellow-500/10 px-1.5 py-0.5 rounded text-yellow-500">
                    <Lock size={10} />
                    <span className="text-[10px] font-medium">Private</span>
                 </div>
               )}
            </div>
          </div>
        </div>
        
        {isOwner && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="text-ios-labelSecondary hover:text-white transition-colors p-2 -mr-2"
            >
              <MoreHorizontal size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 bg-zinc-800 border border-white/10 rounded-xl shadow-xl z-20 w-36 overflow-hidden animate-fade-in py-1">
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      setShowEditModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-white hover:bg-white/5 text-xs font-medium text-left transition-colors"
                  >
                    <Edit3 size={14} />
                    Edit Project
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-white/5 text-xs font-medium text-left transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
              </div>
            )}
            {/* Backdrop to close menu */}
            {showMenu && (
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
            )}
          </div>
        )}
      </div>

      {/* Media Content */}
      <div className="w-full aspect-[4/5] sm:aspect-video bg-black relative">
        {project.videoUrl ? (
          <VideoPlayer src={project.videoUrl} />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-ios-cardHigh border-y border-white/5">
            <div className="p-6 rounded-full bg-white/5 mb-4">
                <Globe size={40} className="text-ios-blue opacity-50" />
            </div>
            <span className="text-lg font-medium text-ios-labelSecondary">XML File Only</span>
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center space-x-5">
          <button 
            onClick={toggleLike}
            className={`flex items-center justify-center transition-transform active:scale-90 duration-200 ${isLiked ? 'text-ios-red' : 'text-white hover:text-ios-red'}`}
          >
            <Heart size={26} className={isLiked ? 'fill-current' : ''} strokeWidth={2} />
          </button>
          
          <button 
            onClick={() => setShowComments(!showComments)}
            className="text-white hover:text-ios-blue transition-colors active:scale-90 duration-200"
          >
            <MessageCircle size={26} strokeWidth={2} />
          </button>
          
          <button className="text-white hover:text-ios-green transition-colors active:scale-90 duration-200">
             <Share2 size={26} strokeWidth={2} />
          </button>
        </div>

        {canDownload && (
          <button 
            onClick={handleDownload}
            className="flex items-center space-x-2 bg-ios-cardHigh hover:bg-white/20 text-white pl-4 pr-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-95 border border-white/10"
          >
            <Download size={16} />
            <span>Download XML</span>
          </button>
        )}
      </div>

      {/* Text Content */}
      <div className="px-5 pb-5">
        {likesCount > 0 && (
           <p className="text-sm font-semibold text-white mb-2">{likesCount.toLocaleString()} likes</p>
        )}
        
        <div className="mb-2 text-sm">
            <span className="font-semibold text-white mr-2">{project.ownerName}</span>
            <span className="text-ios-label">{project.title}</span>
        </div>
        
        {project.description && (
          <p className="text-sm text-ios-labelSecondary leading-relaxed whitespace-pre-wrap">{project.description}</p>
        )}
        
        <button 
            onClick={() => setShowComments(!showComments)}
            className="text-ios-labelSecondary text-sm mt-3 hover:text-white transition-colors"
        >
            {showComments ? 'Hide comments' : `View all comments`}
        </button>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
             <Comments projectId={project.id} currentUser={currentUser} />
          </div>
        )}
      </div>
    </div>
    
    {showEditModal && (
        <EditProjectModal 
            project={project}
            onClose={() => setShowEditModal(false)}
            onUpdateSuccess={() => setShowEditModal(false)}
        />
    )}
    </>
  );
};

export default ProjectCard;