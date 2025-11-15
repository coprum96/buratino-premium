import { create } from 'zustand';

export type GamePhase = 'landing' | 'chapterMap' | 'dialogue' | 'quiz' | 'scenarioTest' | 'complexTest' | 'postTest' | 'ending';

interface GameState {
  // Game Stats
  coins: number;
  wisdom: number;
  
  // Progress
  currentLevel: number;
  currentDialogue: number;
  completedLevels: number[];
  achievements: string[];
  
  // Test Scores
  preTestScore: number;
  postTestScore: number;
  
  // UI State
  phase: GamePhase;
  showMaterialsPanel: boolean;
  
  // Counters
  globalCitizensCount: number;
  victimCount: number;
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  addCoins: (amount: number) => void;
  addWisdom: (amount: number) => void;
  nextLevel: () => void;
  setCurrentDialogue: (index: number) => void;
  completeLevel: (levelId: number) => void;
  addAchievement: (achievement: string) => void;
  toggleMaterialsPanel: () => void;
  setPostTestScore: (score: number) => void;
  resetGame: () => void;
  incrementCitizensCount: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial State
  coins: 5,
  wisdom: 0,
  currentLevel: 0,
  currentDialogue: 0,
  completedLevels: [],
  achievements: [],
  preTestScore: 0,
  postTestScore: 0,
  phase: 'landing',
  showMaterialsPanel: false,
  globalCitizensCount: 0,
  victimCount: 13495302,
  
  // Actions
  setPhase: (phase) => set({ phase }),
  
  addCoins: (amount) => set((state) => ({ 
    coins: Math.max(0, state.coins + amount) 
  })),
  
  addWisdom: (amount) => set((state) => ({ 
    wisdom: Math.max(0, Math.min(100, state.wisdom + amount)) 
  })),
  
  nextLevel: () => set((state) => ({
    currentLevel: state.currentLevel + 1,
    currentDialogue: 0,
    phase: 'chapterMap'
  })),
  
  setCurrentDialogue: (index) => set({ currentDialogue: index }),
  
  completeLevel: (levelId) => set((state) => ({
    completedLevels: [...state.completedLevels, levelId]
  })),
  
  addAchievement: (achievement) => set((state) => ({
    achievements: [...state.achievements, achievement]
  })),
  
  toggleMaterialsPanel: () => set((state) => ({
    showMaterialsPanel: !state.showMaterialsPanel
  })),
  
  setPostTestScore: (score) => set({ postTestScore: score }),
  
  incrementCitizensCount: () => set((state) => ({
    globalCitizensCount: state.globalCitizensCount + 1
  })),
  
  resetGame: () => set({
    coins: 5,
    wisdom: 0,
    currentLevel: 0,
    currentDialogue: 0,
    completedLevels: [],
    achievements: [],
    preTestScore: 0,
    postTestScore: 0,
    phase: 'landing',
    showMaterialsPanel: false
  })
}));

