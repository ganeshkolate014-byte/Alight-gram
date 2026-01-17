import React, { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';
import { UserProfile } from '../types';
import { Mail, Lock, ArrowRight, Upload, User as UserIcon } from 'lucide-react';
import { uploadToCloudinary } from '../services/cloudinary';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      }, { merge: true });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        let photoURL = '';
        if (file) {
           photoURL = await uploadToCloudinary(file);
        }

        await updateProfile(user, {
          displayName: displayName || user.email?.split('@')[0],
          photoURL: photoURL
        });

        const userData: UserProfile = {
          uid: user.uid,
          displayName: displayName || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          photoURL: photoURL
        };
        await setDoc(doc(db, 'users', user.uid), userData);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6">
      
      <div className="w-full max-w-[320px] animate-fade-in">
        <div className="text-center mb-10 flex flex-col items-center">
          <h1 className="text-4xl font-bold tracking-tighter mb-2 bg-gradient-to-b from-white via-zinc-200 to-zinc-600 bg-clip-text text-transparent inline-block pb-1">
            AlightGram
          </h1>
          <p className="text-zinc-500 text-sm transition-all duration-300">
            {isLogin ? 'Welcome back, creator.' : 'Join the community.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Seamless Transition Container for Sign Up Fields */}
            <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${!isLogin ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="space-y-4 pt-1 pb-1">
                    {/* Profile Pic Upload */}
                    <div className="flex justify-center mb-2">
                        <label className="relative cursor-pointer group">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all duration-300 overflow-hidden ${file ? 'border-zinc-700 bg-black' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'}`}>
                                {file ? (
                                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                ) : (
                                    <Upload size={20} className="text-zinc-500" />
                                )}
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                        </label>
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                        <UserIcon size={16} />
                        </div>
                        <input
                        type="text"
                        placeholder="Display Name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
                        />
                    </div>
                </div>
            </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Mail size={16} />
            </div>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <div className="relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Lock size={16} />
            </div>
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold text-sm rounded-xl py-3 hover:bg-zinc-200 transition-all duration-300 flex items-center justify-center space-x-2 mt-2"
          >
            {loading ? (
              <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
                <span className="bg-black px-2 text-zinc-600">OR</span>
            </div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-xl py-3 transition-colors flex items-center justify-center space-x-3 border border-zinc-800"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26+1.81-1.58z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="mt-8 text-center">
          <p className="text-zinc-600 text-xs transition-all duration-300">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white hover:underline transition-colors ml-1 font-medium"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;