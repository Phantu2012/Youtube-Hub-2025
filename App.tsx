

import React, { useState, useEffect, useCallback } from 'react';
import { Project, ProjectStatus, ToastMessage, User, ChannelDna, ApiKeys, AIProvider, AIModel } from './types';
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
import { Loader, PlusCircle } from 'lucide-react';
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
  const [channelDna, setChannelDna] = useLocalStorage<ChannelDna>('channel-dna', '');
  const { t } = useTranslation();
  const [dbConnectionError, setDbConnectionError] = useState<DbError | null>(null);

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
  
  const handleSaveSettings = (settings: { apiKeys: ApiKeys, selectedProvider: AIProvider, selectedModel: AIModel, channelDna: ChannelDna }) => {
    setApiKeys(settings.apiKeys);
    setSelectedProvider(settings.selectedProvider);
    setSelectedModel(settings.selectedModel);
    setChannelDna(settings.channelDna);
    showToast(t('toasts.settingsSaved'), 'success');
    handleCloseModal();
  };

  // handleSaveProject updated to use v8 Firestore syntax
  const handleSaveProject = async (projectToSave: Project) => {
    if (!user) {
        showToast(t('toasts.loginRequiredToSave'), 'error');
        return;
    }

    try {
        const dataToSave = {
            projectName: projectToSave.projectName,
            publishDateTime: projectToSave.publishDateTime,
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
        handleCloseModal();
    } catch (error) {
        console.error("Error saving project:", error);
        showToast(t('toasts.projectSaveFailed'), 'error');
    }
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
  
  const handleCreateNewProject = () => {
    const newProjectTemplate: Omit<Project, 'id'> = {
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

  // handleLogin updated to use v8 Auth syntax
  const handleLogin = async () => {
    try {
      setDbConnectionError(null);
      // FIX: Explicitly set auth persistence to 'session'. This is more compatible
      // with environments like sandboxed iframes where default (local) storage might be blocked.
      await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
      await auth.signInWithPopup(googleProvider);
      // onAuthStateChanged will handle setting user state and loading projects
    } catch (error: any) {
      console.error("Google sign-in error:", error);
       // Handle specific error codes
      if (error?.code === 'auth/operation-not-supported-in-this-environment' || error?.code === 'auth/popup-blocked') {
          showToast(t('toasts.unsupportedEnvironment'), 'error');
      } else if (error?.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        const message = t('toasts.unauthorizedDomain', { domain });
        showToast(message, 'error');
      } else if (error?.code === 'auth/configuration-not-found') {
        showToast(t('toasts.googleSignInNotEnabled'), 'error');
      } else {
        showToast(t('toasts.signInError'), 'error');
      }
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
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t('projects.title')}</h1>
              <button
                onClick={handleCreateNewProject}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-transform transform hover:scale-105"
              >
                <PlusCircle size={20} />
                {t('projects.newProject')}
              </button>
            </div>
            <ProjectList projects={projects} onSelectProject={handleOpenModal} isLoading={isLoading && projects.length === 0} />
          </>
        )}
        {activeView === 'automation' && (
           <AutomationEngine 
              channelDna={channelDna}
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
          currentChannelDna={channelDna}
          onSave={handleSaveSettings}
        />
      )}

      {isModalOpen && (
        <ProjectModal
          project={selectedProject}
          apiKeys={apiKeys}
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          onClose={handleCloseModal}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
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