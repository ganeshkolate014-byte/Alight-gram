import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { UserProfile, Project, ViewState } from './types';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import UploadModal from './components/UploadModal';
import EditProfileModal from './components/EditProfileModal';
import ProjectCard from './components/ProjectCard';
import ProfileView from './components/ProfileView';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Ghost, Upload, Search } from 'lucide-react';
import { GENRES } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('feed');
  const [showUpload, setShowUpload] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  
  // Filter States
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Scroll Reset on View Change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUser(userSnap.data() as UserProfile);
        } else {
           setUser({
             uid: firebaseUser.uid,
             displayName: firebaseUser.displayName || 'User',
             email: firebaseUser.email || '',
             photoURL: firebaseUser.photoURL || ''
           });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Projects Listener
  useEffect(() => {
    if (!user) return;

    setProjectsLoading(true);
    let q;

    // Use 'profile' view for owner projects
    if (view === 'feed') {
      q = query(
        collection(db, 'projects'),
        where('visibility', '==', 'public')
      );
    } else {
      // Profile View: Show all my projects
      q = query(
        collection(db, 'projects'),
        where('ownerId', '==', user.uid)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let loadedProjects: Project[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Project));
      
      // Client-side Sorting
      loadedProjects.sort((a, b) => b.createdAt - a.createdAt);

      setProjects(loadedProjects);
      setProjectsLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setProjectsLoading(false);
    });

    return () => unsubscribe();
  }, [user, view]);

  // Client-side Filtering
  const filteredProjects = projects.filter(p => {
    const matchesGenre = selectedGenre === 'All' || p.genre === selectedGenre;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.ownerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
             <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-ios-bg text-white font-sans pb-24 sm:pb-10 selection:bg-ios-blue selection:text-white">
      <Navbar 
        user={user} 
        currentView={view} 
        onViewChange={setView}
        onUploadClick={() => setShowUpload(true)}
        onProfileClick={() => setView('profile')}
      />

      <main 
        key={view}
        className="max-w-xl mx-auto px-4 pt-6 view-transition"
      >
        {view === 'feed' ? (
          <>
             {/* Feed Header & Filters */}
             <div className="mb-6 flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">For You</h1>
                
                 <div className="w-full space-y-4">
                    {/* Search Bar */}
                    <div className="relative w-full max-w-sm mx-auto">
                        <Search className="absolute left-3 top-2.5 text-ios-labelSecondary" size={16} />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects..." 
                            className="w-full bg-ios-cardHigh rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-ios-labelSecondary focus:outline-none focus:ring-1 focus:ring-white/20"
                        />
                    </div>

                    {/* Genre Filter Scroll */}
                    <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                        <button
                            onClick={() => setSelectedGenre('All')}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border border-white/5 ${selectedGenre === 'All' ? 'bg-white text-black' : 'bg-ios-cardHigh text-slate-400 hover:bg-white/10'}`}
                        >
                            All
                        </button>
                        {GENRES.map((g) => (
                            <button
                                key={g}
                                onClick={() => setSelectedGenre(g)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border border-white/5 ${selectedGenre === g ? 'bg-white text-black' : 'bg-ios-cardHigh text-slate-400 hover:bg-white/10'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                 </div>
            </div>

            {/* Feed Content */}
            {projectsLoading ? (
               <div className="space-y-8">
                 {[1, 2].map(i => (
                   <div key={i} className="bg-ios-card h-[400px] rounded-ios animate-pulse border border-white/5"></div>
                 ))}
               </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-fade-in">
                <div className="bg-ios-cardHigh p-8 rounded-full mb-6 border border-white/5">
                    <Ghost size={48} className="text-ios-labelSecondary" strokeWidth={1} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
                <p className="text-ios-labelSecondary mb-8 max-w-xs mx-auto">
                    {searchQuery || selectedGenre !== 'All' 
                       ? "Try adjusting your filters to find what you're looking for." 
                       : "The community is quiet right now. Be the first to post!"
                    }
                </p>
              </div>
            ) : (
              <div className="space-y-8 pb-10">
                {filteredProjects.map(project => (
                  <ProjectCard key={project.id} project={project} currentUser={user} />
                ))}
                
                <div className="text-center pt-8">
                    <div className="inline-block w-1.5 h-1.5 bg-ios-separator rounded-full mx-1"></div>
                    <div className="inline-block w-1.5 h-1.5 bg-ios-separator rounded-full mx-1"></div>
                    <div className="inline-block w-1.5 h-1.5 bg-ios-separator rounded-full mx-1"></div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Profile View */
          <ProfileView 
             user={user} 
             projects={projects} 
             onEditProfile={() => setShowEditProfile(true)} 
          />
        )}
      </main>

      {showUpload && (
        <UploadModal 
          currentUser={user} 
          onClose={() => setShowUpload(false)} 
          onUploadSuccess={() => {
            setShowUpload(false);
            setView('profile'); // Switch to profile to see new upload
            setSelectedGenre('All');
          }}
        />
      )}

      {showEditProfile && (
        <EditProfileModal
          currentUser={user}
          onClose={() => setShowEditProfile(false)}
          onUpdateSuccess={(updatedUser) => setUser(updatedUser)}
        />
      )}
    </div>
  );
};

export default App;