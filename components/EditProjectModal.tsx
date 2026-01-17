import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { Video, FileCode, Check, AlertCircle, ChevronRight, X, Save, Smartphone, Monitor, Square, RectangleVertical } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { GENRES, ASPECT_RATIOS } from '../constants';

interface EditProjectModalProps {
  project: Project;
  onClose: () => void;
  onUpdateSuccess: () => void;
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ project, onClose, onUpdateSuccess }) => {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [genre, setGenre] = useState(project.genre || GENRES[0]);
  const [aspectRatio, setAspectRatio] = useState(project.aspectRatio || '4:5');
  const [visibility, setVisibility] = useState<'public' | 'private'>(project.visibility);
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updates: any = {
        title,
        description,
        genre,
        aspectRatio,
        visibility
      };

      if (xmlFile) {
        updates.xmlContent = await xmlFile.text();
      }

      if (videoFile) {
        updates.videoUrl = await uploadToCloudinary(videoFile);
      }

      await updateDoc(doc(db, 'projects', project.id), updates);
      
      setIsVisible(false);
      setTimeout(onUpdateSuccess, 300);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  const getAspectRatioIcon = (ratio: string) => {
    switch (ratio) {
      case '9:16': return <Smartphone size={24} strokeWidth={1.5} />;
      case '16:9': return <Monitor size={24} strokeWidth={1.5} />;
      case '1:1': return <Square size={24} strokeWidth={1.5} />;
      case '4:5': return <RectangleVertical size={24} strokeWidth={1.5} />;
      default: return <RectangleVertical size={24} strokeWidth={1.5} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose}
      ></div>
      
      <div 
        className={`relative bg-ios-card w-full max-w-lg sm:rounded-ios rounded-t-ios border border-white/10 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden transform transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full sm:translate-y-10 sm:opacity-0'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-ios-cardHigh/50 backdrop-blur-md sticky top-0 z-10">
          <button onClick={handleClose} className="text-ios-blue text-[17px] font-normal hover:opacity-70 transition-opacity">
            Cancel
          </button>
          <h2 className="text-[17px] font-semibold text-white">Edit Project</h2>
          <button 
            onClick={handleUpdate}
            disabled={loading || !title}
            className={`text-[17px] font-semibold transition-opacity ${loading || !title ? 'text-ios-labelSecondary opacity-50' : 'text-ios-blue hover:opacity-70'}`}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="overflow-y-auto p-4 custom-scrollbar bg-ios-bg">
          {error && (
            <div className="flex items-center gap-2 bg-ios-red/10 text-ios-red p-3 rounded-lg mb-6 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form className="space-y-6 pb-10">
            {/* Metadata */}
            <div className="bg-ios-cardHigh rounded-xl overflow-hidden">
                <div className="p-4 border-b border-white/10">
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent text-white text-lg placeholder-ios-labelSecondary focus:outline-none"
                        placeholder="Title"
                    />
                </div>
                <div className="p-4">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-transparent text-ios-label placeholder-ios-labelSecondary focus:outline-none resize-none h-24 text-base"
                        placeholder="Description..."
                    />
                </div>
            </div>

            {/* Genre */}
            <div>
               <h3 className="text-xs font-medium text-ios-labelSecondary uppercase ml-4 mb-2">Category</h3>
               <div className="bg-ios-cardHigh rounded-xl p-4 overflow-x-auto no-scrollbar flex space-x-2">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenre(g)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${genre === g ? 'bg-white text-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      {g}
                    </button>
                  ))}
               </div>
            </div>

            {/* Aspect Ratio Selection */}
            <div>
               <h3 className="text-xs font-medium text-ios-labelSecondary uppercase ml-4 mb-2">Aspect Ratio</h3>
               <div className="bg-ios-cardHigh rounded-xl p-2 grid grid-cols-4 gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setAspectRatio(ratio.value)}
                      className={`flex flex-col items-center justify-center py-3 rounded-lg transition-all ${aspectRatio === ratio.value ? 'bg-white text-black shadow-lg' : 'bg-transparent text-ios-labelSecondary hover:bg-white/5'}`}
                    >
                      <span className="mb-2">{getAspectRatioIcon(ratio.value)}</span>
                      <span className="text-[10px] font-bold">{ratio.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            {/* Files */}
            <div>
                 <h3 className="text-xs font-medium text-ios-labelSecondary uppercase ml-4 mb-2">Update Assets (Optional)</h3>
                 <div className="bg-ios-cardHigh rounded-xl overflow-hidden divide-y divide-white/10">
                    <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-orange-500/20 flex items-center justify-center">
                                <FileCode size={18} className="text-orange-500" />
                            </div>
                            <span className="text-white">XML Project</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className={`text-sm ${xmlFile ? 'text-ios-green' : 'text-ios-labelSecondary'}`}>
                                {xmlFile ? xmlFile.name.substring(0, 15) + '...' : 'Keep Current'}
                            </span>
                            {xmlFile ? <Check size={16} className="text-ios-green" /> : <ChevronRight size={16} className="text-ios-labelSecondary" />}
                        </div>
                        <input type="file" accept=".xml" className="hidden" onChange={(e) => setXmlFile(e.target.files?.[0] || null)} />
                    </label>

                    <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center">
                                <Video size={18} className="text-blue-500" />
                            </div>
                            <span className="text-white">Preview Video</span>
                        </div>
                        <div className="flex items-center space-x-2">
                             <span className={`text-sm ${videoFile ? 'text-ios-green' : 'text-ios-labelSecondary'}`}>
                                {videoFile ? 'Replace Video' : 'Keep Current'}
                            </span>
                            {videoFile ? <Check size={16} className="text-ios-green" /> : <ChevronRight size={16} className="text-ios-labelSecondary" />}
                        </div>
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
                    </label>
                 </div>
            </div>

            {/* Visibility */}
            <div>
                 <h3 className="text-xs font-medium text-ios-labelSecondary uppercase ml-4 mb-2">Privacy</h3>
                 <div className="bg-ios-cardHigh rounded-xl p-1 flex">
                    <button
                      type="button"
                      onClick={() => setVisibility('public')}
                      className={`flex-1 py-1.5 text-[15px] font-medium rounded-lg transition-all duration-200 ${visibility === 'public' ? 'bg-white/10 text-white shadow' : 'text-ios-labelSecondary'}`}
                    >
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibility('private')}
                      className={`flex-1 py-1.5 text-[15px] font-medium rounded-lg transition-all duration-200 ${visibility === 'private' ? 'bg-white/10 text-white shadow' : 'text-ios-labelSecondary'}`}
                    >
                      Private
                    </button>
                 </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProjectModal;