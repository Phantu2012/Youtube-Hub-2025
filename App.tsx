import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Project, ProjectStatus, ToastMessage, User, ChannelDna, ApiKeys, AIProvider, AIModel, Channel, Dream100Video, ChannelStats, Idea, AutomationStep, YouTubeStats } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Header } from './components/Header';
import { ProjectList } from './components/ProjectList';
import { AutomationEngine } from './components/AutomationEngine';
import { CalendarView } from './components/CalendarView';
import { AdminPanel } from './components/AdminPanel';
import { ProjectModal } from './components/ProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { Dream100Modal } from './components/Dream100Modal';
import { ShareChannelModal } from './components/ShareChannelModal';
import { Toast } from './components/Toast';
import { LoginScreen } from './components/LoginScreen';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { ExpiredScreen } from './components/ExpiredScreen';
import { DbConnectionErrorScreen } from './components/DbConnectionErrorScreen';
import { AuthConfigurationErrorScreen } from './components/AuthConfigurationErrorScreen';
import { Loader } from 'lucide-react';
import { LanguageProvider } from './contexts/LanguageContext';
import { useTranslation } from './hooks/useTranslation';
import { fetchChannelStats, fetchVideoStats } from './services/youtubeService';
import { auth, db, googleProvider, firebase } from './firebase';
import { DEFAULT_AUTOMATION_STEPS } from './constants';

type FirebaseUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
};


const IS_DEV_MODE =false;

const MOCK_USER: User = {
  uid: 'dev-user-01',
  name: 'Developer',
  email: 'dev@example.com',
  avatar: 'https://i.pravatar.cc/150?u=dev',
  status: 'active',
  expiresAt: null,
  isAdmin: true,
};

const DEV_DEFAULT_API_KEYS: ApiKeys = {
  gemini: 'YOUR_GEMINI_API_KEY_HERE',
  openai: 'YOUR_OPENAI_API_KEY_HERE',
  youtube: 'YOUR_YOUTUBE_API_KEY_HERE',
};

// A base template for a project to ensure no fields are undefined when loaded from Firestore.
const DEFAULT_PROJECT_DATA: Omit<Project, 'id' | 'channelId'> = {
    projectName: '',
    publishDateTime: '', // Will be set on creation/modal open
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

// Helper function to recursively remove undefined properties from an object.
// Firestore throws an error if you try to save `undefined`.
const cleanUndefined = (obj: any): any => {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    if (Array.isArray(obj)) {
        return obj.map(item => cleanUndefined(item));
    }

    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] !== undefined) {
            newObj[key] = cleanUndefined(obj[key]);
        }
    }
    return newObj;
};


