import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

interface LayoutConfig {
  showLogs: boolean;
  logHeight: number;
}

const LAYOUT_COOKIE_KEY = 'layout_config';

export function useLayoutConfig() {
  const [config, setConfig] = useState<LayoutConfig>(() => {
    const savedConfig = Cookies.get(LAYOUT_COOKIE_KEY);
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }
    return {
      showLogs: false,
      logHeight: 30,
    };
  });

  useEffect(() => {
    Cookies.set(LAYOUT_COOKIE_KEY, JSON.stringify(config), { expires: 365 });
  }, [config]);

  const toggleLogs = () => {
    setConfig(prev => ({
      ...prev,
      showLogs: !prev.showLogs,
    }));
  };

  const updateLogHeight = (height: number) => {
    setConfig(prev => ({
      ...prev,
      logHeight: Math.max(10, Math.min(90, height)),
    }));
  };

  return {
    config,
    toggleLogs,
    updateLogHeight,
  };
} 