

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, ProjectStatus, ToastMessage, User, ChannelDna, ApiKeys, AIProvider, AIModel, Channel } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/Header';
import { ProjectList } from './components/ProjectList';
import { AutomationEngine } from './components/AutomationEngine';
import { ProjectModal } from './components/ProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { Toast } from './components/Toast';
import { LoginScreen } from './components/LoginScreen';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { ExpiredScreen } from './components/ExpiredScreen';
import { DbConnectionErrorScreen } from './components/DbConnectionErrorScreen';
import { AuthConfigurationErrorScreen } from './components/AuthConfigurationErrorScreen';
import { Loader } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { useTranslation } from './hooks/useTranslation';

// FIX: Corrected Firebase imports to use the compat library for v8 syntax compatibility.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { auth, db, googleProvider } from './firebase';

// Define FirebaseUser type for v8.
type FirebaseUser = firebase.User;


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
};

// Add default placeholder keys for development convenience.
const DEV_DEFAULT_API_KEYS: ApiKeys = {
  gemini: 'YOUR_GEMINI_API_KEY_HERE',
  openai: 'YOUR_OPENAI_API_KEY_HERE',
  youtube: 'YOUR_YOUTUBE_API_KEY_HERE',
};


// Define a structured error type for database connection issues.
type DbError = {
  type: 'generic' | 'unavailable';
  message: string;
};

const AppContent: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
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
  const [activeView, setActiveView] = useState<'projects' | 'automation'>('projects');
  const [channels, setChannels] = useLocalStorage<ChannelDna>('channels', []);
  const { t } = useTranslation();
  const [dbConnectionError, setDbConnectionError] = useState<DbError | null>(null);
  const [signInError, setSignInError] = useState<{ code: string; domain?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
              expiresAt: docData.expiresAt ? docData.expiresAt.toDate().toISOString() : null
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
        if (error.code === 'unavailable' || error.message?.includes('Could not reach Cloud Firestore backend')) {
          // The message is now handled by the DbConnectionErrorScreen for 'unavailable' type for a better UX
          setDbConnectionError({ type: 'unavailable', message: '' });
        } else {
          setDbConnectionError({ type: 'generic', message: t('dbError.message') });
        }
        setUser(null);
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [showToast, t]);

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
    if (user?.uid && user.status === 'active') {
      setIsLoading(true);
      const projectsCollectionRef = db.collection('users').doc(user.uid).collection('projects');
      const q = projectsCollectionRef.orderBy('publishDateTime', 'desc');
      
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
        setProjects(projectsData);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching projects: ", error);
        showToast(t('toasts.fetchProjectsError'), 'error');
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
        setProjects([]);
    }
  }, [user, showToast, t]);
  
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

  const handleChannelsChange = (updatedChannels: Channel[]) => {
    setChannels(updatedChannels);
  };

  const handleDeleteChannelInApp = (channelId: string) => {
      setChannels(prev => prev.filter(ch => ch.id !== channelId));
      showToast(t('toasts.channelDeleted'), 'info');
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
      
      await handleSaveProject(newProject as Project);
      showToast(t('toasts.projectCopied'), 'success');
  };

  // handleDeleteProject updated to use v8 Firestore syntax
  const handleDeleteProject = async (projectId: string) => {
    if (!user) {
        const err = new Error('User not logged in');
        showToast(t('toasts.loginRequiredToDelete'), 'error');
        throw err;
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
  const handleLogin = async () => {
    try {
      setDbConnectionError(null);
      setSignInError(null);
      await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
      // Use redirect flow to avoid cross-origin issues with popups
      await auth.signInWithRedirect(googleProvider);
    } catch (error: any) {
      console.error("Google sign-in initiation error:", error);
      showToast(t('toasts.signInError'), 'error');
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
      setDbConnectionError(null);
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
      return <DbConnectionErrorScreen error={dbConnectionError} onReset={() => { setDbConnectionError(null); setIsLoading(false); }} />;
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (user.status === 'pending') {
    return <PendingApprovalScreen onLogout={handleLogout} />;
  }
  
  if (user.status === 'expired') {
      return <ExpiredScreen onLogout={handleLogout} />;
  }
  
  // Only render the main app if user status is 'active'
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300 font-sans">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onOpenSettings={handleOpenSettingsModal} 
        user={user}
        onLogout={handleLogout}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <main className="container mx-auto p-4 md:p-8">
        {activeView === 'projects' && (
          <ProjectList 
              channels={channels}
              projectsByChannel={projectsByChannel} 
              onSelectProject={handleOpenModal} 
              isLoading={isLoading && projects.length === 0}
              onAddChannel={handleOpenSettingsModal}
              onAddVideo={handleAddNewVideo}
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
           />
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
          projects={projects}
          onChannelsChange={handleChannelsChange}
          onDeleteChannel={handleDeleteChannelInApp}
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