const AppContent: React.FC = () => {
  const [projectsFromListeners, setProjectsFromListeners] = useState<Record<string, Project[]>>({});
  const [localProjects, setLocalProjects] = useLocalStorage<Project[]>('local-projects', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingChannel, setSharingChannel] = useState<Channel | null>(null);
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
  const [ownedChannels, setOwnedChannels] = useState<Channel[]>([]);
  const [sharedChannels, setSharedChannels] = useState<Channel[]>([]);
  const { t } = useTranslation();
  const [dbConnectionError, setDbConnectionError] = useState<boolean>(false);
  const [signInError, setSignInError] = useState<{ code: string; domain?: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dream100Channel, setDream100Channel] = useState<Channel | null>(null);
  const [globalAutomationSteps, setGlobalAutomationSteps] = useState<AutomationStep[]>(DEFAULT_AUTOMATION_STEPS);
  const [channelMembers, setChannelMembers] = useState<Record<string, User>>({});
  const [missingIndexError, setMissingIndexError] = useState<{ message: string, url: string | null } | null>(null);
  const [projectStats, setProjectStats] = useLocalStorage<Record<string, { stats: YouTubeStats, fetchedAt: number }>>('project-stats', {});
  
  const projects = useMemo(() => {
    const cloudProjects = Object.values(projectsFromListeners).flat();
    const allProjects = [...cloudProjects, ...localProjects];
    const uniqueProjectsMap = new Map((allProjects as any[]).filter(p => p && p.id).map(p => [p.id, p]));
    
    const projectsWithStats = Array.from(uniqueProjectsMap.values()).map(p => {
        const cachedStat = projectStats[p.id];
        return {
            ...p,
            stats: cachedStat ? cachedStat.stats : undefined,
        };
    });

    projectsWithStats.sort((a: Project, b: Project) => {
        try {
            const dateA = new Date(a.publishDateTime).getTime();
            const dateB = new Date(b.publishDateTime).getTime();
            if (isNaN(dateB)) return -1;
            if (isNaN(dateA)) return 1;
            return dateB - dateA;
        } catch (e) {
            return 0;
        }
    });
    
    return projectsWithStats as Project[];
  }, [projectsFromListeners, localProjects, projectStats]);

  const channels = useMemo(() => {
    const combined = new Map<string, Channel>();
    ownedChannels.forEach(c => combined.set(c.id, c));
    sharedChannels.forEach(c => {
        if (!combined.has(c.id)) {
            combined.set(c.id, c);
        }
    });
    return Array.from(combined.values());
  }, [ownedChannels, sharedChannels]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 5000);
  }, []);

  useEffect(() => {
    if (IS_DEV_MODE) {
      setUser(MOCK_USER);
      setIsLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          const userDocRef = db.collection('users').doc(firebaseUser.uid);
          const userDoc = await userDocRef.get();
          
          if (userDoc.exists) {
            const docData = userDoc.data() as any;
            let finalStatus: User['status'] = docData.status;

            if (docData.status === 'active' && docData.expiresAt && docData.expiresAt.toDate() < new Date()) {
              finalStatus = 'expired';
              await userDocRef.update({ status: 'expired' });
            }

            const userData: User = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || docData.name || 'User',
              email: firebaseUser.email || docData.email || 'No email',
              avatar: firebaseUser.photoURL || docData.avatar || `https://i.pravatar.cc/150?u=${firebaseUser.uid}`,
              status: finalStatus,
              expiresAt: docData.expiresAt ? docData.expiresAt.toDate().toISOString() : null,
              isAdmin: docData.isAdmin || false,
            };
            setUser(userData);
          } else {
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
          setUser(null);
          setProjectsFromListeners({});
          setOwnedChannels([]);
          setSharedChannels([]);
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error("Firestore connection error:", error);
        setDbConnectionError(true);
        setUser(null);
        setProjectsFromListeners({});
        setOwnedChannels([]);
        setSharedChannels([]);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, [showToast, t]);
  
  useEffect(() => {
    if (IS_DEV_MODE) {
        setGlobalAutomationSteps(DEFAULT_AUTOMATION_STEPS);
        return;
    }

    const docRef = db.collection('system_settings').doc('automation_prompts');

    const unsubscribe = docRef.onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            if (data && data.steps && Array.isArray(data.steps)) {
                const dbSteps = data.steps as AutomationStep[];
                const mergedSteps = DEFAULT_AUTOMATION_STEPS.map(defaultStep => {
                    const dbStep = dbSteps.find(s => s.id === defaultStep.id);
                    return dbStep ? { ...defaultStep, ...dbStep } : defaultStep;
                });
                setGlobalAutomationSteps(mergedSteps);
            } else {
                setGlobalAutomationSteps(DEFAULT_AUTOMATION_STEPS);
            }
        } else {
            setGlobalAutomationSteps(DEFAULT_AUTOMATION_STEPS);
        }
    }, (error: any) => {
        console.error("Error fetching global automation prompts:", error);
        setGlobalAutomationSteps(DEFAULT_AUTOMATION_STEPS);
    });

    return () => unsubscribe();
  }, []);

  // Listener for channels data (owned and shared)
  useEffect(() => {
    if (!user || user.status !== 'active' || IS_DEV_MODE) {
        setOwnedChannels([]);
        setSharedChannels([]);
        if (isLoading) setIsLoading(false);
        return;
    }
    
    setIsLoading(true);

    const ownedChannelsListener = db.collection('users').doc(user.uid).collection('channels')
      .onSnapshot(snapshot => {
        const channelsData = snapshot.docs.map(doc => {
            const data = doc.data();
            if (!data) return null;

            // Robust in-memory hydration for legacy channels.
            // This ensures older channel data (without ownerId/memberIds) can still be used
            // to find and display associated projects, without risky database writes.
            const ownerId = data.ownerId || user.uid;
            const memberIds = data.memberIds || (data.members ? Object.keys(data.members) : [user.uid]);

            return {
                id: doc.id,
                ...data,       // Spread original data
                ownerId,      // Ensure our patched fields are present
                memberIds,
            } as Channel;
        }).filter((c): c is Channel => c !== null);

        setOwnedChannels(channelsData);
      }, error => {
        console.error("Error fetching owned channels:", error);
        if (error.code === 'permission-denied') {
            const messageKey = user?.isAdmin ? 'toasts.sharedChannelPermissionErrorAdmin' : 'toasts.sharedChannelPermissionErrorUser';
            showToast(t(messageKey), 'error');
        } else {
            setDbConnectionError(true);
        }
        setIsLoading(false);
      });

    const sharedChannelsListener = db.collectionGroup('channels').where('memberIds', 'array-contains', user.uid)
        .onSnapshot(snapshot => {
            const channelsData = snapshot.docs.map(doc => {
                const data = doc.data();
                if (!data || data.ownerId === user.uid) return null;

                // Definitive client-side data hydration fix.
                // Infers the ownerId from the document path if it's missing from the data.
                // This is crucial for legacy shared channels where the field might not exist.
                // The path structure is /users/{ownerId}/channels/{channelId}
                const ownerId = data.ownerId || (doc.ref.parent.parent as any)?.id;

                if (!ownerId) {
                    // This case should be rare, but it's a safe guard.
                    console.warn(`Could not determine ownerId for shared channel ${doc.id}. Skipping.`);
                    return null;
                }
                
                return { 
                    id: doc.id, 
                    ...data,
                    ownerId, // Ensures ownerId is always present for the project listener
                } as Channel;

            }).filter((c): c is Channel => c !== null);
            
            setSharedChannels(channelsData);
            setMissingIndexError(null);
            setIsLoading(false);
        }, error => {
            console.error("Error fetching shared channels:", error);
            if (error.code === 'failed-precondition' && error.message.includes('index')) {
                if(user?.isAdmin) {
                    const urlMatch = error.message.match(/(https:\/\/[^\s]+)/);
                    setMissingIndexError({
                        message: t('toasts.missingIndexErrorAdmin'),
                        url: urlMatch ? urlMatch[0] : null,
                    });
                } else {
                    showToast(t('toasts.missingIndexErrorUser'), 'error');
                }
            } else if (error.code === 'permission-denied') {
                const messageKey = user?.isAdmin ? 'toasts.sharedChannelPermissionErrorAdmin' : 'toasts.sharedChannelPermissionErrorUser';
                showToast(t(messageKey), 'error');
            }
            setSharedChannels([]);
            setIsLoading(false);
        });

    return () => {
        ownedChannelsListener();
        sharedChannelsListener();
    };
  }, [user, showToast, t]);
  
    // Listener for member profiles of visible channels
    useEffect(() => {
        if (channels.length === 0 || !user) {
            setChannelMembers({});
            return;
        }

        const allMemberIds = new Set<string>();
        channels.forEach(channel => {
            if (channel.memberIds) {
                channel.memberIds.forEach(uid => allMemberIds.add(uid));
            } else if (channel.members) { // Fallback for older data structure
                Object.keys(channel.members).forEach(uid => allMemberIds.add(uid));
            }
        });

        const idsToFetch = Array.from(allMemberIds);
        const unsubscribes: (() => void)[] = [];

        if (idsToFetch.length > 0) {
            const newMembers: Record<string, User> = {};
            
            idsToFetch.forEach(uid => {
                // Fetch each user document individually. This uses a 'get' operation,
                // which is permitted for all authenticated users by the security rules,
                // unlike a 'list' operation (like a where-in query) which is admin-only.
                const docRef = db.collection('users').doc(uid);
                const unsubscribe = docRef.onSnapshot(doc => {
                    if (doc.exists) {
                        const data = doc.data() as any;
                        newMembers[doc.id] = {
                            uid: doc.id,
                            name: data.name,
                            email: data.email,
                            avatar: data.avatar,
                            status: data.status,
                            expiresAt: data.expiresAt ? data.expiresAt.toDate().toISOString() : null,
                            isAdmin: data.isAdmin || false,
                        };
                        // Update state with the latest complete map of members
                        setChannelMembers(currentMembers => ({ ...currentMembers, ...newMembers }));
                    }
                }, error => {
                    console.error(`Error fetching profile for user ${uid}:`, error);
                });
                unsubscribes.push(unsubscribe);
            });
        }
        
        return () => {
            unsubscribes.forEach(unsub => unsub());
        };
    }, [channels, user]);

  // Listener for project data from all accessible channels
  useEffect(() => {
    if (!user || user.status !== 'active' || IS_DEV_MODE || channels.length === 0) {
      if (!user) setProjectsFromListeners({});
      return;
    }

    const allListeners: (() => void)[] = [];
    const visibleChannelIds = new Set(channels.map(c => c.id));

    channels.forEach(channel => {
        const ownerId = channel.ownerId;
        
        if (!ownerId) {
            console.warn(`Channel "${channel.name}" is missing an ownerId and will be skipped.`);
            return;
        }
        
        const projectsCollectionRef = db.collection('users').doc(ownerId).collection('projects')
                                      .where('channelId', '==', channel.id);
        
        const listener = projectsCollectionRef.onSnapshot(async (snapshot) => {
            const channelProjectsPromises = snapshot.docs.map(async (doc) => {
                const data = doc.data();
                const publishDateTime = data.publishDateTime instanceof firebase.firestore.Timestamp
                    ? data.publishDateTime.toDate().toISOString()
                    : data.publishDateTime;
                
                let largeData = {};
                try {
                    const dataDoc = await doc.ref.collection('data').doc('content').get();
                    if (dataDoc.exists) {
                        largeData = dataDoc.data()!;
                    }
                } catch (e) {
                    console.error(`Error fetching large data for project ${doc.id}: ${e}`);
                }

                // By spreading default data first, we ensure that any missing fields
                // from Firestore are initialized with default empty values, preventing
                // 'undefined' from being saved and causing a 400 error.
                return {
                    ...DEFAULT_PROJECT_DATA,
                    id: doc.id,
                    ...data,
                    ...largeData,
                    publishDateTime,
                    storage: 'cloud',
                } as Project;
            });

            const channelProjects = await Promise.all(channelProjectsPromises);

            setProjectsFromListeners(prev => ({
                ...prev,
                [channel.id]: channelProjects,
            }));

        }, (error: any) => {
            console.error(`Error fetching projects for channel ${channel.id}:`, error);
            setProjectsFromListeners(prev => {
                const newState = {...prev};
                delete newState[channel.id];
                return newState;
            });
        });

        allListeners.push(listener);
    });
    
    setProjectsFromListeners(prev => {
        const newState: Record<string, Project[]> = {};
        Object.keys(prev).forEach(channelId => {
            if (visibleChannelIds.has(channelId)) {
                newState[channelId] = prev[channelId];
            }
        });
        return newState;
    });

    return () => {
        allListeners.forEach(unsubscribe => unsubscribe());
    };
  }, [user, channels]);
  
  // Fetch channel stats (subscriber count etc.)
  useEffect(() => {
    const fetchStatsForChannels = async () => {
      if (!apiKeys.youtube || !user || IS_DEV_MODE) return;

      const channelsToUpdate = channels.filter(ch => ch.channelUrl && !ch.stats);
      if (channelsToUpdate.length === 0) return;

      const statsPromises = channelsToUpdate.map(channel =>
        fetchChannelStats(channel.channelUrl!, apiKeys.youtube)
          .then(stats => ({ channelId: channel.id, ownerId: channel.ownerId || user.uid, stats }))
          .catch(err => {
            console.error(`Failed to fetch stats for ${channel.name}:`, err.message);
            return { channelId: channel.id, ownerId: channel.ownerId || user.uid, stats: null };
          })
      );
      
      const results = await Promise.all(statsPromises);
      
      const batch = db.batch();
      let statsUpdated = false;
      
      results.forEach(result => {
          if (result.stats) {
              const channelDocRef = db.collection('users').doc(result.ownerId).collection('channels').doc(result.channelId);
              batch.update(channelDocRef, cleanUndefined({ stats: result.stats }));
              statsUpdated = true;
          }
      });
      
      if (statsUpdated) {
          try {
              await batch.commit();
          } catch (error) {
              console.error("Error batch updating channel stats:", error);
          }
      }
    };

    fetchStatsForChannels();
  }, [channels, apiKeys.youtube, user]);

  // Fetch video stats (views, likes etc) for published videos
  useEffect(() => {
    const fetchAllStats = async () => {
        if (!apiKeys.youtube) return;

        const allProjects = [...Object.values(projectsFromListeners).flat(), ...localProjects];
        const uniqueProjects = Array.from(new Map(allProjects.map(p => [p.id, p])).values());
        
        const projectsToFetch = uniqueProjects.filter(p => {
            if (p.status !== ProjectStatus.Published || !p.youtubeLink) return false;
            const cachedStat = projectStats[p.id];
            // Fetch if not cached, or if cache is older than 1 hour
            return !cachedStat || (Date.now() - (cachedStat.fetchedAt || 0) > 3600 * 1000);
        });
        
        if (projectsToFetch.length === 0) return;

        const statsPromises = projectsToFetch.map(project =>
            fetchVideoStats(project.youtubeLink!, apiKeys.youtube)
                .then(result => ({ projectId: project.id, stats: result?.stats }))
                .catch(err => {
                    console.warn(`Could not fetch stats for "${project.projectName}":`, err.message);
                    return { projectId: project.id, stats: null };
                })
        );
        
        const results = await Promise.all(statsPromises);
        
        const newStats: Record<string, { stats: YouTubeStats, fetchedAt: number }> = {};
        results.forEach(result => {
            if (result.stats) {
                newStats[result.projectId] = { stats: result.stats, fetchedAt: Date.now() };
            }
        });

        if (Object.keys(newStats).length > 0) {
            setProjectStats(prev => ({ ...prev, ...newStats }));
        }
    };
    
    fetchAllStats();

  }, [projectsFromListeners, localProjects, apiKeys.youtube]);
  
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
  
  const handleOpenShareModal = (channel: Channel) => {
    setSharingChannel(channel);
    setIsShareModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsSettingsModalOpen(false);
    setIsShareModalOpen(false);
    setSelectedProject(null);
    setSharingChannel(null);
  };
  
  const handleSaveSettings = (settings: { apiKeys: ApiKeys, selectedProvider: AIProvider, selectedModel: AIModel }) => {
    setApiKeys(settings.apiKeys);
    setSelectedProvider(settings.selectedProvider);
    setSelectedModel(settings.selectedModel);
    showToast(t('toasts.settingsSaved'), 'success');
  };
  
  const handleAddChannel = async (newChannelData: Omit<Channel, 'id' | 'ownerId' | 'members'>): Promise<void> => {
    if (!user) {
        showToast(t('toasts.loginRequiredToSave'), 'error');
        throw new Error("User not logged in");
    }

    const cleanSteps = JSON.parse(JSON.stringify(DEFAULT_AUTOMATION_STEPS));
    const finalAutomationSteps = cleanSteps.map((step: any) => ({
        ...step,
        settings: step.settings || [],
        enabled: typeof step.enabled === 'boolean' ? step.enabled : true,
    }));

    const newChannelPayload = {
        ...newChannelData,
        ownerId: user.uid,
        members: { [user.uid]: 'owner' as const },
        memberIds: [user.uid],
        ideas: [],
        dream100Videos: [],
        automationSteps: finalAutomationSteps,
    };
    
    try {
        await db.collection('users').doc(user.uid).collection('channels').add(cleanUndefined(newChannelPayload));
        showToast(t('toasts.channelAdded'), 'success');
    } catch (error) {
        console.error("Error adding channel:", error);
        showToast(t('toasts.channelSaveFailed'), 'error');
        throw error;
    }
  };


  const handleSaveChannelChanges = async (channel: Channel) => {
    if (!user) return;
    const ownerId = channel.ownerId || user.uid;
    try {
        const channelDocRef = db.collection('users').doc(ownerId).collection('channels').doc(channel.id);
        const payload = {
            name: channel.name,
            dna: channel.dna,
            channelUrl: channel.channelUrl,
        };
        await channelDocRef.update(cleanUndefined(payload));
    } catch (error) {
        console.error("Error saving channel changes:", error);
        showToast(t('toasts.channelSaveFailed'), 'error');
    }
  };
  
  const handleUpdateChannelMembers = async (channel: Channel, newMembers: Channel['members']) => {
    if (!user) return;
    const ownerId = channel.ownerId || user.uid;
    try {
        const channelDocRef = db.collection('users').doc(ownerId).collection('channels').doc(channel.id);
        const newMemberIds = Object.keys(newMembers);
        await channelDocRef.update(cleanUndefined({ members: newMembers, memberIds: newMemberIds }));
    } catch (error) {
        console.error("Error updating channel members:", error);
        showToast(t('toasts.updateMembersFailed'), 'error');
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!user) return;
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;
    
    if ((projectsByChannel[channelId] || []).length > 0) {
        showToast(t('toasts.deleteChannelError'), 'error');
        return;
    }
    const ownerId = channel.ownerId || user.uid;
    try {
        const channelDocRef = db.collection('users').doc(ownerId).collection('channels').doc(channelId);
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
    if (!user) return;
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;
    const ownerId = channel.ownerId || user.uid;
    try {
        const channelDocRef = db.collection('users').doc(ownerId).collection('channels').doc(channelId);
        await channelDocRef.update(cleanUndefined({ dream100Videos: updatedVideos }));
    } catch (error) {
        console.error("Error updating Dream 100:", error);
        showToast(t('toasts.dream100UpdateFailed'), 'error');
    }
  };
  
  const handleUpdateIdeas = async (channelId: string, updatedIdeas: Idea[]) => {
    if (!user) return;
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;
    const ownerId = channel.ownerId || user.uid;
    try {
        const channelDocRef = db.collection('users').doc(ownerId).collection('channels').doc(channelId);
        await channelDocRef.update(cleanUndefined({ ideas: updatedIdeas }));
    } catch (error) {
        console.error("Error updating Idea Bank:", error);
        showToast(t('toasts.ideaBankUpdateFailed'), 'error');
    }
  };
  
  const handleSaveAutomationSteps = async (channelId: string, updatedSteps: AutomationStep[]) => {
    if (!user || !channelId) return;
    const channel = channels.find(c => c.id === channelId);
    if (!channel) return;
    const ownerId = channel.ownerId || user.uid;
    try {
        const channelDocRef = db.collection('users').doc(ownerId).collection('channels').doc(channelId);
        await channelDocRef.set(cleanUndefined({ automationSteps: updatedSteps }), { merge: true });
    } catch (error: any) {
        console.error("Error saving automation steps:", error);
        showToast(t('toasts.automationStepsSaveFailed'), 'error');
    }
  };


  const handleSaveProject = (projectToSave: Project) => {
    // If it's a local project without a channel, just save locally.
    if (projectToSave.storage === 'local' && !projectToSave.channelId) {
        const index = localProjects.findIndex(p => p.id === projectToSave.id);
        if (index > -1) {
            setLocalProjects(prev => {
                const newProjects = [...prev];
                newProjects[index] = projectToSave;
                return newProjects;
            });
        } else {
            setLocalProjects(prev => [...prev, { ...projectToSave, id: `local_${Date.now()}` }]);
        }
        showToast(t('toasts.projectUpdated'), 'success');
        handleCloseModal();
        return;
    }

    if (!user) {
        showToast(t('toasts.loginRequiredToSave'), 'error');
        return;
    }
    
    if (!projectToSave.channelId) {
        showToast(t('toasts.channelRequired'), 'error');
        return;
    }

    if (projectToSave.thumbnailData && projectToSave.thumbnailData.length > 950000) {
      showToast(t('toasts.thumbnailTooLarge'), 'error');
      return;
    }
    
    if (!projectToSave.publishDateTime || isNaN(new Date(projectToSave.publishDateTime).getTime())) {
      showToast(t('toasts.invalidPublishDate'), 'error');
      return;
    }

    setIsSaving(true);
    
    const performSave = async () => {
        const channel = channels.find(c => c.id === projectToSave.channelId);
        if (!channel || !channel.ownerId) {
            throw new Error("Channel or channel owner not found for this project.");
        }
        
        const ownerId = channel.ownerId;
        const isMigratingFromLocal = projectToSave.storage === 'local' || (projectToSave.id && projectToSave.id.startsWith('local_'));

        const {
            script, thumbnailData, description, pinnedComment, communityPost,
            facebookPost, thumbnailPrompt, voiceoverScript, promptTable,
            timecodeMap, metadata, seoMetadata, visualPrompts,
            id, storage, stats,
            ...mainData
        } = projectToSave;

        const largeData = {
            script: script || '',
            thumbnailData: thumbnailData || '',
            description: description || '',
            pinnedComment: pinnedComment || '',
            communityPost: communityPost || '',
            facebookPost: facebookPost || '',
            thumbnailPrompt: thumbnailPrompt || '',
            voiceoverScript: voiceoverScript || '',
            promptTable: promptTable || '',
            timecodeMap: timecodeMap || '',
            metadata: metadata || '',
            seoMetadata: seoMetadata || '',
            visualPrompts: visualPrompts || '',
        };

        const projectDataToSave = {
            ...mainData,
            tags: mainData.tags || [],
            publishDateTime: firebase.firestore.Timestamp.fromDate(new Date(projectToSave.publishDateTime)),
        };
        
        const cleanedProjectData = cleanUndefined(projectDataToSave);
        const cleanedLargeData = cleanUndefined(largeData);


        if (projectToSave.id && !isMigratingFromLocal) { // Update existing cloud project
            const projectDocRef = db.collection('users').doc(ownerId).collection('projects').doc(projectToSave.id);
            const dataDocRef = projectDocRef.collection('data').doc('content');
            
            const batch = db.batch();
            batch.update(projectDocRef, cleanedProjectData);
            batch.set(dataDocRef, cleanedLargeData, { merge: true });
            await batch.commit();
            
            showToast(t('toasts.projectUpdated'), 'success');
        } else { // Create new cloud project (or migrate from local)
            const projectCollectionRef = db.collection('users').doc(ownerId).collection('projects');
            const newProjectRef = projectCollectionRef.doc();
            const dataDocRef = newProjectRef.collection('data').doc('content');

            const batch = db.batch();
            batch.set(newProjectRef, cleanedProjectData);
            batch.set(dataDocRef, cleanedLargeData);
            await batch.commit();
            
            if (isMigratingFromLocal) {
                // Remove from local storage after successful cloud save
                setLocalProjects(prev => prev.filter(p => p.id !== projectToSave.id));
                showToast(t('toasts.projectSynced'), 'success');
            } else {
                showToast(t('toasts.projectCreated'), 'success');
            }
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

  const handleCopyProject = (projectToCopy: Project) => {
      showToast(t('toasts.copyingProject'), 'info');
      const { id, stats, ...projectData } = projectToCopy;

      const newProject: Omit<Project, 'id'> = {
          ...projectData,
          projectName: `${projectData.projectName} (Copy)`,
          publishDateTime: new Date().toISOString(),
          status: ProjectStatus.Idea,
          youtubeLink: '',
          storage: 'local', // Copies are always created locally first
      };
      
      handleCloseModal();
      setTimeout(() => {
          handleOpenModal(newProject as Project);
      }, 100);
  };

  const handleDeleteProject = async (projectId: string) => {
    const projectToDelete = projects.find(p => p.id === projectId);
    if (!projectToDelete) return;

    if (projectToDelete.storage === 'local' || projectToDelete.id.startsWith('local_')) {
        setLocalProjects(prev => prev.filter(p => p.id !== projectId));
        showToast(t('toasts.projectDeleted'), 'info');
        handleCloseModal();
        return;
    }

    // Cloud deletion logic
    if (!user) {
        showToast(t('toasts.loginRequiredToDelete'), 'error');
        throw new Error('User not logged in');
    }

    const channel = channels.find(c => c.id === projectToDelete.channelId);
    if (!channel || !channel.ownerId) {
        showToast(t('toasts.projectDeleteFailed'), 'error');
        throw new Error("Channel or channel owner not found for project");
    }
    const ownerId = channel.ownerId;

    try {
        const projectDocRef = db.collection('users').doc(ownerId).collection('projects').doc(projectId);
        const dataDocRef = projectDocRef.collection('data').doc('content');
        
        await dataDocRef.delete();
        await projectDocRef.delete();

        showToast(t('toasts.projectDeleted'), 'info');
        handleCloseModal();
    } catch (error) {
        console.error("Error deleting project:", error);
        showToast(t('toasts.projectDeleteFailed'), 'error');
        throw error;
    }
  };
  
  const handleMoveProject = async (projectToMove: Project, newChannelId: string) => {
    if (!user || !projectToMove.id || projectToMove.storage === 'local') {
        showToast(t('toasts.projectMoveFailed'), 'error');
        return;
    }

    const originalChannel = channels.find(c => c.id === projectToMove.channelId);
    const destinationChannel = channels.find(c => c.id === newChannelId);

    if (!originalChannel || !destinationChannel || !originalChannel.ownerId) {
        showToast(t('toasts.projectMoveFailed'), 'error');
        return;
    }
    
    const confirmMove = window.confirm(t('projectModal.moveConfirmation', { channelName: destinationChannel.name }));
    if (!confirmMove) {
        return;
    }

    setIsSaving(true);
    const ownerId = originalChannel.ownerId;
    try {
        const projectDocRef = db.collection('users').doc(ownerId).collection('projects').doc(projectToMove.id);
        await projectDocRef.update({ channelId: newChannelId });
        showToast(t('toasts.projectMoved', { channelName: destinationChannel.name }), 'success');
        handleCloseModal();
    } catch (error) {
        console.error("Error moving project:", error);
        showToast(t('toasts.projectMoveFailed'), 'error');
    } finally {
        setIsSaving(false);
    }
  };
  
  const handleAddNewVideo = (channelId: string) => {
    const newProject: Project = {
        id: `local_${Date.now()}`,
        ...DEFAULT_PROJECT_DATA,
        channelId: channelId,
        publishDateTime: new Date().toISOString(),
        storage: 'local',
    };
    setLocalProjects(prev => [...prev, newProject]);
    handleOpenModal(newProject);
  };
  
  const handleRerunAutomation = (project: Project) => {
    const rerunData = {
        targetTitle: project.projectName || project.videoTitle,
        viralTranscript: '' // Script is no longer stored in the project object
    };
    localStorage.setItem('rerun-data', JSON.stringify(rerunData));
    setActiveView('automation');
    handleCloseModal();
  };

  const handleLoginWithGoogle = async () => {
    try {
      setDbConnectionError(false);
      setSignInError(null);
      await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
      await auth.signInWithPopup(googleProvider);
    } catch (error: any) {
      console.error("Google sign-in popup error:", error);
      // Don't show an error toast if the user simply closes the popup.
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        showToast(t('toasts.signInError'), 'error');
      }
    }
  };
  
  const handleLoginWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      setDbConnectionError(false);
      setSignInError(null);
      await auth.signInWithEmailAndPassword(email, password);
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
      return <DbConnectionErrorScreen onReset={() => window.location.reload()} user={user} />;
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
        {activeView === 'projects' && user && (
          <ProjectList 
              projects={projects}
              channels={channels}
              projectsByChannel={projectsByChannel} 
              user={user}
              channelMembers={channelMembers}
              onSelectProject={handleOpenModal} 
              isLoading={isLoading && projects.length === 0}
              onAddChannel={handleOpenSettingsModal}
              onAddVideo={handleAddNewVideo}
              onManageDream100={handleManageDream100}
              missingIndexError={missingIndexError}
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
              globalAutomationSteps={globalAutomationSteps}
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
            <AdminPanel showToast={showToast} user={user} />
        )}
      </main>
      
      {isSettingsModalOpen && user && (
        <SettingsModal 
          isOpen={isSettingsModalOpen}
          onClose={handleCloseModal}
          user={user}
          apiKeys={apiKeys}
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          currentChannels={channels}
          onSave={handleSaveSettings}
          onAddChannel={handleAddChannel}
          onUpdateChannel={handleSaveChannelChanges}
          onDeleteChannel={handleDeleteChannel}
          onShareChannel={handleOpenShareModal}
        />
      )}

      {isModalOpen && (
        <ProjectModal 
          project={selectedProject} 
          channels={channels}
          apiKeys={apiKeys}
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          isSaving={isSaving}
          onClose={handleCloseModal} 
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
          onCopy={handleCopyProject}
          onRerun={handleRerunAutomation}
          onMove={handleMoveProject}
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

      {isShareModalOpen && sharingChannel && user && (
          <ShareChannelModal
            isOpen={isShareModalOpen}
            onClose={handleCloseModal}
            channel={sharingChannel}
            currentUser={user}
            showToast={showToast}
            onUpdateMembers={handleUpdateChannelMembers}
          />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;