import { useState, useEffect, useCallback } from 'react';
import { storageManager } from '../utils/storage';
import { generateId, getChallengeProgress, getChallengeStatus } from '../utils/helpers';
import type { Challenge, ChallengeEntry, ChallengeFormData } from '../types';

export function useChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeEntries, setChallengeEntries] = useState<ChallengeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load challenges and entries from storage on mount
  useEffect(() => {
    try {
      const storedChallenges = storageManager.loadChallenges();
      const storedEntries = storageManager.loadChallengeEntries();
      setChallenges(storedChallenges);
      setChallengeEntries(storedEntries);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save challenges to storage
  const saveChallenges = useCallback((updatedChallenges: Challenge[]) => {
    try {
      storageManager.saveChallenges(updatedChallenges);
      setChallenges(updatedChallenges);
    } catch (error) {
      console.error('Error saving challenges:', error);
    }
  }, []);

  // Save challenge entries to storage
  const saveChallengeEntries = useCallback((updatedEntries: ChallengeEntry[]) => {
    try {
      storageManager.saveChallengeEntries(updatedEntries);
      setChallengeEntries(updatedEntries);
    } catch (error) {
      console.error('Error saving challenge entries:', error);
    }
  }, []);

  // Create new challenge
  const createChallenge = useCallback((challengeData: ChallengeFormData) => {
    const newChallenge: Challenge = {
      id: generateId(),
      title: challengeData.title,
      description: challengeData.description,
      status: 'active',
      startDate: new Date(challengeData.startDate),
      endDate: new Date(challengeData.endDate),
      targetValue: challengeData.targetValue,
      currentValue: 0,
      unit: challengeData.unit,
      category: challengeData.category,
      color: challengeData.color,
      rewards: challengeData.rewards,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedChallenges = [...challenges, newChallenge];
    saveChallenges(updatedChallenges);
    return newChallenge;
  }, [challenges, saveChallenges]);

  // Update existing challenge
  const updateChallenge = useCallback((id: string, updates: Partial<Challenge>) => {
    const updatedChallenges = challenges.map(challenge =>
      challenge.id === id
        ? { ...challenge, ...updates, updatedAt: new Date() }
        : challenge
    );
    saveChallenges(updatedChallenges);
  }, [challenges, saveChallenges]);

  // Delete challenge and its entries
  const deleteChallenge = useCallback((id: string) => {
    const updatedChallenges = challenges.filter(challenge => challenge.id !== id);
    const updatedEntries = challengeEntries.filter(entry => entry.challengeId !== id);
    saveChallenges(updatedChallenges);
    saveChallengeEntries(updatedEntries);
  }, [challenges, challengeEntries, saveChallenges, saveChallengeEntries]);

  // Add progress to challenge
  const addChallengeProgress = useCallback((challengeId: string, value: number, notes?: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    // Create new entry
    const newEntry: ChallengeEntry = {
      id: generateId(),
      challengeId,
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      value,
      notes,
      createdAt: new Date(),
    };

    // Update challenge current value
    const newCurrentValue = challenge.currentValue + value;
    const updatedChallenges = challenges.map(c =>
      c.id === challengeId
        ? {
            ...c,
            currentValue: newCurrentValue,
            status: newCurrentValue >= c.targetValue ? 'completed' : c.status,
            completedAt: newCurrentValue >= c.targetValue ? new Date() : c.completedAt,
            updatedAt: new Date()
          }
        : c
    );

    const updatedEntries = [...challengeEntries, newEntry];
    saveChallenges(updatedChallenges);
    saveChallengeEntries(updatedEntries);
  }, [challenges, challengeEntries, saveChallenges, saveChallengeEntries]);

  // Get active challenges
  const getActiveChallenges = useCallback(() => {
    return challenges.filter(challenge => challenge.status === 'active');
  }, [challenges]);

  // Get completed challenges
  const getCompletedChallenges = useCallback(() => {
    return challenges.filter(challenge => challenge.status === 'completed');
  }, [challenges]);

  // Get challenges with progress data
  const getChallengesWithProgress = useCallback(() => {
    return challenges.map(challenge => ({
      ...challenge,
      progress: getChallengeProgress(challenge),
      actualStatus: getChallengeStatus(challenge),
      entries: challengeEntries.filter(entry => entry.challengeId === challenge.id)
    }));
  }, [challenges, challengeEntries]);

  // Get challenge statistics
  const getChallengeStats = useCallback(() => {
    const active = getActiveChallenges();
    const completed = getCompletedChallenges();
    const total = challenges.length;
    
    const completionRate = total > 0 ? (completed.length / total) * 100 : 0;
    const averageProgress = active.length > 0 
      ? active.reduce((sum, challenge) => sum + getChallengeProgress(challenge), 0) / active.length
      : 0;

    return {
      total,
      active: active.length,
      completed: completed.length,
      completionRate: Math.round(completionRate),
      averageProgress: Math.round(averageProgress),
    };
  }, [challenges, getActiveChallenges, getCompletedChallenges]);

  return {
    challenges,
    challengeEntries,
    loading,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    addChallengeProgress,
    getActiveChallenges,
    getCompletedChallenges,
    getChallengesWithProgress,
    getChallengeStats,
  };
}
