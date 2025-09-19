import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, ProjectStatus, ToastMessage, User, ChannelDna, ApiKeys, AIProvider, AIModel, Channel, Dream100Video, ChannelStats, Idea, AutomationStep } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/Header';
import { ProjectList } from './components/ProjectList';
import { AutomationEngine } from './components/AutomationEngine';
import { CalendarView } from './components/CalendarView';
import { AdminPanel } from './components/AdminPanel';
import { ProjectModal } from './components/ProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { Dream100Modal } from './components/Dream100Modal';
import { Toast } from './components/Toast';
import { LoginScreen } from './components/LoginScreen';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { ExpiredScreen } from './components/ExpiredScreen';
import { DbConnectionErrorScreen } from './components/DbConnectionErrorScreen';
import { AuthConfigurationErrorScreen } from './components/AuthConfigurationErrorScreen';
import { Loader } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { useTranslation } from './hooks/useTranslation';
import { fetchChannelStats } from './services/youtubeService';
import { auth, db, googleProvider, firebase } from './firebase';
import { DEFAULT_AUTOMATION_STEPS } from './constants';

// Define FirebaseUser type for v8.
// FIX: The type `firebase.User` cannot be resolved correctly because the global `firebase` object from the script tag is not fully typed.
// Defining a minimal type for the user object provides the necessary type information for the properties being used.
type FirebaseUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};


// --- DEVELOPMENT MODE FLAG ---
// Set to true to bypass login and use a mock user for development.
// Set to false for production to enable real Google Sign-In.
const IS_DEV_MODE = false;

const MOCK_USER: User = {
  uid: 'dev-user-01',
  name: 'Developer',
  email: 'dev@example.com',
  avatar: 'https://i.pravatar.cc/150?u=dev',
  status: 'active',
  expiresAt: null,
  isAdmin: true,
};

// Add default placeholder keys for development convenience.
const DEV_DEFAULT_API_KEYS: ApiKeys = {
  gemini: 'YOUR_GEMINI_API_KEY_HERE',
  openai: 'YOUR_OPENAI_API_KEY_HERE',
  youtube: 'YOUR_YOUTUBE_API_KEY_HERE',
};


