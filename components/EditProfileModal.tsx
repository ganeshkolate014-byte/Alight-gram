import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, Upload, User, Save, Camera } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface EditProfileModalProps {
  currentUser: UserProfile;
  onClose: () => void;
  onUpdateSuccess: (updatedProfile: UserProfile) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ currentUser, onClose, onUpdateSuccess }) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let photoURL = currentUser.photoURL;

      // 1. Upload new photo if selected
      if (file) {
        photoURL = await uploadToCloudinary(file);
      }

      // 2. Update Firebase Auth
      if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
              displayName: displayName,
              photoURL: photoURL
          });
      }

      // 3. Update Firestore User Document
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        photoURL: photoURL
      });

      onUpdateSuccess({
          ...currentUser,
          displayName,
          photoURL
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-ios-card w-full max-w-sm rounded-ios border border-white/10 shadow-2xl overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-ios-cardHigh/50">
          <h2 className="text-[17px] font-semibold text-white">Edit Profile</h2>
          <button onClick={onClose} className="p-1 text-ios-labelSecondary hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleUpdate} className="p-6 space-y-6">
           {error && (
            <div className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg text-center">
              {error}
            </div>
           )}

           {/* Avatar */}
           <div className="flex justify-center">
             <label className="relative cursor-pointer group">
                <div className="w-28 h-28 rounded-full border-2 border-dashed border-white/20 overflow-hidden flex items-center justify-center bg-black group-hover:border-white/40 transition-colors">
                    {file ? (
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    ) : currentUser.photoURL ? (
                        <img src={currentUser.photoURL} className="w-full h-full object-cover" />
                    ) : (
                        <User size={32} className="text-slate-500" />
                    )}
                </div>
                <div className="absolute bottom-1 right-1 bg-ios-blue rounded-full p-2 border-2 border-ios-card text-white shadow-lg">
                    <Camera size={16} />
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
             </label>
           </div>

           {/* Name Input */}
           <div className="space-y-2">
              <label className="text-xs font-medium text-ios-labelSecondary uppercase ml-1">Display Name</label>
              <input 
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-ios-cardHigh border border-white/5 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ios-blue/50"
                placeholder="Your name"
              />
           </div>

           <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
           >
             {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full"></span>
             ) : (
                <>
                    <Save size={18} />
                    <span>Save Changes</span>
                </>
             )}
           </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;