import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { auth, db, googleProvider, firebase } from './firebase';
import { User, Channel, Project, ApiKeys, AIProvider, AIModel, ToastMessage, AutomationStep, Idea, Dream100Video, Role, ProjectStatus } from './types';
import { Header } from './components/Header';
import { LoginScreen } from './components/LoginScreen';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { ExpiredScreen } from './components/ExpiredScreen';
import { DbConnectionErrorScreen } from './components/DbConnectionErrorScreen';
import { AuthErrorScreen } from './components/AuthErrorScreen';
import { AuthConfigurationErrorScreen } from './components/AuthConfigurationErrorScreen';
import { EnableSignInMethodScreen } from './components/EnableSignInMethodScreen';
import { ProjectList } from './components/ProjectList';
import { AutomationEngine } from './components/AutomationEngine';
import { CalendarView } from './components/CalendarView';
import { AdminPanel } from './components/AdminPanel';
import { SettingsModal } from './components/SettingsModal';
import { ProjectModal } from './components/ProjectModal';
import { ShareChannelModal } from './components/ShareChannelModal';
import { Dream100Modal } from './components/Dream100Modal';
import { Toast } from './components/Toast';
import { useTranslation } from './hooks/useTranslation';
import { DEFAULT_AUTOMATION_STEPS, ALL_PERMISSION_IDS } from './constants';
import { Loader } from 'lucide-react';

// FIX: Helper function was destroying Date and Firestore objects.
// Updated to preserve instances of classes (like Date, FieldValue).
const cleanUndefined = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    // Preserve Dates
    if (obj instanceof Date) {
        return obj;
    }
    
    // Handle Arrays
    if (Array.isArray(obj)) {
        return obj.map(cleanUndefined);
    }
    
    // Preserve Firestore Types and other special objects
    // If it's not a plain object (created by {} or new Object()), leave it alone.
    if (obj.constructor !== Object) {
        return obj;
    }

    return Object.entries(obj).reduce((acc, [key, value]) => {
        if (value !== undefined) {
            acc[key] = cleanUndefined(value);
        }
        return acc;
    }, {} as any);
};

