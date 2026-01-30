import { useState, useCallback } from 'react';

export type TabType = 'home' | 'scan' | 'analytics' | 'creator' | 'support';

export interface UseScannerReturn {
    showScanner: boolean;
    openScanner: () => void;
    closeScanner: () => void;
}

export const useScanner = (): UseScannerReturn => {
    const [showScanner, setShowScanner] = useState(false);

    const openScanner = useCallback(() => {
        setShowScanner(true);
    }, []);

    const closeScanner = useCallback(() => {
        setShowScanner(false);
    }, []);

    return {
        showScanner,
        openScanner,
        closeScanner
    };
};

export interface UseTabNavigationReturn {
    activeTab: TabType;
    setActiveTab: (tab: TabType) => void;
}

export const useTabNavigation = (initialTab: TabType = 'home'): UseTabNavigationReturn => {
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);

    return {
        activeTab,
        setActiveTab
    };
};