const AppContent: React.FC = () => {
  const [projects, setProjects] = useLocalStorage<Project[]>('dev-projects', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKeys>(
    'api-keys', 
    IS_DEV_MODE ? DEV_DEFAULT_API_KEYS : { gemini: '', openai: '', youtube: '' }
  );
  const [selectedProvider, setSelectedProvider] = useLocalStorage<AIProvider>('ai-provider', 'gemini');
  const [selectedModel, setSelectedModel] = useLocalStorage<AIModel>('ai-model', 'gemini-2.5-flash');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'projects' | 'automation' | 'calendar' | 'admin'>('projects');
  const [channels, setChannels] = useLocalStorage<Channel[]>('dev-channels', []);
  const { t } = useTranslation();
  const [dbConnectionError, setDbConnectionError] = useState<boolean>(false);
  // FIX: Corrected syntax for useState by adding the closing angle bracket `>`.
  const [signInError, setSignInError] = useState<{ code: string; domain?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dream100Channel, setDream100Channel] = useState<Channel | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 5000); // Increased duration for important messages
  }, []);

  // Listener for authentication state using v8 syntax
  useEffect(() => {
    if (IS_DEV_MODE) {
      setUser(MOCK_USER);
      setIsLoading(false);
      return; // Skip Firebase auth listener in dev mode
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const userDocRef = db.collection('users').doc(firebaseUser.uid);
          const userDoc = await userDocRef.get();
          
          if (userDoc.exists) {
            // Existing user
            const docData = userDoc.data() as any;
            let finalStatus: User['status'] = docData.status;

            // Check for subscription expiration if active
            if (docData.status === 'active' && docData.expiresAt && docData.expiresAt.toDate() < new Date()) {
              finalStatus = 'expired';
              await userDocRef.update({ status: 'expired' }); // Persist expired status
            }

            const userData: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || 'No email',
              avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
              status: finalStatus,
              expiresAt: docData.expiresAt ? docData.expiresAt.toDate().toISOString() : null,
              isAdmin: docData.isAdmin || false,
            };
            setUser(userData);
          } else {
            // New user registration, set as pending
            const newUserPayload = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || 'No email',
              avatar: firebaseUser.photoURL || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
              status: 'pending',
              expiresAt: null,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              isAdmin: false,
            };
            await userDocRef.set(newUserPayload);
            
            // FIX: Explicitly create the User object to avoid type errors from spreading newUserPayload.
            // This ensures 'createdAt' is not included and 'status' has the correct literal type.
            const newUserData: User = {
                uid: firebaseUser.uid,
                name: newUserPayload.name,
                email: newUserPayload.email,
                avatar: newUserPayload.avatar,
                status: 'pending',
                expiresAt: newUserPayload.expiresAt,
                isAdmin: newUserPayload.isAdmin,
            };
            setUser(newUserData);
          }
        } else {
          // User is signed out
          setUser(null);
          setProjects([]);
        }
      } catch (error: any) {
        console.error("Firestore connection error:", error);
        setDbConnectionError(true);
        setUser(null);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [showToast, t, setProjects]);

  // Handle redirect result from Google Sign-In
  useEffect(() => {
    if (IS_DEV_MODE) return;
    
    // Check for redirect result on app load.
    const checkRedirectResult = async () => {
        try {
            await auth.getRedirectResult();
            // Successful sign-in is handled by the onAuthStateChanged listener.
        } catch (error: any) {
            console.error("Google sign-in redirect error:", error);
            if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/unauthorized-domain') {
                setSignInError({ code: error.code, domain: window.location.hostname });
            } else {
                showToast(t('toasts.signInError'), 'error');
            }
        }
    };
    
    checkRedirectResult();
  }, [showToast, t]);

  // Listener for project data from Firestore using v8 syntax
  useEffect(() => {
    if (user?.uid && user.status === 'active' && !IS_DEV_MODE) { // Don't fetch in dev mode
      setIsLoading(true);
      const projectsCollectionRef = db.collection('users').doc(user.uid).collection('projects');
      // FIX: Removed `.orderBy('publishDateTime', 'desc')` to prevent Firestore error on missing index.
      // Sorting will now be handled on the client-side after data retrieval.
      const q = projectsCollectionRef;
      
      const unsubscribe = q.onSnapshot((snapshot) => {
        const projectsData = snapshot.docs.map(doc => {
          const data = doc.data();
          // Use firebase.firestore.Timestamp for type checking
          const publishDateTime = data.publishDateTime instanceof firebase.firestore.Timestamp 
            ? data.publishDateTime.toDate().toISOString().slice(0, 16) 
            : data.publishDateTime;
          
          return {
            id: doc.id,
            ...data,
            publishDateTime,
          } as Project;
        });
        // Sort projects on the client side to maintain order without needing a Firestore index.
        projectsData.sort((a, b) => new Date(b.publishDateTime).getTime() - new Date(a.publishDateTime).getTime());
        setProjects(projectsData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching projects: ", error);
        showToast(t('toasts.fetchProjectsError'), 'error');
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else if (!IS_DEV_MODE && !isLoading && !user) {
        setProjects([]);
    }
  }, [user, showToast, t, setProjects, isLoading]);
  
  // Listener for channels data from Firestore
  useEffect(() => {
    if (user?.uid && user.status === 'active' && !IS_DEV_MODE) {
        const channelsCollectionRef = db.collection('users').doc(user.uid).collection('channels');
        
        const unsubscribe = channelsCollectionRef.onSnapshot((snapshot) => {
            const channelsData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                } as Channel;
            });
            setChannels(channelsData);
        }, (error) => {
            console.error("Error fetching channels: ", error);
            showToast(t('toasts.fetchChannelsError'), 'error');
        });
        
        return () => unsubscribe();
    } else if (!IS_DEV_MODE && !isLoading && !user) {
        setChannels([]);
    }
  }, [user, showToast, t, setChannels, isLoading]);
  
  // This effect fetches channel stats when channels are loaded or updated
  useEffect(() => {
    const fetchStatsForChannels = async () => {
      if (!apiKeys.youtube || !user || IS_DEV_MODE) return;

      const channelsToUpdate = channels.filter(ch => ch.channelUrl && !ch.stats);
      if (channelsToUpdate.length === 0) return;

      const statsPromises = channelsToUpdate.map(channel =>
        fetchChannelStats(channel.channelUrl!, apiKeys.youtube)
          .then(stats => ({ channelId: channel.id, stats }))
          .catch(err => {
            console.error(`Failed to fetch stats for ${channel.name}:`, err.message);
            return { channelId: channel.id, stats: null };
          })
      );
      
      const results = await Promise.all(statsPromises);
      
      const batch = db.batch();
      let statsUpdated = false;
      
      results.forEach(result => {
          if (result.stats) {
              const channelDocRef = db.collection('users').doc(user.uid).collection('channels').doc(result.channelId);
              batch.update(channelDocRef, { stats: result.stats });
              statsUpdated = true;
          }
      });
      
      if (statsUpdated) {
          try {
              await batch.commit();
              // The onSnapshot listener will automatically update the local state.
          } catch (error) {
              console.error("Error batch updating channel stats:", error);
          }
      }
    };

    fetchStatsForChannels();
  }, [channels, apiKeys.youtube, user, showToast, t]);
  
  const projectsByChannel = useMemo(() => {
    return projects.reduce((acc, project) => {
      const channelId = project.channelId || 'uncategorized';
      if (!acc[channelId]) {
        acc[channelId] = [];
      }
      acc[channelId].push(project);
      return acc;
    }, {} as Record<string, Project[]>);
  }, [projects]);


  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleOpenModal = (project: Project | null) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };
  
  const handleOpenSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSettingsModalOpen(false);
    setSelectedProject(null);
  };
  
  const handleSaveSettings = (settings: { apiKeys: ApiKeys, selectedProvider: AIProvider, selectedModel: AIModel }) => {
    setApiKeys(settings.apiKeys);
    setSelectedProvider(settings.selectedProvider);
    setSelectedModel(settings.selectedModel);
    showToast(t('toasts.settingsSaved'), 'success');
  };
  
  const handleAddChannel = async (newChannelData: Omit<Channel, 'id'>): Promise<void> => {
    if (IS_DEV_MODE) {
        const newChannel: Channel = {
            id: `dev-chan-${Date.now()}`,
            name: newChannelData.name,
            dna: newChannelData.dna,
            channelUrl: newChannelData.channelUrl || '',
            ideas: [],
            dream100Videos: [],
            automationSteps: DEFAULT_AUTOMATION_STEPS,
        };
        setChannels(prev => [...prev, newChannel]);
        showToast(t('toasts.channelAdded'), 'success');
        return;
    }

    if (!user) {
        showToast(t('toasts.loginRequiredToSave'), 'error');
        throw new Error("User not logged in");
    }
    const channelPayload: Omit<Channel, 'id'> = {
        name: newChannelData.name,
        dna: newChannelData.dna,
        channelUrl: newChannelData.channelUrl || '',
        ideas: [],
        dream100Videos: [],
        automationSteps: DEFAULT_AUTOMATION_STEPS,
    };
    try {
        await db.collection('users').doc(user.uid).collection('channels').add(channelPayload);
        showToast(t('toasts.channelAdded'), 'success');
    } catch (error) {
        console.error("Error adding channel:", error);
        showToast(t('toasts.channelSaveFailed'), 'error');
        // This promise must be rejected to be caught by the caller's try-catch block
        // to handle UI states like loading spinners correctly.
        throw error;
    }
  };

  const handleSaveChannelChanges = async (channel: Channel) => {
     if (IS_DEV_MODE) {
        setChannels(prev => prev.map(c => c.id === channel.id ? channel : c));
        return;
    }
    if (!user) return;
    try {
        const channelDocRef = db.collection('users').doc(user.uid).collection('channels').doc(channel.id);
        await channelDocRef.update({
            name: channel.name,
            dna: channel.dna,
            channelUrl: channel.channelUrl,
        });
    } catch (error) {
        console.error("Error saving channel changes:", error);
        showToast(t('toasts.channelSaveFailed'), 'error');
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (IS_DEV_MODE) {
        if ((projectsByChannel[channelId] || []).length > 0) {
            showToast(t('toasts.deleteChannelError'), 'error');
            return;
        }
        setChannels(prev => prev.filter(c => c.id !== channelId));
        showToast(t('toasts.channelDeleted'), 'info');
        return;
    }
    if (!user) return;
    if ((projectsByChannel[channelId] || []).length > 0) {
        showToast(t('toasts.deleteChannelError'), 'error');
        return;
    }
    try {
        const channelDocRef = db.collection('users').doc(user.uid).collection('channels').doc(channelId);
        await channelDocRef.delete();
        showToast(t('toasts.channelDeleted'), 'info');
    } catch (error) {
        console.error("Error deleting channel:", error);
        showToast(t('toasts.channelDeleteFailed'), 'error');
    }
  };

  const handleManageDream100 = (channelId: string) => {
    const channelToManage = channels.find(ch => ch.id === channelId);
    if (channelToManage) {
      setDream100Channel(channelToManage);
    }
  };

  const handleUpdateDream100 = async (channelId: string, updatedVideos: Dream100Video[]) => {
    if (IS_DEV_MODE) {
        setChannels(prev => prev.map(c => (c.id === channelId ? { ...c, dream100Videos: updatedVideos } : c)));
        return;
    }
    if (!user) return;
    try {
        const channelDocRef = db.collection('users').doc(user.uid).collection('channels').doc(channelId);
        await channelDocRef.update({ dream100Videos: updatedVideos });
    } catch (error) {
        console.error("Error updating Dream 100:", error);
        showToast(t('toasts.dream100UpdateFailed'), 'error');
    }
  };
  
  const handleUpdateIdeas = async (channelId: string, updatedIdeas: Idea[]) => {
    if (IS_DEV_MODE) {
        setChannels(prev => prev.map(c => (c.id === channelId ? { ...c, ideas: updatedIdeas } : c)));
        return;
    }
    if (!user) return;
    try {
        const channelDocRef = db.collection('users').doc(user.uid).collection('channels').doc(channelId);
        await channelDocRef.update({ ideas: updatedIdeas });
    } catch (error) {
        console.error("Error updating Idea Bank:", error);
        showToast(t('toasts.ideaBankUpdateFailed'), 'error');
    }
  };
  
  const handleSaveAutomationSteps = async (channelId: string, updatedSteps: AutomationStep[]) => {
    if (IS_DEV_MODE) {
        if (channelId) {
            setChannels(prev => prev.map(c => (c.id === channelId ? { ...c, automationSteps: updatedSteps } : c)));
        }
        return;
    }
    if (!user || !channelId) return;
    try {
        const channelDocRef = db.collection('users').doc(user.uid).collection('channels').doc(channelId);
        await channelDocRef.update({ automationSteps: updatedSteps });
        // Don't show a toast on every auto-save to avoid spamming the user.
        // A visual indicator in the UI (like a subtle 'saved' text) would be better if needed.
    } catch (error) {
        console.error("Error saving automation steps:", error);
        showToast(t('toasts.automationStepsSaveFailed'), 'error');
    }
  };


  const handleSaveProject = (projectToSave: Project) => {
    if (!user) {
        showToast(t('toasts.loginRequiredToSave'), 'error');
        return;
    }
    
    if (projectToSave.thumbnailData && projectToSave.thumbnailData.length > 950000) {
      showToast(t('toasts.thumbnailTooLarge'), 'error');
      return;
    }

    setIsSaving(true);
    
    if (IS_DEV_MODE) {
        setTimeout(() => {
            if ('id' in projectToSave && projectToSave.id) {
                setProjects(prevProjects => prevProjects.map(p => p.id === projectToSave.id ? projectToSave : p));
                showToast(t('toasts.projectUpdated'), 'success');
            } else {
                const newProject = { ...projectToSave, id: `dev-proj-${Date.now()}` };
                setProjects(prevProjects => [newProject, ...prevProjects]);
                showToast(t('toasts.projectCreated'), 'success');
            }
            setIsSaving(false);
            handleCloseModal();
        }, 1000);
        return;
    }

    const performSave = async () => {
        const dataToSave = {
            channelId: projectToSave.channelId,
            projectName: projectToSave.projectName,
            publishDateTime: firebase.firestore.Timestamp.fromDate(new Date(projectToSave.publishDateTime)),
            status: projectToSave.status,
            videoTitle: projectToSave.videoTitle,
            thumbnailData: projectToSave.thumbnailData,
            description: projectToSave.description,
            tags: projectToSave.tags,
            pinnedComment: projectToSave.pinnedComment,
            communityPost: projectToSave.communityPost,
            facebookPost: projectToSave.facebookPost,
            youtubeLink: projectToSave.youtubeLink,
            script: projectToSave.script,
            thumbnailPrompt: projectToSave.thumbnailPrompt,
            voiceoverScript: projectToSave.voiceoverScript || '',
            promptTable: projectToSave.promptTable || '',
            timecodeMap: projectToSave.timecodeMap || '',
            metadata: projectToSave.metadata || '',
            seoMetadata: projectToSave.seoMetadata || '',
            visualPrompts: projectToSave.visualPrompts || '',
            ...(projectToSave.stats && typeof projectToSave.stats.views === 'number' && { stats: projectToSave.stats }),
        };

        if (projectToSave.id) {
            const projectDocRef = db.collection('users').doc(user.uid).collection('projects').doc(projectToSave.id);
            await projectDocRef.update(dataToSave);
            showToast(t('toasts.projectUpdated'), 'success');
        } else {
            await db.collection('users').doc(user.uid).collection('projects').add(dataToSave);
            showToast(t('toasts.projectCreated'), 'success');
        }
    };

    performSave()
      .then(() => {
        handleCloseModal();
      })
      .catch((error) => {
        console.error("Error saving project:", error);
        showToast(t('toasts.projectSaveFailed'), 'error');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleCopyProject = async (projectToCopy: Project) => {
      showToast(t('toasts.copyingProject'), 'info');
      const { id, stats, ...projectData } = projectToCopy;

      const newProject: Omit<Project, 'id'> = {
          ...projectData,
          projectName: `${projectData.projectName} (Copy)`,
          publishDateTime: new Date().toISOString().slice(0, 16),
          status: ProjectStatus.Idea,
          youtubeLink: '',
      };
      
      handleSaveProject(newProject as Project);
      showToast(t('toasts.projectCopied'), 'success');
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!user) {
        const err = new Error('User not logged in');
        showToast(t('toasts.loginRequiredToDelete'), 'error');
        throw err;
    }

    if (IS_DEV_MODE) {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setProjects(prev => prev.filter(p => p.id !== projectId));
                showToast(t('toasts.projectDeleted'), 'info');
                handleCloseModal();
                resolve();
            }, 500);
        });
    }

    try {
        const projectDocRef = db.collection('users').doc(user.uid).collection('projects').doc(projectId);
        await projectDocRef.delete();
        showToast(t('toasts.projectDeleted'), 'info');
        handleCloseModal();
    } catch (error) {
        console.error("Error deleting project:", error);
        showToast(t('toasts.projectDeleteFailed'), 'error');
        throw error;
    }
  };
  
  const handleAddNewVideo = (channelId: string) => {
    const newProjectTemplate: Omit<Project, 'id'> = {
        channelId: channelId,
        projectName: '',
        publishDateTime: new Date().toISOString().slice(0, 16),
        status: ProjectStatus.Idea,
        videoTitle: '',
        thumbnailData: '',
        description: '',
        tags: [],
        pinnedComment: '',
        communityPost: '',
        facebookPost: '',
        youtubeLink: '',
        script: '',
        thumbnailPrompt: '',
        voiceoverScript: '',
        promptTable: '',
        timecodeMap: '',
        metadata: '',
        seoMetadata: '',
        visualPrompts: '',
    };
    handleOpenModal(newProjectTemplate as Project);
  };
  
  const handleRerunAutomation = (project: Project) => {
    const rerunData = {
        targetTitle: project.projectName || project.videoTitle,
        viralTranscript: project.script // Using the generated script as a new starting point
    };
    localStorage.setItem('rerun-data', JSON.stringify(rerunData));
    setActiveView('automation');
    handleCloseModal();
  };

  // handleLogin now uses signInWithRedirect
  const handleLoginWithGoogle = async () => {
    try {
      setDbConnectionError(false);
      setSignInError(null);
      await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
      // Use redirect flow to avoid cross-origin issues with popups
      await auth.signInWithRedirect(googleProvider);
    } catch (error: any) {
      console.error("Google sign-in initiation error:", error);
      showToast(t('toasts.signInError'), 'error');
    }
  };
  
  const handleLoginWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      setDbConnectionError(false);
      setSignInError(null);
      await auth.signInWithEmailAndPassword(email, password);
      // onAuthStateChanged will handle the rest
    } catch (error: any) {
      console.error("Email/Password Sign-In Error:", error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        showToast(t('toasts.invalidCredentials'), 'error');
      } else {
        showToast(t('toasts.signInError'), 'error');
      }
      throw error;
    }
  };

  const handleRegisterWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      setDbConnectionError(false);
      setSignInError(null);
      await auth.createUserWithEmailAndPassword(email, password);
      // onAuthStateChanged will handle creating the user document in Firestore
    } catch (error: any) {
      console.error("Email/Password Registration Error:", error);
      if (error.code === 'auth/email-already-in-use') {
        showToast(t('toasts.emailInUse'), 'error');
      } else if (error.code === 'auth/weak-password') {
        showToast(t('toasts.weakPassword'), 'error');
      } else {
        showToast(t('toasts.registrationFailed'), 'error');
      }
      throw error;
    }
  };


  // handleLogout updated to use v8 Auth syntax
  const handleLogout = async () => {
    if (IS_DEV_MODE) {
      showToast(t('toasts.logoutDisabledDev'), 'info');
      return;
    }
    try {
      await auth.signOut();
      setDbConnectionError(false);
      showToast(t('toasts.loggedOut'), 'info');
    } catch (error) {
      console.error("Logout error:", error);
      showToast(t('toasts.logoutFailed'), 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex justify-center items-center">
        <Loader className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (signInError) {
      return <AuthConfigurationErrorScreen error={signInError} onResolve={() => setSignInError(null)} />;
  }

  if (dbConnectionError) {
      return <DbConnectionErrorScreen onReset={() => setDbConnectionError(false)} />;
  }

  if (!user) {
    return (
        <LoginScreen 
            onLoginWithGoogle={handleLoginWithGoogle}
            onLoginWithEmail={handleLoginWithEmail}
            onRegisterWithEmail={handleRegisterWithEmail}
        />
    );
  }

  if (user.status === 'pending') {
    return <PendingApprovalScreen onLogout={handleLogout} />;
  }
  
  if (user.status === 'expired') {
      return <ExpiredScreen onLogout={handleLogout} />;
  }
  
  // Only render the main app if user status is 'active'
  return (
    <div className="flex flex-col h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans">
      <Header
        user={user}
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenSettings={handleOpenSettingsModal}
        onLogout={handleLogout}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {activeView === 'projects' && (
          <ProjectList 
              projects={projects}
              channels={channels}
              projectsByChannel={projectsByChannel} 
              onSelectProject={handleOpenModal} 
              isLoading={isLoading && projects.length === 0}
              onAddChannel={handleOpenSettingsModal}
              onAddVideo={handleAddNewVideo}
              onManageDream100={handleManageDream100}
          />
        )}
        {activeView === 'automation' && (
            <AutomationEngine 
              channels={channels}
              onOpenProjectModal={handleOpenModal}
              showToast={showToast}
              apiKeys={apiKeys}
              selectedProvider={selectedProvider}
              selectedModel={selectedModel}
              onUpdateIdeas={handleUpdateIdeas}
              onUpdateAutomationSteps={handleSaveAutomationSteps}
            />
        )}
        {activeView === 'calendar' && (
          <CalendarView
            projects={projects}
            onSelectProject={handleOpenModal}
          />
        )}
        {activeView === 'admin' && user?.isAdmin && (
            <AdminPanel showToast={showToast} />
        )}
      </main>
      
      {isSettingsModalOpen && (
        <SettingsModal 
          isOpen={isSettingsModalOpen}
          onClose={handleCloseModal}
          apiKeys={apiKeys}
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          currentChannels={channels}
          onSave={handleSaveSettings}
          onAddChannel={handleAddChannel}
          onUpdateChannel={handleSaveChannelChanges}
          onDeleteChannel={handleDeleteChannel}
        />
      )}

      {isModalOpen && (
        <ProjectModal
          project={selectedProject}
          apiKeys={apiKeys}
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          isSaving={isSaving}
          onClose={handleCloseModal}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
          onCopy={handleCopyProject}
          onRerun={handleRerunAutomation}
          showToast={showToast}
        />
      )}
      {dream100Channel && (
          <Dream100Modal
              isOpen={!!dream100Channel}
              onClose={() => setDream100Channel(null)}
              channel={dream100Channel}
              apiKeys={apiKeys}
              onUpdate={(updatedVideos) => handleUpdateDream100(dream100Channel.id, updatedVideos)}
          />
      )}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};


const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
};


export default App;