const App: React.FC = () => {
    const { t } = useTranslation();
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState<{ code: string; domain?: string } | null>(null);
    const [dbError, setDbError] = useState(false);
    
    // View State
    const [activeView, setActiveView] = useState<'projects' | 'automation' | 'calendar' | 'admin'>('projects');
    const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('theme') as 'light' | 'dark') || 'light');
    
    // --- Data State (Split for Safety) ---
    // Channels
    const [myChannels, setMyChannels] = useState<Channel[]>([]);
    const [sharedChannels, setSharedChannels] = useState<Channel[]>([]);
    
    // Projects
    const [myProjects, setMyProjects] = useState<Project[]>([]);
    const [sharedProjects, setSharedProjects] = useState<Project[]>([]);
    
    // Unified Data
    const channels = useMemo(() => {
        const map = new Map<string, Channel>();
        // Add my channels first
        myChannels.forEach(c => map.set(c.id, c));
        // Add shared channels (deduplicated by ID)
        sharedChannels.forEach(c => {
            if (!map.has(c.id)) map.set(c.id, c);
        });
        return Array.from(map.values());
    }, [myChannels, sharedChannels]);

    const projects = useMemo(() => {
        const map = new Map<string, Project>();
        // Add my projects first
        myProjects.forEach(p => map.set(p.id, p));
        // Add shared projects
        sharedProjects.forEach(p => {
            if (!map.has(p.id)) map.set(p.id, p);
        });
        return Array.from(map.values());
    }, [myProjects, sharedProjects]);

    const [channelMembers, setChannelMembers] = useState<Record<string, User>>({});
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [missingIndexError, setMissingIndexError] = useState<{ message: string, url: string | null } | null>(null);

    // Settings State
    const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
        const stored = localStorage.getItem('api-keys');
        return stored ? JSON.parse(stored) : { gemini: '', openai: '', claude: '', youtube: '' };
    });
    const [selectedProvider, setSelectedProvider] = useState<AIProvider>(() => (localStorage.getItem('ai-provider') as AIProvider) || 'gemini');
    const [selectedModel, setSelectedModel] = useState<AIModel>(() => (localStorage.getItem('ai-model') as AIModel) || 'gemini-2.5-flash');
    const [globalAutomationSteps, setGlobalAutomationSteps] = useState<AutomationStep[]>(DEFAULT_AUTOMATION_STEPS);

    // Modals State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isSavingProject, setIsSavingProject] = useState(false);
    const [shareChannel, setShareChannel] = useState<Channel | null>(null);
    const [dream100Channel, setDream100Channel] = useState<Channel | null>(null);

    // Toast State
    const [toast, setToast] = useState<ToastMessage | null>(null);

    const showToast = (message: string, type: ToastMessage['type']) => {
        setToast({ id: Date.now(), message, type });
    };

    // Theme Effect
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Auth Effect
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            setAuthLoading(true);
            if (firebaseUser) {
                try {
                    const userDoc = await db.collection('users').doc(firebaseUser.uid).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data() as User;
                        setUser({ ...userData, uid: firebaseUser.uid });
                    } else {
                        // New user, create profile
                        const newUser: User = {
                            uid: firebaseUser.uid,
                            name: firebaseUser.displayName || 'User',
                            email: firebaseUser.email || '',
                            avatar: firebaseUser.photoURL || '',
                            status: 'pending', // Default to pending until approved
                            expiresAt: null,
                            isAdmin: false,
                        };
                        await db.collection('users').doc(firebaseUser.uid).set(newUser);
                        setUser(newUser);
                    }
                } catch (error: any) {
                    console.error("Error fetching user profile:", error);
                    setDbError(true);
                }
            } else {
                setUser(null);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Global Automation Steps
    useEffect(() => {
        if (!user) return;
        const fetchGlobalSteps = async () => {
             try {
                const doc = await db.collection('system_settings').doc('automation_prompts').get();
                if (doc.exists && doc.data()?.steps) {
                    const dbSteps = doc.data()?.steps as AutomationStep[];
                    const mergedSteps = DEFAULT_AUTOMATION_STEPS.map(defaultStep => {
                        const dbStep = dbSteps.find(s => s.id === defaultStep.id);
                        return dbStep ? { ...defaultStep, ...dbStep } : defaultStep;
                    });
                    setGlobalAutomationSteps(mergedSteps);
                }
            } catch (error) {
                console.error("Error fetching global automation steps:", error);
            }
        };
        fetchGlobalSteps();
    }, [user]);

    // --- DATA FETCHING (ISOLATED STREAMS) ---

    // 1. My Channels (Listener)
    useEffect(() => {
        if (!user || user.status !== 'active') {
            setMyChannels([]);
            return;
        }
        setIsLoadingData(true);
        const unsubscribe = db.collection('users').doc(user.uid).collection('channels')
            .onSnapshot((snapshot) => {
                const loadedChannels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Channel[];
                setMyChannels(loadedChannels);
                setIsLoadingData(false);
            }, (error) => {
                console.error("My Channels Error:", error);
                setIsLoadingData(false);
            });
        return () => unsubscribe();
    }, [user]);

    // 2. My Projects (Listener)
    useEffect(() => {
        if (!user || user.status !== 'active') {
            setMyProjects([]);
            return;
        }
        const unsubscribe = db.collection('users').doc(user.uid).collection('projects')
            .onSnapshot((snapshot) => {
                const loadedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                setMyProjects(loadedProjects);
            }, (error) => {
                console.error("My Projects Error:", error);
            });
        return () => unsubscribe();
    }, [user]);

    // 3. Shared Channels (Fetcher)
    useEffect(() => {
        if (!user || user.status !== 'active') {
            setSharedChannels([]);
            return;
        }
        
        const fetchSharedChannels = async () => {
            try {
                const sharedSnapshot = await db.collectionGroup('channels')
                    .where('memberIds', 'array-contains', user.uid)
                    .get();
                
                const loadedSharedChannels = sharedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Channel[];
                setSharedChannels(loadedSharedChannels);
                setMissingIndexError(null);
            } catch (error: any) {
                console.error("Shared Channels Error:", error);
                if (error.code === 'failed-precondition') {
                     const urlMatch = error.message.match(/(https:\/\/[^\s]+)/);
                     setMissingIndexError({
                         message: t('projects.missingIndexError.title'),
                         url: urlMatch ? urlMatch[0] : null
                     });
                }
            }
        };
        fetchSharedChannels();
    }, [user, t]);

    // 4. Shared Projects (Fetcher - Dependent on Shared Channels)
    useEffect(() => {
        if (sharedChannels.length === 0) {
            setSharedProjects([]);
            return;
        }

        const fetchSharedProjects = async () => {
            let fetchedProjects: Project[] = [];
            let memberUids = new Set<string>();

            for (const channel of sharedChannels) {
                if (channel.ownerId !== user?.uid) {
                    try {
                        const snap = await db.collection('users').doc(channel.ownerId).collection('projects')
                            .where('channelId', '==', channel.id)
                            .get();
                        
                        const projs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
                        fetchedProjects = [...fetchedProjects, ...projs];
                        
                        memberUids.add(channel.ownerId);
                        channel.memberIds?.forEach(id => memberUids.add(id));
                    } catch (e) {
                        console.error(`Error fetching projects for shared channel ${channel.id}`, e);
                    }
                }
            }
            
            setSharedProjects(fetchedProjects);

            // Fetch Member Details for display
            if (memberUids.size > 0) {
                 const uidsArray = Array.from(memberUids);
                 const chunks = [];
                 for (let i = 0; i < uidsArray.length; i += 10) {
                     chunks.push(uidsArray.slice(i, i + 10));
                 }
                 
                 let membersMap: Record<string, User> = {};
                 for (const chunk of chunks) {
                     try {
                         const usersSnap = await db.collection('users').where(firebase.firestore.FieldPath.documentId(), 'in', chunk).get();
                         usersSnap.docs.forEach(doc => {
                             membersMap[doc.id] = { uid: doc.id, ...doc.data() } as User;
                         });
                     } catch (e) { console.error("Error fetching members", e); }
                 }
                 setChannelMembers(prev => ({...prev, ...membersMap}));
            }
        };

        fetchSharedProjects();
    }, [sharedChannels, user]);


    // --- Handlers ---

    const handleLoginWithGoogle = async () => {
        try {
            await auth.signInWithPopup(googleProvider);
        } catch (error: any) {
            console.error("Login error:", error);
            setAuthError(error);
        }
    };

    const handleLoginWithEmail = async (email: string, pass: string) => {
        try {
            await auth.signInWithEmailAndPassword(email, pass);
        } catch (error: any) {
             console.error("Login error:", error);
             setAuthError(error);
             showToast(error.message, 'error');
        }
    };

    const handleRegisterWithEmail = async (email: string, pass: string) => {
        try {
            await auth.createUserWithEmailAndPassword(email, pass);
        } catch (error: any) {
            console.error("Register error:", error);
            setAuthError(error);
            showToast(error.message, 'error');
        }
    };

    const handleLogout = async () => {
        await auth.signOut();
        setUser(null);
    };

    const handleSaveSettings = (newSettings: { apiKeys: ApiKeys, selectedProvider: AIProvider, selectedModel: AIModel }) => {
        setApiKeys(newSettings.apiKeys);
        setSelectedProvider(newSettings.selectedProvider);
        setSelectedModel(newSettings.selectedModel);
        
        localStorage.setItem('api-keys', JSON.stringify(newSettings.apiKeys));
        localStorage.setItem('ai-provider', newSettings.selectedProvider);
        localStorage.setItem('ai-model', newSettings.selectedModel);
        
        showToast(t('toasts.settingsSaved'), 'success');
    };

    const handleAddChannel = async (channelData: Omit<Channel, 'id' | 'ownerId' | 'members' | 'roles'>) => {
        if (!user) return;
        try {
            const newChannelRef = db.collection('users').doc(user.uid).collection('channels').doc();
            const newChannel: Channel = {
                id: newChannelRef.id,
                ownerId: user.uid,
                members: {},
                memberIds: [],
                roles: [],
                ...channelData
            };
            await newChannelRef.set(newChannel);
            showToast(t('toasts.channelAdded'), 'success');
        } catch (error) {
            console.error("Error adding channel:", error);
            showToast(t('toasts.channelAddFailed'), 'error');
        }
    };

    const handleUpdateChannel = async (channel: Channel) => {
        if (!user) return;
        const ownerId = channel.ownerId || user.uid;
        try {
            const channelDocRef = db.collection('users').doc(ownerId).collection('channels').doc(channel.id);
            const payload = {
                name: channel.name,
                dna: channel.dna,
                channelUrl: channel.channelUrl,
                log: channel.log || {},
            };
            await channelDocRef.update(cleanUndefined(payload));
            showToast(t('toasts.channelUpdated'), 'success');
        } catch (error) {
            console.error("Error updating channel:", error);
            showToast(t('toasts.channelSaveFailed'), 'error');
        }
    };

    const handleDeleteChannel = async (channelId: string) => {
        if (!user) return;
        const channelProjects = projects.filter(p => p.channelId === channelId);
        if (channelProjects.length > 0) {
            showToast(t('settings.deleteChannelError'), 'error');
            return;
        }

        try {
            await db.collection('users').doc(user.uid).collection('channels').doc(channelId).delete();
            showToast(t('toasts.channelDeleted'), 'success');
        } catch (error) {
            console.error("Error deleting channel:", error);
            showToast(t('toasts.channelDeleteFailed'), 'error');
        }
    };
    
    const handleUpdateChannelRoles = async (channelId: string, roles: Role[]) => {
        if (!user) return;
        try {
            await db.collection('users').doc(user.uid).collection('channels').doc(channelId).update({ roles });
            showToast(t('toasts.rolesUpdated'), 'success');
        } catch (error) {
            console.error("Error updating roles:", error);
            showToast(t('toasts.updateRolesFailed'), 'error');
        }
    };

    const handleUpdateChannelMembers = async (channel: Channel, newMembers: Record<string, string>) => {
        if (!user) return;
        try {
            const memberIds = Object.keys(newMembers);
            await db.collection('users').doc(channel.ownerId).collection('channels').doc(channel.id).update({
                members: newMembers,
                memberIds: memberIds
            });
            showToast(t('toasts.membersUpdated'), 'success');
        } catch (error) {
            console.error("Error updating members:", error);
            showToast(t('toasts.updateMembersFailed'), 'error');
        }
    };

    const handleSaveProject = async (project: Project) => {
        if (!user) return;
        setIsSavingProject(true);
        try {
            // Find channel owner
            const channel = channels.find(c => c.id === project.channelId);
            const ownerId = channel ? channel.ownerId : user.uid; // Fallback to current user if channel unknown (unlikely with orphan fix)
            
            let projectId = project.id;
            const isNew = project.id.startsWith('local_');
            
            if (isNew) {
                const newDoc = db.collection('users').doc(ownerId).collection('projects').doc();
                projectId = newDoc.id;
            }

            const projectData = {
                ...project,
                id: projectId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            };

            await db.collection('users').doc(ownerId).collection('projects').doc(projectId).set(cleanUndefined(projectData));
            
            showToast(t('toasts.projectSaved'), 'success');
            setIsProjectModalOpen(false);
            setEditingProject(null);
        } catch (error) {
            console.error("Error saving project:", error);
            showToast(t('toasts.projectSaveFailed'), 'error');
        } finally {
            setIsSavingProject(false);
        }
    };

    const handleDeleteProject = async (projectId: string) => {
        if (!user) return;
        try {
            const project = projects.find(p => p.id === projectId);
            if (!project) return;
            const channel = channels.find(c => c.id === project.channelId);
            const ownerId = channel ? channel.ownerId : user.uid;

            await db.collection('users').doc(ownerId).collection('projects').doc(projectId).delete();
            showToast(t('toasts.projectDeleted'), 'success');
            setIsProjectModalOpen(false);
        } catch (error) {
             console.error("Error deleting project:", error);
             showToast(t('toasts.projectDeleteFailed'), 'error');
        }
    };
    
    const handleCopyProject = (project: Project) => {
        const copy: Project = {
            ...project,
            id: `local_${Date.now()}`,
            projectName: `${project.projectName} (Copy)`,
            status: ProjectStatus.Idea,
        };
        setEditingProject(copy);
        showToast(t('toasts.projectCopied'), 'info');
    };
    
    const handleMoveProject = async (project: Project, newChannelId: string) => {
        if (!user) return;
        try {
            const oldChannel = channels.find(c => c.id === project.channelId);
            const oldOwnerId = oldChannel ? oldChannel.ownerId : user.uid;
            
            const newChannel = channels.find(c => c.id === newChannelId);
            const newOwnerId = newChannel ? newChannel.ownerId : user.uid;
            
            const projectData = { ...project, channelId: newChannelId };

            const newDocRef = db.collection('users').doc(newOwnerId).collection('projects').doc();
            await newDocRef.set({ ...cleanUndefined(projectData), id: newDocRef.id });
            
            await db.collection('users').doc(oldOwnerId).collection('projects').doc(project.id).delete();
            
            showToast(t('toasts.projectMoved'), 'success');
            setIsProjectModalOpen(false);
        } catch (error) {
            console.error("Move error:", error);
            showToast(t('toasts.moveFailed'), 'error');
        }
    };

    const handleRerunAutomation = (project: Project) => {
         localStorage.setItem('rerun-data', JSON.stringify({
            targetTitle: project.projectName,
            viralTranscript: project.script 
        }));
        setEditingProject(null);
        setIsProjectModalOpen(false);
        setActiveView('automation');
    };
    
    const handleUpdateIdeas = async (channelId: string, updatedIdeas: Idea[]) => {
        const channel = channels.find(c => c.id === channelId);
        if (channel) {
             try {
                const channelRef = db.collection('users').doc(channel.ownerId).collection('channels').doc(channelId);
                await channelRef.update({ ideas: updatedIdeas });
            } catch (error) {
                console.error("Error updating ideas:", error);
                showToast(t('toasts.saveFailed'), 'error');
            }
        }
    };
    
    const handleUpdateAutomationSteps = async (channelId: string, updatedSteps: AutomationStep[]) => {
        const channel = channels.find(c => c.id === channelId);
        if (channel) {
            try {
                const channelRef = db.collection('users').doc(channel.ownerId).collection('channels').doc(channelId);
                await channelRef.update({ automationSteps: updatedSteps });
                showToast(t('toasts.settingsSaved'), 'success');
            } catch (error) {
                 console.error("Error updating steps:", error);
                showToast(t('toasts.saveFailed'), 'error');
            }
        }
    };
    
    const handleUpdateDream100 = async (updatedVideos: Dream100Video[]) => {
        if (!dream100Channel) return;
        try {
            const channelRef = db.collection('users').doc(dream100Channel.ownerId).collection('channels').doc(dream100Channel.id);
            await channelRef.update({ dream100Videos: cleanUndefined(updatedVideos) });
            setDream100Channel({ ...dream100Channel, dream100Videos: updatedVideos });
        } catch (error) {
            console.error("Error updating Dream 100:", error);
            showToast(t('toasts.saveFailed'), 'error');
        }
    };

    const getPermissionsForUser = (channelId: string): string[] => {
        if (!user) return [];
        const channel = channels.find(c => c.id === channelId);
        if (!channel) return [];
        if (channel.ownerId === user.uid) return ALL_PERMISSION_IDS;
        
        const roleId = channel.members[user.uid];
        const role = channel.roles?.find(r => r.id === roleId);
        return role ? role.permissions : [];
    };

    // Render Logic
    if (authLoading) {
        return <div className="min-h-screen flex justify-center items-center bg-light-bg dark:bg-dark-bg"><Loader className="animate-spin text-primary" size={48}/></div>;
    }
    
    if (dbError) {
        return <DbConnectionErrorScreen onReset={() => window.location.reload()} user={user} />;
    }

    if (authError) {
        if (authError.code === 'auth/configuration-not-found' || authError.code === 'auth/operation-not-allowed' || authError.code === 'auth/unauthorized-domain') {
            return <AuthConfigurationErrorScreen error={authError} onResolve={() => setAuthError(null)} />;
        }
        return <AuthErrorScreen domain={window.location.hostname} onResolve={() => setAuthError(null)} />;
    }

    if (!user) {
        return <LoginScreen onLoginWithGoogle={handleLoginWithGoogle} onLoginWithEmail={handleLoginWithEmail} onRegisterWithEmail={handleRegisterWithEmail} />;
    }

    if (user.status === 'pending') {
        return <PendingApprovalScreen onLogout={handleLogout} />;
    }
    
    if (user.status === 'expired') {
        return <ExpiredScreen onLogout={handleLogout} />;
    }

    const projectsByChannel = projects.reduce((acc, project) => {
        const cId = project.channelId || 'uncategorized';
        if (!acc[cId]) acc[cId] = [];
        acc[cId].push(project);
        return acc;
    }, {} as Record<string, Project[]>);

    return (
        <div className="flex min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text font-sans transition-colors duration-300">
            
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Header
                    user={user}
                    theme={theme}
                    toggleTheme={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    onLogout={handleLogout}
                    activeView={activeView}
                    setActiveView={setActiveView}
                />
                
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    {activeView === 'projects' && (
                        <ProjectList
                            projects={projects}
                            channels={channels}
                            projectsByChannel={projectsByChannel}
                            user={user}
                            channelMembers={channelMembers}
                            onSelectProject={(p) => { setEditingProject(p); setIsProjectModalOpen(true); }}
                            isLoading={isLoadingData}
                            onAddChannel={() => setIsSettingsOpen(true)}
                            onAddVideo={(channelId) => {
                                const newProject: Project = {
                                    id: `local_${Date.now()}`,
                                    channelId,
                                    projectName: 'New Video',
                                    publishDateTime: new Date().toISOString(),
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
                                    storage: 'local',
                                };
                                setEditingProject(newProject);
                                setIsProjectModalOpen(true);
                            }}
                            onManageDream100={(channelId) => {
                                const ch = channels.find(c => c.id === channelId);
                                if (ch) setDream100Channel(ch);
                            }}
                            missingIndexError={missingIndexError}
                        />
                    )}
                    
                    {activeView === 'automation' && (
                        <AutomationEngine
                            channels={channels}
                            onOpenProjectModal={(p) => {
                                if (p) {
                                    setEditingProject(p);
                                    setIsProjectModalOpen(true);
                                }
                            }}
                            showToast={showToast}
                            apiKeys={apiKeys}
                            selectedProvider={selectedProvider}
                            selectedModel={selectedModel}
                            onUpdateIdeas={handleUpdateIdeas}
                            onUpdateAutomationSteps={handleUpdateAutomationSteps}
                            globalAutomationSteps={globalAutomationSteps}
                        />
                    )}
                    
                    {activeView === 'calendar' && (
                        <CalendarView
                            projects={projects}
                            onSelectProject={(p) => { setEditingProject(p); setIsProjectModalOpen(true); }}
                        />
                    )}
                    
                    {activeView === 'admin' && (
                        <AdminPanel showToast={showToast} user={user} />
                    )}
                </main>
            </div>
            
            {/* Modals */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={user}
                apiKeys={apiKeys}
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                currentChannels={channels}
                onSave={handleSaveSettings}
                onAddChannel={handleAddChannel}
                onUpdateChannel={handleUpdateChannel}
                onDeleteChannel={handleDeleteChannel}
                onShareChannel={(c) => setShareChannel(c)}
                showToast={showToast}
                onUpdateChannelRoles={handleUpdateChannelRoles}
            />

            {isProjectModalOpen && (
                <ProjectModal
                    project={editingProject}
                    projects={projects}
                    channels={channels}
                    apiKeys={apiKeys}
                    selectedProvider={selectedProvider}
                    selectedModel={selectedModel}
                    isSaving={isSavingProject}
                    channelMembers={channelMembers}
                    onClose={() => { setIsProjectModalOpen(false); setEditingProject(null); }}
                    onSave={handleSaveProject}
                    onDelete={handleDeleteProject}
                    onCopy={handleCopyProject}
                    onRerun={handleRerunAutomation}
                    onMove={handleMoveProject}
                    showToast={showToast}
                    userPermissions={editingProject ? getPermissionsForUser(editingProject.channelId) : []}
                />
            )}
            
            {shareChannel && (
                <ShareChannelModal
                    isOpen={!!shareChannel}
                    onClose={() => setShareChannel(null)}
                    channel={shareChannel}
                    currentUser={user}
                    showToast={showToast}
                    onUpdateMembers={handleUpdateChannelMembers}
                />
            )}

            {dream100Channel && (
                <Dream100Modal
                    isOpen={!!dream100Channel}
                    onClose={() => setDream100Channel(null)}
                    channel={dream100Channel}
                    apiKeys={apiKeys}
                    onUpdate={handleUpdateDream100}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default App;