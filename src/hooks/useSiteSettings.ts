import { useState, useEffect } from 'react';
import { api } from '../lib/api';

interface SiteSettings {
  site_title?: string;
  site_tagline?: string;
  site_description?: string;
  logo_url?: string;
  favicon_url?: string;
  default_theme?: string;
  primary_color?: string;
  font_family?: string;
  default_meta_title?: string;
  default_meta_description?: string;
  google_analytics_id?: string;
  google_search_console?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  custom_css?: string;
  custom_js?: string;
  footer_copyright?: string;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    logo_url: '/mayobebroslogo copy copy.png',
    favicon_url: '/mayobebrosfavicon copy.png',
    site_title: 'Mayobe Bros',
    site_tagline: 'Empowering Minds with Knowledge and Insights',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await api
        .from('site_settings')
        .select('key, value');

      if (error) throw error;

      if (data) {
        const settingsObj: SiteSettings = {};
        data.forEach((setting) => {
          settingsObj[setting.key as keyof SiteSettings] = setting.value;
        });
        setSettings({ ...settings, ...settingsObj });
      }
    } catch (error) {
      console.error('Error loading site settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (settings.favicon_url) {
      updateFavicon(settings.favicon_url);
    }
  }, [settings.favicon_url]);

  const updateFavicon = (faviconUrl: string) => {
    const links = document.querySelectorAll("link[rel*='icon']");
    links.forEach((link) => {
      (link as HTMLLinkElement).href = faviconUrl;
    });

    const appleTouchIcon = document.querySelector("link[rel='apple-touch-icon']");
    if (appleTouchIcon) {
      (appleTouchIcon as HTMLLinkElement).href = faviconUrl;
    }
  };

  return { settings, loading, refresh: loadSettings };
}
