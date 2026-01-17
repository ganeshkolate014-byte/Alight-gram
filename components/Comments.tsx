import React, { useEffect, useState } from 'react';
import { getDatabase, ref, push, onValue, query, orderByChild } from 'firebase/database';
import { rtdb } from '../services/firebase';
import { Comment, UserProfile } from '../types';
import { Send, User } from 'lucide-react';

interface CommentsProps {
  projectId: string;
  currentUser: UserProfile;
}

const Comments: React.FC<CommentsProps> = ({ projectId, currentUser }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const commentsRef = ref(rtdb, `project_comments/${projectId}`);
    const commentsQuery = query(commentsRef, orderByChild('timestamp'));

    const unsubscribe = onValue(commentsQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedComments: Comment[] = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }));
        loadedComments.sort((a, b) => b.timestamp - a.timestamp); // Newest first
        setComments(loadedComments);
      } else {
        setComments([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [projectId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentData = {
      text: newComment,
      userId: currentUser.uid,
      userName: currentUser.displayName,
      userPhoto: currentUser.photoURL || '',
      timestamp: Date.now()
    };

    const commentsRef = ref(rtdb, `project_comments/${projectId}`);
    await push(commentsRef, commentData);
    setNewComment('');
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  return (
    <div className="border-t border-white/5 pt-2">
      <div className="max-h-60 overflow-y-auto mb-3 space-y-3 custom-scrollbar pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-4">
             <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-slate-600 text-xs">No comments yet.</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3 group">
              <div className="flex-shrink-0">
                {comment.userPhoto ? (
                    <img src={comment.userPhoto} alt={comment.userName} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center">
                        <User size={12} className="text-slate-500" />
                    </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline space-x-2">
                    <span className="text-xs font-bold text-slate-200 hover:underline cursor-pointer">{comment.userName}</span>
                    <span className="text-[10px] text-slate-500">{formatTime(comment.timestamp)}</span>
                </div>
                <p className="text-sm text-slate-300 leading-snug">{comment.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handlePostComment} className="flex items-center space-x-2 bg-slate-900/50 p-1.5 rounded-full border border-white/10 focus-within:border-brand-500/50 transition-colors">
        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0 ml-1">
            {currentUser.photoURL ? (
                <img src={currentUser.photoURL} className="w-full h-full rounded-full object-cover" />
            ) : <User size={12} />}
        </div>
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0 outline-none placeholder-slate-600 py-1"
        />
        <button 
          type="submit" 
          disabled={!newComment.trim()}
          className="p-1.5 bg-brand-600 rounded-full text-white hover:bg-brand-500 disabled:opacity-0 disabled:scale-0 transition-all duration-200 ease-out"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
};

export default Comments;